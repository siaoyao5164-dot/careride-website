/**
 * CareRide pricing configuration — the single place to update fares.
 *
 * How a trip estimate is calculated (see src/lib/pricing.ts):
 *   one-way leg fare  = max(minOneWayFare, distanceKm × perKmRate), rounded to the nearest RM
 *                       distanceKm is the real road distance between the customer's exact
 *                       pickup and destination (looked up from OpenStreetMap routing)
 *   transport fare    = leg fare × number of legs (1 for one-way, 2 for round trip)
 *   crossing charge   = crossingSurcharge × number of mainland ↔ island crossings
 *                       (included inside the transport fare shown to customers)
 *   peak-hour charge  = peakSurcharge per trip that starts inside a peak window
 *   accompaniment     = firstBlockPrice for the first firstBlockHours,
 *                       + extraHourPrice for each additional hour
 *   total             = transport + peak + accompaniment
 */

/** Named service areas (shown in the footer and in Google structured data). */
export type AreaId = 'bm' | 'perai' | 'seberang-jaya' | 'butterworth' | 'penang-island'
export type Side = 'mainland' | 'island'

export const pricing = {
  currency: 'RM',

  /** Price per kilometre of road distance (RM). */
  perKmRate: 3.6,
  /** Minimum price for one one-way trip (RM). Round trip minimum = 2 × this. */
  minOneWayFare: 25,

  /** Charged once per mainland ↔ Penang Island crossing (RM). */
  crossingSurcharge: 18,

  /** Added per trip (each leg) when the pickup time falls inside a peak window (RM). */
  peakSurcharge: 10,
  /** Peak windows in 24-hour time. Start is included, end is not. */
  peakWindows: [
    { start: '07:30', end: '09:00' },
    { start: '17:00', end: '19:00' },
  ],

  accompaniment: {
    /** Price for the first block of hours (RM). */
    firstBlockPrice: 90,
    /** Hours covered by the first block. */
    firstBlockHours: 2,
    /** Price for each extra hour after the first block (RM). */
    extraHourPrice: 20,
    /** Smallest number of hours a customer can choose. */
    minHours: 2,
    /** Largest number of hours a customer can choose in the calculator. */
    maxHours: 12,
  },

  /**
   * Locations customers can search for (roughly Penang state).
   * Pickups and destinations outside this box are not offered.
   */
  serviceBounds: { minLat: 5.1, maxLat: 5.6, minLng: 100.15, maxLng: 100.56 },

  /**
   * Penang Island test: a point is on the island when it is inside this box.
   * The island's east coast is west of 100.352°E, while the mainland coast
   * (Butterworth, Perai, Batu Kawan) is east of it.
   */
  island: { minLat: 5.22, maxLat: 5.52, maxLng: 100.352 },
} as const
