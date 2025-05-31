<script setup lang="ts"></script>

<template>
  <RouterView>
    <template #="{ Component, route }">
      <MainLayout v-if="(route.meta?.noLayout ?? false) === false">
        <Component :is="Component" />
      </MainLayout>
      <Component v-else :is="Component" />
    </template>
  </RouterView>
</template>
