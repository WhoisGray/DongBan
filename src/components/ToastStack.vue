<script setup>
import { useToast } from '../composables/useToast.js'
const { messages } = useToast()
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="toast-anim">
      <div
        v-for="message in messages"
        :key="message.id"
        class="toast"
        :class="`toast--${message.type}`"
      >
        {{ message.text }}
      </div>
    </TransitionGroup>
  </div>
</template>
