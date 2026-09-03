<script setup lang="ts">
const brainLogoUrl = `${import.meta.env.BASE_URL}jarvantage-brain.png`
</script>

<template>
  <footer class="powered-by">
    <span>Powered by</span>
    <img :src="brainLogoUrl" class="pb-logo" alt="" />
    <strong>JARVANTAGE</strong>
  </footer>
</template>
