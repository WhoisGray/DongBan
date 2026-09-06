<script setup>
import { computed, ref } from 'vue'
import { calculateEvent } from '../utils/settlement.js'
import { formatMoney } from '../utils/money.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({ event: { type: Object, required: true } })
const result = computed(() => calculateEvent(props.event)); const toast = useToast()
const creatingImage = ref(false)
const person = (id) => props.event.people.find((item) => item.id === id)
const summary = computed(() => {
  const lines = [`🧾 تسویه «${props.event.title}»`, `💰 کل هزینه: ${formatMoney(result.value.total, props.event.currency)}`, '']
  if (!result.value.transfers.length) lines.push('✅ حساب همه صاف است؛ پرداختی لازم نیست.')
  else { lines.push('💸 پرداخت‌های نهایی:'); result.value.transfers.forEach((tx) => lines.push(`• ${person(tx.from)?.name} ← به ← ${person(tx.to)?.name}: ${formatMoney(tx.amount, props.event.currency)}`)); lines.push('', '✅ با انجام پرداخت‌های بالا حساب‌ها بسته می‌شود.') }
  lines.push('', '🌐 dongban.ir')
  return lines.join('\n')
})
async function copy() {
  try { await navigator.clipboard.writeText(summary.value); toast.show('خلاصهٔ تسویه کپی شد.') }
  catch { toast.show('مرورگر اجازهٔ کپی نداد.', 'error') }
}
async function share() {
  if (navigator.share) { try { await navigator.share({ title: `تسویه ${props.event.title}`, text: summary.value }) } catch { /* user cancelled */ } }
  else copy()
}
async function settlementFile() {
  const { createSettlementImage } = await import('../utils/shareImage.js')
  const blob = await createSettlementImage(props.event, result.value)
  return new File([blob], `dongban-${props.event.id}.png`, { type: 'image/png' })
}
async function downloadImage() {
  creatingImage.value = true
  try {
    const file = await settlementFile(); const url = URL.createObjectURL(file); const link = document.createElement('a')
    link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); toast.show('کارت تسویه دانلود شد.')
  } catch { toast.show('ساخت تصویر ممکن نشد.', 'error') }
  finally { creatingImage.value = false }
}
async function shareImage() {
  creatingImage.value = true
  try {
    const file = await settlementFile()
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: `تسویه ${props.event.title}`, text: 'خلاصهٔ تسویه با دنگ‌بان — dongban.ir', files: [file] })
    else { const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); toast.show('اشتراک فایل پشتیبانی نشد؛ تصویر دانلود شد.') }
  } catch { /* cancelled or unavailable */ }
  finally { creatingImage.value = false }
}
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="section-heading"><div><span class="eyebrow">وضعیت نفرات</span><h2>مانده‌حساب‌ها</h2></div><span class="count-pill">رُند: {{ event.roundingIncrement.toLocaleString('fa-IR') }}</span></div>
      <div v-if="event.people.length" class="balance-list">
        <article v-for="item in event.people" :key="item.id" class="balance-row">
          <span class="avatar">{{ item.name.slice(0, 1) }}</span><div><strong>{{ item.name }}</strong><small>پرداخت {{ formatMoney(result.paid[item.id], event.currency) }} · سهم {{ formatMoney(result.consumed[item.id], event.currency) }}</small></div>
          <strong :class="result.balances[item.id] > 0 ? 'positive' : result.balances[item.id] < 0 ? 'negative' : ''">{{ result.balances[item.id] > 0 ? '+' : '' }}{{ formatMoney(result.balances[item.id], event.currency) }}</strong>
        </article>
      </div>
    </section>
    <section class="panel settlement-hero">
      <div class="section-heading"><div><span class="eyebrow">کمترین تعداد انتقال</span><h2>چه کسی به چه کسی بدهد؟</h2></div></div>
      <div v-if="result.transfers.length" class="transfer-list">
        <article v-for="(tx, index) in result.transfers" :key="`${tx.from}-${tx.to}-${index}`" class="transfer-card">
          <div><span class="avatar avatar--soft">{{ person(tx.from)?.name.slice(0, 1) }}</span><strong>{{ person(tx.from)?.name }}</strong></div><span class="transfer-arrow">← پرداخت به ←</span><div><span class="avatar avatar--soft">{{ person(tx.to)?.name.slice(0, 1) }}</span><strong>{{ person(tx.to)?.name }}</strong></div><b>{{ formatMoney(tx.amount, event.currency) }}</b>
        </article>
      </div>
      <div v-else class="empty compact"><span>🎉</span><h3>همه‌چیز صاف است!</h3><p>هیچ پرداختی لازم نیست.</p></div>
      <div class="actions settlement-actions"><button class="btn btn--ghost" @click="copy">کپی متن</button><button class="btn btn--ghost" @click="share">اشتراک متن</button><button class="btn btn--ghost" :disabled="creatingImage" @click="downloadImage">دانلود کارت</button><button class="btn btn--primary" :disabled="creatingImage" @click="shareImage">{{ creatingImage ? 'در حال ساخت…' : 'اشتراک تصویر' }}</button></div>
      <pre class="share-preview">{{ summary }}</pre>
    </section>
  </div>
</template>
