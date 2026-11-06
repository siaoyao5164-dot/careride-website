/** A pickup or destination chosen by the customer. */
export interface Place {
  id: string
  /** Main line, e.g. "Hospital Pulau Pinang" or "12 Jalan Kenari". */
  name: string
  /** Second line, e.g. "Jalan Residensi, George Town, 10990". */
  address: string
  lat: number
  lng: number
}

export function placeLabel(p: Place) {
  return p.address ? `${p.name}, ${p.address}` : p.name
}

export function mapsLink(p: Place) {
  return `https://www.google.com/maps/search/?api=1&query=${p.lat.toFixed(6)},${p.lng.toFixed(6)}`
}
