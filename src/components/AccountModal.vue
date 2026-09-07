<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useEventStore } from '../stores/eventStore.js'
import { useToast } from '../composables/useToast.js'
import {
  BANKS_LIST,
  cleanDigits,
  convertPersianToEnglishDigits,
  extractShebaDigits,
  formatCardNumber,
  formatSheba,
  getBankFromCard,
  getBankFromShaba,
  getBankIconUrl,
  validateCard,
  validateSheba
} from '../utils/bank.js'

const props = defineProps({
  personName: { type: String, required: true }
})

const emit = defineEmits(['close'])
const store = useEventStore()
const toast = useToast()

const rawCard = ref('')
const rawSheba = ref('')
const bankKey = ref('no-img')
const bankName = ref('')
const manualBankSelected = ref(false)

const contact = computed(() => store.getContactByName(props.personName))
const accounts = computed(() => contact.value?.accounts || [])

// Auto-detect bank from card
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

// Auto-detect bank from sheba if card didn't set it
watch(rawSheba, (val) => {
  if (val && !manualBankSelected.value && (!bankKey.value || bankKey.value === 'no-img')) {
    const detected = getBankFromShaba(val)
    if (detected) {
      bankKey.value = detected.bankKey
      bankName.value = detected.bankName
    }
  }
})

function onBankSelect(e) {
  const key = e.target.value
  manualBankSelected.value = true
  bankKey.value = key || 'no-img'
  const found = BANKS_LIST.find((b) => b.key === key)
  bankName.value = found ? found.name : ''
}

function handleCardInput(e) {
  const digits = cleanDigits(e.target.value).slice(0, 16)
  rawCard.value = formatCardNumber(digits)
}

function handleShebaInput(e) {
  const digits = extractShebaDigits(e.target.value).slice(0, 24)
  rawSheba.value = digits
}

const isCardValid = computed(() => {
  const digits = cleanDigits(rawCard.value)
  if (!digits) return null
  if (digits.length === 16) return validateCard(digits)
  return false
})

const isShebaValid = computed(() => {
  const digits = extractShebaDigits(rawSheba.value)
  if (!digits) return null
  return validateSheba(rawSheba.value)
})

function resetForm() {
  rawCard.value = ''
  rawSheba.value = ''
  bankKey.value = 'no-img'
  bankName.value = ''
  manualBankSelected.value = false
}

function addAccount() {
  const cardDigits = cleanDigits(rawCard.value)
  const shebaDigits = extractShebaDigits(rawSheba.value)

  if (!cardDigits && !shebaDigits) {
    return toast.show('حداقل شماره کارت یا شماره شبا را وارد کنید.', 'error')
  }

  if (cardDigits && cardDigits.length !== 16) {
    return toast.show('شماره کارت باید ۱۶ رقم باشد.', 'error')
  }

  if (cardDigits && !validateCard(cardDigits)) {
    return toast.show('شماره کارت واردشده معتبر نیست.', 'error')
  }

  if (shebaDigits && !validateSheba(rawSheba.value)) {
    return toast.show('شماره شبا واردشده معتبر نیست.', 'error')
  }

  const resolvedBankKey = bankKey.value && bankKey.value !== 'no-img' ? bankKey.value : 'no-img'
  const resolvedBankName = bankName.value || BANKS_LIST.find((b) => b.key === resolvedBankKey)?.name || 'نامشخص'

  store.addAccountToContact(props.personName, {
    cardNumber: cardDigits,
    shebaNumber: shebaDigits ? `IR${shebaDigits}` : '',
    bankKey: resolvedBankKey,
    bankName: resolvedBankName
  })

  toast.show('حساب بانکی با موفقیت افزوده شد.')
  resetForm()
}

function removeAccount(accountId) {
  if (window.confirm('این حساب بانکی حذف شود؟')) {
    store.deleteAccountFromContact(props.personName, accountId)
    toast.show('حساب حذف شد.')
  }
}
</script>

<template>
  <BaseModal :title="`حساب‌های بانکی ${personName}`" @close="emit('close')">
    <div class="account-modal stack">
      <!-- Existing accounts list -->
      <div v-if="accounts.length" class="existing-accounts">
        <h4 class="sub-heading">حساب‌های ثبت‌شده ({{ accounts.length }})</h4>
        <div class="accounts-grid">
          <div v-for="acc in accounts" :key="acc.id" class="account-card">
            <div class="account-card__bank">
              <img :src="getBankIconUrl(acc.bankKey)" :alt="acc.bankName" class="bank-icon-sm" />
              <strong>{{ acc.bankName || 'بانک نامشخص' }}</strong>
            </div>
            <div class="account-card__details">
              <div v-if="acc.cardNumber" class="account-card__row">
                <span class="muted">شماره کارت:</span>
                <span class="mono-num">{{ formatCardNumber(acc.cardNumber) }}</span>
              </div>
              <div v-if="acc.shebaNumber" class="account-card__row">
                <span class="muted">شماره شبا:</span>
                <span class="mono-num">{{ formatSheba(acc.shebaNumber) }}</span>
              </div>
            </div>
            <button class="icon-btn icon-btn--danger" aria-label="حذف حساب" @click="removeAccount(acc.id)">×</button>
          </div>
        </div>
      </div>
      <div v-else class="empty compact">
        <p>هنوز حسابی برای {{ personName }} ثبت نشده است.</p>
      </div>

      <!-- Add new account form -->
      <div class="panel new-account-form">
        <h4 class="sub-heading">افزودن حساب جدید</h4>
        <div class="form-grid">
          <!-- Card input with live bank logo -->
          <label class="field field--wide">
            <span class="field-label-with-bank">
              <span>شماره کارت (۱۶ رقم)</span>
              <span v-if="bankKey && bankKey !== 'no-img'" class="bank-tag">
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
                class="money-input mono-font"
                @input="handleCardInput"
              />
              <img :src="getBankIconUrl(bankKey)" :alt="bankName" class="input-bank-logo" />
            </div>
            <small v-if="cleanDigits(rawCard).length === 16 && isCardValid === false" class="text-danger">
              شماره کارت معتبر به نظر نمی‌رسد (خطای چک‌سام).
            </small>
          </label>

          <!-- Sheba input -->
          <label class="field field--wide">
            <span>شماره شبا (۲۴ رقم بدون IR یا با IR)</span>
            <div class="input-with-prefix">
              <input
                v-model="rawSheba"
                dir="ltr"
                type="text"
                placeholder="120170000000123456789012"
                class="money-input mono-font"
              />
              <span class="input-prefix">IR</span>
            </div>
            <small v-if="extractShebaDigits(rawSheba).length === 24 && isShebaValid === false" class="text-danger">
              شماره شبا نامعتبر است.
            </small>
          </label>

          <!-- Bank select dropdown -->
          <label class="field field--wide">
            <span>نام بانک (تشخیص خودکار یا انتخاب دستی)</span>
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

        <div class="actions" style="margin-top: 16px;">
          <button class="btn btn--primary" @click="addAccount">+ ثبت این حساب</button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.account-modal {
  max-width: 580px;
}
.sub-heading {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--ink);
}
.accounts-grid {
  display: grid;
  gap: 10px;
}
.account-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface-2);
}
.account-card__bank {
  display: flex;
  align-items: center;
  gap: 8px;
}
.account-card__details {
  display: grid;
  gap: 4px;
  font-size: 13px;
}
.account-card__row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.bank-icon-sm {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 8px;
}
.bank-icon-xs {
  width: 18px;
  height: 18px;
  object-fit: contain;
  border-radius: 4px;
}
.field-label-with-bank {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bank-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
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
  width: 26px;
  height: 26px;
  object-fit: contain;
  pointer-events: none;
}
.input-with-icon input {
  padding-left: 42px;
}
.select-with-logo select {
  padding-left: 42px;
}
.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}
.input-prefix {
  position: absolute;
  left: 12px;
  font-weight: 800;
  color: var(--muted);
  font-family: monospace;
}
.input-with-prefix input {
  padding-left: 36px;
}
.mono-font {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  letter-spacing: 0.05em;
}
.mono-num {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  direction: ltr;
  font-weight: 700;
  color: var(--ink);
}
.text-danger {
  color: var(--danger);
  font-size: 11px;
}
.new-account-form {
  margin-top: 10px;
  padding: 16px;
}
</style>
