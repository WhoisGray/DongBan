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

export function migrateState(input) {
  if (!input || !Number.isInteger(input.version) || !Array.isArray(input.events)) throw new Error('ساختار داده معتبر نیست.')
  if (input.version > CURRENT_STORAGE_VERSION) throw new Error('این داده متعلق به نسخهٔ جدیدتری از دنگ‌بان است.')
  let migrated = input
  while (migrated.version < CURRENT_STORAGE_VERSION) {
    const migration = migrations[migrated.version]
    if (!migration) throw new Error(`مسیر مهاجرت نسخهٔ ${migrated.version} موجود نیست.`)
    migrated = migration(migrated)
  }
  return { ...defaultState(), ...migrated, settings: { ...defaultState().settings, ...migrated.settings }, meta: { ...defaultState().meta, ...migrated.meta } }
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
function addPerson(eventId, name) {
  const event = findEvent(eventId); const clean = name.trim(); if (!event || !clean) return null
  if (event.people.some((person) => person.name.localeCompare(clean, 'fa', { sensitivity: 'base' }) === 0)) return null
  const person = { id: createId('person'), name: clean }; event.people.push(person)
  if (!state.savedPeople.some((item) => item.localeCompare(clean, 'fa', { sensitivity: 'base' }) === 0)) state.savedPeople.push(clean)
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
function removeSavedPerson(name) { state.savedPeople = state.savedPeople.filter((item) => item !== name); persist() }
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
    if (!state.savedPeople.some((name) => name.localeCompare(person.name, 'fa', { sensitivity: 'base' }) === 0)) state.savedPeople.push(person.name)
  })
  persist()
  return copy
}
function clearAll() {
  Object.assign(state, defaultState())
  ;[STORAGE_KEY, MIGRATION_BACKUP_KEY, ...LEGACY_STORAGE_KEYS].forEach((key) => localStorage.removeItem(key))
}

const api = { state: readonly(state), findEvent, createEvent, updateEvent, deleteEvent, duplicateEvent, addPerson, removePerson, addExpense, updateExpense, deleteExpense, updateSettings, removeSavedPerson, importData, importEvent, clearAll }
export function useEventStore() { return api }
