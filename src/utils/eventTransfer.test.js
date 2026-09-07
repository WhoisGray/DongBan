import { describe, expect, it } from 'vitest'
import { buildEventTransfer, createSampleTransfer, validateEventTransfer } from './eventTransfer.js'

describe('event transfer contract', () => {
  it('round-trips members, expenses and weighted shares', () => {
    const transfer = createSampleTransfer()
    const event = validateEventTransfer(JSON.stringify(transfer))
    expect(event.title).toBe('سفر شمال')
    expect(event.people).toHaveLength(3)
    expect(event.expenses[0]).toMatchObject({ amountMinor: 750000, payerId: 'person_1', category: 'food' })
    expect(event.expenses[0].splits).toEqual({ person_1: 1, person_2: 1, person_3: 1 })
  })

  it('accepts Persian digits and a Persian date', () => {
    const transfer = createSampleTransfer()
    transfer.event.date = '۱۴۰۵/۰۱/۰۲'
    transfer.expenses[0].date = '۱۴۰۵/۰۱/۰۲'
    transfer.expenses[0].amount = '۱٬۲۳۴٬۵۶۷'
    const event = validateEventTransfer(transfer)
    expect(event.date).toBe('2026-03-22')
    expect(event.expenses[0].amountMinor).toBe(1234567)
  })

  it('rejects a payer that is not a member', () => {
    const transfer = createSampleTransfer()
    transfer.expenses[0].payer_id = 'person_missing'
    expect(() => validateEventTransfer(transfer)).toThrow('در اعضا نیست')
  })

  it('exports calculated sections without trusting them on import', () => {
    const transfer = buildEventTransfer(validateEventTransfer(createSampleTransfer()))
    expect(transfer.calculated.total).toBe(750000)
    expect(transfer.calculated.members).toHaveLength(3)
    transfer.calculated.settlements = [{ from_id: 'fake', to_id: 'fake', amount: 1 }]
    expect(validateEventTransfer(transfer).expenses).toHaveLength(1)
  })
})
