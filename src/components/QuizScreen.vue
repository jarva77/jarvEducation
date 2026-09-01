<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question } from '../types'
import { CATEGORY_LABELS } from '../types'

const props = defineProps<{
  question: Question
  current: number
  total: number
}>()
const emit = defineEmits<{ answer: [value: string] }>()

const textAnswer = ref('')

watch(
  () => props.question.id,
  () => {
    textAnswer.value = ''
  },
)

function choose(option: string) {
  emit('answer', option)
}

function submitText() {
  if (!textAnswer.value.trim()) return
  emit('answer', textAnswer.value)
}
</script>

<template>
  <section class="card quiz-screen">
    <div class="progress-row">
      <span class="progress-text">Ερώτηση {{ current }} / {{ total }}</span>
      <span class="category-badge">{{ CATEGORY_LABELS[question.category] }}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-bar-fill" :style="{ width: (current / total) * 100 + '%' }" />
    </div>

    <h2 class="question-text">{{ question.question }}</h2>

    <div v-if="question.type === 'multiple-choice'" class="options">
      <button
        v-for="opt in question.options"
        :key="opt"
        class="option-btn"
        @click="choose(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <form v-else class="text-answer" @submit.prevent="submitText">
      <input
        v-model="textAnswer"
        type="text"
        autocomplete="off"
        placeholder="Γράψε την απάντησή σου"
        autofocus
      />
      <button class="primary-btn" type="submit">Επόμενο</button>
    </form>
  </section>
</template>
