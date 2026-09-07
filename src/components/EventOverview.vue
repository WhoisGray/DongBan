<script setup>
import { computed } from 'vue'
import { calculateEvent } from '../utils/settlement.js'
import { formatMoney } from '../utils/money.js'
import { getCategory } from '../utils/categories.js'

const props = defineProps({ event: { type: Object, required: true } })
const result = computed(() => calculateEvent(props.event))
const topPayer = computed(() =>
  props.event.people
    .map((person) => ({ ...person, amount: result.value.paid[person.id] || 0 }))
    .sort((a, b) => b.amount - a.amount)[0]
)
const categoryTotals = computed(() => {
  const totals = {}
  props.event.expenses.forEach((expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amountMinor
  })
  return Object.entries(totals)
    .map(([id, amount]) => ({ ...getCategory(id), amount }))
    .sort((a, b) => b.amount - a.amount)
})
</script>

<template>
  <div class="stack">
    <!-- Quick Stats Cards -->
    <div class="stats-grid">
      <article class="stat-card stat-card--primary">
        <span>کل مخارج</span>
        <strong>{{ formatMoney(result.total, event.currency) }}</strong>
        <small>{{ event.expenses.length }} هزینه ثبت‌شده</small>
      </article>

      <article class="stat-card">
        <span>اعضای گروه</span>
        <strong>{{ event.people.length }} نفر</strong>
        <small>در این رویداد</small>
      </article>

      <article class="stat-card">
        <span>بیشترین پرداخت</span>
        <strong>{{ topPayer?.name || '—' }}</strong>
        <small>{{ topPayer ? formatMoney(topPayer.amount, event.currency) : 'هنوز پرداختی نیست' }}</small>
      </article>
    </div>

    <!-- Category Breakdown Panel -->
    <section class="panel">
      <div class="section-heading">
        <div>
          <span class="eyebrow">تحلیل هزینه</span>
          <h2>تفکیک دسته‌بندی‌ها</h2>
        </div>
      </div>

      <div v-if="categoryTotals.length" class="category-list">
        <div v-for="category in categoryTotals" :key="category.id" class="category-row">
          <span class="category-icon">{{ category.icon }}</span>
          <div>
            <strong>{{ category.label }}</strong>
            <div class="progress">
              <i :style="{ width: `${(category.amount / result.total) * 100}%` }" />
            </div>
          </div>
          <strong>{{ formatMoney(category.amount, event.currency) }}</strong>
        </div>
      </div>

      <div v-else class="empty compact">
        <span>📊</span>
        <p>با ثبت هزینه‌ها، نمودار دسته‌بندی اینجا شکل می‌گیرد.</p>
      </div>
    </section>
  </div>
</template>
