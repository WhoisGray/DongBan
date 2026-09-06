import { getCurrency } from './currencies.js'

export function toMinor(amount, currencyCode = 'TOMAN') {
  const factor = 10 ** getCurrency(currencyCode).decimals
  const number = Number(amount)
  if (!Number.isFinite(number)) return 0
  return Math.round(number * factor)
}
export const fromMinor = (amount, code = 'TOMAN') => amount / (10 ** getCurrency(code).decimals)

export function normalizeDigits(value) {
  return String(value)
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/٫/g, '.')
    .replace(/[٬،]/g, ',')
}

export function formatAmountInput(value, code = 'TOMAN') {
  const { decimals } = getCurrency(code)
  const normalized = normalizeDigits(value).replace(/[\s,]/g, '')
  const hasDecimal = normalized.includes('.')
  const [integerPart = '', ...decimalParts] = normalized.split('.')
  const integerDigits = integerPart.replace(/\D/g, '')
  const decimalDigits = decimalParts.join('').replace(/\D/g, '').slice(0, decimals)

  if (!integerDigits && !hasDecimal) return ''
  const cleanInteger = (integerDigits || '0').replace(/^0+(?=\d)/, '')
  const grouped = cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimals > 0 && hasDecimal ? `${grouped}.${decimalDigits}` : grouped
}

export function formatMoney(minorAmount, code = 'TOMAN', withLabel = true) {
  const currency = getCurrency(code)
  const value = fromMinor(minorAmount, code)
  const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: currency.decimals }).format(value)
  return withLabel ? `${formatted} ${currency.label}` : formatted
}
export function parseAmount(value, code = 'TOMAN') {
  const normalized = normalizeDigits(value).replace(/[,\s]/g, '')
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) return null
  const minor = toMinor(amount, code)
  return minor > 0 && Number.isSafeInteger(minor) ? minor : null
}
