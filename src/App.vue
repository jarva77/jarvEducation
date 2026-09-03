<script setup lang="ts">
import HistoryScreen from './components/HistoryScreen.vue'
import LeaderboardScreen from './components/LeaderboardScreen.vue'
import PoweredBy from './components/PoweredBy.vue'
import PrivacyScreen from './components/PrivacyScreen.vue'
import QuizScreen from './components/QuizScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import StartScreen from './components/StartScreen.vue'
import { useQuiz } from './composables/useQuiz'

const {
  phase,
  grade,
  bank,
  bankSize,
  bankLoading,
  currentQuestion,
  progress,
  answers,
  setGrade,
  startQuiz,
  submitAnswer,
  restart,
  showHistory,
  showLeaderboard,
  showPrivacy,
} = useQuiz()
</script>

<template>
  <main class="app-shell">
    <StartScreen
      v-if="phase === 'start'"
      :bank="bank"
      :bank-size="bankSize"
      :grade="grade"
      :loading="bankLoading"
      @start="startQuiz"
      @grade-change="setGrade"
      @history="showHistory"
      @leaderboard="showLeaderboard"
      @privacy="showPrivacy"
    />

    <QuizScreen
      v-else-if="phase === 'quiz' && currentQuestion"
      :question="currentQuestion"
      :current="progress.current"
      :total="progress.total"
      @answer="submitAnswer"
    />

    <ResultsScreen v-else-if="phase === 'results'" :answers="answers" @restart="restart" />

    <HistoryScreen v-else-if="phase === 'history'" @back="restart" />

    <LeaderboardScreen v-else-if="phase === 'leaderboard'" @back="restart" />

    <PrivacyScreen v-else-if="phase === 'privacy'" @back="restart" />

    <PoweredBy />
  </main>
</template>
