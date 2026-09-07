import { categories } from './categories.js'
import { currencies, getCurrency } from './currencies.js'
import { jalaaliToIso, todayIso } from './date.js'
import { createId } from './id.js'
import { fromMinor, normalizeDigits, toMinor } from './money.js'
import { calculateEvent } from './settlement.js'

export const EVENT_TRANSFER_FORMAT = 'dongban-event'
export const EVENT_TRANSFER_VERSION = 1

const cleanText = (value, fallback = '') => String(value ?? fallback).trim()
const validCategories = new Set(categories.map((item) => item.id))

function parseNumber(value) {
  const normalized = normalizeDigits(value ?? '').replace(/[,،\s]/g, '')
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

function parseDate(value, persianValue) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10)
  const normalized = normalizeDigits(value ?? '').replace(/\//g, '-')
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)
  if (isoMatch && Number(isoMatch[1]) >= 1700) {
    const parsed = new Date(`${normalized}T00:00:00Z`)
    if (!Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === normalized) return normalized
  }
  const persian = normalizeDigits(persianValue ?? value ?? '')
  const match = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(persian)
  if (match) {
    try { return jalaaliToIso(Number(match[1]), Number(match[2]), Number(match[3])) } catch { /* handled below */ }
  }
  return null
}

function ensureUniqueId(value, prefix, used) {
  let id = cleanText(value) || createId(prefix)
  if (used.has(id)) throw new Error(`شناسهٔ تکراری «${id}» در فایل وجود دارد.`)
  used.add(id)
  return id
}

export function buildEventTransfer(event) {
  const result = calculateEvent(event)
  const members = event.people.map((person) => ({ id: person.id, name: person.name }))
  const expenses = event.expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    amount: fromMinor(expense.amountMinor, event.currency),
    payer_id: expense.payerId,
    category: expense.category,
    date: expense.date,
    note: expense.note || ''
  }))
  const shares = event.expenses.flatMap((expense) => Object.entries(expense.splits || {})
    .filter(([, weight]) => Number(weight) > 0)
    .map(([personId, weight]) => ({ expense_id: expense.id, member_id: personId, weight: Number(weight) })))
  const memberName = Object.fromEntries(members.map((person) => [person.id, person.name]))
  const expenseCountByPayer = Object.fromEntries(members.map((person) => [person.id, 0]))
  expenses.forEach((expense) => { expenseCountByPayer[expense.payer_id] = (expenseCountByPayer[expense.payer_id] || 0) + 1 })

  return {
    format: EVENT_TRANSFER_FORMAT,
    schema_version: EVENT_TRANSFER_VERSION,
    exported_at: new Date().toISOString(),
    source: 'https://dongban.ir',
    event: {
      title: event.title,
      date: event.date,
      currency: event.currency,
      rounding_increment: Number(event.roundingIncrement || 1),
      note: event.note || ''
    },
    members,
    expenses,
    shares,
    payers: members.filter((person) => (result.paid[person.id] || 0) > 0).map((person) => ({
      member_id: person.id,
      name: person.name,
      expense_count: expenseCountByPayer[person.id] || 0,
      total_paid: fromMinor(result.paid[person.id] || 0, event.currency)
    })),
    calculated: {
      total: fromMinor(result.total, event.currency),
      members: members.map((person) => ({
        member_id: person.id,
        name: person.name,
        paid: fromMinor(result.paid[person.id] || 0, event.currency),
        share: fromMinor(result.consumed[person.id] || 0, event.currency),
        balance: fromMinor(result.balances[person.id] || 0, event.currency)
      })),
      settlements: result.transfers.map((transfer) => ({
        from_id: transfer.from,
        from_name: memberName[transfer.from],
        to_id: transfer.to,
        to_name: memberName[transfer.to],
        amount: fromMinor(transfer.amount, event.currency)
      }))
    }
  }
}

export function createSampleTransfer({ blank = false } = {}) {
  const now = todayIso()
  const event = {
    id: 'event_sample', title: blank ? 'نام رویداد' : 'سفر شمال', date: now,
    currency: 'TOMAN', roundingIncrement: 1000,
    note: blank ? '' : 'نمونهٔ قابل ویرایش برای ورود به دنگ‌بان',
    people: blank ? [{ id: 'person_1', name: 'نام عضو' }] : [
      { id: 'person_1', name: 'سارا' }, { id: 'person_2', name: 'علی' }, { id: 'person_3', name: 'مینا' }
    ],
    expenses: blank ? [] : [{
      id: 'expense_1', title: 'شام', amountMinor: 750000, payerId: 'person_1',
      category: 'food', date: now, note: 'شب اول',
      splits: { person_1: 1, person_2: 1, person_3: 1 }
    }]
  }
  return buildEventTransfer(event)
}

export function validateEventTransfer(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input
  if (!data || typeof data !== 'object') throw new Error('محتوای فایل معتبر نیست.')
  if (data.format !== EVENT_TRANSFER_FORMAT) throw new Error('این فایل، فایل رویداد دنگ‌بان نیست.')
  if (Number(data.schema_version) > EVENT_TRANSFER_VERSION) throw new Error('فایل با نسخهٔ جدیدتری از دنگ‌بان ساخته شده است.')

  const sourceEvent = data.event || {}
  const title = cleanText(sourceEvent.title)
  if (!title) throw new Error('نام رویداد خالی است.')
  const currency = cleanText(sourceEvent.currency, 'TOMAN').toUpperCase()
  if (!currencies[currency]) throw new Error(`واحد پول «${currency}» پشتیبانی نمی‌شود.`)
  const date = parseDate(sourceEvent.date, sourceEvent.persian_date)
  if (!date) throw new Error('تاریخ رویداد معتبر نیست.')
  const rounding = parseNumber(sourceEvent.rounding_increment) ?? 1
  if (rounding <= 0) throw new Error('مقدار رُندکردن باید مثبت باشد.')

  if (!Array.isArray(data.members) || !data.members.length) throw new Error('فایل باید حداقل یک عضو داشته باشد.')
  const memberIds = new Set()
  const people = data.members.map((row, index) => {
    const id = ensureUniqueId(row.id ?? row.member_id, 'person', memberIds)
    const name = cleanText(row.name)
    if (!name) throw new Error(`نام عضو در ردیف ${index + 1} خالی است.`)
    return { id, name }
  })

  const expenseIds = new Set()
  const expenses = (Array.isArray(data.expenses) ? data.expenses : []).map((row, index) => {
    const id = ensureUniqueId(row.id ?? row.expense_id, 'expense', expenseIds)
    const expenseTitle = cleanText(row.title)
    if (!expenseTitle) throw new Error(`عنوان هزینه در ردیف ${index + 1} خالی است.`)
    const amount = parseNumber(row.amount)
    const amountMinor = amount === null ? Number(row.amount_minor) : toMinor(amount, currency)
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error(`مبلغ هزینهٔ «${expenseTitle}» معتبر نیست.`)
    const payerId = cleanText(row.payer_id ?? row.payerId)
    if (!memberIds.has(payerId)) throw new Error(`پرداخت‌کنندهٔ هزینهٔ «${expenseTitle}» در اعضا نیست.`)
    const expenseDate = parseDate(row.date, row.persian_date)
    if (!expenseDate) throw new Error(`تاریخ هزینهٔ «${expenseTitle}» معتبر نیست.`)
    const category = cleanText(row.category, 'other')
    return { id, title: expenseTitle, amountMinor, payerId, category: validCategories.has(category) ? category : 'other', date: expenseDate, note: cleanText(row.note), splits: {} }
  })

  const expenseById = Object.fromEntries(expenses.map((expense) => [expense.id, expense]))
  for (const row of Array.isArray(data.shares) ? data.shares : []) {
    const expenseId = cleanText(row.expense_id)
    const memberId = cleanText(row.member_id)
    const weight = parseNumber(row.weight)
    if (!expenseById[expenseId]) throw new Error(`شناسهٔ هزینهٔ «${expenseId}» در سهم‌ها پیدا نشد.`)
    if (!memberIds.has(memberId)) throw new Error(`شناسهٔ عضو «${memberId}» در سهم‌ها پیدا نشد.`)
    if (weight === null || weight < 0) throw new Error('ضریب سهم باید صفر یا عددی مثبت باشد.')
    if (weight > 0) expenseById[expenseId].splits[memberId] = weight
  }
  expenses.forEach((expense) => {
    if (!Object.values(expense.splits).some((weight) => weight > 0)) throw new Error(`هزینهٔ «${expense.title}» حداقل به یک سهم مثبت نیاز دارد.`)
  })

  const now = new Date().toISOString()
  return {
    id: createId('event'), title, date, currency, roundingIncrement: rounding,
    note: cleanText(sourceEvent.note), people, expenses, createdAt: now, updatedAt: now
  }
}

export function stringifyEventTransfer(event, spacing = 2) {
  return JSON.stringify(buildEventTransfer(event), null, spacing)
}

export function eventTransferAiPrompt() {
  return `فایل پیوست، قالب انتقال رویداد دنگ‌بان است. فقط شیت‌های «رویداد»، «اعضا»، «هزینه‌ها» و «سهم‌ها» را تکمیل یا ویرایش کن و نام شیت‌ها و ستون‌ها را تغییر نده. شناسه‌ها باید در هر شیت یکتا و بین شیت‌ها یکسان باشند. مبلغ را به واحد پول نوشته‌شده در شیت رویداد و به‌صورت عدد وارد کن. payer_id باید یکی از member_idهای شیت اعضا باشد. برای هر هزینه، در شیت سهم‌ها حداقل یک ضریب مثبت ثبت کن؛ ضریب‌های برابر یعنی سهم برابر. تاریخ میلادی را با قالب YYYY-MM-DD وارد کن. شیت‌های «خلاصه افراد» و «تسویه‌ها» خروجی محاسباتی‌اند و لازم نیست ویرایش شوند. فایل نهایی را با فرمت XLSX و همان ساختار تحویل بده.`
}

export function currencyDecimals(code) { return getCurrency(code).decimals }
