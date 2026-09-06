<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'
import { currencies, roundingOptions } from '../utils/currencies.js'
import { usePwaUpdate } from '../composables/usePwaUpdate.js'

const store = useEventStore(); const toast = useToast(); const router = useRouter(); const fileInput = ref()
const updates = usePwaUpdate()
const appVersion = __APP_VERSION__; const commitSha = __COMMIT_SHA__
const buildDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(__BUILD_TIME__))
const lastChecked = computed(() => updates.state.lastChecked ? new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' }).format(-Math.max(1, Math.round((Date.now() - new Date(updates.state.lastChecked)) / 60000)), 'minute') : 'هنوز بررسی نشده')
function exportBackup() {
  const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = `dongban-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
}
function importBackup(event) {
  const file = event.target.files?.[0]; if (!file) return
  const reader = new FileReader(); reader.onload = () => { try { store.importData(JSON.parse(reader.result)); toast.show('پشتیبان بازیابی شد.'); router.push('/') } catch (error) { toast.show(error.message, 'error') } }; reader.readAsText(file)
}
function clearAll() { if (window.confirm('تمام رویدادها و اسامی ذخیره‌شده برای همیشه پاک شوند؟')) { store.clearAll(); toast.show('همهٔ داده‌ها پاک شد.') } }
async function checkUpdate() {
  const checked = await updates.checkForUpdate()
  toast.show(checked ? (updates.state.needRefresh ? 'نسخهٔ جدید آمادهٔ نصب است.' : 'دنگ‌بان به‌روز است.') : 'بررسی آپدیت در نسخهٔ نصب‌شده و آنلاین فعال است.', checked ? 'success' : 'error')
}
</script>

<template>
  <div class="page settings-page stack-lg">
    <header class="page-title"><span class="eyebrow">شخصی‌سازی و داده‌ها</span><h1>تنظیمات</h1><p>اطلاعات رویدادها و هزینه‌ها فقط روی همین دستگاه نگهداری می‌شوند.</p></header>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">پیش‌فرض‌ها</span><h2>تنظیمات رویداد تازه</h2></div></div><div class="form-grid"><label class="field"><span>واحد پول</span><select :value="store.state.settings.defaultCurrency" @change="store.updateSettings({ defaultCurrency: $event.target.value })"><option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.label }}</option></select></label><label class="field"><span>رُندکردن</span><select :value="store.state.settings.defaultRounding" @change="store.updateSettings({ defaultRounding: Number($event.target.value) })"><option v-for="option in roundingOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label><label class="field"><span>ظاهر</span><select :value="store.state.settings.theme" @change="store.updateSettings({ theme: $event.target.value })"><option value="light">روشن</option><option value="dark">تیره</option></select></label></div></section>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">دفترچهٔ اسامی</span><h2>افراد ذخیره‌شده</h2></div><span class="count-pill">{{ store.state.savedPeople.length }}</span></div><div v-if="store.state.savedPeople.length" class="saved-people"><span v-for="name in store.state.savedPeople" :key="name" class="person-chip"><strong>{{ name }}</strong><button class="icon-btn icon-btn--danger" @click="store.removeSavedPerson(name)">×</button></span></div><div v-else class="empty compact"><p>نام افرادی که به رویدادها اضافه می‌کنی اینجا ذخیره می‌شود.</p></div></section>
    <section class="panel"><div class="section-heading"><div><span class="eyebrow">پشتیبان‌گیری</span><h2>مالک داده‌هایت باش</h2></div></div><p class="helper">یک فایل JSON خروجی بگیر یا پشتیبان قبلی را بازیابی کن.</p><div class="actions actions--start"><button class="btn btn--primary" @click="exportBackup">دریافت پشتیبان</button><button class="btn btn--ghost" @click="fileInput.click()">بازیابی فایل</button><input ref="fileInput" class="sr-only" type="file" accept="application/json" @change="importBackup" /></div></section>
    <section class="panel version-panel"><div><span class="eyebrow">نسخه و آپدیت</span><h2>دنگ‌بان {{ appVersion }}</h2><p>Build {{ commitSha }} · {{ buildDate }}</p><small>آخرین بررسی: {{ lastChecked }}</small></div><button class="btn btn--ghost" :disabled="updates.state.checking" @click="checkUpdate">{{ updates.state.checking ? 'در حال بررسی…' : 'بررسی آپدیت' }}</button></section>
    <section class="panel danger-zone"><div><h2>پاک‌کردن همهٔ داده‌ها</h2><p>این عملیات قابل بازگشت نیست؛ اول پشتیبان بگیر.</p></div><button class="btn btn--danger" @click="clearAll">پاک‌کردن کامل</button></section>
  </div>
</template>
