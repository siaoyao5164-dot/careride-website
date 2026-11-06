/**
 * Malaysian mobile numbers.
 * Stored in one canonical form: country code + number, digits only (e.g. "60123456789").
 * Mobile prefixes: 010, 012, 013, 014, 016, 017, 018, 019 (+7 digits) and 011 (+8 digits).
 */
const MOBILE = /^1(?:[02-46-9]\d{7}|1\d{8})$/

/** Returns the canonical "60XXXXXXXXX" form, or null if it is not a valid Malaysian mobile number. */
export function normalizeMobile(input: string): string | null {
  let d = input.replace(/[\s\-().+]/g, '')
  if (!/^\d+$/.test(d)) return null
  if (d.startsWith('0060')) d = d.slice(4)
  else if (d.startsWith('60')) d = d.slice(2)
  else if (d.startsWith('0')) d = d.slice(1)
  return MOBILE.test(d) ? `60${d}` : null
}

/** "60123456789" → "012-345 6789" */
export function formatMobile(canonical: string) {
  const local = `0${canonical.replace(/^60/, '')}`
  return local.length === 11
    ? `${local.slice(0, 3)}-${local.slice(3, 7)} ${local.slice(7)}`
    : `${local.slice(0, 3)}-${local.slice(3, 6)} ${local.slice(6)}`
}
