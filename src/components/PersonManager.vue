<script setup>
import { computed, ref, watch } from 'vue'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'
import AccountModal from './AccountModal.vue'
import {
  BANKS_LIST,
  cleanDigits,
  extractShebaDigits,
  getBankFromCard,
  getBankFromShaba,
  getBankIconUrl,
  validateCard,
  validateSheba
} from '../utils/bank.js'

const props = defineProps({ event: { type: Object, required: true } })
const store = useEventStore()
const toast = useToast()

const name = ref('')
const showBankFields = ref(false)
const rawCard = ref('')
const rawSheba = ref('')
const bankKey = ref('no-img')
const bankName = ref('')
const manualBankSelected = ref(false)

const activeAccountPerson = ref(null)

watch(rawCard, (val) => {
  const digits = cleanDigits(val)
  if (digits.length >= 6 && !manualBankSelected.value) {
    const detected = getBankFromCard(digits)
    if (detected) {
      bankKey.value = detected.bankKey
      bankName.value = detected.bankName
    }
  }
})

watch(rawSheba, (val) => {
  if (val && !manualBankSelected.value && (!bankKey.value || bankKey.value === 'no-img')) {
    const detected = getBankFromShaba(val)
    if (detected) {
      bankKey.value = detected.bankKey
      bankName.value = detected.bankName
    }
  }
})

function handleCardInput(e) {
  const digits = cleanDigits(e.target.value).slice(0, 16)
  rawCard.value = formatCardNumber(digits)
}

function onBankSelect(e) {
  const key = e.target.value
  manualBankSelected.value = true
  bankKey.value = key || 'no-img'
  const found = BANKS_LIST.find((b) => b.key === key)
  bankName.value = found ? found.name : ''
}

function resetForm() {
  name.value = ''
  rawCard.value = ''
  rawSheba.value = ''
  bankKey.value = 'no-img'
  bankName.value = ''
  manualBankSelected.value = false
  showBankFields.value = false
}

function add() {
  if (!name.value.trim()) return toast.show('نام شخص را وارد کنید.', 'error')

  let optionalAccount = null
  const cardDigits = cleanDigits(rawCard.value)
  const shebaDigits = extractShebaDigits(rawSheba.value)

  if (cardDigits || shebaDigits) {
    if (cardDigits && cardDigits.length !== 16) {
      return toast.show('شماره کارت باید ۱۶ رقم باشد.', 'error')
    }
    if (cardDigits && !validateCard(cardDigits)) {
      return toast.show('شماره کارت معتبر نیست.', 'error')
    }
    if (shebaDigits && !validateSheba(rawSheba.value)) {
      return toast.show('شماره شبا معتبر نیست.', 'error')
    }

    const resolvedBankKey = bankKey.value && bankKey.value !== 'no-img' ? bankKey.value : 'no-img'
    const resolvedBankName = bankName.value || BANKS_LIST.find((b) => b.key === resolvedBankKey)?.name || 'نامشخص'

    optionalAccount = {
      cardNumber: cardDigits,
      shebaNumber: shebaDigits ? `IR${shebaDigits}` : '',
      bankKey: resolvedBankKey,
      bankName: resolvedBankName
    }
  }

  const person = store.addPerson(props.event.id, name.value, optionalAccount)
  if (!person) return toast.show('این نام قبلاً در رویداد وجود دارد.', 'error')

  resetForm()
  toast.show('شخص به رویداد اضافه شد.')
}

function remove(person) {
  const count = props.event.expenses.filter((expense) => expense.payerId === person.id).length
  const warning = count ? `با حذف ${person.name}، ${count} هزینه‌ای که پرداخت کرده نیز حذف می‌شود. ادامه می‌دهید؟` : `«${person.name}» حذف شود؟`
  if (window.confirm(warning)) store.removePerson(props.event.id, person.id)
}

function getAccountsForPerson(personName) {
  return store.getContactByName(personName)?.accounts || []
}
</script>

<template>
  <section class="panel">
    <div class="section-heading">
      <div>
        <span class="eyebrow">اعضای رویداد</span>
        <h2>چه کسانی همراه‌اند؟</h2>
      </div>
      <span class="count-pill">{{ event.people.length }} نفر</span>
    </div>

    <div class="inline-form">
      <label class="field field--grow">
        <span>نام</span>
        <input
          v-model="name"
          list="saved-people"
          autocomplete="off"
          placeholder="مثلاً سارا"
          @keydown.enter.prevent="add"
        />
      </label>
      <datalist id="saved-people">
        <option v-for="person in store.state.savedPeople" :key="person" :value="person" />
      </datalist>
      <button
        type="button"
        class="btn btn--ghost"
        :class="{ 'btn--active': showBankFields }"
        @click="showBankFields = !showBankFields"
      >
        💳 {{ showBankFields ? 'بستن حساب' : 'اطلاعات بانکی' }}
      </button>
      <button class="btn btn--primary" @click="add">افزودن</button>
    </div>

    <!-- Optional bank fields when adding a person -->
    <div v-if="showBankFields" class="optional-bank-box">
      <small class="muted" style="margin-bottom: 8px; display: block;">
        اطلاعات بانکی اختیاری است و برای همه رویدادها در دفترچه مخاطبین ذخیره می‌شود:
      </small>
      <div class="form-grid">
        <label class="field">
          <span class="field-label-flex">
            <span>شماره کارت (۱۶ رقم)</span>
            <span v-if="bankKey && bankKey !== 'no-img'" class="bank-tag-inline">
              <img :src="getBankIconUrl(bankKey)" :alt="bankName" class="bank-icon-xs" />
              <small>{{ bankName }}</small>
            </span>
          </span>
          <div class="input-with-icon">
            <input
              :value="rawCard"
              dir="ltr"
              type="text"
              inputmode="numeric"
              maxlength="19"
              placeholder="6037 9911 2233 4455"
              class="money-input"
              @input="handleCardInput"
            />
            <img :src="getBankIconUrl(bankKey)" :alt="bankName" class="input-bank-logo" />
          </div>
        </label>

        <label class="field">
          <span>شماره شبا (IBAN)</span>
          <div class="input-with-prefix">
            <input
              v-model="rawSheba"
              dir="ltr"
              type="text"
              placeholder="120170000000123456789012"
              class="money-input"
            />
            <span class="input-prefix">IR</span>
          </div>
        </label>

        <label class="field field--wide">
          <span>بانک</span>
          <div class="select-with-logo">
            <select :value="bankKey" @change="onBankSelect">
              <option value="no-img">انتخاب از لیست بانک‌ها…</option>
              <option v-for="b in BANKS_LIST" :key="b.key" :value="b.key">
                {{ b.name }}
              </option>
            </select>
            <img :src="getBankIconUrl(bankKey)" :alt="bankName" class="select-bank-logo" />
          </div>
        </label>
      </div>
    </div>

    <!-- People list -->
    <div v-if="event.people.length" class="people-grid">
      <div v-for="person in event.people" :key="person.id" class="person-chip">
        <span class="avatar">{{ person.name.slice(0, 1) }}</span>
        <strong>{{ person.name }}</strong>

        <!-- Bank account badge & quick-edit trigger -->
        <button
          v-if="getAccountsForPerson(person.name).length"
          class="person-account-badge"
          :title="`مدیریت حساب‌های ${person.name}`"
          @click="activeAccountPerson = person.name"
        >
          <img
            :src="getBankIconUrl(getAccountsForPerson(person.name)[0].bankKey)"
            :alt="getAccountsForPerson(person.name)[0].bankName"
            class="bank-icon-chip"
          />
          <span v-if="getAccountsForPerson(person.name).length > 1" class="acc-count">
            {{ getAccountsForPerson(person.name).length }}
          </span>
        </button>
        <button
          v-else
          class="person-account-badge person-account-badge--add"
          :title="`افزودن اطلاعات بانکی ${person.name}`"
          @click="activeAccountPerson = person.name"
        >
          + 💳
        </button>

        <button class="icon-btn icon-btn--danger" :aria-label="`حذف ${person.name}`" @click="remove(person)">×</button>
      </div>
    </div>
    <div v-else class="empty compact">
      <span>👋</span>
      <p>هنوز کسی اضافه نشده؛ از دفترچهٔ اسامی یا یک نام تازه شروع کن.</p>
    </div>

    <!-- Modal for managing/editing accounts of a person -->
    <AccountModal
      v-if="activeAccountPerson"
      :person-name="activeAccountPerson"
      @close="activeAccountPerson = null"
    />
  </section>
</template>

<style scoped>
.btn--active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
}
.optional-bank-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px dashed var(--line);
}
.field-label-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bank-tag-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
}
.bank-icon-xs {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.input-with-icon,
.select-with-logo {
  position: relative;
  display: flex;
  align-items: center;
}
.input-bank-logo,
.select-bank-logo {
  position: absolute;
  left: 10px;
  width: 22px;
  height: 22px;
  object-fit: contain;
  pointer-events: none;
}
.input-with-icon input,
.select-with-logo select {
  padding-left: 38px;
}
.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}
.input-prefix {
  position: absolute;
  left: 10px;
  font-weight: 800;
  color: var(--muted);
  font-size: 11px;
}
.input-with-prefix input {
  padding-left: 32px;
}
.person-account-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  cursor: pointer;
  font-size: 11px;
  color: var(--muted);
  transition: 0.15s;
}
.person-account-badge:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
}
.person-account-badge--add {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  color: var(--muted);
}
.bank-icon-chip {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.acc-count {
  font-size: 10px;
  font-weight: 800;
  color: var(--primary);
}
</style>
