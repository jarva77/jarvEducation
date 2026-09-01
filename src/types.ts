export type Category = 'math' | 'grammar' | 'spelling' | 'environment'
export type QuestionType = 'multiple-choice' | 'text'

export interface Question {
  id: string
  category: Category
  type: QuestionType
  question: string
  options?: string[]
  answer: string
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
