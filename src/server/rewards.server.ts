/**
 * Server-only business rules for customers, vouchers, referrals and bookings.
 * Every rule is enforced here, so nothing in the browser can grant or redeem a voucher.
 */
import { createHash, randomInt } from 'node:crypto'
import { and, eq, gte, inArray, isNull, lt, or, sql } from 'drizzle-orm'

import { bookings, customers, db, referrals, voucherEvents, vouchers } from '../../db'
import { business } from '@/config/business'
import { rewards } from '@/config/rewards'
import { roadDistance } from '@/lib/geo.server'
import { normalizeMobile } from '@/lib/phone'
import { applyVouchers, calculateEstimate, isInServiceArea, sideOf, type TripType } from '@/lib/pricing'

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
type Executor = typeof db | Tx

export const toSen = (rm: number) => Math.round(rm * 100)
export const fromSen = (sen: number) => sen / 100

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function randomCode(length: number) {
  let out = ''
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return out
}

function addDays(days: number | null) {
  if (days === null) return null
  return new Date(Date.now() + days * 86_400_000)
}

/** Today's date in Malaysia (UTC+8) as YYYY-MM-DD. */
export function malaysiaToday(offsetDays = 0) {
  return new Date(Date.now() + 8 * 3_600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10)
}

function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } }
  return e?.code === '23505' || e?.cause?.code === '23505'
}

export function hashIp(ip: string | undefined) {
  if (!ip) return null
  const salt = process.env.IP_HASH_SALT || 'careride-ip-v1'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

function maskName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => `${w[0]}${'*'.repeat(Math.min(3, Math.max(1, w.length - 1)))}`)
    .join(' ')
}

async function logEvent(
  ex: Executor,
  voucherId: number,
  event: string,
  opts: { bookingId?: number | null; actor?: string; note?: string } = {},
) {
  await ex.insert(voucherEvents).values({
    voucherId,
    event,
    bookingId: opts.bookingId ?? null,
    actor: opts.actor ?? 'system',
    note: opts.note ?? null,
  })
}

async function issueVoucher(
  ex: Executor,
  input: { customerId: number; type: 'welcome' | 'referral' | 'manual'; amountSen: number; expiresAt: Date | null; note?: string; actor?: string },
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [v] = await ex
        .insert(vouchers)
        .values({
          code: `CR${randomCode(6)}`,
          customerId: input.customerId,
          type: input.type,
          amountSen: input.amountSen,
          expiresAt: input.expiresAt,
          note: input.note ?? null,
        })
        .returning()
      await logEvent(ex, v.id, 'issued', { actor: input.actor, note: input.note })
      return v
    } catch (e) {
      // Retry only on a voucher-code collision; a second welcome voucher must fail.
      if (!isUniqueViolation(e) || input.type === 'welcome' || attempt === 2) throw e
    }
  }
  throw new Error('Could not issue voucher')
}

/** Expires overdue vouchers and releases vouchers held by bookings that were never confirmed. */
export async function housekeeping() {
  const now = new Date()
  const expired = await db
    .update(vouchers)
    .set({ status: 'expired' })
    .where(and(eq(vouchers.status, 'available'), lt(vouchers.expiresAt, now)))
    .returning({ id: vouchers.id })
  for (const v of expired) await logEvent(db, v.id, 'expired', { note: 'Expiry date passed' })

  const cutoff = new Date(Date.now() - rewards.reservationHoldDays * 86_400_000)
  const stale = await db
    .update(bookings)
    .set({ status: 'cancelled', cancelledAt: now, adminNote: 'Automatically cancelled: not confirmed in time' })
    .where(and(eq(bookings.status, 'pending'), lt(bookings.createdAt, cutoff)))
    .returning({ id: bookings.id })
  for (const b of stale) await releaseVouchers(db, b.id, 'system', 'Booking not confirmed in time')
}

async function releaseVouchers(ex: Executor, bookingId: number, actor: string, note: string) {
  const held = await ex
    .select()
    .from(vouchers)
    .where(and(eq(vouchers.bookingId, bookingId), eq(vouchers.status, 'reserved')))
  for (const v of held) {
    const isExpired = v.expiresAt !== null && v.expiresAt < new Date()
    await ex
      .update(vouchers)
      .set({ status: isExpired ? 'expired' : 'available', bookingId: null, reservedAt: null })
      .where(eq(vouchers.id, v.id))
    await logEvent(ex, v.id, isExpired ? 'expired' : 'released', { bookingId, actor, note })
  }
}

/* -------------------------------------------------------------------------- */
/*                                Registration                                */
/* -------------------------------------------------------------------------- */

export type RegisterError =
  | 'invalid_mobile'
  | 'invalid_referrer_mobile'
  | 'already_registered'
  | 'referrer_not_found'
  | 'self_referral'
  | 'too_many_attempts'
  | 'server_error'

export async function registerCustomer(input: {
  name: string
  mobile: string
  referrerMobile?: string
  language: string
  ipHash: string | null
}): Promise<{ ok: true; welcomeAmount: number; referred: boolean } | { ok: false; error: RegisterError }> {
  const mobile = normalizeMobile(input.mobile)
  if (!mobile) return { ok: false, error: 'invalid_mobile' }

  let referrerMobile: string | null = null
  if (input.referrerMobile?.trim()) {
    referrerMobile = normalizeMobile(input.referrerMobile)
    if (!referrerMobile) return { ok: false, error: 'invalid_referrer_mobile' }
    if (referrerMobile === mobile) return { ok: false, error: 'self_referral' }
  }

  const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.mobile, mobile))
  if (existing) return { ok: false, error: 'already_registered' }

  if (input.ipHash) {
    const since = new Date(Date.now() - 86_400_000)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(and(eq(customers.ipHash, input.ipHash), gte(customers.registeredAt, since)))
    if (count >= rewards.maxRegistrationsPerIpPerDay) return { ok: false, error: 'too_many_attempts' }
  }

  let referrer: { id: number } | undefined
  if (referrerMobile) {
    ;[referrer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.mobile, referrerMobile), eq(customers.status, 'active')))
    if (!referrer) return { ok: false, error: 'referrer_not_found' }
  }

  try {
    await db.transaction(async (tx) => {
      const [customer] = await tx
        .insert(customers)
        .values({
          name: input.name.trim(),
          mobile,
          referrerMobile,
          referrerId: referrer?.id ?? null,
          language: input.language,
          consentAt: new Date(),
          ipHash: input.ipHash,
        })
        .returning()

      await issueVoucher(tx, {
        customerId: customer.id,
        type: 'welcome',
        amountSen: toSen(rewards.welcomeAmount),
        expiresAt: addDays(rewards.welcomeExpiryDays),
        note: 'First Ride Voucher',
      })

      if (referrer) {
        const monthStart = new Date()
        monthStart.setUTCDate(1)
        monthStart.setUTCHours(0, 0, 0, 0)
        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(referrals)
          .where(
            and(
              eq(referrals.referrerId, referrer.id),
              eq(referrals.status, 'rewarded'),
              gte(referrals.createdAt, monthStart),
            ),
          )
        const overLimit = count >= rewards.maxReferralRewardsPerMonth
        const rewardNow = !overLimit && rewards.referralRewardTrigger === 'registration'
        const reward = rewardNow
          ? await issueVoucher(tx, {
              customerId: referrer.id,
              type: 'referral',
              amountSen: toSen(rewards.referralAmount),
              expiresAt: addDays(rewards.referralExpiryDays),
              note: `Referral reward for introducing ${mobile}`,
            })
          : null
        await tx.insert(referrals).values({
          referrerId: referrer.id,
          referredId: customer.id,
          rewardSen: toSen(rewards.referralAmount),
          status: overLimit ? 'rejected' : rewardNow ? 'rewarded' : 'pending',
          rewardVoucherId: reward?.id ?? null,
          note: overLimit ? 'Monthly referral reward limit reached' : null,
        })
      }
    })
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'already_registered' }
    console.error('Registration failed', e)
    return { ok: false, error: 'server_error' }
  }

  return { ok: true, welcomeAmount: rewards.welcomeAmount, referred: !!referrer }
}

/* -------------------------------------------------------------------------- */
/*                               Voucher lookup                               */
/* -------------------------------------------------------------------------- */

export interface PublicVoucher {
  id: number
  code: string
  type: string
  amount: number
  status: string
  expiresAt: string | null
  /** Can be used on a new booking right now. */
  usable: boolean
}

export async function lookupCustomer(mobileInput: string) {
  const mobile = normalizeMobile(mobileInput)
  if (!mobile) return { ok: false as const, error: 'invalid_mobile' as const }
  await housekeeping()

  const [customer] = await db.select().from(customers).where(eq(customers.mobile, mobile))
  if (!customer) return { ok: true as const, registered: false as const }

  const list = await db
    .select()
    .from(vouchers)
    .where(and(eq(vouchers.customerId, customer.id), inArray(vouchers.status, ['available', 'reserved'])))
    .orderBy(vouchers.issuedAt)

  const active = customer.status === 'active'
  const result: PublicVoucher[] = list.map((v) => ({
    id: v.id,
    code: v.code,
    type: v.type,
    amount: fromSen(v.amountSen),
    status: v.status,
    expiresAt: v.expiresAt?.toISOString() ?? null,
    usable: active && v.status === 'available' && (v.type !== 'welcome' || customer.firstRideStatus === 'pending'),
  }))

  return {
    ok: true as const,
    registered: true as const,
    name: maskName(customer.name),
    blocked: !active,
    vouchers: result,
    balance: result.filter((v) => v.usable).reduce((s, v) => s + v.amount, 0),
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Bookings                                  */
/* -------------------------------------------------------------------------- */

export interface BookingPlace {
  name: string
  address: string
  lat: number
  lng: number
}

export interface BookingInput {
  name: string
  mobile: string
  pickup: BookingPlace
  destination: BookingPlace
  travelDate: string
  pickupTime: string
  returnTime?: string
  tripType: TripType
  accompanimentHours: number
  voucherIds: number[]
  language: string
}

export type BookingError = 'invalid_mobile' | 'invalid_date' | 'invalid_location' | 'voucher_unavailable' | 'too_many_vouchers' | 'server_error'

export async function createBooking(input: BookingInput) {
  const mobile = normalizeMobile(input.mobile)
  if (!mobile) return { ok: false as const, error: 'invalid_mobile' as BookingError }
  if (input.travelDate < malaysiaToday(business.minBookingDaysAhead))
    return { ok: false as const, error: 'invalid_date' as BookingError }
  for (const p of [input.pickup, input.destination]) {
    if (!isInServiceArea(p.lat, p.lng)) return { ok: false as const, error: 'invalid_location' as BookingError }
  }
  const voucherIds = [...new Set(input.voucherIds)]
  if (voucherIds.length > rewards.maxVouchersPerBooking)
    return { ok: false as const, error: 'too_many_vouchers' as BookingError }

  await housekeeping()

  // Recalculate the price on the server so it cannot be changed in the browser.
  let distance: { distanceKm: number; durationMin: number } | null = null
  try {
    distance = await roadDistance(input.pickup, input.destination)
  } catch (e) {
    console.error('Distance lookup failed during booking', e)
  }
  const hasAccompaniment = input.accompanimentHours > 0
  const estimate = calculateEstimate({
    distanceKm: distance?.distanceKm ?? null,
    pickupSide: sideOf(input.pickup.lat, input.pickup.lng),
    destinationSide: sideOf(input.destination.lat, input.destination.lng),
    tripType: input.tripType,
    accompaniment: hasAccompaniment,
    hours: input.accompanimentHours,
    pickupTime: input.pickupTime,
    returnTime: input.tripType === 'round' ? input.returnTime : undefined,
  })

  const [customer] = await db.select().from(customers).where(eq(customers.mobile, mobile))
  if (voucherIds.length && (!customer || customer.status !== 'active'))
    return { ok: false as const, error: 'voucher_unavailable' as BookingError }

  try {
    return await db.transaction(async (tx) => {
      let booking: typeof bookings.$inferSelect | undefined
      for (let attempt = 0; attempt < 3 && !booking; attempt++) {
        const reference = `CR-${malaysiaToday().slice(2).replaceAll('-', '')}-${randomCode(4)}`
        const [row] = await tx
          .insert(bookings)
          .values({
            reference,
            customerId: customer?.id ?? null,
            name: input.name.trim(),
            mobile,
            pickup: input.pickup,
            destination: input.destination,
            travelDate: input.travelDate,
            pickupTime: input.pickupTime,
            returnTime: input.tripType === 'round' ? input.returnTime || null : null,
            tripType: input.tripType,
            accompanimentHours: estimate?.accompanimentHours ?? (hasAccompaniment ? input.accompanimentHours : 0),
            distanceKm: distance?.distanceKm ?? null,
            distanceFareSen: estimate ? toSen(estimate.distanceFare) : null,
            crossingSen: estimate ? toSen(estimate.crossingCharge) : null,
            peakSen: estimate ? toSen(estimate.peak) : null,
            accompanimentSen: estimate ? toSen(estimate.accompaniment) : null,
            subtotalSen: estimate ? toSen(estimate.subtotal) : null,
            language: input.language,
          })
          .onConflictDoNothing({ target: bookings.reference })
          .returning()
        booking = row
      }
      if (!booking) throw new Error('Could not create booking reference')

      // Reserve vouchers atomically: only an available, unexpired voucher owned by this customer can be reserved.
      const reserved: (typeof vouchers.$inferSelect)[] = []
      for (const id of voucherIds) {
        const [v] = await tx
          .update(vouchers)
          .set({ status: 'reserved', bookingId: booking.id, reservedAt: new Date() })
          .where(
            and(
              eq(vouchers.id, id),
              eq(vouchers.customerId, customer!.id),
              eq(vouchers.status, 'available'),
              or(isNull(vouchers.expiresAt), gte(vouchers.expiresAt, new Date())),
              customer!.firstRideStatus === 'pending' ? undefined : sql`${vouchers.type} <> 'welcome'`,
            ),
          )
          .returning()
        if (!v) throw new VoucherUnavailable()
        await logEvent(tx, v.id, 'reserved', { bookingId: booking.id, note: booking.reference })
        reserved.push(v)
      }

      const amounts = reserved.map((v) => fromSen(v.amountSen))
      const applied = estimate ? applyVouchers(estimate, amounts) : null
      const discountSen = applied ? toSen(applied.discount) : toSen(amounts.reduce((a, b) => a + b, 0))
      const totalSen = applied ? toSen(applied.payable) : null
      await tx.update(bookings).set({ discountSen, totalSen }).where(eq(bookings.id, booking.id))

      return {
        ok: true as const,
        reference: booking.reference,
        mobile,
        distanceKm: distance?.distanceKm ?? null,
        durationMin: distance?.durationMin ?? null,
        estimate: estimate
          ? {
              distanceFare: estimate.distanceFare,
              crossingCharge: estimate.crossingCharge,
              peak: estimate.peak,
              peakTrips: estimate.peakTrips,
              accompaniment: estimate.accompaniment,
              accompanimentHours: estimate.accompanimentHours,
              subtotal: estimate.subtotal,
            }
          : null,
        vouchers: reserved.map((v) => ({ code: v.code, type: v.type, amount: fromSen(v.amountSen) })),
        discount: fromSen(discountSen),
        total: totalSen === null ? null : fromSen(totalSen),
      }
    })
  } catch (e) {
    if (e instanceof VoucherUnavailable) return { ok: false as const, error: 'voucher_unavailable' as BookingError }
    console.error('Booking failed', e)
    return { ok: false as const, error: 'server_error' as BookingError }
  }
}

class VoucherUnavailable extends Error {}

/* -------------------------------------------------------------------------- */
/*                               Admin actions                                */
/* -------------------------------------------------------------------------- */

export async function setBookingStatus(bookingId: number, status: 'confirmed' | 'completed' | 'cancelled', actor: string) {
  return db.transaction(async (tx) => {
    const [booking] = await tx.select().from(bookings).where(eq(bookings.id, bookingId))
    if (!booking) throw new Error('Booking not found')
    if (booking.status === 'completed' || booking.status === 'cancelled')
      throw new Error(`This booking is already ${booking.status}`)
    const now = new Date()

    if (status === 'confirmed') {
      await tx.update(bookings).set({ status, confirmedAt: now }).where(eq(bookings.id, bookingId))
      return
    }

    if (status === 'cancelled') {
      await tx.update(bookings).set({ status, cancelledAt: now }).where(eq(bookings.id, bookingId))
      await releaseVouchers(tx, bookingId, actor, `Booking ${booking.reference} cancelled`)
      return
    }

    // Completed: redeem the reserved vouchers and close the first ride.
    await tx.update(bookings).set({ status, completedAt: now }).where(eq(bookings.id, bookingId))
    const held = await tx
      .update(vouchers)
      .set({ status: 'redeemed', redeemedAt: now })
      .where(and(eq(vouchers.bookingId, bookingId), eq(vouchers.status, 'reserved')))
      .returning({ id: vouchers.id })
    for (const v of held) await logEvent(tx, v.id, 'redeemed', { bookingId, actor, note: booking.reference })

    if (!booking.customerId) return
    const [customer] = await tx.select().from(customers).where(eq(customers.id, booking.customerId))
    if (!customer || customer.firstRideStatus === 'completed') return

    await tx.update(customers).set({ firstRideStatus: 'completed' }).where(eq(customers.id, customer.id))
    // The welcome voucher is only valid for the first completed ride.
    const unusedWelcome = await tx
      .update(vouchers)
      .set({ status: 'expired' })
      .where(and(eq(vouchers.customerId, customer.id), eq(vouchers.type, 'welcome'), eq(vouchers.status, 'available')))
      .returning({ id: vouchers.id })
    for (const v of unusedWelcome) await logEvent(tx, v.id, 'expired', { note: 'First ride completed without this voucher' })

    // Referral rewards that wait for the friend's first ride.
    const [pending] = await tx
      .select()
      .from(referrals)
      .where(and(eq(referrals.referredId, customer.id), eq(referrals.status, 'pending')))
    if (pending) {
      const [referrer] = await tx.select().from(customers).where(eq(customers.id, pending.referrerId))
      if (referrer?.status === 'active') {
        const reward = await issueVoucher(tx, {
          customerId: referrer.id,
          type: 'referral',
          amountSen: pending.rewardSen,
          expiresAt: addDays(rewards.referralExpiryDays),
          note: `Referral reward: ${customer.mobile} completed first ride`,
        })
        await tx.update(referrals).set({ status: 'rewarded', rewardVoucherId: reward.id }).where(eq(referrals.id, pending.id))
      } else {
        await tx.update(referrals).set({ status: 'rejected', note: 'Referrer blocked' }).where(eq(referrals.id, pending.id))
      }
    }
  })
}

export async function adminIssueVoucher(input: { mobile: string; amount: number; expiresAt: string | null; note?: string }, actor: string) {
  const mobile = normalizeMobile(input.mobile)
  if (!mobile) throw new Error('Invalid mobile number')
  const [customer] = await db.select().from(customers).where(eq(customers.mobile, mobile))
  if (!customer) throw new Error('No customer is registered with this mobile number')
  return issueVoucher(db, {
    customerId: customer.id,
    type: 'manual',
    amountSen: toSen(input.amount),
    expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T23:59:59+08:00`) : null,
    note: input.note || 'Issued by CareRide',
    actor,
  })
}

export async function adminUpdateVoucher(
  input: { id: number; amount?: number; expiresAt?: string | null; status?: 'available' | 'cancelled' | 'expired'; note?: string },
  actor: string,
) {
  const [v] = await db.select().from(vouchers).where(eq(vouchers.id, input.id))
  if (!v) throw new Error('Voucher not found')
  if (v.status === 'redeemed') throw new Error('Redeemed vouchers cannot be changed')
  if (v.status === 'reserved' && input.status) throw new Error('Cancel or complete the booking first')
  const changes: Partial<typeof vouchers.$inferInsert> = {}
  const notes: string[] = []
  if (input.amount !== undefined) {
    changes.amountSen = toSen(input.amount)
    notes.push(`amount ${fromSen(v.amountSen)} → ${input.amount}`)
  }
  if (input.expiresAt !== undefined) {
    changes.expiresAt = input.expiresAt ? new Date(`${input.expiresAt}T23:59:59+08:00`) : null
    notes.push(`expiry → ${input.expiresAt ?? 'none'}`)
  }
  if (input.status) {
    changes.status = input.status
    notes.push(`status ${v.status} → ${input.status}`)
  }
  if (!notes.length) return
  await db.update(vouchers).set(changes).where(eq(vouchers.id, v.id))
  await logEvent(db, v.id, input.status === 'cancelled' ? 'cancelled' : 'adjusted', {
    actor,
    note: [notes.join(', '), input.note].filter(Boolean).join(' — '),
  })
}

export async function adminSetCustomerStatus(customerId: number, status: 'active' | 'blocked', note: string | undefined, actor: string) {
  await db.transaction(async (tx) => {
    await tx.update(customers).set({ status, adminNote: note ?? null }).where(eq(customers.id, customerId))
    if (status === 'blocked') {
      // A blocked account's unused vouchers are cancelled.
      const cancelled = await tx
        .update(vouchers)
        .set({ status: 'cancelled' })
        .where(and(eq(vouchers.customerId, customerId), eq(vouchers.status, 'available')))
        .returning({ id: vouchers.id })
      for (const v of cancelled) await logEvent(tx, v.id, 'cancelled', { actor, note: 'Account blocked' })
    }
  })
}
