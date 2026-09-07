<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({ title: { type: String, required: true } })
const emit = defineEmits(['close'])

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" role="presentation" @click.self="emit('close')">
      <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal__header">
          <h2 class="font-bold text-ink">{{ title }}</h2>
          <button class="icon-btn" aria-label="بستن" @click="emit('close')">×</button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>
