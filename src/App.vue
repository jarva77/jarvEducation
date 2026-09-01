<script setup lang="ts">
import PoweredBy from './components/PoweredBy.vue'
import QuizScreen from './components/QuizScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import StartScreen from './components/StartScreen.vue'
import { useQuiz } from './composables/useQuiz'

const { phase, bankSize, currentQuestion, progress, answers, startQuiz, submitAnswer, restart } =
  useQuiz()
</script>

<template>
  <main class="app-shell">
    <StartScreen v-if="phase === 'start'" :bank-size="bankSize" @start="startQuiz" />

    <QuizScreen
      v-else-if="phase === 'quiz' && currentQuestion"
      :question="currentQuestion"
      :current="progress.current"
      :total="progress.total"
      @answer="submitAnswer"
    />

    <ResultsScreen v-else-if="phase === 'results'" :answers="answers" @restart="restart" />

    <PoweredBy />
  </main>
</template>
