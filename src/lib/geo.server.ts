/**
 * Server-only helpers for location search and road distance.
 * Uses free OpenStreetMap services: Photon (search) and OSRM (driving routes).
 */
import { pricing } from '@/config/pricing'
import { isInServiceArea } from '@/lib/pricing'
import type { Place } from '@/lib/places'

const USER_AGENT = 'CareRide-website/1.0 (https://careride-website.netlify.app)'
const PHOTON = 'https://photon.komoot.io'
const OSRM = 'https://router.project-osrm.org'

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] }
  properties?: Record<string, unknown>
}

function str(v: unknown) {
  return typeof v === 'string' && v.trim() ? v.trim() : ''
}

function toPlace(f: PhotonFeature): Place | null {
  const coords = f.geometry?.coordinates
  const p = f.properties ?? {}
  if (!coords || coords.length < 2) return null
  const [lng, lat] = coords
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInServiceArea(lat, lng)) return null

  const street = [str(p.housenumber), str(p.street)].filter(Boolean).join(' ')
  const name = str(p.name) || street || str(p.locality) || str(p.district) || str(p.city)
  if (!name) return null
  const parts = [name === street ? '' : street, str(p.locality), str(p.district), str(p.city), str(p.postcode)]
  const seen = new Set([name.toLowerCase()])
  const address = parts
    .filter((x) => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase()))
    .join(', ')

  return { id: `${str(p.osm_type)}${String(p.osm_id ?? '')}-${lat.toFixed(5)},${lng.toFixed(5)}`, name, address, lat, lng }
}

async function photon(path: string) {
  const res = await fetch(`${PHOTON}${path}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Search service error ${res.status}`)
  const data = (await res.json()) as { features?: PhotonFeature[] }
  const places = (data.features ?? []).map(toPlace).filter((p): p is Place => p !== null)
  // Drop duplicates (same name + address), keeping the first (best) match.
  const unique = new Map<string, Place>()
  for (const p of places) {
    const key = `${p.name}|${p.address}`
    if (!unique.has(key)) unique.set(key, p)
  }
  return [...unique.values()]
}

export async function searchPlaces(query: string) {
  const b = pricing.serviceBounds
  const params = new URLSearchParams({
    q: query,
    limit: '8',
    bbox: `${b.minLng},${b.minLat},${b.maxLng},${b.maxLat}`,
    // Prefer results near central Penang.
    lat: '5.38',
    lon: '100.38',
  })
  return (await photon(`/api/?${params}`)).slice(0, 6)
}

export async function reversePlace(lat: number, lng: number): Promise<Place | null> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng), limit: '1' })
  const [place] = await photon(`/reverse?${params}`)
  // Keep the customer's real GPS position rather than the nearest mapped feature.
  return place ? { ...place, lat, lng } : null
}

export async function roadDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
  const res = await fetch(`${OSRM}/route/v1/driving/${coords}?overview=false`, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Routing service error ${res.status}`)
  const data = (await res.json()) as { code?: string; routes?: { distance?: number; duration?: number }[] }
  const route = data.routes?.[0]
  if (data.code !== 'Ok' || typeof route?.distance !== 'number' || typeof route.duration !== 'number') {
    throw new Error('No route found')
  }
  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
  }
}

/** Parses "lat,lng" and checks it is inside the service area. */
export function parsePoint(value: string | null) {
  if (!value) return null
  const [lat, lng] = value.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

export const cacheHeaders = (seconds: number) => ({
  'Cache-Control': 'public, max-age=300',
  'Netlify-CDN-Cache-Control': `public, durable, max-age=${seconds}, stale-while-revalidate=${seconds}`,
})
