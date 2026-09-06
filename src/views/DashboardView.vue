<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '../components/BaseModal.vue'
import { useEventStore } from '../stores/eventStore.js'
import { currencies } from '../utils/currencies.js'
import { calculateEvent } from '../utils/settlement.js'
import { formatMoney } from '../utils/money.js'

const store = useEventStore(); const router = useRouter(); const showCreate = ref(false); const query = ref('')
const form = reactive({ title: '', date: new Date().toISOString().slice(0, 10), currency: store.state.settings.defaultCurrency, note: '' })
const events = computed(() => store.state.events.filter((event) => event.title.toLocaleLowerCase('fa').includes(query.value.toLocaleLowerCase('fa'))))
function create() { if (!form.title.trim()) return; const event = store.createEvent(form); showCreate.value = false; router.push(`/event/${event.id}`) }
function duplicate(event) { const copy = store.duplicateEvent(event.id); if (copy) router.push(`/event/${copy.id}`) }
function remove(event) { if (window.confirm(`رویداد «${event.title}» و تمام هزینه‌هایش حذف شود؟`)) store.deleteEvent(event.id) }
const total = (event) => calculateEvent(event).total
</script>

<template>
  <div class="page stack-lg">
    <section class="hero">
      <div><span class="hero__badge">همهٔ حساب‌ها، یک‌جا</span><h1>دُنگ‌ها را ساده ببند.</h1><p>رویداد بساز، خرج‌ها را ثبت کن و با کمترین انتقال ممکن حساب همه را صاف کن؛ حتی آفلاین.</p><button class="btn btn--primary btn--large" @click="showCreate = true">＋ رویداد تازه</button></div>
      <div class="hero__visual"><span>دُنگ</span><strong>بان</strong><i>✓</i></div>
    </section>
    <section>
      <div class="section-heading dashboard-heading"><div><span class="eyebrow">آرشیو شخصی</span><h2>رویدادهای من</h2></div><input v-if="store.state.events.length" v-model="query" class="search" placeholder="جست‌وجوی رویداد…" /></div>
      <div v-if="events.length" class="event-grid">
        <article v-for="event in events" :key="event.id" class="event-card" @click="router.push(`/event/${event.id}`)">
          <header><span class="event-card__icon">✦</span><div class="row-actions" @click.stop><button class="icon-btn" title="ساخت کپی بدون هزینه‌ها" @click="duplicate(event)">⧉</button><button class="icon-btn icon-btn--danger" title="حذف" @click="remove(event)">×</button></div></header>
          <div><small>{{ new Date(`${event.date}T00:00:00`).toLocaleDateString('fa-IR', { dateStyle: 'medium' }) }}</small><h3>{{ event.title }}</h3><p>{{ event.note || 'بدون توضیح' }}</p></div>
          <footer><strong>{{ formatMoney(total(event), event.currency) }}</strong><span>{{ event.people.length }} نفر · {{ event.expenses.length }} هزینه</span></footer>
        </article>
      </div>
      <div v-else class="empty empty--large"><span>🪁</span><h2>{{ store.state.events.length ? 'رویدادی پیدا نشد' : 'هنوز رویدادی نداری' }}</h2><p>سفر، مهمانی یا خانهٔ مشترک؛ اولین رویداد را بساز.</p><button v-if="!store.state.events.length" class="btn btn--primary" @click="showCreate = true">ساخت اولین رویداد</button></div>
    </section>
    <BaseModal v-if="showCreate" title="رویداد تازه" @close="showCreate = false">
      <form class="stack" @submit.prevent="create"><label class="field"><span>نام رویداد</span><input v-model="form.title" autofocus placeholder="مثلاً سفر شمال" /></label><div class="form-grid"><label class="field"><span>تاریخ</span><input v-model="form.date" type="date" /></label><label class="field"><span>واحد پول</span><select v-model="form.currency"><option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.label }}</option></select></label></div><label class="field"><span>توضیح کوتاه</span><textarea v-model="form.note" rows="3" placeholder="اختیاری" /></label><div class="actions"><button type="button" class="btn btn--ghost" @click="showCreate = false">انصراف</button><button class="btn btn--primary">ساخت رویداد</button></div></form>
    </BaseModal>
  </div>
</template>
