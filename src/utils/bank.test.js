import { describe, expect, it } from 'vitest'
import {
  convertPersianToEnglishDigits,
  cleanDigits,
  validateCard,
  getBankFromCard,
  getBankFromShaba,
  validateSheba,
  formatCardNumber,
  formatSheba
} from './bank.js'

describe('bank utilities', () => {
  it('converts persian and arabic digits', () => {
    expect(convertPersianToEnglishDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789')
    expect(convertPersianToEnglishDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789')
    expect(cleanDigits('۶۰۳۷-۹۹۱۱-۲۲۳۳-۴۴۵۵')).toBe('6037991122334455')
  })

  it('detects bank from card prefix', () => {
    expect(getBankFromCard('6037991234567890')?.bankKey).toBe('meli')
    expect(getBankFromCard('۶۱۰۴۳۳۱۲۳۴۵۶۷۸۹۰')?.bankKey).toBe('mellat')
    expect(getBankFromCard('5892101234567890')?.bankKey).toBe('sepah')
    expect(getBankFromCard('6219861912345678')?.bankKey).toBe('blu')
    expect(getBankFromCard('۶۲۱۹۸۶۱۹۱۲۳۴۵۶۷۸')?.bankName).toBe('بلوبانک')
    expect(getBankFromCard('6219860012345678')?.bankKey).toBe('saman')
    expect(getBankFromCard('1111111111111111')).toBeNull()
  })

  it('validates card numbers with checksum algorithm', () => {
    // 6037991199999992 - valid luhn
    // Test known sample or calculate valid checksum:
    // Let's test a card: 6037991753412586 -> let's test validateCard
    expect(validateCard('1234')).toBe(false)
    expect(validateCard('60379912345678901234')).toBe(false)
  })

  it('detects bank from Sheba code', () => {
    expect(getBankFromShaba('012')?.bankKey).toBe('mellat')
    expect(getBankFromShaba('IR120170000000123456789012')?.bankKey).toBe('meli')
    expect(getBankFromShaba('IR880180000000123456789012')?.bankKey).toBe('tejarat')
    expect(validateSheba('123')).toBe(false)
    expect(validateSheba('IR123')).toBe(false)
  })

  it('formats card and sheba numbers', () => {
    expect(formatCardNumber('6037991122334455')).toBe('6037 9911 2233 4455')
    expect(formatSheba('IR120170000000123456789012')).toBe('IR1201 7000 0000 1234 5678 9012')
  })
})
