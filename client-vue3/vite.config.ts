import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const backend = process.env.VITE_BACKEND_URL ?? 'http://localhost:4050'

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
      },
      '/static': {
        target: backend,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'v3/assets',
    sourcemap: true,
  },
})
