<script setup>
import { RouterView } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import AppHeader from './components/AppHeader.vue'
import ToastStack from './components/ToastStack.vue'
import { useEventStore } from './stores/eventStore.js'

const store = useEventStore()
</script>

<template>
  <div class="app-shell" :data-theme="store.state.settings.theme">
    <AppHeader />
    <main class="main-shell"><RouterView /></main>
    <ToastStack />
    <Analytics />
  </div>
</template>
