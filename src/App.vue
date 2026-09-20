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
    title: 'دنگ بان | اپلیکیشن مدیریت هزینه‌ها (دنگبان)',
    description: 'با دنگ بان به سادگی هزینه‌های گروهی را مدیریت و تسویه کنید. دنگبان ابزاری هوشمند، کاملاً رایگان و آفلاین برای تقسیم منصفانه خرج‌ها با کمترین کارت‌به‌کارت است.'
  },
  guide: {
    title: 'راهنمای دنگ بان | استفاده و تسویه حساب گروهی (دنگبان)',
    description: 'آموزش صفر تا صد نحوه محاسبه دنگ، ثبت فاکتور و خرج‌ها، ثبت شماره کارت و تسویه حساب گروهی با دنگ بان. محاسبه خودکار سهم‌ها در دنگبان.'
  },
  about: {
    title: 'دربارهٔ دنگ بان | ابزار متن‌باز تقسیم هزینه (دنگبان)',
    description: 'دنگ بان یک ابزار مستقل، فارسی، آفلاین و متن‌باز برای تقسیم عادلانه هزینه‌های گروهی است. با دنگبان بدون دسترسی به سرور و با امنیت کامل دنگ‌ها را مدیریت کنید.'
  },
  settings: {
    title: 'تنظیمات و پشتیبان‌گیری | دنگ بان (دنگبان)',
    description: 'تنظیمات واحد پول، پوسته، خروجی گرفتن و بازیابی فایل‌های پشتیبان رویدادها در دنگ بان. داده‌های دنگبان به سادگی بازیابی می‌شوند.'
  },
  event: {
    title: 'تسویه حساب گروهی و شماره حساب‌ها | دنگ بان (دنگبان)',
    description: 'مشاهده ریز مخارج، سهم‌بندی افراد، شماره کارت طلبکاران و تسویه حساب هوشمند رویداد با دنگ بان. محاسبه سریع سهم افراد در دنگبان.'
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
