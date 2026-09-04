import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

// yymmddHHmm in UTC, so the stamp is stable regardless of the build machine's locale/timezone
function buildTimestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return [d.getUTCFullYear() % 100, d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()]
    .map(pad)
    .join('')
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp()),
  },
  server: {
    watch: {
      // Visual Studio locks files under .vs/ while indexing, which crashes
      // Vite's watcher with EBUSY — this folder isn't source anyway (gitignored).
      ignored: ['**/.vs/**'],
    },
  },
})
