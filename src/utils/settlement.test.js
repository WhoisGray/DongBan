import { describe, expect, it } from 'vitest'
import { allocateByWeight, calculateEvent, optimizeTransfers, roundBalancedBalances } from './settlement.js'

describe('allocateByWeight', () => {
  it('keeps the allocated sum exact for indivisible amounts', () => {
    const result = allocateByWeight(100, { a: 1, b: 1, c: 1 })
    expect(Object.values(result).reduce((sum, value) => sum + value, 0)).toBe(100)
    expect(Object.values(result).sort((a, b) => a - b)).toEqual([33, 33, 34])
  })
  it('supports weighted shares', () => {
    expect(allocateByWeight(120, { a: 2, b: 1, c: 1 })).toEqual({ a: 60, b: 30, c: 30 })
  })
})

describe('roundBalancedBalances', () => {
  it('rounds to an increment while preserving a zero sum', () => {
    const result = roundBalancedBalances({ a: 6667, b: -3333, c: -3334 }, 1000)
    expect(Object.values(result).reduce((sum, value) => sum + value, 0)).toBe(0)
    expect(Object.values(result).every((value) => value % 1000 === 0)).toBe(true)
  })
})

describe('optimizeTransfers', () => {
  it('finds fewer transfers than the previous greedy counterexample', () => {
    const original = { a: 3, b: 2, c: 1, d: -2, e: -2, f: -2 }
    const transfers = optimizeTransfers(original)
    expect(transfers).toHaveLength(4)
    expect(transfers.reduce((sum, tx) => sum + tx.amount, 0)).toBe(6)
    const settled = { ...original }
    transfers.forEach((tx) => { settled[tx.from] += tx.amount; settled[tx.to] -= tx.amount })
    expect(Object.values(settled)).toEqual([0, 0, 0, 0, 0, 0])
  })
})

describe('calculateEvent', () => {
  it('settles a 100-unit expense without losing a rounding unit', () => {
    const event = { currency: 'TOMAN', roundingIncrement: 1,
      people: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      expenses: [{ payerId: 'a', amountMinor: 100, splits: { a: 1, b: 1, c: 1 } }]
    }
    const result = calculateEvent(event)
    expect(Object.values(result.consumed).reduce((sum, value) => sum + value, 0)).toBe(100)
    expect(Object.values(result.balances).reduce((sum, value) => sum + value, 0)).toBe(0)
    expect(result.transfers.reduce((sum, tx) => sum + tx.amount, 0)).toBe(66)
  })
})
