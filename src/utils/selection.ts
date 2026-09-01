import type { Category, Question } from '../types'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Picks `count` questions from the bank, sampling as evenly as possible
 * across categories so a run doesn't end up all-math or all-spelling.
 */
export function pickQuestions(bank: Question[], count: number): Question[] {
  const total = Math.min(count, bank.length)
  const byCategory = new Map<Category, Question[]>()
  for (const q of bank) {
    const list = byCategory.get(q.category) ?? []
    list.push(q)
    byCategory.set(q.category, list)
  }
  const categories = [...byCategory.keys()]
  const pools = categories.map((c) => shuffle(byCategory.get(c)!))

  const picked: Question[] = []
  let i = 0
  while (picked.length < total) {
    const pool = pools[i % pools.length]
    if (pool.length > 0) picked.push(pool.shift()!)
    i++
    if (pools.every((p) => p.length === 0)) break
  }
  return shuffle(picked)
}
