import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // lo registramos a mano (solo en https, no en Electron)
      manifest: {
        name: 'KAEFER Partes de Comida',
        short_name: 'Partes Comida',
        description: 'Partes de comida KAEFER 2026',
        theme_color: '#1A1A2E',
        background_color: '#F4F5F7',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,pdf}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  base: './',
  server: { port: 5174 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
