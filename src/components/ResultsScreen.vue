<script setup lang="ts">
import { computed } from 'vue'
import type { AnsweredQuestion, Category } from '../types'
import { CATEGORY_LABELS } from '../types'

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
  if (percentage.value >= 90) return 'Άριστα! 🌟'
  if (percentage.value >= 70) return 'Πολύ καλά! 👏'
  if (percentage.value >= 50) return 'Καλή προσπάθεια! 💪'
  return 'Χρειάζεται λίγη ακόμα εξάσκηση 📚'
})
</script>

<template>
  <section class="card results-screen">
    <h1>Αποτελέσματα</h1>
    <p class="score-big">{{ correct }} / {{ total }}</p>
    <p class="score-percentage">{{ percentage }}%</p>
    <p class="encouragement">{{ encouragement }}</p>

    <div class="category-breakdown">
      <div v-for="c in byCategory" :key="c.cat" class="category-row">
        <span>{{ CATEGORY_LABELS[c.cat] }}</span>
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
