<script setup>
import { computed, ref } from 'vue'
import { calculateEvent } from '../utils/settlement.js'
import { formatMoney } from '../utils/money.js'
import { useToast } from '../composables/useToast.js'
import { useEventStore } from '../stores/eventStore.js'
import AccountModal from './AccountModal.vue'
import { formatCardNumber, formatSheba, getBankIconUrl } from '../utils/bank.js'

const props = defineProps({ event: { type: Object, required: true } })
const store = useEventStore()
const toast = useToast()

const result = computed(() => calculateEvent(props.event))
const creatingImage = ref(false)
const activeAccountPerson = ref(null)

const person = (id) => props.event.people.find((item) => item.id === id)

// Creditors who need to receive money
const creditors = computed(() => {
  const map = new Map()
  result.value.transfers.forEach((tx) => {
    const current = map.get(tx.to) || 0
    map.set(tx.to, current + tx.amount)
  })

  return Array.from(map.entries()).map(([personId, totalAmount]) => {
    const p = person(personId)
    const personName = p?.name || 'نامشخص'
    const contact = store.getContactByName(personName)
    const accounts = contact?.accounts || []
    return {
      personId,
      name: personName,
      totalAmount,
      accounts
    }
  })
})

const summary = computed(() => {
  const lines = [
    `🧾 تسویه «${props.event.title}»`,
    `💰 کل هزینه: ${formatMoney(result.value.total, props.event.currency)}`,
    ''
  ]

  if (!result.value.transfers.length) {
    lines.push('✅ حساب همه صاف است؛ پرداختی لازم نیست.')
  } else {
    lines.push('💸 پرداخت‌های نهایی:')
    result.value.transfers.forEach((tx) =>
      lines.push(`• ${person(tx.from)?.name} ← به ← ${person(tx.to)?.name}: ${formatMoney(tx.amount, props.event.currency)}`)
    )
    lines.push('', '✅ با انجام پرداخت‌های بالا حساب‌ها بسته می‌شود.')

    const withAccounts = creditors.value.filter((c) => c.accounts.length > 0)
    if (withAccounts.length > 0) {
      lines.push('', '💳 شماره کارت و حساب جهت واریز:')
      withAccounts.forEach((c) => {
        lines.push(`• ${c.name}:`)
        c.accounts.forEach((acc) => {
          const bank = acc.bankName ? ` (${acc.bankName})` : ''
          if (acc.cardNumber) {
            lines.push(`  شماره کارت${bank}: ${formatCardNumber(acc.cardNumber)}`)
          }
          if (acc.shebaNumber) {
            lines.push(`  شماره شبا${bank}: ${formatSheba(acc.shebaNumber)}`)
          }
        })
      })
    }
  }

  lines.push('', '🌐 dongban.ir')
  return lines.join('\n')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(summary.value)
    toast.show('خلاصهٔ تسویه کپی شد.')
  } catch {
    toast.show('مرورگر اجازهٔ کپی نداد.', 'error')
  }
}

async function copyText(val, label) {
  try {
    await navigator.clipboard.writeText(val)
    toast.show(`${label} کپی شد.`)
  } catch {
    toast.show('امکان کپی وجود ندارد.', 'error')
  }
}

async function share() {
  if (navigator.share) {
    try {
      await navigator.share({ title: `تسویه ${props.event.title}`, text: summary.value })
    } catch {
      /* user cancelled */
    }
  } else {
    copy()
  }
}

async function settlementFile() {
  const { createSettlementImage } = await import('../utils/shareImage.js')
  const blob = await createSettlementImage(props.event, result.value, creditors.value)
  return new File([blob], `dongban-${props.event.id}.png`, { type: 'image/png' })
}

async function downloadImage() {
  creatingImage.value = true
  try {
    const file = await settlementFile()
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
    toast.show('کارت تسویه دانلود شد.')
  } catch {
    toast.show('ساخت تصویر ممکن نشد.', 'error')
  } finally {
    creatingImage.value = false
  }
}

async function shareImage() {
  creatingImage.value = true
  try {
    const file = await settlementFile()
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: `تسویه ${props.event.title}`,
        text: 'خلاصهٔ تسویه با دنگ‌بان — dongban.ir',
        files: [file]
      })
    } else {
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
      URL.revokeObjectURL(url)
      toast.show('اشتراک فایل پشتیبانی نشد؛ تصویر دانلود شد.')
    }
  } catch {
    /* cancelled or unavailable */
  } finally {
    creatingImage.value = false
  }
}
</script>

<template>
  <div class="stack">
    <!-- Balances panel -->
    <section class="panel">
      <div class="section-heading">
        <div>
          <span class="eyebrow">وضعیت نفرات</span>
          <h2>مانده‌حساب‌ها</h2>
        </div>
        <span class="count-pill">رُند: {{ event.roundingIncrement.toLocaleString('fa-IR') }}</span>
      </div>
      <div v-if="event.people.length" class="balance-list">
        <article v-for="item in event.people" :key="item.id" class="balance-row">
          <span class="avatar">{{ item.name.slice(0, 1) }}</span>
          <div>
            <strong>{{ item.name }}</strong>
            <small>
              پرداخت {{ formatMoney(result.paid[item.id], event.currency) }} · سهم
              {{ formatMoney(result.consumed[item.id], event.currency) }}
            </small>
          </div>
          <strong
            :class="
              result.balances[item.id] > 0
                ? 'positive'
                : result.balances[item.id] < 0
                  ? 'negative'
                  : ''
            "
          >
            {{ result.balances[item.id] > 0 ? '+' : '' }}{{ formatMoney(result.balances[item.id], event.currency) }}
          </strong>
        </article>
      </div>
    </section>

    <!-- Optimal transfers panel -->
    <section class="panel settlement-hero">
      <div class="section-heading">
        <div>
          <span class="eyebrow">کمترین تعداد انتقال</span>
          <h2>چه کسی به چه کسی بدهد؟</h2>
        </div>
      </div>
      <div v-if="result.transfers.length" class="transfer-list">
        <article
          v-for="(tx, index) in result.transfers"
          :key="`${tx.from}-${tx.to}-${index}`"
          class="transfer-card"
        >
          <div>
            <span class="avatar avatar--soft">{{ person(tx.from)?.name.slice(0, 1) }}</span>
            <strong>{{ person(tx.from)?.name }}</strong>
          </div>
          <span class="transfer-arrow">← پرداخت به ←</span>
          <div>
            <span class="avatar avatar--soft">{{ person(tx.to)?.name.slice(0, 1) }}</span>
            <strong>{{ person(tx.to)?.name }}</strong>
          </div>
          <b>{{ formatMoney(tx.amount, event.currency) }}</b>
        </article>
      </div>
      <div v-else class="empty compact">
        <span>🎉</span>
        <h3>همه‌چیز صاف است!</h3>
        <p>هیچ پرداختی لازم نیست.</p>
      </div>

      <!-- Creditor bank accounts section -->
      <div v-if="creditors.length" class="creditors-section stack">
        <div class="section-heading" style="margin-bottom: 12px; margin-top: 24px;">
          <div>
            <span class="eyebrow">واریز دنگ‌ها</span>
            <h3>💳 شماره حساب‌ها جهت واریز</h3>
          </div>
        </div>

        <div class="creditors-grid">
          <div v-for="c in creditors" :key="c.personId" class="creditor-card">
            <div class="creditor-card__header">
              <div class="creditor-card__person">
                <span class="avatar avatar--soft">{{ c.name.slice(0, 1) }}</span>
                <div>
                  <strong>{{ c.name }}</strong>
                  <small class="creditor-due">مبلغ دریافتی: {{ formatMoney(c.totalAmount, event.currency) }}</small>
                </div>
              </div>
              <button
                class="btn btn--ghost btn--sm"
                :title="`ویرایش حساب‌های ${c.name}`"
                @click="activeAccountPerson = c.name"
              >
                {{ c.accounts.length ? 'ویرایش حساب‌ها' : '+ افزودن شماره کارت' }}
              </button>
            </div>

            <!-- List of accounts for this creditor -->
            <div v-if="c.accounts.length" class="creditor-accounts-list">
              <div v-for="acc in c.accounts" :key="acc.id" class="settlement-account-row">
                <div class="account-bank-info">
                  <img :src="getBankIconUrl(acc.bankKey)" :alt="acc.bankName" class="bank-icon-sm" />
                  <span>{{ acc.bankName || 'بانک' }}</span>
                </div>

                <div class="account-numbers">
                  <div v-if="acc.cardNumber" class="number-line">
                    <span class="mono-font">{{ formatCardNumber(acc.cardNumber) }}</span>
                    <button
                      class="btn-copy"
                      title="کپی شماره کارت"
                      @click="copyText(acc.cardNumber, `شماره کارت ${c.name}`)"
                    >
                      📋 کپی کارت
                    </button>
                  </div>
                  <div v-if="acc.shebaNumber" class="number-line">
                    <span class="mono-font">{{ formatSheba(acc.shebaNumber) }}</span>
                    <button
                      class="btn-copy"
                      title="کپی شبا"
                      @click="copyText(acc.shebaNumber, `شماره شبا ${c.name}`)"
                    >
                      📋 کپی شبا
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-account-notice">
              <span>اطلاعات حسابی برای {{ c.name }} ثبت نشده است.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="actions settlement-actions mt-2">
        <button class="btn btn--ghost" @click="copy">کپی متن</button>
        <button class="btn btn--ghost" @click="share">اشتراک متن</button>
        <button class="btn btn--ghost" :disabled="creatingImage" @click="downloadImage">دانلود کارت</button>
        <button class="btn btn--primary" :disabled="creatingImage" @click="shareImage">
          {{ creatingImage ? 'در حال ساخت…' : 'اشتراک تصویر' }}
        </button>
      </div>

      <pre class="share-preview">{{ summary }}</pre>
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
.creditors-section {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px dashed var(--line);
}
.creditors-grid {
  display: grid;
  gap: 12px;
}
.creditor-card {
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface-2);
}
.creditor-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.creditor-card__person {
  display: flex;
  align-items: center;
  gap: 10px;
}
.creditor-card__person > div {
  display: grid;
  line-height: 1.3;
}
.creditor-due {
  color: var(--positive);
  font-weight: 700;
  font-size: 12px;
}
.creditor-accounts-list {
  display: grid;
  gap: 8px;
}
.settlement-account-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
}
.account-bank-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 750;
  font-size: 13px;
}
.bank-icon-sm {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
}
.account-numbers {
  display: grid;
  gap: 6px;
  text-align: left;
}
.number-line {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.mono-font {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  direction: ltr;
  font-weight: 700;
  color: var(--ink);
}
.btn-copy {
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--primary);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
}
.btn-copy:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
}
.empty-account-notice {
  font-size: 12px;
  color: var(--muted);
  padding: 6px 0;
}
.btn--sm {
  min-height: 34px;
  padding: 5px 12px;
  font-size: 12px;
}
@media (max-width: 600px) {
  .settlement-account-row {
    flex-direction: column;
    align-items: stretch;
  }
  .account-numbers {
    text-align: right;
  }
  .number-line {
    justify-content: space-between;
  }
}
</style>
