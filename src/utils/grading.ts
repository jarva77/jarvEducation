import type { Question } from '../types'

const LEADING_ARTICLES = /^(ο|η|το|οι|τα|ένας|ένα|μία|μια)\s+/

// accepts unknown (not just string) because the answer/options ultimately
// come from a static JSON bank — a malformed entry there must never crash
// the quiz, only be graded wrong
export function normalizeAnswer(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;·!]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function variants(value: unknown): string[] {
  const base = normalizeAnswer(value)
  const noArticle = base.replace(LEADING_ARTICLES, '')
  return noArticle !== base ? [base, noArticle] : [base]
}

// never throws: a quiz must never freeze on a bad answer/question, at worst
// it should grade something incorrectly
export function isAnswerCorrect(userAnswer: string, question: Question): boolean {
  try {
    const user = variants(userAnswer)
    const accepted = [question.answer, ...(question.acceptedAnswers ?? [])].flatMap(variants)
    return user.some((u) => accepted.includes(u))
  } catch (e) {
    console.error('grading failed, marking as incorrect', e)
    return false
  }
}
