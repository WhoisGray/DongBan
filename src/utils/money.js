import { getCurrency } from './currencies.js'

export function toMinor(amount, currencyCode = 'TOMAN') {
  const factor = 10 ** getCurrency(currencyCode).decimals
  const number = Number(amount)
  if (!Number.isFinite(number)) return 0
  return Math.round(number * factor)
}
export const fromMinor = (amount, code = 'TOMAN') => amount / (10 ** getCurrency(code).decimals)
export function formatMoney(minorAmount, code = 'TOMAN', withLabel = true) {
  const currency = getCurrency(code)
  const value = fromMinor(minorAmount, code)
  const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: currency.decimals }).format(value)
  return withLabel ? `${formatted} ${currency.label}` : formatted
}
export function parseAmount(value, code = 'TOMAN') {
  const normalized = String(value).replace(/[٬,\s]/g, '')
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) return null
  const minor = toMinor(amount, code)
  return minor > 0 && Number.isSafeInteger(minor) ? minor : null
}
