<script setup>
defineProps({ title: { type: String, required: true } })
defineEmits(['close'])
</script>

<template>
  <div class="modal-backdrop" role="presentation" @click.self="$emit('close')">
    <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <header class="modal__header"><h2>{{ title }}</h2><button class="icon-btn" aria-label="بستن" @click="$emit('close')">×</button></header>
      <div class="modal__body"><slot /></div>
    </section>
  </div>
</template>
