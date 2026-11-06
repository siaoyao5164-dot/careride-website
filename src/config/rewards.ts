/**
 * CareRide voucher and referral settings — change the values here to adjust the programme.
 * All voucher and referral rules are enforced on the server (src/server/*.server.ts).
 */
export const rewards = {
  /** RM8 First Ride Voucher issued to every new customer. */
  welcomeAmount: 8,
  /** Days before an unused welcome voucher expires (null = never expires). */
  welcomeExpiryDays: 180 as number | null,

  /** RM5 Referral Voucher issued to the customer who introduced a new customer. */
  referralAmount: 5,
  /** Days before an unused referral voucher expires (null = never expires). */
  referralExpiryDays: 180 as number | null,
  /**
   * When the referrer receives their RM5:
   *  - 'registration': as soon as the friend registers (default, as requested)
   *  - 'first_ride':   only after the friend's first ride is marked completed (stronger fraud protection)
   */
  referralRewardTrigger: 'registration' as 'registration' | 'first_ride',
  /** Maximum referral rewards one customer can earn per calendar month (anti-abuse). */
  maxReferralRewardsPerMonth: 10,

  /** How many vouchers a customer may use on one booking. */
  maxVouchersPerBooking: 1,

  /**
   * A voucher is reserved when the customer sends a booking on WhatsApp.
   * If you never confirm or complete that booking, it is cancelled automatically
   * after this many days and the voucher becomes available again.
   */
  reservationHoldDays: 14,

  /** Maximum new registrations from one internet connection per day (anti-abuse). */
  maxRegistrationsPerIpPerDay: 3,
} as const
