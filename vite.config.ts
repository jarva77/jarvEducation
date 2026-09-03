import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    watch: {
      // Visual Studio locks files under .vs/ while indexing, which crashes
      // Vite's watcher with EBUSY — this folder isn't source anyway (gitignored).
      ignored: ['**/.vs/**'],
    },
  },
})
