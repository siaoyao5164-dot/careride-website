import { describe, expect, it } from 'vitest'
import { applyVouchers, calculateEstimate, isInServiceArea, isPeakTime, sideOf } from './pricing'

const base = {
  pickupSide: 'mainland' as const,
  destinationSide: 'mainland' as const,
  tripType: 'oneway' as const,
  accompaniment: false,
  hours: 2,
}

describe('calculateEstimate', () => {
  it('charges RM3.6 per km, rounded to the nearest ringgit', () => {
    const e = calculateEstimate({ ...base, distanceKm: 20 })!
    expect(e.distanceFare).toBe(72)
    expect(e.subtotal).toBe(72)
    expect(calculateEstimate({ ...base, distanceKm: 26.3 })!.distanceFare).toBe(95) // 94.68
  })

  it('handles a Bukit Mertajam → Penang GH round trip with accompaniment', () => {
    const e = calculateEstimate({
      ...base,
      distanceKm: 26.3,
      destinationSide: 'island',
      tripType: 'round',
      accompaniment: true,
      hours: 3,
      pickupTime: '10:00',
      returnTime: '14:00',
    })!
    expect(e.distanceFare).toBe(190)
    expect(e.crossings).toBe(2)
    expect(e.crossingCharge).toBe(36)
    expect(e.accompaniment).toBe(110)
    expect(e.subtotal).toBe(336)
    expect(e.voucherEligible).toBe(226)
    expect(applyVouchers(e, [8])).toEqual({ discount: 8, payable: 328 })
  })

  it('applies the RM25 minimum and no crossing fee on the same side', () => {
    const e = calculateEstimate({ ...base, distanceKm: 4 })!
    expect(e.distanceFare).toBe(25)
    expect(e.crossings).toBe(0)
    expect(e.crossingCharge).toBe(0)
  })

  it('adds RM10 per peak-hour trip', () => {
    const e = calculateEstimate({ ...base, distanceKm: 10, tripType: 'round', pickupTime: '08:00', returnTime: '17:30' })!
    expect(e.peak).toBe(20)
  })

  it('returns null until the distance is known', () => {
    expect(calculateEstimate({ ...base, distanceKm: null })).toBeNull()
  })
})

describe('applyVouchers', () => {
  it('never discounts more than the transport fare and never goes negative', () => {
    const e = calculateEstimate({ ...base, distanceKm: 1, accompaniment: true, hours: 2 })!
    // RM25 minimum transport + RM90 accompaniment; a RM30 voucher only covers the RM25 transport.
    expect(applyVouchers(e, [30])).toEqual({ discount: 25, payable: 90 })
    const t = calculateEstimate({ ...base, distanceKm: 1 })!
    expect(applyVouchers(t, [8, 50])).toEqual({ discount: 25, payable: 0 })
    expect(applyVouchers(t, [])).toEqual({ discount: 0, payable: 25 })
  })
})

describe('sideOf', () => {
  it('puts island and mainland places on the right side', () => {
    expect(sideOf(5.417, 100.3115)).toBe('island') // Penang General Hospital
    expect(sideOf(5.3214, 100.2823)).toBe('island') // Bayan Baru
    expect(sideOf(5.3631, 100.4561)).toBe('mainland') // Bukit Mertajam
    expect(sideOf(5.3946, 100.3667)).toBe('mainland') // Butterworth (Penang Sentral)
    expect(sideOf(5.2464, 100.4366)).toBe('mainland') // Batu Kawan
  })

  it('knows the service area', () => {
    expect(isInServiceArea(5.417, 100.3115)).toBe(true)
    expect(isInServiceArea(3.139, 101.6869)).toBe(false) // Kuala Lumpur
  })
})

describe('isPeakTime', () => {
  it('detects peak windows', () => {
    expect(isPeakTime('07:30')).toBe(true)
    expect(isPeakTime('08:59')).toBe(true)
    expect(isPeakTime('09:00')).toBe(false)
    expect(isPeakTime('18:30')).toBe(true)
    expect(isPeakTime('19:00')).toBe(false)
    expect(isPeakTime('12:00')).toBe(false)
  })
})
