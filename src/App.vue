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
    title: 'دنگ بان | اپلیکیشن رایگان تقسیم هزینه و محاسبه دنگ (دنگبان)',
    description: 'با دنگ بان به سادگی هزینه‌های گروهی سفر، مهمانی و همخانه‌ای‌ها را مدیریت و تسویه کنید. دنگبان ابزاری هوشمند، آفلاین و بدون نیاز به ثبت‌نام است.'
  },
  guide: {
    title: 'راهنمای دنگ بان | آموزش صفر تا صد محاسبه دنگ و تسویه حساب (دنگبان)',
    description: 'آموزش کامل نحوه محاسبه دنگ، ثبت فاکتور و خرج‌ها، افزودن شماره کارت و تسویه حساب گروهی با دنگ بان با کمترین کارت‌به‌کارت.'
  },
  about: {
    title: 'درباره دنگ بان | اپلیکیشن آفلاین، مستقل و متن‌باز تقسیم هزینه (دنگبان)',
    description: 'دنگ بان یک پروژه مستقل، فارسی، آفلاین و متن‌باز برای تقسیم عادلانه هزینه‌های گروهی است. در دنگبان اطلاعات مالی شما فقط روی دستگاه خودتان می‌ماند.'
  },
  settings: {
    title: 'تنظیمات و پشتیبان‌گیری | دنگ بان (دنگبان)',
    description: 'تنظیمات واحد پول، پوسته، خروجی اکسل و بازیابی فایل‌های پشتیبان رویدادها در دنگ بان.'
  },
  event: {
    title: 'تسویه حساب گروهی و شماره کارت‌ها | دنگ بان (دنگبان)',
    description: 'مشاهده ریز مخارج، سهم‌بندی افراد، شماره کارت طلبکاران و تسویه حساب هوشمند رویداد با دنگ بان.'
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
