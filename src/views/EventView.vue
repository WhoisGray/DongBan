<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '../components/BaseModal.vue'
import PersonManager from '../components/PersonManager.vue'
import ExpenseForm from '../components/ExpenseForm.vue'
import ExpenseList from '../components/ExpenseList.vue'
import EventOverview from '../components/EventOverview.vue'
import SplitMatrix from '../components/SplitMatrix.vue'
import SettlementPanel from '../components/SettlementPanel.vue'
import { useEventStore } from '../stores/eventStore.js'
import { currencies, roundingOptions } from '../utils/currencies.js'
import { formatPersianDate } from '../utils/date.js'
import PersianDatePicker from '../components/PersianDatePicker.vue'

const props = defineProps({ id: { type: String, required: true } }); const store = useEventStore(); const router = useRouter()
const event = computed(() => store.findEvent(props.id)); const tab = ref('overview'); const showExpense = ref(false); const showPeople = ref(false); const showDetails = ref(false)
const tabs = [{ id: 'overview', label: 'نمای کلی', icon: '⌂' }, { id: 'expenses', label: 'هزینه‌ها', icon: '▤' }, { id: 'splits', label: 'سهم‌ها', icon: '⚖' }, { id: 'settlement', label: 'تسویه', icon: '✓' }]
function updateDetail(key, value) { store.updateEvent(props.id, { [key]: value }) }
</script>

<template>
  <div v-if="event" class="page stack-lg">
    <section class="event-banner">
      <button class="back-link" @click="router.push('/')">→ رویدادها</button>
      <div class="event-banner__main"><div><span class="eyebrow">{{ formatPersianDate(event.date, { dateStyle: 'long' }) }}</span><h1>{{ event.title }}</h1><p>{{ event.note || 'برای این رویداد توضیحی ثبت نشده است.' }}</p></div><div class="event-banner__actions"><button class="btn btn--ghost" @click="showDetails = true">تنظیمات رویداد</button><button class="btn btn--ghost" @click="showPeople = true">＋ اعضا</button><button class="btn btn--primary" :disabled="event.people.length < 2" @click="showExpense = true">＋ ثبت هزینه</button></div></div>
      <nav class="tabs" aria-label="بخش‌های رویداد"><button v-for="item in tabs" :key="item.id" :class="{ active: tab === item.id }" @click="tab = item.id"><span>{{ item.icon }}</span>{{ item.label }}<b v-if="item.id === 'expenses'">{{ event.expenses.length }}</b></button></nav>
    </section>
    <EventOverview v-if="tab === 'overview'" :event="event" />
    <ExpenseList v-else-if="tab === 'expenses'" :event="event" />
    <SplitMatrix v-else-if="tab === 'splits'" :event="event" />
    <SettlementPanel v-else :event="event" />
    <BaseModal v-if="showPeople" title="مدیریت اعضا" @close="showPeople = false"><PersonManager :event="event" /></BaseModal>
    <BaseModal v-if="showExpense" title="ثبت هزینهٔ تازه" @close="showExpense = false"><ExpenseForm :event="event" @done="showExpense = false" /></BaseModal>
    <BaseModal v-if="showDetails" title="تنظیمات رویداد" @close="showDetails = false">
      <div class="stack"><label class="field"><span>نام رویداد</span><input :value="event.title" @change="updateDetail('title', $event.target.value.trim())" /></label><PersianDatePicker :model-value="event.date" @update:model-value="updateDetail('date', $event)" /><label class="field"><span>توضیح</span><textarea :value="event.note" rows="3" @change="updateDetail('note', $event.target.value.trim())" /></label><div class="form-grid"><label class="field"><span>واحد پول</span><select :value="event.currency" :disabled="event.expenses.length > 0" @change="updateDetail('currency', $event.target.value)"><option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.label }}</option></select><small v-if="event.expenses.length">پس از ثبت هزینه قابل تغییر نیست.</small></label><label class="field"><span>رُندکردن تسویه</span><select :value="event.roundingIncrement" @change="updateDetail('roundingIncrement', Number($event.target.value))"><option v-for="option in roundingOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label></div><div class="actions"><button class="btn btn--primary" @click="showDetails = false">تمام</button></div></div>
    </BaseModal>
  </div>
  <div v-else class="empty empty--large"><span>🔎</span><h2>رویداد پیدا نشد</h2><button class="btn btn--primary" @click="router.push('/')">بازگشت</button></div>
</template>
