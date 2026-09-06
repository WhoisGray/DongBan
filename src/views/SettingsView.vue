<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'
import { currencies, roundingOptions } from '../utils/currencies.js'

const store = useEventStore(); const toast = useToast(); const router = useRouter(); const fileInput = ref()
function exportBackup() {
  const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = `dongban-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
}
function importBackup(event) {
  const file = event.target.files?.[0]; if (!file) return
  const reader = new FileReader(); reader.onload = () => { try { store.importData(JSON.parse(reader.result)); toast.show('پشتیبان بازیابی شد.'); router.push('/') } catch (error) { toast.show(error.message, 'error') } }; reader.readAsText(file)
}
function clearAll() { if (window.confirm('تمام رویدادها و اسامی ذخیره‌شده برای همیشه پاک شوند؟')) { store.clearAll(); toast.show('همهٔ داده‌ها پاک شد.') } }
</script>

<template>
  <div class="page settings-page stack-lg">
    <header class="page-title"><span class="eyebrow">شخصی‌سازی و داده‌ها</span><h1>تنظیمات</h1><p>دنگ‌بان اطلاعات را فقط روی همین دستگاه نگه می‌دارد.</p></header>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">پیش‌فرض‌ها</span><h2>تنظیمات رویداد تازه</h2></div></div><div class="form-grid"><label class="field"><span>واحد پول</span><select :value="store.state.settings.defaultCurrency" @change="store.updateSettings({ defaultCurrency: $event.target.value })"><option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.label }}</option></select></label><label class="field"><span>رُندکردن</span><select :value="store.state.settings.defaultRounding" @change="store.updateSettings({ defaultRounding: Number($event.target.value) })"><option v-for="option in roundingOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label><label class="field"><span>ظاهر</span><select :value="store.state.settings.theme" @change="store.updateSettings({ theme: $event.target.value })"><option value="light">روشن</option><option value="dark">تیره</option></select></label></div></section>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">دفترچهٔ اسامی</span><h2>افراد ذخیره‌شده</h2></div><span class="count-pill">{{ store.state.savedPeople.length }}</span></div><div v-if="store.state.savedPeople.length" class="saved-people"><span v-for="name in store.state.savedPeople" :key="name" class="person-chip"><strong>{{ name }}</strong><button class="icon-btn icon-btn--danger" @click="store.removeSavedPerson(name)">×</button></span></div><div v-else class="empty compact"><p>نام افرادی که به رویدادها اضافه می‌کنی اینجا ذخیره می‌شود.</p></div></section>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">پشتیبان‌گیری</span><h2>مالک داده‌هایت باش</h2></div></div><p class="helper">یک فایل JSON خروجی بگیر یا پشتیبان قبلی را بازیابی کن.</p><div class="actions actions--start"><button class="btn btn--primary" @click="exportBackup">دریافت پشتیبان</button><button class="btn btn--ghost" @click="fileInput.click()">بازیابی فایل</button><input ref="fileInput" class="sr-only" type="file" accept="application/json" @change="importBackup" /></div></section>
    <section class="panel danger-zone"><div><h2>پاک‌کردن همهٔ داده‌ها</h2><p>این عملیات قابل بازگشت نیست؛ اول پشتیبان بگیر.</p></div><button class="btn btn--danger" @click="clearAll">پاک‌کردن کامل</button></section>
  </div>
</template>
