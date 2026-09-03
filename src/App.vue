<script setup lang="ts">
import { ref } from 'vue'
import HistoryScreen from './components/HistoryScreen.vue'
import HomeScreen from './components/HomeScreen.vue'
import IntroSplash from './components/IntroSplash.vue'
import LeaderboardScreen from './components/LeaderboardScreen.vue'
import OptionsScreen from './components/OptionsScreen.vue'
import PoweredBy from './components/PoweredBy.vue'
import PrivacyScreen from './components/PrivacyScreen.vue'
import QuizScreen from './components/QuizScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import { useQuiz } from './composables/useQuiz'

const {
  phase,
  currentQuestion,
  progress,
  answers,
  startQuiz,
  submitAnswer,
  restart,
  showOptions,
  showHistory,
  showLeaderboard,
  showPrivacy,
} = useQuiz()

const INTRO_SEEN_KEY = 'quiz-intro-seen'
function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === '1'
  } catch {
    return true
  }
}
const showIntro = ref(!hasSeenIntro())
function finishIntro() {
  showIntro.value = false
  try {
    localStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    /* storage unavailable */
  }
}
</script>

<template>
  <IntroSplash v-if="showIntro" @done="finishIntro" />

  <main v-else class="app-shell">
    <HomeScreen
      v-if="phase === 'home'"
      @new-quiz="showOptions"
      @history="showHistory"
      @leaderboard="showLeaderboard"
      @privacy="showPrivacy"
    />

    <OptionsScreen
      v-else-if="phase === 'options'"
      @start="startQuiz"
      @home="restart"
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
