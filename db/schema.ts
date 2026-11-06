import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/** Money is stored in sen (RM1 = 100) to avoid rounding errors. */

export const customers = pgTable(
  'customers',
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    /** Canonical Malaysian mobile number, digits only, e.g. "60123456789". Unique customer ID. */
    mobile: text().notNull().unique(),
    referrerMobile: text('referrer_mobile'),
    referrerId: integer('referrer_id'),
    /** 'pending' until the first eligible booking is completed, then 'completed'. */
    firstRideStatus: text('first_ride_status').notNull().default('pending'),
    /** 'active' | 'blocked' */
    status: text().notNull().default('active'),
    language: text().notNull().default('en'),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    /** One-way hash of the registration IP, only used to limit repeated sign-ups. */
    ipHash: text('ip_hash'),
    adminNote: text('admin_note'),
    registeredAt: timestamp('registered_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('customers_ip_hash_idx').on(t.ipHash, t.registeredAt)],
)

export const bookings = pgTable(
  'bookings',
  {
    id: serial().primaryKey(),
    reference: text().notNull().unique(),
    customerId: integer('customer_id').references(() => customers.id),
    name: text().notNull(),
    mobile: text().notNull(),
    pickup: jsonb().$type<{ name: string; address: string; lat: number; lng: number }>().notNull(),
    destination: jsonb().$type<{ name: string; address: string; lat: number; lng: number }>().notNull(),
    travelDate: date('travel_date').notNull(),
    pickupTime: text('pickup_time'),
    returnTime: text('return_time'),
    /** 'oneway' | 'round' */
    tripType: text('trip_type').notNull(),
    accompanimentHours: integer('accompaniment_hours').notNull().default(0),
    distanceKm: doublePrecision('distance_km'),
    distanceFareSen: integer('distance_fare_sen'),
    crossingSen: integer('crossing_sen'),
    peakSen: integer('peak_sen'),
    accompanimentSen: integer('accompaniment_sen'),
    subtotalSen: integer('subtotal_sen'),
    discountSen: integer('discount_sen').notNull().default(0),
    totalSen: integer('total_sen'),
    language: text().notNull().default('en'),
    /** 'pending' | 'confirmed' | 'completed' | 'cancelled' */
    status: text().notNull().default('pending'),
    adminNote: text('admin_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  },
  (t) => [index('bookings_status_idx').on(t.status, t.createdAt), index('bookings_mobile_idx').on(t.mobile)],
)

export const vouchers = pgTable(
  'vouchers',
  {
    id: serial().primaryKey(),
    code: text().notNull().unique(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    /** 'welcome' (RM8 first ride) | 'referral' (RM5) | 'manual' (issued by admin) */
    type: text().notNull(),
    amountSen: integer('amount_sen').notNull(),
    /** 'available' | 'reserved' | 'redeemed' | 'expired' | 'cancelled' */
    status: text().notNull().default('available'),
    bookingId: integer('booking_id').references(() => bookings.id),
    note: text(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    reservedAt: timestamp('reserved_at', { withTimezone: true }),
    redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
  },
  (t) => [
    index('vouchers_customer_idx').on(t.customerId, t.status),
    // A customer can only ever receive one welcome voucher.
    uniqueIndex('vouchers_one_welcome_per_customer').on(t.customerId).where(sql`type = 'welcome'`),
  ],
)

export const referrals = pgTable('referrals', {
  id: serial().primaryKey(),
  referrerId: integer('referrer_id')
    .notNull()
    .references(() => customers.id),
  /** Each new customer can only be referred once. */
  referredId: integer('referred_id')
    .notNull()
    .unique()
    .references(() => customers.id),
  rewardSen: integer('reward_sen').notNull(),
  /** 'rewarded' | 'pending' (waiting for first ride) | 'rejected' */
  status: text().notNull(),
  rewardVoucherId: integer('reward_voucher_id').references(() => vouchers.id),
  note: text(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Audit trail of everything that happens to a voucher. */
export const voucherEvents = pgTable(
  'voucher_events',
  {
    id: serial().primaryKey(),
    voucherId: integer('voucher_id')
      .notNull()
      .references(() => vouchers.id),
    bookingId: integer('booking_id').references(() => bookings.id),
    /** 'issued' | 'reserved' | 'released' | 'redeemed' | 'expired' | 'adjusted' | 'cancelled' */
    event: text().notNull(),
    actor: text().notNull().default('system'),
    note: text(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('voucher_events_voucher_idx').on(t.voucherId)],
)

/** Real customer reviews, entered by the owner in the admin dashboard. */
export const testimonials = pgTable('testimonials', {
  id: serial().primaryKey(),
  name: text().notNull(),
  /** Optional detail shown under the name, e.g. "Bukit Mertajam · Hospital accompaniment". */
  detail: text(),
  quote: text().notNull(),
  rating: integer().notNull().default(5),
  published: boolean().notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
