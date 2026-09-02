<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import type { Category, Grade } from '../types'
import { CATEGORY_EMOJI, CATEGORY_LABELS, GRADE_LABELS } from '../types'

const props = defineProps<{ bankSize: number; grade: Grade; loading: boolean }>()
const emit = defineEmits<{
  start: [count: number, categories: Category[]]
  gradeChange: [grade: Grade]
  history: []
  leaderboard: []
  privacy: []
}>()

const { user, cloudEnabled, signInWithGoogle, signOut } = useAuth()

const GRADES: Grade[] = ['c', 'd']
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

const selectedCategories = ref<Category[]>([...ALL_CATEGORIES])
const count = ref(20)
const presets = [10, 20, 50, 100]

const maxCount = computed(() => Math.max(props.bankSize, 5))
const canStart = computed(
  () => !props.loading && selectedCategories.value.length > 0 && props.bankSize > 0,
)

function toggleCategory(cat: Category) {
  if (selectedCategories.value.includes(cat)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== cat)
  } else {
    selectedCategories.value = [...selectedCategories.value, cat]
  }
}

function start() {
  if (!canStart.value) return
  emit('start', Math.min(count.value, maxCount.value), [...selectedCategories.value])
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
    <p class="subtitle">Διάλεξε τάξη, μαθήματα και πόσες ερωτήσεις θέλεις!</p>

    <p class="label">🎓 Τάξη</p>
    <div class="grade-row" role="radiogroup">
      <label v-for="g in GRADES" :key="g" class="grade-pill" :class="{ selected: grade === g }">
        <input
          type="radio"
          name="grade"
          :value="g"
          :checked="grade === g"
          @change="emit('gradeChange', g)"
        />
        {{ GRADE_LABELS[g] }}
      </label>
    </div>

    <p class="label">📚 Μαθήματα</p>
    <div class="category-checks">
      <label
        v-for="cat in ALL_CATEGORIES"
        :key="cat"
        class="category-chip"
        :class="['chip-' + cat, { selected: selectedCategories.includes(cat) }]"
      >
        <input
          type="checkbox"
          :checked="selectedCategories.includes(cat)"
          @change="toggleCategory(cat)"
        />
        {{ CATEGORY_EMOJI[cat] }} {{ CATEGORY_LABELS[cat] }}
      </label>
    </div>
    <p v-if="selectedCategories.length === 0" class="warning-msg">Διάλεξε τουλάχιστον ένα μάθημα!</p>

    <p class="label">🔢 Ερωτήσεις: <span class="count-value">{{ Math.min(count, maxCount) }}</span></p>
    <div class="presets">
      <button
        v-for="p in presets"
        :key="p"
        class="preset-btn"
        :class="{ selected: count === p }"
        :disabled="p > maxCount"
        @click="count = p"
      >
        {{ p }}
      </button>
    </div>
    <input
      v-model.number="count"
      type="range"
      class="count-slider"
      min="5"
      :max="maxCount"
      step="5"
    />

    <button class="primary-btn start-btn" :disabled="!canStart" @click="start">
      {{ loading ? 'Φόρτωση...' : 'Ξεκίνα! 🚀' }}
    </button>

    <div class="secondary-actions">
      <button class="history-link" @click="emit('history')">📊 Ιστορικό &amp; πρόοδος</button>
      <button v-if="cloudEnabled" class="history-link" @click="emit('leaderboard')">🏆 Βαθμολογία</button>
    </div>

    <button class="privacy-link" @click="emit('privacy')">🔒 Απόρρητο</button>
  </section>
</template>
