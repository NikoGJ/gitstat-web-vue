<script setup lang="ts">
import SideMenu from './SideMenu.vue'
</script>

<template>
  <div class="main-layout">
    <SideMenu />
    <div class="content"><slot /></div>
  </div>
</template>

<style lang="css" scoped>
.main-layout {
  display: flex;
  flex-direction: row;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

.content {
  flex: 1;
  padding: 1rem 2rem;
}
</style>
