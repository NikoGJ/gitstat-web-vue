<script setup lang="ts">
import Logo from './Logo.vue'
</script>

<template>
  <div class="container">
    <Logo />
    <div class="message-container">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;
}

.message-container {
  margin: 1.85rem 3.2rem;
}
</style>
