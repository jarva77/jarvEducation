<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { fetchLeaderboard, type PlayerEntry } from '../services/cloud'

const emit = defineEmits<{ back: [] }>()
const { user } = useAuth()

const players = ref<PlayerEntry[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    players.value = await fetchLeaderboard()
  } catch (e) {
    console.error('leaderboard fetch failed', e)
    error.value = true
  } finally {
    loading.value = false
  }
})

const medals = ['🥇', '🥈', '🥉']
</script>

<template>
  <section class="card leaderboard-screen">
    <h1>🏆 Βαθμολογία</h1>

    <p v-if="loading" class="empty-msg">Φόρτωση...</p>
    <p v-else-if="error" class="empty-msg">Κάτι πήγε στραβά. Δοκίμασε ξανά αργότερα.</p>
    <p v-else-if="players.length === 0" class="empty-msg">
      Κανείς δεν έχει παίξει ακόμα. Γίνε ο πρώτος! 🚀
    </p>

    <div v-else class="player-list">
      <div
        v-for="(p, i) in players"
        :key="p.uid"
        class="player-row"
        :class="{ me: user && p.uid === user.uid }"
      >
        <span class="player-rank">{{ medals[i] ?? i + 1 }}</span>
        <span class="player-name">{{ p.name }}</span>
        <span class="player-points">{{ p.totalPoints }} π.</span>
      </div>
    </div>

    <p class="leaderboard-hint">Κερδίζεις 1 πόντο για κάθε σωστή απάντηση!</p>

    <button class="primary-btn back-btn" @click="emit('back')">Πίσω</button>
  </section>
</template>
