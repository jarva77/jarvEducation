import type { Question } from '../types'

const LEADING_ARTICLES = /^(ο|η|το|οι|τα|ένας|ένα|μία|μια)\s+/

export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;·!]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function variants(value: string): string[] {
  const base = normalizeAnswer(value)
  const noArticle = base.replace(LEADING_ARTICLES, '')
  return noArticle !== base ? [base, noArticle] : [base]
}

export function isAnswerCorrect(userAnswer: string, question: Question): boolean {
  const user = variants(userAnswer)
  const accepted = [question.answer, ...(question.acceptedAnswers ?? [])].flatMap(variants)
  return user.some((u) => accepted.includes(u))
}
