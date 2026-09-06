import { toMinor } from './money.js'

export function allocateByWeight(amount, splits) {
  const active = Object.entries(splits)
    .map(([personId, weight]) => ({ personId, weight: Number(weight) }))
    .filter(({ weight }) => Number.isFinite(weight) && weight > 0)
  if (!active.length || amount <= 0) return {}

  const totalWeight = active.reduce((sum, item) => sum + item.weight, 0)
  const allocations = {}
  const fractions = []
  let allocated = 0
  active.forEach(({ personId, weight }) => {
    const raw = (amount * weight) / totalWeight
    const base = Math.floor(raw)
    allocations[personId] = base
    allocated += base
    fractions.push({ personId, fraction: raw - base })
  })
  fractions.sort((a, b) => b.fraction - a.fraction || a.personId.localeCompare(b.personId))
  for (let index = 0; index < amount - allocated; index += 1) {
    allocations[fractions[index % fractions.length].personId] += 1
  }
  return allocations
}

export function roundBalancedBalances(exactBalances, increment) {
  if (increment <= 1) return { ...exactBalances }
  const rows = Object.entries(exactBalances).map(([personId, amount]) => {
    const quotient = amount / increment
    const floor = Math.floor(quotient)
    return { personId, units: floor, fraction: quotient - floor }
  })
  const missingUnits = -rows.reduce((sum, row) => sum + row.units, 0)
  rows.sort((a, b) => b.fraction - a.fraction || a.personId.localeCompare(b.personId))
  for (let index = 0; index < missingUnits; index += 1) rows[index % rows.length].units += 1
  return Object.fromEntries(rows.map((row) => [row.personId, row.units * increment]))
}

const stateKey = (balances) => balances.map((item) => `${item.personId}:${item.amount}`).sort().join(',')

export function optimizeTransfers(inputBalances, exactLimit = 10) {
  const balances = Object.entries(inputBalances)
    .filter(([, amount]) => amount !== 0)
    .map(([personId, amount]) => ({ personId, amount }))
  if (balances.length <= 1) return []
  if (balances.length > exactLimit) return greedyTransfers(balances)

  const memo = new Map()
  function solve(current) {
    const active = current.filter((item) => item.amount !== 0)
    if (!active.length) return []
    const key = stateKey(active)
    if (memo.has(key)) return memo.get(key).map((tx) => ({ ...tx }))

    const first = active[0]
    let best = null
    const tried = new Set()
    for (let index = 1; index < active.length; index += 1) {
      const other = active[index]
      if (first.amount * other.amount >= 0 || tried.has(other.amount)) continue
      tried.add(other.amount)
      const amount = Math.min(Math.abs(first.amount), Math.abs(other.amount))
      const next = active.map((item) => ({ ...item }))
      next[0].amount += first.amount < 0 ? amount : -amount
      next[index].amount += first.amount < 0 ? -amount : amount
      const tx = first.amount < 0
        ? { from: first.personId, to: other.personId, amount }
        : { from: other.personId, to: first.personId, amount }
      const candidate = [tx, ...solve(next)]
      if (!best || candidate.length < best.length) best = candidate
      if (next[0].amount === 0 && next[index].amount === 0) break
    }
    const result = best || []
    memo.set(key, result.map((tx) => ({ ...tx })))
    return result
  }
  return solve(balances)
}

function greedyTransfers(balances) {
  const creditors = balances.filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount).map((x) => ({ ...x }))
  const debtors = balances.filter((item) => item.amount < 0).sort((a, b) => a.amount - b.amount).map((x) => ({ ...x, amount: -x.amount }))
  const transfers = []
  let ci = 0
  let di = 0
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount)
    transfers.push({ from: debtors[di].personId, to: creditors[ci].personId, amount })
    creditors[ci].amount -= amount
    debtors[di].amount -= amount
    if (!creditors[ci].amount) ci += 1
    if (!debtors[di].amount) di += 1
  }
  return transfers
}

export function calculateEvent(event) {
  const paid = Object.fromEntries(event.people.map((person) => [person.id, 0]))
  const consumed = Object.fromEntries(event.people.map((person) => [person.id, 0]))
  let total = 0
  event.expenses.forEach((expense) => {
    if (!(expense.payerId in paid)) return
    const amount = Number(expense.amountMinor ?? toMinor(expense.amount, event.currency))
    if (!Number.isSafeInteger(amount) || amount <= 0) return
    total += amount
    paid[expense.payerId] += amount
    const allocations = allocateByWeight(amount, expense.splits || {})
    Object.entries(allocations).forEach(([personId, share]) => {
      if (personId in consumed) consumed[personId] += share
    })
  })
  const exactBalances = Object.fromEntries(event.people.map((person) => [person.id, paid[person.id] - consumed[person.id]]))
  const incrementMinor = toMinor(event.roundingIncrement || 1, event.currency)
  const balances = roundBalancedBalances(exactBalances, incrementMinor)
  return { total, paid, consumed, exactBalances, balances, transfers: optimizeTransfers(balances) }
}
