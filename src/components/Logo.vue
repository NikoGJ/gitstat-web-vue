<script lang="ts" setup>
import { useRouter } from 'vue-router'
import LogoSVG from '../assets/logo.svg?raw'

const router = useRouter()

function gotoHome(): void {
  router.push('/')
}
</script>
<template>
  <div class="logo" @click="gotoHome">
    <span v-html="LogoSVG" />
    <div class="styled-logo">gitstat</div>
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}

.styled-logo {
  font-size: 2rem;
  font-family: Lato, sans-serif;
  letter-spacing: -0.1rem;
  padding-left: 0.3rem;
  padding-bottom: 0.5rem;
  font-weight: bold;
}
</style>
