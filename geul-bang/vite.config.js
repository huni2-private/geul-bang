import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // public/manifest.json 사용 — 플러그인 자체 manifest 비활성
      manifest: false,
      workbox: {
        // 앱 셸(JS/CSS/HTML)만 precache — 소설 내용(Firestore)은 온라인 전용
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      'styled-system': path.resolve(__dirname, 'styled-system'),
    },
  },
})
