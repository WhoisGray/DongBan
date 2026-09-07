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

const form = reactive({
  title: '',
  date: todayIso(),
  currency: store.state.settings.defaultCurrency,
  note: ''
})
const showCreate = ref(false)

function create() {
  if (!form.title.trim()) return
  const event = store.createEvent(form)
  showCreate.value = false
  router.push(`/event/${event.id}`)
}

const faqs = [
  {
    q: 'آیا برای استفاده از دُنگ‌بان به اینترنت نیاز دارم؟',
    a: 'خیر! دُنگ‌بان یک وب‌اپلیکیشن آفلاین (PWA) است. پس از اولین باری که سایت را باز می‌کنید، تمام بخش‌ها حتی در سفر، کوه و جنگل بدون اینترنت کار می‌کنند.'
  },
  {
    q: 'اطلاعات مالی و شماره حساب‌های من کجا ذخیره می‌شوند؟',
    a: '۱۰۰٪ روی دستگاه و مرورگر خودتان! هیچ سروری اطلاعات شما، اسامی دوستان یا هزینه‌هایتان را ذخیره نمی‌کند. خیالتان از بابت حریم خصوصی کاملاً راحت باشد.'
  },
  {
    q: 'چطور برنامه را مثل یک اپلیکیشن روی آیفون یا اندروید نصب کنم؟',
    a: 'در آیفون کافی است در مرورگر Safari دکمه Share (مربع با فلش بالا) را بزنید و گزینه «Add to Home Screen» را انتخاب کنید. در اندروید و کروم هم کافی است روی دکمه «نصب اپ» بالای صفحه بزنید.'
  },
  {
    q: 'اگر کسی در سفر بیشتر از بقیه مصرف کرده باشد چطور ثبت کنیم؟',
    a: 'خیلی ساده! هنگام ثبت هزینه می‌توانید برای هر شخص ضریب سهم تعیین کنید؛ مثلاً یک نفر ۲ سهم، بچه‌ها ۰٫۵ سهم و بقیه ۱ سهم.'
  },
  {
    q: 'شماره کارت و شبا چطور برای طلبکاران ارسال می‌شود؟',
    a: 'وقتی شماره کارت یا شبای اعضا را ذخیره کنید، در صفحهٔ تسویه به همراه لوگوی بانک نمایش داده می‌شود و دکمه کپی سریع دارد. همچنین می‌توانید کارت تصویری شیک تسویه را دانلود کرده و در گروه تلگرام یا واتساپ بفرستید.'
  }
]

const activeFaq = ref(null)
function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<template>
  <div class="page guide-page stack-lg">
    <!-- Hero Section -->
    <section class="guide-hero">
      <div class="max-w-2xl">
        <span class="hero__badge">راهنمای کامل و ساده</span>
        <h1>دُنگ‌ها را ساده، عادلانه و بی‌دردسر صاف کن!</h1>
        <p>
          سفر رفتی؟ با بچه‌ها هم‌خانه‌ای؟ مهمانی یا شام بیرون بودید؟
          دیگر نیازی به ماشین‌حساب و دعوا سر خرده‌حساب‌ها نیست. در چند قدم ساده هزینه‌ها را وارد کن و بگذار دُنگ‌بان حساب‌ها را با کمترین تعداد جابه‌جایی پول برایت صاف کند.
        </p>
        <div class="hero-actions mt-6 flex flex-wrap gap-3">
          <button class="btn btn--primary btn--large" @click="showCreate = true">
            ＋ ساخت اولین رویداد
          </button>
          <button class="btn btn--ghost text-white border-white/20 hover:bg-white/10" @click="router.push('/')">
            مشاهده رویدادهای من
          </button>
        </div>
      </div>
    </section>

    <!-- Visual Overview Banner -->
    <section class="panel overflow-hidden border border-line bg-surface p-6 sm:p-8 rounded-3xl shadow-sm">
      <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="flex-1 space-y-4 text-right">
          <span class="eyebrow text-primary font-bold">پیش‌نمایش محیط برنامه</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-ink">طراحی مدرن، فارسی و سازگار با موبایل</h2>
          <p class="text-muted leading-relaxed text-sm sm:text-base">
            دُنگ‌بان از پایه‌ای‌ترین لایه‌ها برای زبان فارسی و نیازهای کاربر ایرانی طراحی شده است: تقویم شمسی روان، تشخیص خودکار بانک‌ها، فونت‌های زیبای استعداد و لاله‌زار، و کارکرد بی‌نقص روی گوشی و لپ‌تاپ.
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            <span class="badge-feature">⚡ کاملاً آفلاین</span>
            <span class="badge-feature">💳 تشخیص خودکار کارت و شبا</span>
            <span class="badge-feature">📅 تقویم شمسی</span>
            <span class="badge-feature">📊 خروجی اکسل</span>
            <span class="badge-feature">🎨 کارت عکس تسویه</span>
          </div>
        </div>
        <div class="w-full md:w-1/2 flex justify-center items-center gap-4">
          <img
            src="/screenshots/desktop-dashboard.png"
            alt="داشبورد دنگ‌بان در دسکتاپ"
            class="rounded-2xl border border-line shadow-lg hidden sm:block w-7/12 hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          <img
            src="/screenshots/mobile-event.png"
            alt="دنگ‌بان در موبایل"
            class="rounded-2xl border border-line shadow-lg w-44 sm:w-5/12 hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <!-- Step by Step Guide -->
    <section class="space-y-6">
      <div class="text-center max-w-xl mx-auto mb-8">
        <span class="eyebrow">مراحل استفاده</span>
        <h2 class="text-3xl font-bold text-ink">تنها در ۴ قدم حساب‌ها بسته می‌شود</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Step 1 -->
        <article class="panel step-card">
          <div class="step-num">۱</div>
          <div class="step-content">
            <h3 class="text-xl font-bold text-ink mb-2">رویداد تازه بساز</h3>
            <p class="text-muted text-sm leading-relaxed mb-4">
              رویداد همان جمع یا سفر شماست؛ مثلاً «سفر شمال»، «شام تولد سارا»، یا «خانه‌مشترک شهریور». تاریخ شمسی و واحد پول (تومان یا ریال) را مشخص کنید.
            </p>
            <div class="bg-surface-2 p-3 rounded-xl text-xs text-muted">
              💡 <strong>نکته:</strong> می‌توانید دقت رُندکردن تسویه را هم به دلخواه (مثلاً ۱٬۰۰۰ تومان یا ۱۰٬۰۰۰ تومان) تنظیم کنید تا انتقال‌ها پول خرد نداشته باشد.
            </div>
          </div>
        </article>

        <!-- Step 2 -->
        <article class="panel step-card">
          <div class="step-num">۲</div>
          <div class="step-content">
            <h3 class="text-xl font-bold text-ink mb-2">همسفرها و دوستان را اضافه کن</h3>
            <p class="text-muted text-sm leading-relaxed mb-4">
              نام هر نفر را بنویسید و اضافه کنید. می‌توانید برای هر دوست شماره کارت یا شماره شبا هم وارد کنید؛ دُنگ‌بان خودکار نام و لوگوی بانک را تشخیص می‌دهد!
            </p>
            <div class="bg-surface-2 p-3 rounded-xl text-xs text-muted">
              💳 <strong>تشخیص کارت هوشمند:</strong> بانک‌های ملی، ملت، بلو، صادرات، تجارت، پاسارگاد، سامان و تمام بانک‌های شتاب پشتیبانی می‌شوند.
            </div>
          </div>
        </article>

        <!-- Step 3 -->
        <article class="panel step-card">
          <div class="step-num">۳</div>
          <div class="step-content">
            <h3 class="text-xl font-bold text-ink mb-2">خرج‌ها را به‌راحتی ثبت کن</h3>
            <p class="text-muted text-sm leading-relaxed mb-4">
              هر خریدی که شد (ویلا، غذا، بنزین، تنقلات) را ثبت کنید. بنویسید چه کسی پرداخت کرده و بین چه کسانی تقسیم می‌شود. تقسیم می‌تواند مساوی یا بر اساس سهم دلخواه باشد.
            </p>
            <div class="bg-surface-2 p-3 rounded-xl text-xs text-muted">
              ⚖️ <strong>سهم‌های نابرابر:</strong> با وارد کردن ضرایب (مثلاً ۱٫۵ یا ۲ سهم) حساب کسانی که همراه کودک دارند یا سفارش بیشتری داشتند به عدالت محاسبه می‌شود.
            </div>
          </div>
        </article>

        <!-- Step 4 -->
        <article class="panel step-card">
          <div class="step-num">۴</div>
          <div class="step-content">
            <h3 class="text-xl font-bold text-ink mb-2">تسویهٔ هوشمند؛ کمترین جابه‌جایی پول</h3>
            <p class="text-muted text-sm leading-relaxed mb-4">
              دُنگ‌بان با الگوریتم هوشمند، هزاران بدهی و طلب خرد را به کمترین تعداد تراکنش ممکن خلاصه می‌کند؛ یعنی به جای اینکه همه به هم پول بدهند، در ۳-۲ انتقال حساب همه صاف می‌شود!
            </p>
            <div class="bg-surface-2 p-3 rounded-xl text-xs text-muted">
              🚀 <strong>اشتراک‌گذاری آسان:</strong> متن خلاصه را با یک کلیک کپی کنید یا کارت تصویری شیک بسازید و در گروه تلگرام بفرستید.
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Visual Showcase of Settlement -->
    <section class="panel p-6 sm:p-8 rounded-3xl bg-surface border border-line">
      <div class="flex flex-col lg:flex-row items-center gap-8">
        <div class="w-full lg:w-1/2">
          <img
            src="/screenshots/desktop-settlement.png"
            alt="صفحه تسویه دنگ‌بان"
            class="rounded-2xl border border-line shadow-md w-full hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div class="w-full lg:w-1/2 space-y-4 text-right">
          <span class="eyebrow text-primary font-bold">تسویهٔ نهایی و شماره حساب‌ها</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-ink">همه چیز آماده برای واریز</h2>
          <p class="text-muted text-sm sm:text-base leading-relaxed">
            در زبانهٔ «تسویه»، دقیقاً مشخص است چه کسی باید به چه کسی پول واریز کند. زیر نام طلبکاران، شماره کارت و شماره شبای آن‌ها با دکمهٔ کپی سریع آماده است تا کسی نیازی به تایپ دستی شماره کارت در موبایل‌بانک نداشته باشد.
          </p>
          <ul class="space-y-2 text-sm text-ink pr-4 list-disc marker:text-primary">
            <li>محاسبهٔ دقیق بدون حتی یک ریال کسری یا اعشار گم‌شده</li>
            <li>امکان دانلود مستقیم فایل کارت تصویری تسویه</li>
            <li>قابلیت اشتراک‌گذاری در تمام شبکه‌های اجتماعی</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Powerful Pro Features -->
    <section class="panel p-6 sm:p-8 rounded-3xl bg-surface border border-line">
      <div class="section-heading mb-6">
        <div>
          <span class="eyebrow">امکانات حرفه‌ای</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-ink">چرا دُنگ‌بان خاص و متمایز است؟</h2>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div class="feature-box">
          <span class="feature-icon">🛡️</span>
          <h4 class="font-bold text-ink mb-1">امنیت و حریم خصوصی مطلق</h4>
          <p class="text-xs text-muted leading-relaxed">
            اطلاعات مالی شما پیش خودتان امن است. هیچ حساب کاربری، لاگین یا سروری برای ردیابی هزینه‌های شما وجود ندارد.
          </p>
        </div>

        <div class="feature-box">
          <span class="feature-icon">📥</span>
          <h4 class="font-bold text-ink mb-1">ورودی و خروجی کامل اکسل</h4>
          <p class="text-xs text-muted leading-relaxed">
            می‌توانید کل رویداد را در قالب فایل اکسل زیبا و راست‌چین با فرمول‌های آماده دانلود کنید یا از اکسل وارد کنید.
          </p>
        </div>

        <div class="feature-box">
          <span class="feature-icon">🤖</span>
          <h4 class="font-bold text-ink mb-1">سازگار با هوش مصنوعی (AI)</h4>
          <p class="text-xs text-muted leading-relaxed">
            فرمت داده‌های دُنگ‌بان و پرامپت‌های آماده به شما اجازه می‌دهد فاکتورها را به AI بدهید تا خودکار فایل رویداد بسازد.
          </p>
        </div>

        <div class="feature-box">
          <span class="feature-icon">🌗</span>
          <h4 class="font-bold text-ink mb-1">حالت تاریک و روشن چشم‌نواز</h4>
          <p class="text-xs text-muted leading-relaxed">
            مطابق میل یا زمان شبانه‌روز، به حالت تاریک (Dark Mode) بروید و از رابط کاربری روان و کم‌نور لذت ببرید.
          </p>
        </div>

        <div class="feature-box">
          <span class="feature-icon">🔄</span>
          <h4 class="font-bold text-ink mb-1">کپی و تکرار سریع رویدادها</h4>
          <p class="text-xs text-muted leading-relaxed">
            برای دورهمی‌ها یا خانه‌های مشترک که اعضای ثابتی دارند، می‌توانید رویداد را بدون هزینه‌ها کپی کنید و دوباره استفاده کنید.
          </p>
        </div>

        <div class="feature-box">
          <span class="feature-icon">📱</span>
          <h4 class="font-bold text-ink mb-1">نصب روی گوشی (PWA)</h4>
          <p class="text-xs text-muted leading-relaxed">
            به‌عنوان یک برنامه مستقل روی صفحه گوشی‌تان می‌نشیند، سریع باز می‌شود و هیچ حجمی از حافظه دستگاه اشغال نمی‌کند.
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion -->
    <section class="panel p-6 sm:p-8 rounded-3xl bg-surface border border-line">
      <div class="section-heading mb-6">
        <div>
          <span class="eyebrow">پرسش‌های متداول</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-ink">سؤالاتی که شاید برایت پیش بیاید</h2>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="border border-line rounded-2xl overflow-hidden transition-all duration-200"
          :class="{ 'bg-surface-2': activeFaq === index }"
        >
          <button
            class="w-full text-right p-4 flex items-center justify-between gap-4 font-bold text-ink hover:text-primary transition-colors"
            @click="toggleFaq(index)"
          >
            <span>{{ faq.q }}</span>
            <span class="text-xl transition-transform duration-200" :class="{ 'rotate-180': activeFaq === index }">⌄</span>
          </button>
          <div v-if="activeFaq === index" class="p-4 pt-0 text-muted text-sm leading-relaxed border-t border-line/60">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="guide-cta">
      <div>
        <h2 class="text-2xl font-bold text-ink">آماده‌ای اولین دُنگ را ثبت کنی؟</h2>
        <p class="text-muted mt-1">بدون نیاز به ثبت‌نام؛ همین حالا در چند ثانیه رویدادت را بساز.</p>
      </div>
      <div class="actions">
        <button class="btn btn--primary btn--large" @click="showCreate = true">
          ＋ ساخت رویداد تازه
        </button>
      </div>
    </section>

    <!-- Modal for new event -->
    <BaseModal v-if="showCreate" title="رویداد تازه" @close="showCreate = false">
      <form class="stack" @submit.prevent="create">
        <label class="field">
          <span>نام رویداد</span>
          <input v-model="form.title" autofocus placeholder="مثلاً سفر شمال یا دورهمی شام" />
        </label>
        <div class="form-grid">
          <PersianDatePicker v-model="form.date" />
          <label class="field">
            <span>واحد پول</span>
            <select v-model="form.currency">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.label }}
              </option>
            </select>
          </label>
        </div>
        <label class="field">
          <span>توضیح کوتاه</span>
          <textarea v-model="form.note" rows="3" placeholder="اختیاری؛ مثلاً متل قو شهریور ۱۴۰۵" />
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
.guide-page {
  padding-bottom: 30px;
}

.guide-hero {
  min-height: 280px;
  padding: 46px 44px;
  display: flex;
  align-items: center;
  border-radius: 32px;
  background: linear-gradient(130deg, #151447 0%, #4338ca 52%, #7c3aed 100%);
  color: white;
  box-shadow: 0 24px 60px rgba(67, 56, 202, 0.22);
}

.guide-hero h1 {
  font: 400 clamp(30px, 4.8vw, 48px)/1.25 Lalezar, Estedad, sans-serif;
  margin: 12px 0 16px;
  letter-spacing: -0.02em;
}

.guide-hero p {
  line-height: 2;
  margin: 0;
  color: #dfe2ff;
  font-size: 15px;
}

.badge-feature {
  padding: 6px 12px;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 750;
}

.step-card {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--line);
  background: var(--surface);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.step-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.step-num {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--primary);
  color: white;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.25);
}

.feature-box {
  padding: 20px;
  border-radius: 18px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  transition: transform 0.16s ease;
}

.feature-box:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 26px;
  display: inline-block;
  margin-bottom: 10px;
}

.guide-cta {
  padding: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 26px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}

@media (max-width: 700px) {
  .guide-hero {
    padding: 30px 24px;
    border-radius: 24px;
  }
  .guide-cta {
    flex-direction: column;
    align-items: flex-start;
  }
  .guide-cta .actions {
    width: 100%;
  }
  .guide-cta .btn {
    flex: 1;
  }
}
</style>
