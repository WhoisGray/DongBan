<script setup>
import { useToast } from '../composables/useToast.js'
const { messages } = useToast()
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <div v-for="message in messages" :key="message.id" class="toast" :class="`toast--${message.type}`">{{ message.text }}</div>
  </div>
</template>
