import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'دنگ‌بان | DongBan', short_name: 'دنگ‌بان',
        description: 'مدیریت و تسویه هوشمند هزینه‌های گروهی',
        lang: 'fa', dir: 'rtl', theme_color: '#4f46e5', background_color: '#f8fafc',
        id: '/', display: 'standalone', start_url: '/', scope: '/',
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\.(?:xml|txt|json|webmanifest|ico|png|svg|jpe?g|gif|webp|woff2?|css|js)$/]
      }
    })
  ],
  build: {
    sourcemap: true,
    rollupOptions: { output: { manualChunks: { 'vue-vendor': ['vue', 'vue-router'] } } }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_SHA__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local')
  },
  test: { environment: 'node' }
})
