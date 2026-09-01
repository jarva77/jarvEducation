<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHistory } from '../composables/useHistory'
import type { Category } from '../types'
import { CATEGORY_LABELS } from '../types'

const emit = defineEmits<{ back: [] }>()
const { history, clearHistory } = useHistory()
const confirmingClear = ref(false)

const entries = computed(() => [...history.value].reverse())

const overallAverage = computed(() => {
  if (history.value.length === 0) return 0
  const sum = history.value.reduce((acc, e) => acc + e.percentage, 0)
  return Math.round(sum / history.value.length)
})

const trend = computed(() => {
  // compare average of last 3 tests vs the 3 before them
  const list = history.value
  if (list.length < 4) return null
  const recent = list.slice(-3)
  const before = list.slice(-6, -3)
  const avg = (xs: typeof list) => xs.reduce((a, e) => a + e.percentage, 0) / xs.length
  const diff = Math.round(avg(recent) - avg(before))
  return diff
})

const categoryAverages = computed(() => {
  const acc: Partial<Record<Category, { correct: number; total: number }>> = {}
  for (const e of history.value) {
    for (const [cat, stats] of Object.entries(e.byCategory)) {
      const c = cat as Category
      acc[c] ??= { correct: 0, total: 0 }
      acc[c]!.correct += stats.correct
      acc[c]!.total += stats.total
    }
  }
  return (Object.keys(CATEGORY_LABELS) as Category[])
    .filter((c) => acc[c] && acc[c]!.total > 0)
    .map((c) => ({
      cat: c,
      label: CATEGORY_LABELS[c],
      pct: Math.round((acc[c]!.correct / acc[c]!.total) * 100),
    }))
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
}

function barColor(pct: number): string {
  if (pct >= 70) return 'var(--color-correct)'
  if (pct >= 50) return '#d97706'
  return 'var(--color-incorrect)'
}

function onClear() {
  if (!confirmingClear.value) {
    confirmingClear.value = true
    return
  }
  clearHistory()
  confirmingClear.value = false
}
</script>

<template>
  <section class="card history-screen">
    <h1>Ιστορικό</h1>

    <p v-if="entries.length === 0" class="empty-msg">
      Δεν υπάρχουν ακόμα ολοκληρωμένα τεστ. Κάνε το πρώτο σου τεστ!
    </p>

    <template v-else>
      <div class="history-summary">
        <div class="summary-box">
          <span class="summary-value">{{ entries.length }}</span>
          <span class="summary-label">τεστ</span>
        </div>
        <div class="summary-box">
          <span class="summary-value">{{ overallAverage }}%</span>
          <span class="summary-label">μέσος όρος</span>
        </div>
        <div v-if="trend !== null" class="summary-box">
          <span class="summary-value" :style="{ color: trend >= 0 ? 'var(--color-correct)' : 'var(--color-incorrect)' }">
            {{ trend > 0 ? '+' : '' }}{{ trend }}%
          </span>
          <span class="summary-label">τάση</span>
        </div>
      </div>

      <h3>Ανά μάθημα</h3>
      <div class="category-averages">
        <div v-for="c in categoryAverages" :key="c.cat" class="cat-avg-row">
          <span class="cat-avg-label">{{ c.label }}</span>
          <div class="cat-avg-bar">
            <div class="cat-avg-fill" :style="{ width: c.pct + '%', background: barColor(c.pct) }" />
          </div>
          <span class="cat-avg-pct">{{ c.pct }}%</span>
        </div>
      </div>

      <h3>Τεστ</h3>
      <div class="history-list">
        <div v-for="(e, i) in entries" :key="i" class="history-item">
          <div class="history-item-main">
            <span class="history-date">{{ formatDate(e.date) }}</span>
            <span class="history-score">{{ e.correct }} / {{ e.total }}</span>
            <span class="history-pct" :style="{ color: barColor(e.percentage) }">{{ e.percentage }}%</span>
          </div>
          <div class="history-bar">
            <div class="history-bar-fill" :style="{ width: e.percentage + '%', background: barColor(e.percentage) }" />
          </div>
        </div>
      </div>

      <button class="danger-link" @click="onClear">
        {{ confirmingClear ? 'Σίγουρα; Πάτησε ξανά για διαγραφή' : 'Διαγραφή ιστορικού' }}
      </button>
    </template>

    <button class="primary-btn back-btn" @click="emit('back')">Πίσω</button>
  </section>
</template>
