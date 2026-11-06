import { pricing, type Side } from '@/config/pricing'

export type TripType = 'oneway' | 'round'

export interface EstimateInput {
  /** One-way road distance in km, or null while it is unknown. */
  distanceKm: number | null
  pickupSide: Side
  destinationSide: Side
  tripType: TripType
  accompaniment: boolean
  hours: number
  /** "HH:MM" 24-hour pickup time for the outbound trip. */
  pickupTime?: string
  /** "HH:MM" 24-hour pickup time for the return trip (round trip only). */
  returnTime?: string
}

export interface Estimate {
  distanceKm: number
  legs: number
  crossings: number
  /** Distance-based fare for all legs. */
  distanceFare: number
  /** Mainland ↔ island crossing surcharge for all legs (0 when not crossing). */
  crossingCharge: number
  peakTrips: number
  peak: number
  accompanimentHours: number
  accompaniment: number
  /** Everything added together, before any voucher. */
  subtotal: number
  /** The part of the subtotal a voucher can be used on (transport only, not accompaniment). */
  voucherEligible: number
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function isPeakTime(time?: string) {
  if (!time) return false
  const t = toMinutes(time)
  if (t === null) return false
  return pricing.peakWindows.some((w) => {
    const start = toMinutes(w.start)!
    const end = toMinutes(w.end)!
    return t >= start && t < end
  })
}

/** Which side of the Penang Strait a coordinate is on. */
export function sideOf(lat: number, lng: number): Side {
  const { minLat, maxLat, maxLng } = pricing.island
  return lat >= minLat && lat <= maxLat && lng <= maxLng ? 'island' : 'mainland'
}

export function isInServiceArea(lat: number, lng: number) {
  const b = pricing.serviceBounds
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
}

export function legFare(distanceKm: number) {
  return Math.max(pricing.minOneWayFare, Math.round(distanceKm * pricing.perKmRate))
}

export function accompanimentPrice(hours: number) {
  const { firstBlockPrice, firstBlockHours, extraHourPrice, minHours } = pricing.accompaniment
  const h = Math.max(minHours, Math.ceil(hours))
  return firstBlockPrice + Math.max(0, h - firstBlockHours) * extraHourPrice
}

/** Returns null until the road distance is known. */
export function calculateEstimate(input: EstimateInput): Estimate | null {
  if (input.distanceKm === null || !Number.isFinite(input.distanceKm) || input.distanceKm < 0) return null

  const legs = input.tripType === 'round' ? 2 : 1
  const distanceKm = input.distanceKm
  const distanceFare = legFare(distanceKm) * legs

  // One crossing per leg when the trip goes between mainland and island.
  const crossings = input.pickupSide !== input.destinationSide ? legs : 0
  const crossingCharge = crossings * pricing.crossingSurcharge

  const peakTrips =
    (isPeakTime(input.pickupTime) ? 1 : 0) +
    (input.tripType === 'round' && isPeakTime(input.returnTime) ? 1 : 0)
  const peak = peakTrips * pricing.peakSurcharge

  const accompanimentHours = input.accompaniment
    ? Math.max(pricing.accompaniment.minHours, input.hours)
    : 0
  const accompaniment = input.accompaniment ? accompanimentPrice(accompanimentHours) : 0

  const voucherEligible = distanceFare + crossingCharge + peak
  return {
    distanceKm,
    legs,
    crossings,
    distanceFare,
    crossingCharge,
    peakTrips,
    peak,
    accompanimentHours,
    accompaniment,
    subtotal: voucherEligible + accompaniment,
    voucherEligible,
  }
}

/**
 * Applies voucher amounts (RM) to an estimate.
 * The discount never exceeds the eligible transport fare, and the payable amount is never negative.
 */
export function applyVouchers(estimate: Estimate, voucherAmounts: number[]) {
  const requested = voucherAmounts.reduce((sum, v) => sum + Math.max(0, v), 0)
  const discount = Math.min(requested, estimate.voucherEligible, estimate.subtotal)
  const rounded = Math.round(discount * 100) / 100
  return { discount: rounded, payable: Math.max(0, Math.round((estimate.subtotal - rounded) * 100) / 100) }
}

export function formatRM(amount: number) {
  return `${pricing.currency}${amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`
}

export function formatKm(km: number) {
  return `${km.toLocaleString('en-MY', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

/** Headline "From" prices. */
export const fromPrices = {
  oneWay: pricing.minOneWayFare,
  roundTrip: pricing.minOneWayFare * 2,
  accompaniment: pricing.accompaniment.firstBlockPrice,
}
