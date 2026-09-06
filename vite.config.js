import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'دنگ‌بان | DongBan', short_name: 'دنگ‌بان',
        description: 'مدیریت و تسویه هوشمند هزینه‌های گروهی',
        lang: 'fa', dir: 'rtl', theme_color: '#4f46e5', background_color: '#f8fafc',
        display: 'standalone', start_url: '/', scope: '/',
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], navigateFallback: 'index.html' }
    })
  ],
  build: {
    sourcemap: true,
    rollupOptions: { output: { manualChunks: { 'vue-vendor': ['vue', 'vue-router'] } } }
  },
  test: { environment: 'node' }
})
