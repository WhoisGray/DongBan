<script setup>
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import AppHeader from './components/AppHeader.vue'
import ToastStack from './components/ToastStack.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
import AppFooter from './components/AppFooter.vue'
import { useEventStore } from './stores/eventStore.js'

const store = useEventStore()
const route = useRoute()

const SEO = {
  dashboard: {
    title: 'دنگبان (DongBan) | محاسبه دنگ و تقسیم هزینه آنلاین و آفلاین - دنگ بان',
    description: 'محاسبه دنگ و تقسیم هزینه رایگان با دنگبان (DongBan). دنگ بان ابزار هوشمند برای محاسبه دنگ سفر، مهمانی و همخانه با تسویه بدهی و کارکرد کاملاً آفلاین بدون نیاز به ثبت‌نام.'
  },
  guide: {
    title: 'راهنمای دنگبان (DongBan) | آموزش محاسبه دنگ و تسویه حساب - دنگ بان',
    description: 'راهنمای جامع دنگبان (DongBan). آموزش محاسبه دنگ سفر، مهمانی و همخانه، ثبت خرج‌ها و تسویه حساب گروهی در چند قدم ساده. کاملاً آفلاین و بدون ثبت نام.'
  },
  about: {
    title: 'دربارهٔ دنگبان (DongBan) | نرم‌افزار رایگان و متن‌باز دنگ بان',
    description: 'درباره دنگبان (DongBan | دنگ بان). ابزار رایگان، آنلاین و آفلاین، امن و متن‌باز برای محاسبه دنگ و تقسیم منصفانه هزینه‌های گروهی با حفظ کامل حریم خصوصی.'
  },
  settings: {
    title: 'تنظیمات و پشتیبان‌گیری | دنگبان (DongBan - دنگ بان)',
    description: 'تنظیمات واحد پول، پوسته، خروجی اکسل و بازیابی فایل‌های پشتیبان رویدادها در دنگبان (DongBan).'
  },
  event: {
    title: 'تسویه حساب گروهی و محاسبه دنگ | دنگبان (DongBan)',
    description: 'مشاهده ریز مخارج، سهم‌بندی افراد، شماره کارت طلبکاران و تسویه حساب هوشمند رویداد با دنگبان (DongBan - دنگ بان).'
  }
}

watch(
  () => route.name,
  (name) => {
    const seo = SEO[name] || SEO.dashboard
    document.title = seo.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description)
  },
  { immediate: true }
)
</script>

<template>
  <div class="app-shell" :data-theme="store.state.settings.theme">
    <AppHeader />
    <main class="main-shell">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <ToastStack />
    <PwaUpdatePrompt />
    <Analytics />
    <SpeedInsights />
  </div>
</template>
