<script setup lang="ts">
import confetti from 'canvas-confetti'
import { computed, onMounted } from 'vue'
import type { AnsweredQuestion, Category } from '../types'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../types'

const props = defineProps<{ answers: AnsweredQuestion[] }>()
const emit = defineEmits<{ restart: [] }>()

const total = computed(() => props.answers.length)
const correct = computed(() => props.answers.filter((a) => a.isCorrect).length)
const percentage = computed(() =>
  total.value === 0 ? 0 : Math.round((correct.value / total.value) * 100),
)

const byCategory = computed(() => {
  const categories = Object.keys(CATEGORY_LABELS) as Category[]
  return categories
    .map((cat) => {
      const items = props.answers.filter((a) => a.question.category === cat)
      const ok = items.filter((a) => a.isCorrect).length
      return { cat, ok, total: items.length }
    })
    .filter((c) => c.total > 0)
})

const wrongAnswers = computed(() => props.answers.filter((a) => !a.isCorrect))

const encouragement = computed(() => {
  if (percentage.value >= 90) return 'Άριστα! Είσαι σούπερ σταρ!'
  if (percentage.value >= 70) return 'Πολύ καλά! Μπράβο σου!'
  if (percentage.value >= 50) return 'Καλή προσπάθεια! Συνέχισε έτσι!'
  return 'Μην τα παρατάς! Η εξάσκηση κάνει θαύματα!'
})

const resultEmoji = computed(() => {
  if (percentage.value >= 90) return '🏆'
  if (percentage.value >= 70) return '🌟'
  if (percentage.value >= 50) return '💪'
  return '📚'
})

onMounted(() => {
  if (percentage.value < 90) return
  const colors = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#3b82f6']
  confetti({ particleCount: 120, spread: 75, origin: { x: 0.5, y: 0.6 }, colors })
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors })
  }, 350)
  setTimeout(() => {
    confetti({ particleCount: 90, spread: 100, origin: { x: 0.5, y: 0.4 }, colors })
  }, 800)
})
</script>

<template>
  <section class="card results-screen">
    <h1>Αποτελέσματα</h1>
    <span class="result-emoji">{{ resultEmoji }}</span>
    <p class="score-big">{{ correct }} / {{ total }}</p>
    <p class="score-percentage">{{ percentage }}%</p>
    <p class="encouragement">{{ encouragement }}</p>

    <div class="category-breakdown">
      <div v-for="c in byCategory" :key="c.cat" class="category-row" :class="'cat-' + c.cat">
        <span>{{ CATEGORY_EMOJI[c.cat] }} {{ CATEGORY_LABELS[c.cat] }}</span>
        <span>{{ c.ok }} / {{ c.total }}</span>
      </div>
    </div>

    <div v-if="wrongAnswers.length" class="wrong-list">
      <h3>Ερωτήσεις για επανάληψη</h3>
      <div v-for="(a, i) in wrongAnswers" :key="i" class="wrong-item">
        <p class="wrong-question">{{ a.question.question }}</p>
        <p class="wrong-answer">Η απάντησή σου: <strong>{{ a.userAnswer }}</strong></p>
        <p class="correct-answer">Σωστή απάντηση: <strong>{{ a.question.answer }}</strong></p>
      </div>
    </div>

    <button class="primary-btn" @click="emit('restart')">Νέο τεστ</button>
  </section>
</template>
