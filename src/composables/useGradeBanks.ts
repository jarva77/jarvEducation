import type { Grade, Question } from '../types'

// per-grade banks are separate chunks, downloaded only when picked; dynamic
// import() caches the module, so loading the same grade twice is free
const GRADE_LOADERS: Record<Grade, () => Promise<{ default: unknown }>> = {
  a: () => import('../data/questions-a.json'),
  b: () => import('../data/questions-b.json'),
  c: () => import('../data/questions-c.json'),
  d: () => import('../data/questions-d.json'),
  e: () => import('../data/questions-e.json'),
  f: () => import('../data/questions-f.json'),
}

const ALL_GRADES: Grade[] = ['a', 'b', 'c', 'd', 'e', 'f']

export async function loadBanks(grades: Grade[]): Promise<Question[]> {
  const mods = await Promise.all(grades.map((g) => GRADE_LOADERS[g]()))
  return mods.flatMap((m) => m.default as Question[])
}

const GRADES_STORAGE_KEY = 'quiz-grades'

export function loadStoredGrades(): Grade[] {
  try {
    const raw = localStorage.getItem(GRADES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((g) => ALL_GRADES.includes(g))) {
        return parsed as Grade[]
      }
    }
  } catch {
    /* storage unavailable or malformed */
  }
  return ['d']
}

export function storeGrades(grades: Grade[]) {
  try {
    localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades))
  } catch {
    /* storage unavailable */
  }
}
