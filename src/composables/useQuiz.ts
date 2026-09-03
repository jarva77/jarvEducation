import { computed, ref } from 'vue'
import type { AnsweredQuestion, Category, Grade, Question } from '../types'
import { saveResultToCloud } from '../services/cloud'
import { isAnswerCorrect } from '../utils/grading'
import { pickQuestions } from '../utils/selection'
import { playCorrect, playWrong } from '../utils/sound'
import { useAuth } from './useAuth'
import { useHistory } from './useHistory'

export type Phase = 'start' | 'quiz' | 'results' | 'history' | 'leaderboard' | 'privacy'

// per-grade banks are separate chunks, downloaded only when the grade is picked
const GRADE_LOADERS: Record<Grade, () => Promise<{ default: unknown }>> = {
  a: () => import('../data/questions-a.json'),
  b: () => import('../data/questions-b.json'),
  c: () => import('../data/questions-c.json'),
  d: () => import('../data/questions-d.json'),
  e: () => import('../data/questions-e.json'),
  f: () => import('../data/questions-f.json'),
}

const GRADE_STORAGE_KEY = 'quiz-grade'

function loadStoredGrade(): Grade {
  try {
    const raw = localStorage.getItem(GRADE_STORAGE_KEY)
    if (raw && ['a', 'b', 'c', 'd', 'e', 'f'].includes(raw)) return raw as Grade
  } catch {
    /* storage unavailable */
  }
  return 'd'
}

const phase = ref<Phase>('start')
const quizQuestions = ref<Question[]>([])
const currentIndex = ref(0)
const answers = ref<AnsweredQuestion[]>([])

const grade = ref<Grade>(loadStoredGrade())
const bank = ref<Question[]>([])
const bankLoading = ref(false)

async function loadBank(g: Grade) {
  bankLoading.value = true
  try {
    const mod = await GRADE_LOADERS[g]()
    bank.value = mod.default as Question[]
  } catch (e) {
    console.error('bank load failed', e)
    bank.value = []
  } finally {
    bankLoading.value = false
  }
}

void loadBank(grade.value)

export function useQuiz() {
  const { recordResult } = useHistory()
  const { user } = useAuth()
  const currentQuestion = computed(() => quizQuestions.value[currentIndex.value])
  const progress = computed(() => ({
    current: currentIndex.value + 1,
    total: quizQuestions.value.length,
  }))
  const score = computed(() => answers.value.filter((a) => a.isCorrect).length)
  const bankSize = computed(() => bank.value.length)

  function setGrade(g: Grade) {
    if (g === grade.value) return
    grade.value = g
    try {
      localStorage.setItem(GRADE_STORAGE_KEY, g)
    } catch {
      /* storage unavailable */
    }
    void loadBank(g)
  }

  function startQuiz(count: number, categories?: Category[]) {
    const picked = pickQuestions(bank.value, count, categories)
    if (picked.length === 0) return
    quizQuestions.value = picked
    currentIndex.value = 0
    answers.value = []
    phase.value = 'quiz'
  }

  function submitAnswer(userAnswer: string) {
    const question = currentQuestion.value
    if (!question) return
    const isCorrect = isAnswerCorrect(userAnswer, question)
    if (isCorrect) playCorrect()
    else playWrong()
    answers.value.push({
      question,
      userAnswer,
      isCorrect,
    })

    if (currentIndex.value + 1 < quizQuestions.value.length) {
      currentIndex.value++
    } else {
      recordResult(answers.value, grade.value)
      if (user.value) {
        // fire-and-forget: cloud saving must never block the results screen
        void saveResultToCloud(user.value, answers.value, grade.value).catch((e) =>
          console.error('cloud save failed', e),
        )
      }
      phase.value = 'results'
    }
  }

  function restart() {
    phase.value = 'start'
    quizQuestions.value = []
    currentIndex.value = 0
    answers.value = []
  }

  function showHistory() {
    phase.value = 'history'
  }

  function showLeaderboard() {
    phase.value = 'leaderboard'
  }

  function showPrivacy() {
    phase.value = 'privacy'
  }

  return {
    phase,
    grade,
    bank,
    bankSize,
    bankLoading,
    currentQuestion,
    progress,
    answers,
    score,
    setGrade,
    startQuiz,
    submitAnswer,
    restart,
    showHistory,
    showLeaderboard,
    showPrivacy,
  }
}
