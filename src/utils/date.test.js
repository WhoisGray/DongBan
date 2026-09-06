import { describe, expect, it } from 'vitest'
import { isoToJalaali, jalaaliToIso, todayIso } from './date.js'

describe('Jalaali dates', () => {
  it('converts Nowruz in both directions', () => {
    expect(isoToJalaali('2026-03-21')).toEqual({ jy: 1405, jm: 1, jd: 1 })
    expect(jalaaliToIso(1405, 1, 1)).toBe('2026-03-21')
  })
  it('returns a local ISO-shaped date', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
