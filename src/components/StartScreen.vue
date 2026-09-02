<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{ bankSize: number }>()
const emit = defineEmits<{ start: [count: number]; history: []; leaderboard: [] }>()

const { user, cloudEnabled, signInWithGoogle, signOut } = useAuth()

const presets = [10, 20, 50, 100]
const custom = ref(20)

function start(count: number) {
  const clamped = Math.max(1, Math.min(count, props.bankSize))
  emit('start', clamped)
}
</script>

<template>
  <section class="card start-screen">
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

    <h1>🚀 Επαναληπτικό Τεστ</h1>
    <p class="subtitle">Γ' Δημοτικού &mdash; 🔢 Μαθηματικά, 📖 Γραμματική, ✏️ Ορθογραφία &amp; 🌍 Μελέτη Περιβάλλοντος</p>

    <p class="label">Πόσες ερωτήσεις θέλεις; 🤔</p>
    <div class="presets">
      <button
        v-for="p in presets"
        :key="p"
        class="preset-btn"
        :disabled="p > bankSize"
        @click="start(p)"
      >
        {{ p }}
      </button>
    </div>

    <div class="custom-row">
      <label for="custom-count">Άλλος αριθμός (max {{ bankSize }}):</label>
      <input
        id="custom-count"
        v-model.number="custom"
        type="number"
        min="1"
        :max="bankSize"
      />
      <button class="primary-btn" @click="start(custom)">Ξεκίνα</button>
    </div>

    <div class="secondary-actions">
      <button class="history-link" @click="emit('history')">📊 Ιστορικό &amp; πρόοδος</button>
      <button v-if="cloudEnabled" class="history-link" @click="emit('leaderboard')">🏆 Βαθμολογία</button>
    </div>
  </section>
</template>
