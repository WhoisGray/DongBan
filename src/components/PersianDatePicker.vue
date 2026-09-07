<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { jalaaliMonthLength, toJalaali } from 'jalaali-js'
import { formatPersianDate, isoToJalaali, jalaaliToIso, persianMonths, persianWeekdays } from '../utils/date.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'تاریخ' }
})
const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const triggerRef = ref(null)
const popoverRef = ref(null)
const open = ref(false)
const popoverStyle = ref({})

const today = toJalaali(new Date())
const selected = computed(() => isoToJalaali(props.modelValue))
const viewYear = ref(selected.value.jy)
const viewMonth = ref(selected.value.jm)
const displayValue = computed(() => formatPersianDate(props.modelValue, { year: 'numeric', month: 'long', day: 'numeric' }))

const days = computed(() => {
  const firstIso = jalaaliToIso(viewYear.value, viewMonth.value, 1)
  const firstDate = new Date(`${firstIso}T00:00:00`)
  const leading = (firstDate.getDay() + 1) % 7
  const output = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= jalaaliMonthLength(viewYear.value, viewMonth.value); day += 1) {
    output.push(day)
  }
  return output
})

watch(() => props.modelValue, () => {
  const value = selected.value
  viewYear.value = value.jy
  viewMonth.value = value.jm
})

function updatePosition() {
  if (!open.value || !triggerRef.value) return

  // Small screens (mobile bottom sheet)
  if (window.innerWidth <= 640) {
    popoverStyle.value = {
      position: 'fixed',
      zIndex: 250,
      left: '16px',
      right: '16px',
      bottom: 'max(16px, env(safe-area-inset-bottom))',
      top: 'auto',
      width: 'auto',
      maxWidth: '360px',
      margin: '0 auto'
    }
    return
  }

  const rect = triggerRef.value.getBoundingClientRect()
  const popoverWidth = 320
  const popoverEstimatedHeight = 350
  const margin = 8

  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  let top = rect.bottom + margin
  if (spaceBelow < popoverEstimatedHeight && spaceAbove > spaceBelow) {
    top = Math.max(margin, rect.top - popoverEstimatedHeight - margin)
  }

  let right = window.innerWidth - rect.right
  if (right + popoverWidth > window.innerWidth - margin) {
    right = window.innerWidth - popoverWidth - margin
  }
  if (right < margin) {
    right = margin
  }

  popoverStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    right: `${right}px`,
    zIndex: 250,
    width: `${popoverWidth}px`
  }
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    viewYear.value = selected.value.jy
    viewMonth.value = selected.value.jm
    await nextTick()
    updatePosition()
  }
}

function moveMonth(offset) {
  let month = viewMonth.value + offset
  let year = viewYear.value
  if (month > 12) {
    month = 1
    year += 1
  } else if (month < 1) {
    month = 12
    year -= 1
  }
  viewMonth.value = month
  viewYear.value = year
}

function selectDay(day) {
  if (!day) return
  emit('update:modelValue', jalaaliToIso(viewYear.value, viewMonth.value, day))
  open.value = false
}

function selectToday() {
  emit('update:modelValue', jalaaliToIso(today.jy, today.jm, today.jd))
  open.value = false
}

const isSelected = (day) => selected.value.jy === viewYear.value && selected.value.jm === viewMonth.value && selected.value.jd === day
const isToday = (day) => today.jy === viewYear.value && today.jm === viewMonth.value && today.jd === day

function closeOutside(event) {
  if (!open.value) return
  const triggerEl = triggerRef.value
  const popoverEl = popoverRef.value
  if (
    triggerEl && !triggerEl.contains(event.target) &&
    popoverEl && !popoverEl.contains(event.target)
  ) {
    open.value = false
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && open.value) {
    open.value = false
  }
}

function handleScrollOrResize() {
  if (open.value) {
    updatePosition()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleScrollOrResize)
  window.addEventListener('scroll', handleScrollOrResize, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleScrollOrResize)
  window.removeEventListener('scroll', handleScrollOrResize, true)
})
</script>

<template>
  <label ref="root" class="field persian-date">
    <span>{{ label }}</span>
    <button
      ref="triggerRef"
      type="button"
      class="date-trigger"
      :aria-expanded="open"
      @click="toggle"
    >
      <span>{{ displayValue }}</span>
      <b class="inline-block transition-transform duration-200" :class="{ 'rotate-180': open }">⌄</b>
    </button>

    <Teleport to="body">
      <div v-if="open" class="calendar-portal">
        <div
          class="calendar-backdrop sm:hidden fixed inset-0 z-[245] bg-black/40 backdrop-blur-xs"
          @click="open = false"
        />
        <div
          ref="popoverRef"
          class="calendar-popover"
          :style="popoverStyle"
        >
          <header>
            <button
              type="button"
              class="icon-btn"
              aria-label="ماه قبل"
              title="ماه قبل"
              @click="moveMonth(-1)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <strong>{{ persianMonths[viewMonth - 1] }} {{ viewYear.toLocaleString('fa-IR', { useGrouping: false }) }}</strong>
            <button
              type="button"
              class="icon-btn"
              aria-label="ماه بعد"
              title="ماه بعد"
              @click="moveMonth(1)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </header>

          <div class="calendar-weekdays">
            <span v-for="weekday in persianWeekdays" :key="weekday">{{ weekday }}</span>
          </div>

          <div class="calendar-days">
            <button
              v-for="(day, index) in days"
              :key="`${day}-${index}`"
              type="button"
              :disabled="!day"
              :class="{ selected: isSelected(day), today: isToday(day) }"
              @click="selectDay(day)"
            >
              {{ day?.toLocaleString('fa-IR', { useGrouping: false }) }}
            </button>
          </div>

          <footer>
            <button type="button" @click="selectToday">امروز</button>
            <span>تقویم هجری شمسی</span>
          </footer>
        </div>
      </div>
    </Teleport>
  </label>
</template>
