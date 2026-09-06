<script setup>
import { computed, reactive, watch } from 'vue'
import { categories } from '../utils/categories.js'
import { fromMinor, parseAmount } from '../utils/money.js'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({ event: { type: Object, required: true }, expense: { type: Object, default: null } })
const emit = defineEmits(['done'])
const store = useEventStore(); const toast = useToast()
const form = reactive({ title: '', amount: '', payerId: '', category: 'food', date: '', note: '', splits: {} })
const isEdit = computed(() => Boolean(props.expense))

function reset() {
  const expense = props.expense
  form.title = expense?.title || ''; form.amount = expense ? fromMinor(expense.amountMinor, props.event.currency) : ''
  form.payerId = expense?.payerId || props.event.people[0]?.id || ''; form.category = expense?.category || 'food'
  form.date = expense?.date || props.event.date; form.note = expense?.note || ''
  form.splits = expense ? { ...expense.splits } : Object.fromEntries(props.event.people.map((person) => [person.id, 1]))
}
watch(() => props.expense, reset, { immediate: true })

function toggle(personId) { form.splits[personId] = form.splits[personId] > 0 ? 0 : 1 }
function setWeight(personId, value) {
  const weight = Number(value); if (Number.isFinite(weight) && weight > 0) form.splits[personId] = weight
}
function submit() {
  const amountMinor = parseAmount(form.amount, props.event.currency)
  if (!form.title.trim()) return toast.show('عنوان هزینه را وارد کنید.', 'error')
  if (!amountMinor) return toast.show('مبلغ معتبر و مثبت وارد کنید.', 'error')
  if (!form.payerId) return toast.show('پرداخت‌کننده را انتخاب کنید.', 'error')
  if (!Object.values(form.splits).some((weight) => Number(weight) > 0)) return toast.show('حداقل یک مصرف‌کننده انتخاب کنید.', 'error')
  const payload = { title: form.title.trim(), amountMinor, payerId: form.payerId, category: form.category, date: form.date, note: form.note.trim(), splits: { ...form.splits } }
  if (props.expense) store.updateExpense(props.event.id, props.expense.id, payload)
  else store.addExpense(props.event.id, payload)
  toast.show(isEdit.value ? 'هزینه ویرایش شد.' : 'هزینه ثبت شد.'); emit('done')
}
</script>

<template>
  <form class="stack" @submit.prevent="submit">
    <div class="form-grid">
      <label class="field field--wide"><span>عنوان هزینه</span><input v-model="form.title" autofocus placeholder="مثلاً شام شب اول" /></label>
      <label class="field"><span>مبلغ</span><input v-model="form.amount" inputmode="decimal" placeholder="120000" /></label>
      <label class="field"><span>پرداخت‌کننده</span><select v-model="form.payerId"><option v-for="person in event.people" :key="person.id" :value="person.id">{{ person.name }}</option></select></label>
      <label class="field"><span>دسته‌بندی</span><select v-model="form.category"><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.icon }} {{ category.label }}</option></select></label>
      <label class="field"><span>تاریخ</span><input v-model="form.date" type="date" /></label>
      <label class="field field--wide"><span>یادداشت (اختیاری)</span><input v-model="form.note" placeholder="جزئیات کوتاه" /></label>
    </div>
    <fieldset class="split-fieldset"><legend>مصرف‌کنندگان و ضریب سهم</legend>
      <div class="split-grid">
        <div v-for="person in event.people" :key="person.id" class="split-person" :class="{ muted: !(form.splits[person.id] > 0) }">
          <button type="button" class="check" :class="{ checked: form.splits[person.id] > 0 }" :aria-pressed="form.splits[person.id] > 0" @click="toggle(person.id)">{{ form.splits[person.id] > 0 ? '✓' : '' }}</button>
          <span>{{ person.name }}</span>
          <input :value="form.splits[person.id] || 1" type="number" min="0.1" step="0.1" :disabled="!(form.splits[person.id] > 0)" aria-label="ضریب سهم" @change="setWeight(person.id, $event.target.value)" />
        </div>
      </div>
    </fieldset>
    <div class="actions"><button type="button" class="btn btn--ghost" @click="$emit('done')">انصراف</button><button class="btn btn--primary" type="submit">{{ isEdit ? 'ذخیره تغییرات' : 'ثبت هزینه' }}</button></div>
  </form>
</template>
