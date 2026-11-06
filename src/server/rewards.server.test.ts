// @vitest-environment node
/**
 * Runs the real voucher, referral and booking rules against an in-memory Postgres
 * (PGlite) created from the same migration that Netlify applies on deploy.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import * as schema from '../../db/schema'

const client = new PGlite()
const testDb = drizzle({ client, schema })

vi.mock('../../db', async () => ({ ...(await import('../../db/schema')), db: testDb }))
// Fixed 26.2 km road distance (Bukit Mertajam → Penang GH) so tests don't call the internet.
vi.mock('@/lib/geo.server', () => ({ roadDistance: async () => ({ distanceKm: 26.2, durationMin: 29 }) }))

const { registerCustomer, lookupCustomer, createBooking, setBookingStatus, adminSetCustomerStatus, malaysiaToday } = await import(
  './rewards.server'
)

const pickup = { name: 'Bukit Mertajam', address: '', lat: 5.3631, lng: 100.4561 }
const hospital = { name: 'Hospital Pulau Pinang', address: 'George Town', lat: 5.417, lng: 100.3115 }
const bookingBase = {
  pickup,
  destination: hospital,
  travelDate: malaysiaToday(5),
  pickupTime: '10:00',
  tripType: 'oneway' as const,
  accompanimentHours: 0,
  language: 'en',
}

beforeAll(async () => {
  const dir = join(process.cwd(), 'netlify/database/migrations')
  for (const m of readdirSync(dir).sort()) {
    const sqlText = readFileSync(join(dir, m, 'migration.sql'), 'utf8')
    for (const statement of sqlText.split('--> statement-breakpoint')) if (statement.trim()) await client.exec(statement)
  }
})

describe('registration', () => {
  it('registers a customer once and issues one RM8 welcome voucher', async () => {
    const res = await registerCustomer({ name: 'Ali Ahmad', mobile: '012-345 6789', language: 'en', ipHash: 'a' })
    expect(res).toEqual({ ok: true, welcomeAmount: 8, referred: false })
    const again = await registerCustomer({ name: 'Ali Again', mobile: '+60123456789', language: 'en', ipHash: 'a' })
    expect(again).toEqual({ ok: false, error: 'already_registered' })
    const look = await lookupCustomer('0123456789')
    expect(look.ok && look.registered && look.balance).toBe(8)
  })

  it('rejects invalid numbers, unknown referrers and self-referral', async () => {
    expect(await registerCustomer({ name: 'X', mobile: '04-123 4567', language: 'en', ipHash: null })).toEqual({ ok: false, error: 'invalid_mobile' })
    expect(await registerCustomer({ name: 'Y', mobile: '0198765432', referrerMobile: '0170000000', language: 'en', ipHash: null })).toEqual({
      ok: false,
      error: 'referrer_not_found',
    })
    expect(await registerCustomer({ name: 'Z', mobile: '0198765432', referrerMobile: '019-876 5432', language: 'en', ipHash: null })).toEqual({
      ok: false,
      error: 'self_referral',
    })
  })

  it('gives the referrer RM5 and the new customer RM8', async () => {
    const res = await registerCustomer({ name: 'Mei Ling', mobile: '0112149 0000', referrerMobile: '0123456789', language: 'zh', ipHash: 'b' })
    expect(res).toEqual({ ok: true, welcomeAmount: 8, referred: true })
    const referrer = await lookupCustomer('0123456789')
    expect(referrer.ok && referrer.registered && referrer.vouchers.map((v) => v.amount).sort()).toEqual([5, 8])
    const friend = await lookupCustomer('01121490000')
    expect(friend.ok && friend.registered && friend.balance).toBe(8)
  })

  it('limits registrations from one connection per day', async () => {
    for (const n of ['0161111111', '0162222222']) await registerCustomer({ name: 'Spam', mobile: n, language: 'en', ipHash: 'c' })
    expect(await registerCustomer({ name: 'Spam', mobile: '0163333333', language: 'en', ipHash: 'c' })).toEqual({ ok: true, welcomeAmount: 8, referred: false })
    expect(await registerCustomer({ name: 'Spam', mobile: '0164444444', language: 'en', ipHash: 'c' })).toEqual({ ok: false, error: 'too_many_attempts' })
  })
})

describe('booking with vouchers', () => {
  it('reserves on booking, cannot be reused, and redeems only on completion', async () => {
    const look = await lookupCustomer('0123456789')
    if (!look.ok || !look.registered) throw new Error('missing customer')
    const welcome = look.vouchers.find((v) => v.type === 'welcome')!
    const referral = look.vouchers.find((v) => v.type === 'referral')!

    // Only one voucher per booking.
    const two = await createBooking({ ...bookingBase, name: 'Ali', mobile: '0123456789', voucherIds: [welcome.id, referral.id] })
    expect(two).toEqual({ ok: false, error: 'too_many_vouchers' })

    const first = await createBooking({ ...bookingBase, name: 'Ali', mobile: '0123456789', voucherIds: [welcome.id] })
    if (!first.ok) throw new Error(first.error)
    // 26.2 km × RM3.6 = RM94 + RM18 crossing = RM112, minus RM8.
    expect(first.estimate?.subtotal).toBe(112)
    expect(first.discount).toBe(8)
    expect(first.total).toBe(104)
    expect(first.reference).toMatch(/^CR-\d{6}-[A-Z0-9]{4}$/)

    // The same voucher cannot be reserved twice.
    const reuse = await createBooking({ ...bookingBase, name: 'Ali', mobile: '0123456789', voucherIds: [welcome.id] })
    expect(reuse).toEqual({ ok: false, error: 'voucher_unavailable' })

    // Another customer cannot use Ali's voucher.
    const stolen = await createBooking({ ...bookingBase, name: 'Mei', mobile: '01121490000', voucherIds: [referral.id] })
    expect(stolen).toEqual({ ok: false, error: 'voucher_unavailable' })

    const after = await lookupCustomer('0123456789')
    expect(after.ok && after.registered && after.vouchers.find((v) => v.id === welcome.id)?.status).toBe('reserved')

    const [row] = await client.query<{ id: number }>(`select id from bookings where reference = $1`, [first.reference]).then((r) => r.rows)
    await setBookingStatus(row.id, 'completed', 'test')
    const [v] = await client.query<{ status: string }>(`select status from vouchers where id = $1`, [welcome.id]).then((r) => r.rows)
    expect(v.status).toBe('redeemed')
    await expect(setBookingStatus(row.id, 'completed', 'test')).rejects.toThrow()
  })

  it('cancelling a booking gives the voucher back', async () => {
    const look = await lookupCustomer('0123456789')
    if (!look.ok || !look.registered) throw new Error('missing customer')
    const referral = look.vouchers.find((v) => v.type === 'referral' && v.usable)!
    const res = await createBooking({ ...bookingBase, name: 'Ali', mobile: '0123456789', voucherIds: [referral.id] })
    if (!res.ok) throw new Error(res.error)
    const [row] = await client.query<{ id: number }>(`select id from bookings where reference = $1`, [res.reference]).then((r) => r.rows)
    await setBookingStatus(row.id, 'cancelled', 'test')
    const back = await lookupCustomer('0123456789')
    expect(back.ok && back.registered && back.vouchers.find((v) => v.id === referral.id)?.status).toBe('available')
  })

  it('expires an unused welcome voucher after the first completed ride', async () => {
    const res = await createBooking({ ...bookingBase, name: 'Mei', mobile: '01121490000', voucherIds: [] })
    if (!res.ok) throw new Error(res.error)
    const [row] = await client.query<{ id: number }>(`select id from bookings where reference = $1`, [res.reference]).then((r) => r.rows)
    await setBookingStatus(row.id, 'completed', 'test')
    const look = await lookupCustomer('01121490000')
    expect(look.ok && look.registered && look.balance).toBe(0)
  })

  it('blocked customers lose their vouchers and cannot refer', async () => {
    const [c] = await client.query<{ id: number }>(`select id from customers where mobile = '60161111111'`).then((r) => r.rows)
    await adminSetCustomerStatus(c.id, 'blocked', 'duplicate', 'test')
    const look = await lookupCustomer('0161111111')
    expect(look.ok && look.registered && look.blocked).toBe(true)
    expect(await registerCustomer({ name: 'New', mobile: '0175555555', referrerMobile: '0161111111', language: 'en', ipHash: 'd' })).toEqual({
      ok: false,
      error: 'referrer_not_found',
    })
  })

  it('rejects bookings that are too soon', async () => {
    const res = await createBooking({ ...bookingBase, travelDate: malaysiaToday(1), name: 'Ali', mobile: '0123456789', voucherIds: [] })
    expect(res).toEqual({ ok: false, error: 'invalid_date' })
  })
})
