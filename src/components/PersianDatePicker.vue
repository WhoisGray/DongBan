<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { jalaaliMonthLength, toJalaali } from 'jalaali-js'
import { formatPersianDate, isoToJalaali, jalaaliToIso, persianMonths, persianWeekdays } from '../utils/date.js'

const props = defineProps({ modelValue: { type: String, default: '' }, label: { type: String, default: 'تاریخ' } })
const emit = defineEmits(['update:modelValue'])
const root = ref(); const open = ref(false); const today = toJalaali(new Date())
const selected = computed(() => isoToJalaali(props.modelValue))
const viewYear = ref(selected.value.jy); const viewMonth = ref(selected.value.jm)
const displayValue = computed(() => formatPersianDate(props.modelValue, { year: 'numeric', month: 'long', day: 'numeric' }))

const days = computed(() => {
  const firstIso = jalaaliToIso(viewYear.value, viewMonth.value, 1)
  const firstDate = new Date(`${firstIso}T00:00:00`)
  const leading = (firstDate.getDay() + 1) % 7
  const output = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= jalaaliMonthLength(viewYear.value, viewMonth.value); day += 1) output.push(day)
  return output
})

watch(() => props.modelValue, () => {
  const value = selected.value; viewYear.value = value.jy; viewMonth.value = value.jm
})
function toggle() { open.value = !open.value; if (open.value) { viewYear.value = selected.value.jy; viewMonth.value = selected.value.jm } }
function moveMonth(offset) {
  let month = viewMonth.value + offset; let year = viewYear.value
  if (month > 12) { month = 1; year += 1 } else if (month < 1) { month = 12; year -= 1 }
  viewMonth.value = month; viewYear.value = year
}
function selectDay(day) { if (!day) return; emit('update:modelValue', jalaaliToIso(viewYear.value, viewMonth.value, day)); open.value = false }
function selectToday() { emit('update:modelValue', jalaaliToIso(today.jy, today.jm, today.jd)); open.value = false }
const isSelected = (day) => selected.value.jy === viewYear.value && selected.value.jm === viewMonth.value && selected.value.jd === day
const isToday = (day) => today.jy === viewYear.value && today.jm === viewMonth.value && today.jd === day
function closeOutside(event) { if (root.value && !root.value.contains(event.target)) open.value = false }
onMounted(() => document.addEventListener('pointerdown', closeOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside))
</script>

<template>
  <label ref="root" class="field persian-date"><span>{{ label }}</span>
    <button type="button" class="date-trigger" :aria-expanded="open" @click="toggle"><span>{{ displayValue }}</span><b>⌄</b></button>
    <div v-if="open" class="calendar-popover">
      <header><button type="button" class="icon-btn" aria-label="ماه بعد" @click="moveMonth(1)">›</button><strong>{{ persianMonths[viewMonth - 1] }} {{ viewYear.toLocaleString('fa-IR', { useGrouping: false }) }}</strong><button type="button" class="icon-btn" aria-label="ماه قبل" @click="moveMonth(-1)">‹</button></header>
      <div class="calendar-weekdays"><span v-for="weekday in persianWeekdays" :key="weekday">{{ weekday }}</span></div>
      <div class="calendar-days"><button v-for="(day, index) in days" :key="`${day}-${index}`" type="button" :disabled="!day" :class="{ selected: isSelected(day), today: isToday(day) }" @click="selectDay(day)">{{ day?.toLocaleString('fa-IR', { useGrouping: false }) }}</button></div>
      <footer><button type="button" @click="selectToday">امروز</button><span>تقویم هجری شمسی</span></footer>
    </div>
  </label>
</template>
