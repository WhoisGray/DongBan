import { reactive, readonly } from 'vue'
import { createId } from '../utils/id.js'

export const STORAGE_KEY = 'dongban:data'
export const CURRENT_STORAGE_VERSION = 3
const LEGACY_STORAGE_KEYS = ['dongban:v2']
const MIGRATION_BACKUP_KEY = 'dongban:migration-backup'

const defaultState = () => ({
  version: CURRENT_STORAGE_VERSION,
  settings: { theme: 'light', defaultCurrency: 'TOMAN', defaultRounding: 1 },
  savedPeople: [],
  contacts: [],
  events: [],
  meta: { migratedAt: null }
})

const migrations = {
  2: (data) => ({
    ...data,
    version: 3,
    meta: { ...(data.meta || {}), migratedAt: new Date().toISOString() }
  })
}

function normalizeContacts(data) {
  const contacts = Array.isArray(data.contacts) ? [...data.contacts] : []
  const savedPeople = Array.isArray(data.savedPeople) ? [...data.savedPeople] : []

  savedPeople.forEach((item) => {
    const name = typeof item === 'string' ? item.trim() : (item?.name || '').trim()
    if (!name) return
    const exists = contacts.some((c) => c.name.localeCompare(name, 'fa', { sensitivity: 'base' }) === 0)
    if (!exists) {
      contacts.push({
        id: (typeof item === 'object' && item?.id) ? item.id : createId('contact'),
        name,
        accounts: (typeof item === 'object' && Array.isArray(item?.accounts)) ? item.accounts : []
      })
    }
  })

  // Ensure every contact has proper format
  const normalizedContacts = contacts.map((contact) => ({
    id: contact.id || createId('contact'),
    name: contact.name.trim(),
    accounts: Array.isArray(contact.accounts)
      ? contact.accounts.map((acc) => ({
          id: acc.id || createId('account'),
          cardNumber: acc.cardNumber || '',
          shebaNumber: acc.shebaNumber || '',
          bankKey: acc.bankKey || 'no-img',
          bankName: acc.bankName || ''
        }))
      : []
  }))

  const normalizedSavedPeople = normalizedContacts.map((c) => c.name)

  return { contacts: normalizedContacts, savedPeople: normalizedSavedPeople }
}

export function migrateState(input) {
  if (!input || !Number.isInteger(input.version) || !Array.isArray(input.events)) throw new Error('ساختار داده معتبر نیست.')
  if (input.version > CURRENT_STORAGE_VERSION) throw new Error('این داده متعلق به نسخهٔ جدیدتری از دنگ‌بان است.')
  let migrated = input
  while (migrated.version < CURRENT_STORAGE_VERSION) {
    const migration = migrations[migrated.version]
    if (!migration) throw new Error(`مسیر مهاجرت نسخهٔ ${migrated.version} موجود نیست.`)
    migrated = migration(migrated)
  }
  const base = { ...defaultState(), ...migrated, settings: { ...defaultState().settings, ...migrated.settings }, meta: { ...defaultState().meta, ...migrated.meta } }
  const { contacts, savedPeople } = normalizeContacts(base)
  return { ...base, contacts, savedPeople }
}

function loadState() {
  let raw
  try {
    const sourceKey = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS].find((key) => localStorage.getItem(key))
    if (!sourceKey) return defaultState()
    raw = localStorage.getItem(sourceKey)
    const parsed = JSON.parse(raw)
    if (parsed.version < CURRENT_STORAGE_VERSION) {
      try { localStorage.setItem(MIGRATION_BACKUP_KEY, raw) } catch { /* migration can continue without the optional backup */ }
    }
    const migrated = migrateState(parsed)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)) } catch { /* keep the migrated in-memory copy when storage is full */ }
    return migrated
  } catch {
    return defaultState()
  }
}

const state = reactive(loadState())
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* the UI remains usable in restricted storage modes */ }
}

function syncSavedPeople() {
  state.savedPeople = state.contacts.map((c) => c.name)
}

function findEvent(id) { return state.events.find((event) => event.id === id) }
function createEvent(payload) {
  const now = new Date().toISOString()
  const event = {
    id: createId('event'), title: payload.title.trim(), date: payload.date || now.slice(0, 10),
    currency: payload.currency || state.settings.defaultCurrency,
    roundingIncrement: Number(payload.roundingIncrement || state.settings.defaultRounding),
    note: payload.note?.trim() || '', people: [], expenses: [], createdAt: now, updatedAt: now
  }
  state.events.unshift(event); persist(); return event
}
function touch(event) { event.updatedAt = new Date().toISOString(); persist() }
function updateEvent(id, patch) { const event = findEvent(id); if (event) { Object.assign(event, patch); touch(event) } }
function deleteEvent(id) { state.events = state.events.filter((event) => event.id !== id); persist() }
function duplicateEvent(id) {
  const source = findEvent(id); if (!source) return null
  const copy = JSON.parse(JSON.stringify(source)); copy.id = createId('event'); copy.title = `${source.title} (کپی)`
  copy.expenses = []; copy.createdAt = copy.updatedAt = new Date().toISOString(); state.events.unshift(copy); persist(); return copy
}

function getContactByName(name) {
  if (!name) return null
  const clean = name.trim()
  return state.contacts.find((c) => c.name.localeCompare(clean, 'fa', { sensitivity: 'base' }) === 0) || null
}

function findContact(id) {
  return state.contacts.find((c) => c.id === id) || null
}

function saveContact(payload) {
  const cleanName = (payload.name || '').trim()
  if (!cleanName) return null

  let contact = payload.id ? findContact(payload.id) : getContactByName(cleanName)
  if (contact) {
    contact.name = cleanName
    if (Array.isArray(payload.accounts)) {
      contact.accounts = payload.accounts.map((acc) => ({
        id: acc.id || createId('account'),
        cardNumber: acc.cardNumber || '',
        shebaNumber: acc.shebaNumber || '',
        bankKey: acc.bankKey || 'no-img',
        bankName: acc.bankName || ''
      }))
    }
  } else {
    contact = {
      id: payload.id || createId('contact'),
      name: cleanName,
      accounts: Array.isArray(payload.accounts)
        ? payload.accounts.map((acc) => ({
            id: acc.id || createId('account'),
            cardNumber: acc.cardNumber || '',
            shebaNumber: acc.shebaNumber || '',
            bankKey: acc.bankKey || 'no-img',
            bankName: acc.bankName || ''
          }))
        : []
    }
    state.contacts.push(contact)
  }
  syncSavedPeople()
  persist()
  return contact
}

function deleteContact(idOrName) {
  state.contacts = state.contacts.filter(
    (c) => c.id !== idOrName && c.name.localeCompare(idOrName, 'fa', { sensitivity: 'base' }) !== 0
  )
  syncSavedPeople()
  persist()
}

function addAccountToContact(idOrName, account) {
  let contact = findContact(idOrName) || getContactByName(idOrName)
  if (!contact) {
    contact = saveContact({ name: idOrName, accounts: [] })
  }
  const newAccount = {
    id: createId('account'),
    cardNumber: account.cardNumber || '',
    shebaNumber: account.shebaNumber || '',
    bankKey: account.bankKey || 'no-img',
    bankName: account.bankName || ''
  }
  contact.accounts.push(newAccount)
  persist()
  return newAccount
}

function updateAccountInContact(idOrName, accountId, patch) {
  const contact = findContact(idOrName) || getContactByName(idOrName)
  if (!contact) return null
  const account = contact.accounts.find((acc) => acc.id === accountId)
  if (!account) return null
  Object.assign(account, patch)
  persist()
  return account
}

function deleteAccountFromContact(idOrName, accountId) {
  const contact = findContact(idOrName) || getContactByName(idOrName)
  if (!contact) return
  contact.accounts = contact.accounts.filter((acc) => acc.id !== accountId)
  persist()
}

function addPerson(eventId, name, optionalAccount = null) {
  const event = findEvent(eventId); const clean = name.trim(); if (!event || !clean) return null
  if (event.people.some((person) => person.name.localeCompare(clean, 'fa', { sensitivity: 'base' }) === 0)) return null
  const person = { id: createId('person'), name: clean }; event.people.push(person)

  let contact = getContactByName(clean)
  if (!contact) {
    const accounts = []
    if (optionalAccount && (optionalAccount.cardNumber || optionalAccount.shebaNumber)) {
      accounts.push({
        id: createId('account'),
        cardNumber: optionalAccount.cardNumber || '',
        shebaNumber: optionalAccount.shebaNumber || '',
        bankKey: optionalAccount.bankKey || 'no-img',
        bankName: optionalAccount.bankName || ''
      })
    }
    contact = { id: createId('contact'), name: clean, accounts }
    state.contacts.push(contact)
    syncSavedPeople()
  } else if (optionalAccount && (optionalAccount.cardNumber || optionalAccount.shebaNumber)) {
    const hasDuplicate = contact.accounts.some(
      (a) =>
        (optionalAccount.cardNumber && a.cardNumber === optionalAccount.cardNumber) ||
        (optionalAccount.shebaNumber && a.shebaNumber === optionalAccount.shebaNumber)
    )
    if (!hasDuplicate) {
      contact.accounts.push({
        id: createId('account'),
        cardNumber: optionalAccount.cardNumber || '',
        shebaNumber: optionalAccount.shebaNumber || '',
        bankKey: optionalAccount.bankKey || 'no-img',
        bankName: optionalAccount.bankName || ''
      })
    }
  }

  touch(event); return person
}

function removePerson(eventId, personId) {
  const event = findEvent(eventId); if (!event) return
  event.people = event.people.filter((person) => person.id !== personId)
  event.expenses = event.expenses.filter((expense) => expense.payerId !== personId)
  event.expenses.forEach((expense) => delete expense.splits[personId]); touch(event)
}
function addExpense(eventId, expense) { const event = findEvent(eventId); if (!event) return; event.expenses.unshift({ id: createId('expense'), ...expense }); touch(event) }
function updateExpense(eventId, expenseId, patch) { const event = findEvent(eventId); const expense = event?.expenses.find((item) => item.id === expenseId); if (expense) { Object.assign(expense, patch); touch(event) } }
function deleteExpense(eventId, expenseId) { const event = findEvent(eventId); if (event) { event.expenses = event.expenses.filter((item) => item.id !== expenseId); touch(event) } }
function updateSettings(patch) { Object.assign(state.settings, patch); persist() }
function removeSavedPerson(name) { deleteContact(name) }

function importData(data) {
  const migrated = migrateState(data)
  Object.assign(state, defaultState(), migrated); persist()
}

function importEvent(event) {
  if (!event || !event.id || !Array.isArray(event.people) || !Array.isArray(event.expenses)) throw new Error('رویداد قابل ورود نیست.')
  const copy = JSON.parse(JSON.stringify(event))
  if (findEvent(copy.id)) copy.id = createId('event')
  state.events.unshift(copy)
  copy.people.forEach((person) => {
    const clean = person.name?.trim()
    if (clean && !getContactByName(clean)) {
      state.contacts.push({ id: createId('contact'), name: clean, accounts: [] })
    }
  })
  syncSavedPeople()
  persist()
  return copy
}

function clearAll() {
  Object.assign(state, defaultState())
  ;[STORAGE_KEY, MIGRATION_BACKUP_KEY, ...LEGACY_STORAGE_KEYS].forEach((key) => localStorage.removeItem(key))
}

const api = {
  state: readonly(state),
  findEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  duplicateEvent,
  addPerson,
  removePerson,
  addExpense,
  updateExpense,
  deleteExpense,
  updateSettings,
  removeSavedPerson,
  importData,
  importEvent,
  clearAll,
  getContactByName,
  findContact,
  saveContact,
  deleteContact,
  addAccountToContact,
  updateAccountInContact,
  deleteAccountFromContact
}
export function useEventStore() { return api }
