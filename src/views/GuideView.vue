<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '../components/BaseModal.vue'
import PersianDatePicker from '../components/PersianDatePicker.vue'
import { useEventStore } from '../stores/eventStore.js'
import { currencies } from '../utils/currencies.js'
import { todayIso } from '../utils/date.js'

const store = useEventStore()
const router = useRouter()

const form = reactive({ title: '', date: todayIso(), currency: store.state.settings.defaultCurrency, note: '' })
const showCreate = ref(false)

function create() {
  if (!form.title.trim()) return
  const event = store.createEvent(form)
  showCreate.value = false
  router.push(`/event/${event.id}`)
}
</script>

<template>
  <div class="page guide-page stack-lg">
    <section class="guide-hero">
      <div><span class="hero__badge">راهنمای استفاده</span><h1>چطور با دُنگ‌بان حساب‌ها را صاف کنیم؟</h1><p>از ساخت رویداد تا تسویهٔ نهایی؛ در چند قدم ساده همهٔ هزینه‌های گروهی را مدیریت کنید. کاملاً آفلاین و بدون نیاز به ثبت‌نام.</p></div>
    </section>

    <section class="panel">
      <div class="section-heading"><div><span class="eyebrow">قدم ۱</span><h2>یک رویداد بساز</h2></div></div>
      <p class="guide-lead">رویداد یعنی همان «دُنگ» شما؛ سفر، مهمانی، خانهٔ مشترک یا هر جمعی که هزینه‌هایش باید تقسیم شود.</p>
      <ol class="guide-steps">
        <li>از صفحهٔ اصلی روی «＋ رویداد تازه» بزنید.</li>
        <li>یک نام انتخاب کنید؛ مثل «سفر شمال» یا «شام جمعه».</li>
        <li>تاریخ رویداد و واحد پول را هم تعیین کنید.</li>
      </ol>
      <div class="actions actions--start"><button class="btn btn--primary" @click="showCreate = true">＋ ساختن اولین رویداد</button></div>
    </section>

    <section class="panel">
      <div class="section-heading"><div><span class="eyebrow">قدم ۲</span><h2>اعضای جمع را اضافه کن</h2></div></div>
      <p class="guide-lead">همهٔ کسانی که در هزینه‌ها شریک‌اند را به رویداد اضافه کنید. دُنگ‌بان به‌طور خودکار سهم هر نفر را محاسبه می‌کند.</p>
      <ol class="guide-steps">
        <li>وارد رویداد شوید و از زبانهٔ «اعضا» استفاده کنید.</li>
        <li>نام هر نفر را وارد کنید و اضافه‌اش کنید.</li>
        <li>اعضای پرکاربرد برای ساخت سریع‌تر رویدادهای بعدی ذخیره می‌شوند.</li>
      </ol>
    </section>

    <section class="panel">
      <div class="section-heading"><div><span class="eyebrow">قدم ۳</span><h2>خرج‌ها را ثبت کن</h2></div></div>
      <p class="guide-lead">هر خرج را با توضیح، مبلغ و اینکه چه کسی پرداخت کرده ثبت کنید. سپس مشخص کنید هزینه بین چه کسانی تقسیم شود.</p>
      <ol class="guide-steps">
        <li>از زبانهٔ «خرج‌ها» روی «ثبت خرج» بزنید.</li>
        <li>مبلغ و پرداخت‌کننده را انتخاب کنید.</li>
        <li>اگر همه سهم یکسان دارند گزینهٔ «تقسیم مساوی» را بزنید؛ وگرنه سهم هر نفر را دستی تنظیم کنید.</li>
      </ol>
    </section>

    <section class="panel">
      <div class="section-heading"><div><span class="eyebrow">قدم ۴</span><h2>حساب‌ها را صاف کن</h2></div></div>
      <p class="guide-lead">وقتی همهٔ خرج‌ها ثبت شد، دُنگ‌بان به‌طور خودکار بهترین و کمترین تعداد انتقال را برای تسویهٔ کامل محاسبه می‌کند.</p>
      <ol class="guide-steps">
        <li>به زبانهٔ «تسویه» بروید؛ لیستِ «چه کسی به چه کسی چقدر بدهد» را می‌بینید.</li>
        <li>هر انتقال را می‌توانید مستقیم ویدیو یا متن کنید و برای بقیه بفرستید.</li>
        <li>تصویر خلاصهٔ تسویه را هم می‌توانید در گروه به اشتراک بگذارید.</li>
      </ol>
    </section>

    <section class="panel">
      <div class="section-heading"><div><span class="eyebrow">نکات</span><h2>دُنگ‌بان برای چه مواقعی است؟</h2></div></div>
      <p class="guide-lead">چند نمونهٔ کاربردی که دُنگ‌بان به کمک می‌آید:</p>
      <ul class="guide-tips">
        <li><strong>سفرهای گروهی</strong> — بنزین، اقامت، خوراک؛ همه را یک‌جا ثبت کن و آخر سفر یک‌جا صاف کن.</li>
        <li><strong>خانهٔ مشترک</strong> — قبوض، ودیعه و خریدهای مشترک را بین همخانه‌ای‌ها تقسیم کن.</li>
        <li><strong>مهمانی و دورهمی</strong> — هزینهٔ شام یا جشن را سریع بین همه تقسیم کن.</li>
        <li><strong>پروژه و تیم</strong> — هزینه‌های مشترک کاری یا کلاسی را منصفانه تقسیم کن.</li>
      </ul>
      <p class="guide-offline">همهٔ این‌ها بدون اینترنت و بدون ساخت حساب کاربری انجام می‌شود؛ اطلاعات مالی فقط روی دستگاه خودتان می‌ماند.</p>
    </section>

    <section class="guide-cta">
      <div><h2>همین حالا شروع کن</h2><p>اولین رویدادت را بساز و ببین حساب‌ها چقدر ساده صاف می‌شود.</p></div>
      <div class="actions"><button class="btn btn--primary btn--large" @click="showCreate = true">＋ رویداد تازه</button></div>
    </section>

    <BaseModal v-if="showCreate" title="رویداد تازه" @close="showCreate = false">
      <form class="stack" @submit.prevent="create">
        <label class="field">
          <span>نام رویداد</span>
          <input v-model="form.title" autofocus placeholder="مثلاً سفر شمال" />
        </label>
        <div class="form-grid">
          <PersianDatePicker v-model="form.date" />
          <label class="field">
            <span>واحد پول</span>
            <select v-model="form.currency">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.label }}</option>
            </select>
          </label>
        </div>
        <label class="field">
          <span>توضیح کوتاه</span>
          <textarea v-model="form.note" rows="3" placeholder="اختیاری" />
        </label>
        <div class="actions">
          <button type="button" class="btn btn--ghost" @click="showCreate = false">انصراف</button>
          <button class="btn btn--primary">ساخت رویداد</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.guide-page { padding-bottom: 20px }
.guide-hero { min-height: 260px; padding: 42px 48px; display: flex; align-items: center; border-radius: 32px; background: linear-gradient(125deg, #15154a, #4f46e5 62%, #8b5cf6); color: white; box-shadow: 0 28px 70px rgba(79,70,229,.22) }
.guide-hero h1 { font: 400 clamp(30px,5vw,52px)/1.25 Lalezar,Estedad,sans-serif; margin: 13px 0 15px; letter-spacing: -.02em }
.guide-hero p { max-width: 640px; line-height: 2; margin: 0; color: #dfe2ff }
.guide-lead { color: var(--muted); line-height: 2; margin: -6px 0 14px }
.guide-steps { margin: 0; padding-right: 22px; color: var(--ink); line-height: 2.2 }
.guide-tips { margin: 0; padding-right: 22px; list-style: none }
.guide-tips li { position: relative; padding-right: 20px; margin-bottom: 10px; color: var(--muted); line-height: 1.9; font-size: 14px }
.guide-tips li:before { content: "✦"; position: absolute; right: 0; color: var(--primary) }
.guide-tips strong { color: var(--ink) }
.guide-offline { margin: 16px 0 0; padding: 14px 16px; border-radius: 14px; background: var(--primary-soft); color: var(--primary); font-weight: 700; font-size: 13px; line-height: 1.9 }
.guide-cta { padding: 32px 34px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 24px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow) }
.guide-cta h2 { margin: 0 0 5px; font-size: 24px }
.guide-cta p { margin: 0; color: var(--muted) }
@media (max-width: 700px) { .guide-hero { padding: 30px 24px; border-radius: 24px } .guide-cta { flex-direction: column; align-items: flex-start } .guide-cta .actions { width: 100% } .guide-cta .btn { flex: 1 } }
</style>
