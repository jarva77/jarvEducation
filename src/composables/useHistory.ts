import { ref } from 'vue'
import type { AnsweredQuestion, Category } from '../types'

export interface HistoryEntry {
  date: string // ISO timestamp
  total: number
  correct: number
  percentage: number
  byCategory: Partial<Record<Category, { correct: number; total: number }>>
}

const STORAGE_KEY = 'quiz-history-v1'

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const history = ref<HistoryEntry[]>(load())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch {
    // storage full or unavailable (private mode) — history just won't persist
  }
}

export function useHistory() {
  function recordResult(answers: AnsweredQuestion[]) {
    if (answers.length === 0) return
    const correct = answers.filter((a) => a.isCorrect).length
    const byCategory: HistoryEntry['byCategory'] = {}
    for (const a of answers) {
      const cat = a.question.category
      byCategory[cat] ??= { correct: 0, total: 0 }
      byCategory[cat]!.total++
      if (a.isCorrect) byCategory[cat]!.correct++
    }
    history.value.push({
      date: new Date().toISOString(),
      total: answers.length,
      correct,
      percentage: Math.round((correct / answers.length) * 100),
      byCategory,
    })
    persist()
  }

  function clearHistory() {
    history.value = []
    persist()
  }

  return { history, recordResult, clearHistory }
}
