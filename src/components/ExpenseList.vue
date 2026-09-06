<script setup>
import { computed, ref } from 'vue'
import BaseModal from './BaseModal.vue'
import ExpenseForm from './ExpenseForm.vue'
import { useEventStore } from '../stores/eventStore.js'
import { formatMoney } from '../utils/money.js'
import { getCategory } from '../utils/categories.js'

const props = defineProps({ event: { type: Object, required: true } })
const store = useEventStore(); const editing = ref(null); const query = ref(''); const category = ref('all')
const filtered = computed(() => props.event.expenses.filter((expense) => {
  const matchesText = expense.title.toLocaleLowerCase('fa').includes(query.value.toLocaleLowerCase('fa'))
  return matchesText && (category.value === 'all' || expense.category === category.value)
}))
const personName = (id) => props.event.people.find((person) => person.id === id)?.name || 'نامشخص'
function remove(expense) { if (window.confirm(`هزینهٔ «${expense.title}» حذف شود؟`)) store.deleteExpense(props.event.id, expense.id) }
</script>

<template>
  <section class="panel">
    <div class="section-heading"><div><span class="eyebrow">ریز مخارج</span><h2>هزینه‌ها</h2></div><span class="count-pill">{{ event.expenses.length }} مورد</span></div>
    <div class="toolbar"><input v-model="query" class="search" placeholder="جست‌وجوی هزینه…" /><select v-model="category"><option value="all">همه دسته‌ها</option><option value="food">خوراک</option><option value="transport">رفت‌وآمد</option><option value="stay">اقامت</option><option value="shopping">خرید</option><option value="fun">تفریح</option><option value="other">سایر</option></select></div>
    <div v-if="filtered.length" class="expense-list">
      <article v-for="expense in filtered" :key="expense.id" class="expense-row">
        <span class="category-icon">{{ getCategory(expense.category).icon }}</span>
        <div class="expense-row__main"><strong>{{ expense.title }}</strong><small>{{ personName(expense.payerId) }} پرداخت کرده · {{ expense.date }}</small></div>
        <strong class="expense-row__amount">{{ formatMoney(expense.amountMinor, event.currency) }}</strong>
        <div class="row-actions"><button class="icon-btn" aria-label="ویرایش" @click="editing = expense">✎</button><button class="icon-btn icon-btn--danger" aria-label="حذف" @click="remove(expense)">×</button></div>
      </article>
    </div>
    <div v-else class="empty"><span>🧾</span><h3>{{ event.expenses.length ? 'نتیجه‌ای پیدا نشد' : 'اولین هزینه را ثبت کن' }}</h3><p>خرج‌ها را با پرداخت‌کننده و سهم هر نفر ثبت کن.</p></div>
    <BaseModal v-if="editing" title="ویرایش هزینه" @close="editing = null"><ExpenseForm :event="event" :expense="editing" @done="editing = null" /></BaseModal>
  </section>
</template>
