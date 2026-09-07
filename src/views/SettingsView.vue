<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'
import { currencies, roundingOptions } from '../utils/currencies.js'
import { usePwaUpdate } from '../composables/usePwaUpdate.js'
import AccountModal from '../components/AccountModal.vue'
import { formatCardNumber, getBankIconUrl } from '../utils/bank.js'

const store = useEventStore()
const toast = useToast()
const router = useRouter()
const fileInput = ref()
const updates = usePwaUpdate()

const appVersion = __APP_VERSION__
const commitSha = __COMMIT_SHA__
const buildDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(__BUILD_TIME__))
const lastChecked = computed(() => updates.state.lastChecked ? new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' }).format(-Math.max(1, Math.round((Date.now() - new Date(updates.state.lastChecked)) / 60000)), 'minute') : 'هنوز بررسی نشده')

const contactSearch = ref('')
const newContactName = ref('')
const activeAccountPerson = ref(null)

const contacts = computed(() => store.state.contacts || [])
const filteredContacts = computed(() => {
  const q = contactSearch.value.trim().toLocaleLowerCase('fa')
  if (!q) return contacts.value
  return contacts.value.filter((c) => {
    const nameMatch = c.name.toLocaleLowerCase('fa').includes(q)
    const bankMatch = c.accounts?.some((a) =>
      (a.bankName && a.bankName.toLocaleLowerCase('fa').includes(q)) ||
      (a.cardNumber && a.cardNumber.includes(q))
    )
    return nameMatch || bankMatch
  })
})

function addContact() {
  const name = newContactName.value.trim()
  if (!name) return toast.show('نام مخاطب را وارد کنید.', 'error')
  const existing = store.getContactByName(name)
  if (existing) return toast.show('مخاطبی با این نام از قبل وجود دارد.', 'error')
  store.saveContact({ name, accounts: [] })
  newContactName.value = ''
  toast.show('مخاطب اضافه شد.')
  // Automatically open account modal so user can add cards
  activeAccountPerson.value = name
}

function removeContact(contact) {
  if (window.confirm(`مخاطب «${contact.name}» و تمام حساب‌های بانکی او حذف شوند؟`)) {
    store.deleteContact(contact.id)
    toast.show('مخاطب حذف شد.')
  }
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dongban-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function importBackup(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      store.importData(JSON.parse(reader.result))
      toast.show('پشتیبان بازیابی شد.')
      router.push('/')
    } catch (error) {
      toast.show(error.message, 'error')
    }
  }
  reader.readAsText(file)
}

function clearAll() {
  if (window.confirm('تمام رویدادها، مخاطبین و حساب‌های بانکی برای همیشه پاک شوند؟')) {
    store.clearAll()
    toast.show('همهٔ داده‌ها پاک شد.')
  }
}

async function checkUpdate() {
  const checked = await updates.checkForUpdate()
  toast.show(checked ? (updates.state.needRefresh ? 'نسخهٔ جدید آمادهٔ نصب است.' : 'دنگ‌بان به‌روز است.') : 'بررسی آپدیت در نسخهٔ نصب‌شده و آنلاین فعال است.', checked ? 'success' : 'error')
}
</script>

<template>
  <div class="page settings-page stack-lg">
    <header class="page-title">
      <span class="eyebrow">شخصی‌سازی و داده‌ها</span>
      <h1>تنظیمات</h1>
      <p>اطلاعات رویدادها و هزینه‌ها فقط روی همین دستگاه نگهداری می‌شوند.</p>
    </header>

    <!-- Defaults panel -->
    <section class="panel">
      <div class="section-heading">
        <div><span class="eyebrow">پیش‌فرض‌ها</span><h2>تنظیمات رویداد تازه</h2></div>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>واحد پول</span>
          <select :value="store.state.settings.defaultCurrency" @change="store.updateSettings({ defaultCurrency: $event.target.value })">
            <option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.label }}</option>
          </select>
        </label>
        <label class="field">
          <span>رُندکردن</span>
          <select :value="store.state.settings.defaultRounding" @change="store.updateSettings({ defaultRounding: Number($event.target.value) })">
            <option v-for="option in roundingOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="field">
          <span>ظاهر</span>
          <select :value="store.state.settings.theme" @change="store.updateSettings({ theme: $event.target.value })">
            <option value="light">روشن</option>
            <option value="dark">تیره</option>
          </select>
        </label>
      </div>
    </section>

    <!-- Global Contacts & Bank Accounts panel -->
    <section class="panel">
      <div class="section-heading">
        <div>
          <span class="eyebrow">دفترچهٔ گلوبال</span>
          <h2>مخاطبین و حساب‌های بانکی</h2>
        </div>
        <span class="count-pill">{{ contacts.length }} مخاطب</span>
      </div>
      <p class="helper">
        اطلاعات بانکی افراد در تمام رویدادها در دسترس است و در بخش تسویه جهت واریز سهم‌ها استفاده می‌شود.
      </p>

      <!-- Add contact form -->
      <div class="inline-form" style="margin-bottom: 16px;">
        <label class="field field--grow">
          <span>نام مخاطب جدید</span>
          <input
            v-model="newContactName"
            autocomplete="off"
            placeholder="مثلاً علی رضایی"
            @keydown.enter.prevent="addContact"
          />
        </label>
        <button class="btn btn--primary" @click="addContact">+ افزودن مخاطب</button>
      </div>

      <!-- Search input if there are contacts -->
      <div v-if="contacts.length > 3" style="margin-bottom: 14px;">
        <input
          v-model="contactSearch"
          class="search"
          placeholder="جست‌وجوی مخاطب یا بانک…"
        />
      </div>

      <!-- Contacts list -->
      <div v-if="filteredContacts.length" class="contacts-grid">
        <div v-for="contact in filteredContacts" :key="contact.id" class="contact-card">
          <div class="contact-card__main">
            <span class="avatar avatar--soft">{{ contact.name.slice(0, 1) }}</span>
            <div>
              <strong>{{ contact.name }}</strong>
              <div v-if="contact.accounts?.length" class="contact-accounts-preview">
                <span v-for="acc in contact.accounts" :key="acc.id" class="account-pill">
                  <img :src="getBankIconUrl(acc.bankKey)" :alt="acc.bankName" class="bank-icon-xs" />
                  <small>{{ acc.bankName || 'بانک' }}</small>
                  <span v-if="acc.cardNumber" class="mono-text">
                    {{ formatCardNumber(acc.cardNumber).slice(-9) }}
                  </span>
                </span>
              </div>
              <small v-else class="muted">حساب بانکی ثبت نشده</small>
            </div>
          </div>

          <div class="row-actions">
            <button
              class="btn btn--ghost btn--sm"
              :title="`مدیریت حساب‌های ${contact.name}`"
              @click="activeAccountPerson = contact.name"
            >
              💳 {{ contact.accounts?.length ? `${contact.accounts.length} حساب` : '+ افزودن حساب' }}
            </button>
            <button
              class="icon-btn icon-btn--danger"
              :aria-label="`حذف ${contact.name}`"
              @click="removeContact(contact)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="contacts.length" class="empty compact">
        <p>مخاطبی با این عبارت پیدا نشد.</p>
      </div>
      <div v-else class="empty compact">
        <p>هنوز مخاطبی ثبت نشده است. از فرم بالا برای اضافه کردن شروع کنید.</p>
      </div>
    </section>

    <!-- Backup panel -->
    <section class="panel">
      <div class="section-heading">
        <div><span class="eyebrow">پشتیبان‌گیری</span><h2>مالک داده‌هایت باش</h2></div>
      </div>
      <p class="helper">یک فایل JSON خروجی بگیر یا پشتیبان قبلی را بازیابی کن.</p>
      <div class="actions actions--start">
        <button class="btn btn--primary" @click="exportBackup">دریافت پشتیبان</button>
        <button class="btn btn--ghost" @click="fileInput.click()">بازیابی فایل</button>
        <input ref="fileInput" class="sr-only" type="file" accept="application/json" @change="importBackup" />
      </div>
    </section>

    <!-- Version panel -->
    <section class="panel version-panel">
      <div>
        <span class="eyebrow">نسخه و آپدیت</span>
        <h2>دنگ‌بان {{ appVersion }}</h2>
        <p>Build {{ commitSha }} · {{ buildDate }}</p>
        <small>آخرین بررسی: {{ lastChecked }}</small>
      </div>
      <button class="btn btn--ghost" :disabled="updates.state.checking" @click="checkUpdate">
        {{ updates.state.checking ? 'در حال بررسی…' : 'بررسی آپدیت' }}
      </button>
    </section>

    <!-- Danger zone -->
    <section class="panel danger-zone">
      <div>
        <h2>پاک‌کردن همهٔ داده‌ها</h2>
        <p>این عملیات قابل بازگشت نیست؛ اول پشتیبان بگیر.</p>
      </div>
      <button class="btn btn--danger" @click="clearAll">پاک‌کردن کامل</button>
    </section>

    <!-- Modal for managing accounts -->
    <AccountModal
      v-if="activeAccountPerson"
      :person-name="activeAccountPerson"
      @close="activeAccountPerson = null"
    />
  </div>
</template>

<style scoped>
.contacts-grid {
  display: grid;
  gap: 10px;
}
.contact-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface-2);
}
.contact-card__main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.contact-card__main > div {
  display: grid;
  gap: 4px;
}
.contact-accounts-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.account-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: 1px solid var(--line);
  border-radius: 99px;
  background: var(--surface);
  font-size: 11px;
}
.bank-icon-xs {
  width: 15px;
  height: 15px;
  object-fit: contain;
}
.mono-text {
  font-family: monospace;
  direction: ltr;
  color: var(--muted);
  font-weight: 700;
}
.btn--sm {
  min-height: 36px;
  padding: 6px 12px;
  font-size: 12px;
}
</style>
