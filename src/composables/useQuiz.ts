import { computed, ref } from 'vue'
import rawQuestions from '../data/questions.json'
import type { AnsweredQuestion, Question } from '../types'
import { isAnswerCorrect } from '../utils/grading'
import { pickQuestions } from '../utils/selection'
import { playCorrect, playWrong } from '../utils/sound'
import { useHistory } from './useHistory'

const bank = rawQuestions as Question[]

export type Phase = 'start' | 'quiz' | 'results' | 'history'

const phase = ref<Phase>('start')
const quizQuestions = ref<Question[]>([])
const currentIndex = ref(0)
const answers = ref<AnsweredQuestion[]>([])

export function useQuiz() {
  const { recordResult } = useHistory()
  const currentQuestion = computed(() => quizQuestions.value[currentIndex.value])
  const progress = computed(() => ({
    current: currentIndex.value + 1,
    total: quizQuestions.value.length,
  }))
  const score = computed(() => answers.value.filter((a) => a.isCorrect).length)

  function startQuiz(count: number) {
    quizQuestions.value = pickQuestions(bank, count)
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
      recordResult(answers.value)
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

  return {
    phase,
    bankSize: bank.length,
    currentQuestion,
    progress,
    answers,
    score,
    startQuiz,
    submitAnswer,
    restart,
    showHistory,
  }
}
