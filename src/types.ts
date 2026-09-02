export type Category = 'math' | 'grammar' | 'spelling' | 'environment'
export type Grade = 'c' | 'd'

export const GRADE_LABELS: Record<Grade, string> = {
  c: "Γ' Δημοτικού",
  d: "Δ' Δημοτικού",
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
