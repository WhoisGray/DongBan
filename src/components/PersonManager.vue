<script setup>
import { ref } from 'vue'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({ event: { type: Object, required: true } })
const store = useEventStore(); const toast = useToast(); const name = ref('')
function add() {
  if (!name.value.trim()) return toast.show('نام شخص را وارد کنید.', 'error')
  const person = store.addPerson(props.event.id, name.value)
  if (!person) return toast.show('این نام قبلاً در رویداد وجود دارد.', 'error')
  name.value = ''; toast.show('شخص به رویداد اضافه شد.')
}
function remove(person) {
  const count = props.event.expenses.filter((expense) => expense.payerId === person.id).length
  const warning = count ? `با حذف ${person.name}، ${count} هزینه‌ای که پرداخت کرده نیز حذف می‌شود. ادامه می‌دهید؟` : `«${person.name}» حذف شود؟`
  if (window.confirm(warning)) store.removePerson(props.event.id, person.id)
}
</script>

<template>
  <section class="panel">
    <div class="section-heading"><div><span class="eyebrow">اعضای رویداد</span><h2>چه کسانی همراه‌اند؟</h2></div><span class="count-pill">{{ event.people.length }} نفر</span></div>
    <div class="inline-form">
      <label class="field field--grow"><span>نام</span><input v-model="name" list="saved-people" autocomplete="off" placeholder="مثلاً سارا" @keydown.enter.prevent="add" /></label>
      <datalist id="saved-people"><option v-for="person in store.state.savedPeople" :key="person" :value="person" /></datalist>
      <button class="btn btn--primary" @click="add">افزودن</button>
    </div>
    <div v-if="event.people.length" class="people-grid">
      <div v-for="person in event.people" :key="person.id" class="person-chip"><span class="avatar">{{ person.name.slice(0, 1) }}</span><strong>{{ person.name }}</strong><button class="icon-btn icon-btn--danger" :aria-label="`حذف ${person.name}`" @click="remove(person)">×</button></div>
    </div>
    <div v-else class="empty compact"><span>👋</span><p>هنوز کسی اضافه نشده؛ از دفترچهٔ اسامی یا یک نام تازه شروع کن.</p></div>
  </section>
</template>
