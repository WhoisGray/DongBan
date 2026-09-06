import { describe, expect, it } from 'vitest'
import { formatAmountInput, normalizeDigits, parseAmount } from './money.js'

describe('Persian and Arabic number input', () => {
  it('normalizes Persian and Arabic digits and decimal separators', () => {
    expect(normalizeDigits('۱۲۳٬۴۵۶٫۷۸')).toBe('123,456.78')
    expect(normalizeDigits('١٢٣٬٤٥٦٫٧٨')).toBe('123,456.78')
  })

  it('adds thousands separators while typing', () => {
    expect(formatAmountInput('۱۲۳۴۵۶۷', 'TOMAN')).toBe('1,234,567')
    expect(formatAmountInput('١٢٣٤٥٦٧', 'TOMAN')).toBe('1,234,567')
  })

  it('keeps the allowed decimals for decimal currencies', () => {
    expect(formatAmountInput('۱۲۳۴٫۵۶۷', 'USD')).toBe('1,234.56')
    expect(parseAmount('۱٬۲۳۴٫۵۰', 'USD')).toBe(123450)
  })
})
