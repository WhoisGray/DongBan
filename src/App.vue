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
  dashboard: {
    title: 'محاسبه دُنگ و تقسیم هزینه‌ها (آفلاین) | دُنگ‌بان',
    description: 'دُنگ‌بان؛ ابزار هوشمند، کاملاً رایگان و آفلاین برای تقسیم منصفانه هزینه‌های سفر، مهمانی و خانه مشترک با کمترین تعداد کارت‌به‌کارت و بدون نیاز به ثبت‌نام.'
  },
  guide: {
    title: 'راهنمای جامع تقسیم دنگ و تسویه حساب گروهی | دُنگ‌بان',
    description: 'آموزش صفر تا صد نحوه محاسبه دنگ، ثبت فاکتور و خرج‌ها، ثبت شماره کارت و شبا، و تسویه حساب با کمترین انتقال در دنگ‌بان.'
  },
  about: {
    title: 'دربارهٔ پروژه دُنگ‌بان | ابزار متن‌باز تقسیم هزینه فارسی',
    description: 'دُنگ‌بان یک ابزار مستقل، فارسی، آفلاین و متن‌باز برای تقسیم عادلانه هزینه‌های گروهی و بستن دنگ‌ها بدون دسترسی به سرور و با امنیت کامل است.'
  },
  settings: {
    title: 'تنظیمات و پشتیبان‌گیری | دُنگ‌بان',
    description: 'تنظیمات واحد پول، تم تاریک و روشن، خروجی گرفتن و بازیابی فایل‌های پشتیبان رویدادها در دُنگ‌بان.'
  },
  event: {
    title: 'تسویه حساب گروهی و شماره حساب‌ها | دُنگ‌بان',
    description: 'مشاهده ریز مخارج، سهم‌بندی افراد، شماره کارت طلبکاران و تسویه حساب هوشمند رویداد با دُنگ‌بان.'
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
  </div>
</template>
