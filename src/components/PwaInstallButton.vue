<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const deferredPrompt = ref(null); const showHelp = ref(false)
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
const canInstall = computed(() => !isStandalone && (deferredPrompt.value || isIos))
function capture(event) { event.preventDefault(); deferredPrompt.value = event }
onMounted(() => window.addEventListener('beforeinstallprompt', capture))
onBeforeUnmount(() => window.removeEventListener('beforeinstallprompt', capture))
async function install() {
  if (deferredPrompt.value) { deferredPrompt.value.prompt(); await deferredPrompt.value.userChoice; deferredPrompt.value = null }
  else showHelp.value = true
}
</script>

<template>
  <button v-if="canInstall" class="install-btn" @click="install">نصب اپ</button>
  <div v-if="showHelp" class="install-help" @click.self="showHelp = false">
    <div><button class="icon-btn" aria-label="بستن" @click="showHelp = false">×</button><span class="install-help__icon">⇧</span><h2>نصب دنگ‌بان روی iPhone</h2><ol><li>در Safari دکمهٔ <strong>Share</strong> را بزن.</li><li>گزینهٔ <strong>Add to Home Screen</strong> را انتخاب کن.</li><li>در پایان روی <strong>Add</strong> بزن.</li></ol></div>
  </div>
</template>
