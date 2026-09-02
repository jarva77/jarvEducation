export type Category = 'math' | 'grammar' | 'spelling' | 'environment'
export type Grade = 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

export const GRADE_LABELS: Record<Grade, string> = {
  a: "Α' Δημοτικού",
  b: "Β' Δημοτικού",
  c: "Γ' Δημοτικού",
  d: "Δ' Δημοτικού",
  e: "Ε' Δημοτικού",
  f: "ΣΤ' Δημοτικού",
}
export type QuestionType = 'multiple-choice' | 'text'

export interface Question {
  id: string
  category: Category
  type: QuestionType
  question: string
  options?: string[]
  answer: string
  /** Extra answers that also count as correct (open-ended questions). */
  acceptedAnswers?: string[]
}

export interface AnsweredQuestion {
  question: Question
  userAnswer: string
  isCorrect: boolean
}

export const CATEGORY_LABELS: Record<Category, string> = {
  math: 'Μαθηματικά',
  grammar: 'Γραμματική',
  spelling: 'Ορθογραφία',
  environment: 'Μελέτη Περιβάλλοντος',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  math: '🔢',
  grammar: '📖',
  spelling: '✏️',
  environment: '🌍',
}
