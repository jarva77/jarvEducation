<script setup lang="ts">
import { onMounted, ref } from 'vue'

const emit = defineEmits<{ done: [] }>()

const brainLogoUrl = `${import.meta.env.BASE_URL}jarvantage-brain.png`
const words = ['open', 'your', 'mind']

const opening = ref(false)
const showText = ref(false)
const closing = ref(false)

let timers: number[] = []

function finish() {
  timers.forEach(clearTimeout)
  timers = []
  emit('done')
}

onMounted(() => {
  requestAnimationFrame(() => {
    opening.value = true
  })
  timers.push(window.setTimeout(() => (showText.value = true), 1000))
  timers.push(window.setTimeout(() => (closing.value = true), 3300))
  timers.push(window.setTimeout(finish, 4000))
})
</script>

<template>
  <div class="intro-splash" :class="{ closing }" @click="finish">
    <div class="intro-stage">
      <div class="intro-brain" :class="{ open: opening, faded: showText }">
        <img :src="brainLogoUrl" class="intro-brain-half intro-brain-left" alt="" />
        <img :src="brainLogoUrl" class="intro-brain-half intro-brain-right" alt="" />
      </div>
      <div class="intro-text" :class="{ visible: showText }">
        <span v-for="w in words" :key="w" class="intro-word">{{ w }}</span>
      </div>
    </div>
  </div>
</template>
