import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router.js'
import './assets/main.css'

registerSW({ immediate: true })
createApp(App).use(router).mount('#app')
