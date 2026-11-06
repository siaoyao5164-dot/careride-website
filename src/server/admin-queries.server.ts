/** Server-only read queries and CRUD used by the admin dashboard. */
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { bookings, customers, db, referrals, testimonials, voucherEvents, vouchers } from '../../db'
import { normalizeMobile } from '@/lib/phone'
import { housekeeping } from './rewards.server'

const iso = (d: Date | null) => (d ? d.toISOString() : null)
const rm = (sen: number | null) => (sen === null ? null : sen / 100)

/** Matches a mobile search typed in any format, e.g. "012-345" or "60123". */
function mobileLike(search: string) {
  const digits = search.replace(/\D/g, '')
  if (!digits) return null
  const full = normalizeMobile(search)
  if (full) return full
  return `%${digits.replace(/^0/, '')}%`
}

export async function overview() {
  await housekeeping()
  const count = (table: typeof customers | typeof vouchers | typeof referrals | typeof bookings, where?: ReturnType<typeof eq>) =>
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(table)
      .where(where)
      .then((r) => r[0]?.n ?? 0)
  const sum = (status: string) =>
    db
      .select({ n: sql<number>`coalesce(sum(${vouchers.amountSen}), 0)::int` })
      .from(vouchers)
      .where(eq(vouchers.status, status))
      .then((r) => (r[0]?.n ?? 0) / 100)
  const [totalCustomers, blocked, available, availableValue, reserved, redeemed, redeemedValue, referralCount, pending, confirmed] =
    await Promise.all([
      count(customers),
      count(customers, eq(customers.status, 'blocked')),
      count(vouchers, eq(vouchers.status, 'available')),
      sum('available'),
      count(vouchers, eq(vouchers.status, 'reserved')),
      count(vouchers, eq(vouchers.status, 'redeemed')),
      sum('redeemed'),
      count(referrals),
      count(bookings, eq(bookings.status, 'pending')),
      count(bookings, eq(bookings.status, 'confirmed')),
    ])
  return { totalCustomers, blocked, available, availableValue, reserved, redeemed, redeemedValue, referralCount, pending, confirmed }
}

export async function listCustomers(search: string) {
  const like = mobileLike(search)
  const text = search.trim()
  const where = text
    ? or(...[like ? ilike(customers.mobile, like) : undefined, ilike(customers.name, `%${text}%`)].filter(Boolean))
    : undefined
  const rows = await db
    .select({
      c: customers,
      balanceSen: sql<number>`(select coalesce(sum(amount_sen), 0)::int from vouchers v where v.customer_id = ${customers.id} and v.status = 'available')`,
      referralCount: sql<number>`(select count(*)::int from referrals r where r.referrer_id = ${customers.id})`,
      bookingCount: sql<number>`(select count(*)::int from bookings b where b.customer_id = ${customers.id})`,
    })
    .from(customers)
    .where(where)
    .orderBy(desc(customers.registeredAt))
    .limit(200)
  return rows.map(({ c, balanceSen, referralCount, bookingCount }) => ({
    id: c.id,
    name: c.name,
    mobile: c.mobile,
    referrerMobile: c.referrerMobile,
    firstRideStatus: c.firstRideStatus,
    status: c.status,
    language: c.language,
    adminNote: c.adminNote,
    registeredAt: iso(c.registeredAt)!,
    consentAt: iso(c.consentAt)!,
    balance: balanceSen / 100,
    referralCount,
    bookingCount,
  }))
}

export async function listVouchers(search: string, status: string) {
  const like = mobileLike(search)
  const text = search.trim()
  const rows = await db
    .select({ v: vouchers, name: customers.name, mobile: customers.mobile, reference: bookings.reference })
    .from(vouchers)
    .innerJoin(customers, eq(customers.id, vouchers.customerId))
    .leftJoin(bookings, eq(bookings.id, vouchers.bookingId))
    .where(
      and(
        status ? eq(vouchers.status, status) : undefined,
        text
          ? or(...[like ? ilike(customers.mobile, like) : undefined, ilike(vouchers.code, `%${text}%`)].filter(Boolean))
          : undefined,
      ),
    )
    .orderBy(desc(vouchers.issuedAt))
    .limit(300)
  return rows.map(({ v, name, mobile, reference }) => ({
    id: v.id,
    code: v.code,
    type: v.type,
    amount: v.amountSen / 100,
    status: v.status,
    customerName: name,
    mobile,
    bookingReference: reference,
    note: v.note,
    issuedAt: iso(v.issuedAt)!,
    expiresAt: iso(v.expiresAt),
    reservedAt: iso(v.reservedAt),
    redeemedAt: iso(v.redeemedAt),
  }))
}

export async function listReferrals(search: string) {
  const referrer = alias(customers, 'referrer')
  const referred = alias(customers, 'referred')
  const like = mobileLike(search)
  const rows = await db
    .select({
      r: referrals,
      referrerName: referrer.name,
      referrerMobile: referrer.mobile,
      referredName: referred.name,
      referredMobile: referred.mobile,
      voucherCode: vouchers.code,
      voucherStatus: vouchers.status,
    })
    .from(referrals)
    .innerJoin(referrer, eq(referrer.id, referrals.referrerId))
    .innerJoin(referred, eq(referred.id, referrals.referredId))
    .leftJoin(vouchers, eq(vouchers.id, referrals.rewardVoucherId))
    .where(like ? or(ilike(referrer.mobile, like), ilike(referred.mobile, like)) : undefined)
    .orderBy(desc(referrals.createdAt))
    .limit(300)
  return rows.map(({ r, ...rest }) => ({
    id: r.id,
    referrerId: r.referrerId,
    referredId: r.referredId,
    reward: r.rewardSen / 100,
    status: r.status,
    note: r.note,
    createdAt: iso(r.createdAt)!,
    ...rest,
  }))
}

export async function listBookings(search: string, status: string) {
  await housekeeping()
  const like = mobileLike(search)
  const text = search.trim()
  const rows = await db
    .select({
      b: bookings,
      voucherCodes: sql<string | null>`(select string_agg(code, ', ') from vouchers v where v.booking_id = ${bookings.id})`,
    })
    .from(bookings)
    .where(
      and(
        status ? eq(bookings.status, status) : undefined,
        text
          ? or(...[like ? ilike(bookings.mobile, like) : undefined, ilike(bookings.reference, `%${text}%`)].filter(Boolean))
          : undefined,
      ),
    )
    .orderBy(desc(bookings.createdAt))
    .limit(300)
  return rows.map(({ b, voucherCodes }) => ({
    id: b.id,
    reference: b.reference,
    name: b.name,
    mobile: b.mobile,
    registered: b.customerId !== null,
    pickup: b.pickup,
    destination: b.destination,
    travelDate: b.travelDate,
    pickupTime: b.pickupTime,
    returnTime: b.returnTime,
    tripType: b.tripType,
    accompanimentHours: b.accompanimentHours,
    distanceKm: b.distanceKm,
    subtotal: rm(b.subtotalSen),
    discount: rm(b.discountSen),
    total: rm(b.totalSen),
    voucherCodes,
    status: b.status,
    adminNote: b.adminNote,
    createdAt: iso(b.createdAt)!,
    confirmedAt: iso(b.confirmedAt),
    completedAt: iso(b.completedAt),
    cancelledAt: iso(b.cancelledAt),
  }))
}

export async function listVoucherHistory(search: string) {
  const text = search.trim()
  const like = mobileLike(search)
  const rows = await db
    .select({
      e: voucherEvents,
      code: vouchers.code,
      amountSen: vouchers.amountSen,
      mobile: customers.mobile,
      reference: bookings.reference,
    })
    .from(voucherEvents)
    .innerJoin(vouchers, eq(vouchers.id, voucherEvents.voucherId))
    .innerJoin(customers, eq(customers.id, vouchers.customerId))
    .leftJoin(bookings, eq(bookings.id, voucherEvents.bookingId))
    .where(
      text
        ? or(...[like ? ilike(customers.mobile, like) : undefined, ilike(vouchers.code, `%${text}%`)].filter(Boolean))
        : undefined,
    )
    .orderBy(desc(voucherEvents.createdAt))
    .limit(300)
  return rows.map(({ e, code, amountSen, mobile, reference }) => ({
    id: e.id,
    event: e.event,
    actor: e.actor,
    note: e.note,
    createdAt: iso(e.createdAt)!,
    code,
    amount: amountSen / 100,
    mobile,
    bookingReference: reference,
  }))
}

export async function listTestimonials() {
  const rows = await db.select().from(testimonials).orderBy(testimonials.sortOrder, desc(testimonials.createdAt))
  return rows.map((t) => ({ ...t, createdAt: iso(t.createdAt)! }))
}

export async function saveTestimonial(input: {
  id?: number
  name: string
  detail?: string
  quote: string
  rating: number
  published: boolean
  sortOrder: number
}) {
  const values = {
    name: input.name,
    detail: input.detail || null,
    quote: input.quote,
    rating: input.rating,
    published: input.published,
    sortOrder: input.sortOrder,
  }
  if (input.id) await db.update(testimonials).set(values).where(eq(testimonials.id, input.id))
  else await db.insert(testimonials).values(values)
}

export async function deleteTestimonial(id: number) {
  await db.delete(testimonials).where(eq(testimonials.id, id))
}

/* --------------------------------- Export --------------------------------- */

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
    // Prevent spreadsheet formula injection and escape quotes.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => cell(r[h])).join(','))].join('\n')
}

export async function exportCsv(type: 'customers' | 'referrals' | 'vouchers' | 'bookings') {
  if (type === 'customers') return csv(await listCustomers(''))
  if (type === 'referrals') return csv(await listReferrals(''))
  if (type === 'vouchers') return csv(await listVouchers('', ''))
  const list = await listBookings('', '')
  return csv(
    list.map(({ pickup, destination, ...b }) => ({
      ...b,
      pickup: `${pickup.name}, ${pickup.address}`,
      destination: `${destination.name}, ${destination.address}`,
    })),
  )
}
