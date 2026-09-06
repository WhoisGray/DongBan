import { describe, expect, it } from 'vitest'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key)
}

const { migrateState } = await import('./eventStore.js')

describe('storage migrations', () => {
  it('keeps v2 events and people while upgrading to v3', () => {
    const old = { version: 2, settings: { theme: 'dark' }, savedPeople: ['سارا'], events: [{ id: 'event_1', title: 'سفر' }] }
    const migrated = migrateState(old)
    expect(migrated.version).toBe(3)
    expect(migrated.savedPeople).toEqual(['سارا'])
    expect(migrated.events[0].title).toBe('سفر')
    expect(migrated.settings.theme).toBe('dark')
    expect(migrated.meta.migratedAt).toBeTruthy()
  })
})
