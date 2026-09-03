import { computed, ref } from 'vue'
import type { AnsweredQuestion, Category, Grade, Question } from '../types'
import { saveResultToCloud } from '../services/cloud'
import { isAnswerCorrect } from '../utils/grading'
import { pickQuestions } from '../utils/selection'
import { playCorrect, playWrong } from '../utils/sound'
import { useAuth } from './useAuth'
import { useHistory } from './useHistory'

export type Phase = 'home' | 'options' | 'quiz' | 'results' | 'history' | 'leaderboard' | 'privacy'

const phase = ref<Phase>('home')
const quizQuestions = ref<Question[]>([])
const currentIndex = ref(0)
const answers = ref<AnsweredQuestion[]>([])
// the grade to attribute a result to in history/leaderboard — only set when
// the quiz drew from a single grade; left undefined for mixed-grade quizzes
const quizGrade = ref<Grade | undefined>(undefined)

export function useQuiz() {
  const { recordResult } = useHistory()
  const { user } = useAuth()
  const currentQuestion = computed(() => quizQuestions.value[currentIndex.value])
  const progress = computed(() => ({
    current: currentIndex.value + 1,
    total: quizQuestions.value.length,
  }))
  const score = computed(() => answers.value.filter((a) => a.isCorrect).length)

  function startQuiz(count: number, grades: Grade[], categories: Category[], bank: Question[]) {
    const picked = pickQuestions(bank, count, categories)
    if (picked.length === 0) return
    quizQuestions.value = picked
    currentIndex.value = 0
    answers.value = []
    quizGrade.value = grades.length === 1 ? grades[0] : undefined
    phase.value = 'quiz'
  }

  // The quiz must never freeze on a submitted answer — isAnswerCorrect()
  // already can't throw (see grading.ts), and every other risky step here
  // (sound, local/cloud history) is isolated so a failure there degrades
  // gracefully instead of blocking the player from moving to the next
  // question or seeing their results.
  function submitAnswer(userAnswer: string) {
    const question = currentQuestion.value
    if (!question) return
    const isCorrect = isAnswerCorrect(userAnswer, question)

    try {
      if (isCorrect) playCorrect()
      else playWrong()
    } catch (e) {
      console.error('sound playback failed', e)
    }

    answers.value.push({
      question,
      userAnswer,
      isCorrect,
    })

    if (currentIndex.value + 1 < quizQuestions.value.length) {
      currentIndex.value++
      return
    }

    try {
      recordResult(answers.value, quizGrade.value)
    } catch (e) {
      console.error('saving local history failed', e)
    }
    if (user.value) {
      // fire-and-forget: cloud saving must never block the results screen
      void saveResultToCloud(user.value, answers.value, quizGrade.value).catch((e) =>
        console.error('cloud save failed', e),
      )
    }
    phase.value = 'results'
  }

  function restart() {
    phase.value = 'home'
    quizQuestions.value = []
    currentIndex.value = 0
    answers.value = []
  }

  function showOptions() {
    phase.value = 'options'
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
    currentQuestion,
    progress,
    answers,
    score,
    startQuiz,
    submitAnswer,
    restart,
    showOptions,
    showHistory,
    showLeaderboard,
    showPrivacy,
  }
}
