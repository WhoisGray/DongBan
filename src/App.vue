<script setup>
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import AppHeader from './components/AppHeader.vue'
import ToastStack from './components/ToastStack.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
import AppFooter from './components/AppFooter.vue'
import { useEventStore } from './stores/eventStore.js'

const store = useEventStore()
const route = useRoute()

const SEO = {
  dashboard: { title: 'محاسبه دُنگ و تقسیم هزینه‌ها (آفلاین) | دُنگ‌بان', description: 'دُنگ‌ها را ساده ببند. رویداد بساز، خرج‌ها را ثبت کن و با کمترین انتقال ممکن حساب همه را صاف کن؛ کاملاً آفلاین و بدون نیاز به اینترنت.' },
  guide: { title: 'راهنمای استفاده از دُنگ‌بان | تقسیم هزینه گروهی', description: 'در چند قدم ساده رویداد بساز، خرج‌ها را ثبت کن و با دُنگ‌بان حساب‌ها را صاف کن؛ کاملاً آفلاین و بدون نیاز به ثبت‌نام.' },
  about: { title: 'دربارهٔ پروژه دُنگ‌بان | DongBan', description: 'دُنگ‌بان یک ابزار فارسی، آفلاین و متن‌باز برای تقسیم منصفانهٔ هزینه‌های گروهی است.' },
  settings: { title: 'تنظیمات | دُنگ‌بان', description: 'تنظیمات دُنگ‌بان' },
  event: { title: 'تسویه حساب گروهی | دُنگ‌بان', description: 'تقسیم و تسویهٔ هوشمند هزینه‌های گروهی با دُنگ‌بان.' }
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
    <main class="main-shell"><RouterView /></main>
    <AppFooter />
    <ToastStack />
    <PwaUpdatePrompt />
    <Analytics />
  </div>
</template>
