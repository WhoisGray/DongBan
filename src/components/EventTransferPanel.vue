<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast.js'
import { useEventStore } from '../stores/eventStore.js'
import { buildEventTransfer, createSampleTransfer, eventTransferAiPrompt, stringifyEventTransfer, validateEventTransfer } from '../utils/eventTransfer.js'

const props = defineProps({ event: { type: Object, required: true } })
const emit = defineEmits(['done'])
const router = useRouter()
const store = useEventStore()
const toast = useToast()
const pastedJson = ref('')
const busy = ref('')
const fileInput = ref(null)

function safeFilename(title, extension) {
  const clean = title.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').slice(0, 70) || 'dongban-event'
  return `${clean}.${extension}`
}

function download(data, filename, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function copyText(text, success) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
    await navigator.clipboard.writeText(text)
    toast.show(success)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    toast.show(copied ? success : 'کپی خودکار ممکن نبود؛ متن را دستی انتخاب کنید.', copied ? 'success' : 'error')
  }
}

function exportJson() {
  download(stringifyEventTransfer(props.event), safeFilename(props.event.title, 'json'), 'application/json;charset=utf-8')
  toast.show('فایل JSON رویداد دانلود شد.')
}

async function exportExcel(transfer = buildEventTransfer(props.event), name = props.event.title) {
  busy.value = 'excel'
  try {
    const { eventTransferToXlsxBuffer } = await import('../utils/eventWorkbook.js')
    const buffer = await eventTransferToXlsxBuffer(transfer)
    download(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), safeFilename(name, 'xlsx'))
    toast.show('فایل Excel راست‌چین آماده شد.')
  } catch (error) { toast.show(error.message || 'ساخت فایل Excel ناموفق بود.', 'error') }
  finally { busy.value = '' }
}

function importNormalized(event) {
  const imported = store.importEvent(event)
  toast.show('رویداد به‌صورت یک نسخهٔ مستقل وارد شد.')
  emit('done')
  router.push(`/event/${imported.id}`)
}

function importPastedJson() {
  try { importNormalized(validateEventTransfer(pastedJson.value)) }
  catch (error) { toast.show(error.message || 'JSON معتبر نیست.', 'error') }
}

async function importFile(file) {
  if (!file) return
  busy.value = 'import'
  try {
    if (file.name.toLowerCase().endsWith('.json')) {
      importNormalized(validateEventTransfer(await file.text()))
    } else if (file.name.toLowerCase().endsWith('.xlsx')) {
      const { xlsxBufferToEvent } = await import('../utils/eventWorkbook.js')
      importNormalized(await xlsxBufferToEvent(await file.arrayBuffer()))
    } else throw new Error('فقط فایل‌های JSON و XLSX پشتیبانی می‌شوند.')
  } catch (error) { toast.show(error.message || 'ورود فایل ناموفق بود.', 'error') }
  finally { busy.value = ''; if (fileInput.value) fileInput.value.value = '' }
}

function downloadSampleJson() {
  download(JSON.stringify(createSampleTransfer(), null, 2), 'dongban-event-sample.json', 'application/json;charset=utf-8')
  toast.show('نمونهٔ JSON دانلود شد.')
}
</script>

<template>
  <div class="transfer-panel stack">
    <section class="transfer-section">
      <div class="transfer-section__heading"><div><span class="transfer-icon">⇩</span><div><h3>خروجی این رویداد</h3><p>همهٔ اعضا، هزینه‌ها، سهم‌ها و نتیجهٔ تسویه را منتقل کنید.</p></div></div></div>
      <div class="transfer-actions">
        <button class="btn btn--primary" :disabled="Boolean(busy)" @click="exportExcel()">{{ busy === 'excel' ? 'در حال ساخت…' : 'دانلود Excel' }}</button>
        <button class="btn btn--ghost" :disabled="Boolean(busy)" @click="exportJson">دانلود JSON</button>
        <button class="btn btn--ghost" :disabled="Boolean(busy)" @click="copyText(stringifyEventTransfer(event), 'JSON رویداد کپی شد.')">کپی JSON</button>
      </div>
      <small class="privacy-note">فایل داخل مرورگر ساخته می‌شود و اطلاعاتی به سرور ارسال نمی‌شود.</small>
    </section>

    <section class="transfer-section">
      <div class="transfer-section__heading"><div><span class="transfer-icon transfer-icon--green">⇧</span><div><h3>ادامهٔ رویداد از فایل</h3><p>Excel یا JSON را وارد کنید؛ یک رویداد مستقل تازه ساخته می‌شود.</p></div></div></div>
      <input ref="fileInput" class="sr-only" type="file" accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" @change="importFile($event.target.files[0])" />
      <div class="transfer-actions"><button class="btn btn--primary" :disabled="Boolean(busy)" @click="fileInput.click()">{{ busy === 'import' ? 'در حال بررسی…' : 'انتخاب فایل Excel / JSON' }}</button></div>
      <details class="json-paste"><summary>یا JSON را اینجا Paste کنید</summary><label class="field"><span>متن JSON</span><textarea v-model="pastedJson" rows="8" spellcheck="false" dir="ltr" placeholder="{ &quot;format&quot;: &quot;dongban-event&quot;, ... }" /></label><div class="actions"><button class="btn btn--primary" :disabled="!pastedJson.trim() || busy" @click="importPastedJson">بررسی و ورود</button></div></details>
    </section>

    <section class="transfer-section transfer-section--soft">
      <div class="transfer-section__heading"><div><span class="transfer-icon transfer-icon--amber">AI</span><div><h3>قالب نمونه برای تکمیل</h3><p>نمونه را دانلود کنید، به شخص دیگر یا AI بدهید و فایل تکمیل‌شده را همین‌جا وارد کنید.</p></div></div></div>
      <div class="transfer-actions">
        <button class="btn btn--ghost" :disabled="Boolean(busy)" @click="exportExcel(createSampleTransfer(), 'dongban-event-sample')">نمونهٔ Excel</button>
        <button class="btn btn--ghost" :disabled="Boolean(busy)" @click="downloadSampleJson">نمونهٔ JSON</button>
        <button class="btn btn--ghost" :disabled="Boolean(busy)" @click="copyText(eventTransferAiPrompt(), 'راهنمای AI کپی شد.')">کپی دستور AI</button>
      </div>
    </section>
  </div>
</template>
