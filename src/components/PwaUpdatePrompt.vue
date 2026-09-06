<script setup>
import { initPwaUpdates, usePwaUpdate } from '../composables/usePwaUpdate.js'

initPwaUpdates()
const updates = usePwaUpdate()
</script>

<template>
  <aside v-if="updates.state.needRefresh" class="update-banner" role="status">
    <span class="update-banner__icon">↻</span>
    <div><strong>نسخهٔ تازهٔ دنگ‌بان آماده است</strong><small>بدون حذف رویدادها، همین حالا به‌روز شو.</small></div>
    <button class="btn btn--ghost" @click="updates.dismissUpdate">بعداً</button>
    <button class="btn btn--primary" @click="updates.applyUpdate">آپدیت الان</button>
  </aside>
  <aside v-else-if="updates.state.offlineReady" class="update-banner update-banner--offline" role="status">
    <span class="update-banner__icon">✓</span><div><strong>دنگ‌بان برای استفادهٔ آفلاین آماده است</strong><small>حتی بدون اینترنت به رویدادها دسترسی داری.</small></div>
    <button class="icon-btn" aria-label="بستن" @click="updates.dismissOfflineReady">×</button>
  </aside>
</template>
