<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const emit = defineEmits<{
  newQuiz: []
  history: []
  leaderboard: []
  privacy: []
}>()

const { user, cloudEnabled, signupBlocked, signInWithGoogle, signOut } = useAuth()
const brainLogoUrl = `${import.meta.env.BASE_URL}jarvantage-brain.png`
</script>

<template>
  <section class="card home-screen">
    <div v-if="cloudEnabled" class="auth-bar">
      <template v-if="user">
        <img v-if="user.photoURL" :src="user.photoURL" class="auth-avatar" alt="" referrerpolicy="no-referrer" />
        <span class="auth-name">{{ user.displayName }}</span>
        <button class="auth-link" @click="signOut()">Έξοδος</button>
      </template>
      <button v-else class="auth-google-btn" @click="signInWithGoogle()">
        Σύνδεση με Google
      </button>
    </div>
    <p v-if="signupBlocked" class="signup-blocked-msg">
      Η εφαρμογή έχει προς το παρόν φτάσει το ανώτατο όριο εγγεγραμμένων χρηστών. Μπορείς
      ακόμα να παίζεις χωρίς σύνδεση.
    </p>

    <div class="hero-brain-wrap">
      <img :src="brainLogoUrl" class="hero-brain" alt="" aria-hidden="true" />
      <span class="hero-spark hero-spark-1">✦</span>
      <span class="hero-spark hero-spark-2">✦</span>
      <span class="hero-spark hero-spark-3">✦</span>
    </div>

    <p class="wordmark">Prime Quiz</p>
    <h1 class="hero-title">Είσαι πιο έξυπνος από έναν μαθητή Δημοτικού;</h1>
    <p class="hero-subtitle">8 μαθήματα · 6 τάξεις Δημοτικού · εκατοντάδες ερωτήσεις</p>

    <button class="primary-btn new-quiz-btn" @click="emit('newQuiz')">Νέο Quiz 🚀</button>

    <div class="secondary-actions">
      <button class="history-link" @click="emit('history')">📊 Ιστορικό &amp; πρόοδος</button>
      <button v-if="cloudEnabled" class="history-link" @click="emit('leaderboard')">🏆 Βαθμολογία</button>
    </div>

    <button class="privacy-link" @click="emit('privacy')">🔒 Απόρρητο</button>
  </section>
</template>
