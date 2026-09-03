<script setup lang="ts">
import { computed, ref } from 'vue'
import { loadBanks, loadStoredGrades, storeGrades } from '../composables/useGradeBanks'
import type { Category, Grade, Question } from '../types'
import { CATEGORY_EMOJI, CATEGORY_LABELS, GRADE_LABELS } from '../types'

const emit = defineEmits<{
  start: [count: number, grades: Grade[], categories: Category[], bank: Question[]]
  home: []
}>()

type Step = 1 | 2 | 3 | 4
const step = ref<Step>(1)
const direction = ref<'forward' | 'back'>('forward')

const ALL_GRADES: Grade[] = ['a', 'b', 'c', 'd', 'e', 'f']
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as Category[]
const presets = [10, 20, 50, 100]
const SLIDER_MAX = 300

const count = ref(20)
const selectedGrades = ref<Grade[]>(loadStoredGrades())
const selectedCategories = ref<Category[]>([])
const bank = ref<Question[]>([])
const bankLoading = ref(false)

const availableCategories = computed(() => {
  const present = new Set(bank.value.map((q) => q.category))
  return CATEGORY_ORDER.filter((c) => present.has(c))
})

// what will actually run — the chosen count, capped by how many questions
// the picked grades/subjects can offer
const effectiveCount = computed(() => Math.min(count.value, bank.value.length || count.value))

const canGoStep3 = computed(() => selectedGrades.value.length > 0)
const canStart = computed(() => selectedCategories.value.length > 0 && bank.value.length > 0)

function toggleGrade(g: Grade) {
  selectedGrades.value = selectedGrades.value.includes(g)
    ? selectedGrades.value.filter((x) => x !== g)
    : [...selectedGrades.value, g]
}

function toggleCategory(cat: Category) {
  selectedCategories.value = selectedCategories.value.includes(cat)
    ? selectedCategories.value.filter((c) => c !== cat)
    : [...selectedCategories.value, cat]
}

async function goNext() {
  direction.value = 'forward'
  if (step.value === 2) {
    // leaving the grade step: (re)load the combined bank before showing subjects
    bankLoading.value = true
    try {
      bank.value = await loadBanks(selectedGrades.value)
    } finally {
      bankLoading.value = false
    }
    const present = new Set(bank.value.map((q) => q.category))
    selectedCategories.value = selectedCategories.value.filter((c) => present.has(c))
    if (selectedCategories.value.length === 0) {
      selectedCategories.value = [...availableCategories.value]
    }
  }
  if (step.value < 4) step.value = (step.value + 1) as Step
}

function goBack() {
  direction.value = 'back'
  if (step.value > 1) step.value = (step.value - 1) as Step
}

const showHomeConfirm = ref(false)

function start() {
  if (!canStart.value) return
  storeGrades(selectedGrades.value)
  emit('start', effectiveCount.value, [...selectedGrades.value], [...selectedCategories.value], bank.value)
}
</script>

<template>
  <section class="card options-screen">
    <div class="wizard-header">
      <button class="icon-btn home-btn" aria-label="Αρχική" @click="showHomeConfirm = true">🏠</button>
      <div class="step-dots">
        <span v-for="s in 4" :key="s" class="step-dot" :class="{ active: s === step, done: s < step }" />
      </div>
      <span class="wizard-header-spacer" />
    </div>

    <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
      <!-- Step 1: question count -->
      <div v-if="step === 1" key="1" class="wizard-step">
        <p class="label step-heading">Διάλεξε πόσες ερωτήσεις</p>
        <div class="presets">
          <button
            v-for="p in presets"
            :key="p"
            class="preset-btn"
            :class="{ selected: count === p }"
            @click="count = p"
          >
            {{ p }}
          </button>
        </div>
        <p class="count-value-row">
          <span class="count-value">{{ count }}</span> ερωτήσεις
        </p>
        <input v-model.number="count" type="range" class="count-slider" min="5" :max="SLIDER_MAX" step="5" />

        <button class="primary-btn next-btn" @click="goNext">Συνέχεια →</button>
      </div>

      <!-- Step 2: grade(s) -->
      <div v-else-if="step === 2" key="2" class="wizard-step">
        <p class="label step-heading">Διάλεξε τάξη (μία ή περισσότερες)</p>
        <div class="grade-row" role="group">
          <label
            v-for="g in ALL_GRADES"
            :key="g"
            class="grade-pill"
            :class="{ selected: selectedGrades.includes(g) }"
          >
            <input type="checkbox" :checked="selectedGrades.includes(g)" @change="toggleGrade(g)" />
            {{ GRADE_LABELS[g] }}
          </label>
        </div>
        <p v-if="selectedGrades.length === 0" class="warning-msg">Διάλεξε τουλάχιστον μία τάξη!</p>

        <div class="wizard-nav">
          <button class="back-link" @click="goBack">← Πίσω</button>
          <button class="primary-btn next-btn" :disabled="!canGoStep3" @click="goNext">Συνέχεια →</button>
        </div>
      </div>

      <!-- Step 3: subjects -->
      <div v-else-if="step === 3" key="3" class="wizard-step">
        <p class="label step-heading">Διάλεξε μαθήματα</p>
        <p v-if="bankLoading" class="loading-msg">Φόρτωση...</p>
        <template v-else>
          <div class="category-checks">
            <label
              v-for="cat in availableCategories"
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
        </template>

        <div class="wizard-nav">
          <button class="back-link" @click="goBack">← Πίσω</button>
          <button class="primary-btn next-btn" :disabled="!canStart" @click="goNext">Συνέχεια →</button>
        </div>
      </div>

      <!-- Step 4: summary -->
      <div v-else key="4" class="wizard-step">
        <p class="label step-heading">Έτοιμος; 🚀</p>
        <div class="summary-card">
          <p class="summary-row"><strong>🔢 Ερωτήσεις:</strong> {{ effectiveCount }}</p>
          <p class="summary-row">
            <strong>🎓 Τάξη:</strong>
            {{ selectedGrades.map((g) => GRADE_LABELS[g]).join(', ') }}
          </p>
          <p class="summary-row">
            <strong>📚 Μαθήματα:</strong>
            {{ selectedCategories.map((c) => CATEGORY_EMOJI[c] + ' ' + CATEGORY_LABELS[c]).join(', ') }}
          </p>
        </div>

        <div class="wizard-nav">
          <button class="back-link" @click="goBack">← Πίσω</button>
          <button class="primary-btn next-btn" :disabled="!canStart" @click="start">Έναρξη! 🚀</button>
        </div>
      </div>
    </Transition>

    <div v-if="showHomeConfirm" class="modal-backdrop" @click.self="showHomeConfirm = false">
      <div class="modal-card">
        <p class="modal-text">Θα χάσεις τις επιλογές σου. Θέλεις σίγουρα να πας στην αρχική;</p>
        <div class="modal-actions">
          <button class="modal-cancel-btn" @click="showHomeConfirm = false">Άκυρο</button>
          <button class="modal-confirm-btn" @click="emit('home')">Ναι, έξοδος</button>
        </div>
      </div>
    </div>
  </section>
</template>
