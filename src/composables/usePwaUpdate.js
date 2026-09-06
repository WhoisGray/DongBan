import { reactive } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const CHECK_INTERVAL = 60 * 60 * 1000
const LAST_CHECK_KEY = 'dongban:last-update-check'
const state = reactive({ needRefresh: false, offlineReady: false, checking: false, lastChecked: localStorage.getItem(LAST_CHECK_KEY) || null })
let registration
let initialized = false
let updateServiceWorker = async () => {}

function recordCheck() {
  state.lastChecked = new Date().toISOString()
  try { localStorage.setItem(LAST_CHECK_KEY, state.lastChecked) } catch { /* optional metadata */ }
}

export function initPwaUpdates() {
  if (initialized) return
  initialized = true
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh: () => { state.needRefresh = true },
    onOfflineReady: () => { state.offlineReady = true },
    onRegisteredSW: (_url, value) => {
      registration = value
      recordCheck()
      if (registration) setInterval(() => checkForUpdate(), CHECK_INTERVAL)
    }
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
  window.addEventListener('online', checkForUpdate)
}

export async function checkForUpdate() {
  if (!registration || state.checking || !navigator.onLine) return false
  state.checking = true
  try { await registration.update(); recordCheck(); return true }
  finally { state.checking = false }
}

export async function applyUpdate() {
  state.needRefresh = false
  await updateServiceWorker(true)
}

export function dismissUpdate() { state.needRefresh = false }
export function dismissOfflineReady() { state.offlineReady = false }
export function usePwaUpdate() { return { state, checkForUpdate, applyUpdate, dismissUpdate, dismissOfflineReady } }
