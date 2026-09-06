import { toGregorian, toJalaali } from 'jalaali-js'

export const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
export const persianWeekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export function todayIso() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function isoToJalaali(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '')
  if (!match) return toJalaali(new Date())
  return toJalaali(Number(match[1]), Number(match[2]), Number(match[3]))
}

export function jalaaliToIso(jy, jm, jd) {
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

export function formatPersianDate(isoDate, options = { dateStyle: 'medium' }) {
  if (!isoDate) return '—'
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', options).format(new Date(`${isoDate}T00:00:00`))
}
