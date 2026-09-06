<script setup>
import { computed } from 'vue'
import { useEventStore } from '../stores/eventStore.js'
import { allocateByWeight } from '../utils/settlement.js'
import { formatMoney } from '../utils/money.js'

const props = defineProps({ event: { type: Object, required: true } })
const store = useEventStore()
const rows = computed(() => props.event.expenses.map((expense) => ({ expense, allocations: allocateByWeight(expense.amountMinor, expense.splits) })))
function toggle(expense, personId) {
  const splits = { ...expense.splits, [personId]: expense.splits[personId] > 0 ? 0 : 1 }
  if (!Object.values(splits).some((value) => value > 0)) return
  store.updateExpense(props.event.id, expense.id, { splits })
}
function updateWeight(expense, personId, value) {
  const weight = Number(value); if (!Number.isFinite(weight) || weight <= 0) return
  store.updateExpense(props.event.id, expense.id, { splits: { ...expense.splits, [personId]: weight } })
}
</script>

<template>
  <section class="panel">
    <div class="section-heading"><div><span class="eyebrow">کنترل دقیق</span><h2>ماتریس سهم‌ها</h2></div></div>
    <p class="helper">هر ردیف یک هزینه است. افراد را فعال/غیرفعال کن یا ضریب‌هایی مثل ۰٫۵ و ۲ وارد کن.</p>
    <div v-if="rows.length" class="matrix-wrap">
      <article v-for="row in rows" :key="row.expense.id" class="matrix-card">
        <header><div><strong>{{ row.expense.title }}</strong><small>{{ formatMoney(row.expense.amountMinor, event.currency) }}</small></div></header>
        <div class="matrix-people">
          <div v-for="person in event.people" :key="person.id" class="matrix-person" :class="{ muted: !(row.expense.splits[person.id] > 0) }">
            <button class="check" :class="{ checked: row.expense.splits[person.id] > 0 }" @click="toggle(row.expense, person.id)">{{ row.expense.splits[person.id] > 0 ? '✓' : '' }}</button>
            <div><strong>{{ person.name }}</strong><small>{{ formatMoney(row.allocations[person.id] || 0, event.currency) }}</small></div>
            <input :value="row.expense.splits[person.id] || 1" type="number" min="0.1" step="0.1" :disabled="!(row.expense.splits[person.id] > 0)" aria-label="ضریب سهم" @change="updateWeight(row.expense, person.id, $event.target.value)" />
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty"><span>⚖️</span><h3>هزینه‌ای برای تقسیم وجود ندارد</h3></div>
  </section>
</template>
