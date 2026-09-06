import { reactive, readonly } from 'vue'
import { createId } from '../utils/id.js'

export const STORAGE_KEY = 'dongban:v2'
const defaultState = () => ({
  version: 2,
  settings: { theme: 'light', defaultCurrency: 'TOMAN', defaultRounding: 1 },
  savedPeople: [],
  events: []
})

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.events)) return defaultState()
    return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...parsed.settings } }
  } catch {
    return defaultState()
  }
}

const state = reactive(loadState())
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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
  if (!data || data.version !== 2 || !Array.isArray(data.events)) throw new Error('فایل پشتیبان معتبر نیست.')
  Object.assign(state, defaultState(), data); persist()
}
function clearAll() { Object.assign(state, defaultState()); localStorage.removeItem(STORAGE_KEY) }

const api = { state: readonly(state), findEvent, createEvent, updateEvent, deleteEvent, duplicateEvent, addPerson, removePerson, addExpense, updateExpense, deleteExpense, updateSettings, removeSavedPerson, importData, clearAll }
export function useEventStore() { return api }
