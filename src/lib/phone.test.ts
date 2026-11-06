import { describe, expect, it } from 'vitest'
import { formatMobile, normalizeMobile } from './phone'

describe('normalizeMobile', () => {
  it('accepts common Malaysian formats', () => {
    expect(normalizeMobile('012-345 6789')).toBe('60123456789')
    expect(normalizeMobile('+60 12-345 6789')).toBe('60123456789')
    expect(normalizeMobile('60123456789')).toBe('60123456789')
    expect(normalizeMobile('011-2149 0832')).toBe('601121490832')
    expect(normalizeMobile('0060 19 876 5432')).toBe('60198765432')
  })
  it('rejects landlines, wrong lengths and junk', () => {
    expect(normalizeMobile('04-123 4567')).toBeNull()
    expect(normalizeMobile('012-345 678')).toBeNull()
    expect(normalizeMobile('011-2149 083')).toBeNull()
    expect(normalizeMobile('015-123 4567')).toBeNull()
    expect(normalizeMobile('abc')).toBeNull()
    expect(normalizeMobile('')).toBeNull()
  })
  it('formats for display', () => {
    expect(formatMobile('60123456789')).toBe('012-345 6789')
    expect(formatMobile('601121490832')).toBe('011-2149 0832')
  })
})
