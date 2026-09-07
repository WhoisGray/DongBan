import { describe, expect, it } from 'vitest'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key)
}

const { migrateState, useEventStore } = await import('./eventStore.js')

describe('storage migrations', () => {
  it('keeps v2 events and people while upgrading to v3', () => {
    const old = { version: 2, settings: { theme: 'dark' }, savedPeople: ['سارا'], events: [{ id: 'event_1', title: 'سفر' }] }
    const migrated = migrateState(old)
    expect(migrated.version).toBe(3)
    expect(migrated.savedPeople).toEqual(['سارا'])
    expect(migrated.contacts.some((c) => c.name === 'سارا')).toBe(true)
    expect(migrated.events[0].title).toBe('سفر')
    expect(migrated.settings.theme).toBe('dark')
    expect(migrated.meta.migratedAt).toBeTruthy()
  })
})

describe('event import', () => {
  it('adds imported names to the address book', () => {
    const store = useEventStore()
    const event = store.importEvent({ id: 'event_imported', title: 'رویداد واردشده', people: [{ id: 'p1', name: 'مینا' }], expenses: [], createdAt: '', updatedAt: '' })
    expect(store.findEvent(event.id).title).toBe('رویداد واردشده')
    expect(store.state.savedPeople).toContain('مینا')
    expect(store.getContactByName('مینا')).toBeTruthy()
  })
})

describe('global contacts and accounts', () => {
  it('adds and manages accounts on contacts', () => {
    const store = useEventStore()
    const contact = store.saveContact({
      name: 'نوید',
      accounts: [{ cardNumber: '6037991234567890', shebaNumber: 'IR120170000000123456789012', bankKey: 'meli', bankName: 'بانک ملی' }]
    })
    expect(contact.accounts.length).toBe(1)
    expect(store.getContactByName('نوید')?.accounts[0].bankKey).toBe('meli')

    // Add another account
    store.addAccountToContact(contact.id, {
      cardNumber: '6104331234567890',
      bankKey: 'mellat',
      bankName: 'بانک ملت'
    })
    expect(store.getContactByName('نوید')?.accounts.length).toBe(2)

    // Add person to an event with optional account
    const ev = store.createEvent({ title: 'دورهمی' })
    store.addPerson(ev.id, 'کوروش', {
      cardNumber: '5892101234567890',
      bankKey: 'sepah',
      bankName: 'بانک سپه'
    })
    const kuroushContact = store.getContactByName('کوروش')
    expect(kuroushContact).toBeTruthy()
    expect(kuroushContact.accounts.length).toBe(1)
    expect(kuroushContact.accounts[0].bankKey).toBe('sepah')
  })
})
