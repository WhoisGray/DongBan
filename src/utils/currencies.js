export const currencies = {
  TOMAN: { code: 'TOMAN', label: 'تومان', decimals: 0 },
  IRR: { code: 'IRR', label: 'ریال', decimals: 0 },
  USD: { code: 'USD', label: 'دلار', decimals: 2 },
  EUR: { code: 'EUR', label: 'یورو', decimals: 2 },
  GBP: { code: 'GBP', label: 'پوند', decimals: 2 },
  AED: { code: 'AED', label: 'درهم', decimals: 2 },
  TRY: { code: 'TRY', label: 'لیر', decimals: 2 }
}
export const getCurrency = (code) => currencies[code] || currencies.TOMAN
export const roundingOptions = [
  { value: 1, label: 'بدون رُند اضافه' }, { value: 10, label: 'نزدیک‌ترین ۱۰' },
  { value: 100, label: 'نزدیک‌ترین ۱۰۰' }, { value: 1000, label: 'نزدیک‌ترین ۱٬۰۰۰' },
  { value: 10000, label: 'نزدیک‌ترین ۱۰٬۰۰۰' }
]
