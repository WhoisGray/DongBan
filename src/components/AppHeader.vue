<script setup>
import { RouterLink, useRoute } from 'vue-router'
import PwaInstallButton from './PwaInstallButton.vue'
const route = useRoute()
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <RouterLink class="brand group" to="/" aria-label="دنگ‌بان، صفحه اصلی">
        <span class="brand__mark transition-transform duration-200 group-hover:scale-105">د</span>
        <span>
          <strong>دنگ‌بان</strong>
          <small>DongBan</small>
        </span>
      </RouterLink>

      <div class="topbar__actions">
        <PwaInstallButton />
        <nav class="topbar__nav" aria-label="منوی اصلی">
          <RouterLink to="/" :class="{ active: route.name === 'dashboard' }">رویدادها</RouterLink>
          <RouterLink to="/guide" :class="{ active: route.name === 'guide' }">راهنما</RouterLink>
          <RouterLink to="/settings" :class="{ active: route.name === 'settings' }">تنظیمات</RouterLink>
        </nav>
      </div>
    </div>
  </header>
</template>
