<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GitStatData } from '../types/gitStatData'
import { useGitData } from '../stores/useGitData'
import { useRouter } from 'vue-router'

const router = useRouter()
const options = ref([
  { label: 'react', value: 'react.json' },
  { label: 'helm', value: 'helm.json' },
])

const { loading, loadData } = useGitData()
const selected = ref<{ label: string; value: string }>()

watch(selected, async (newVal) => {
  if (newVal) await handleSelectProject(newVal as any)
})
async function handleSelectProject(file: string) {
  loading.value = true
  try {
    const response = (await (await fetch(file)).json()) as GitStatData
    loadData(response)
    router.push('/graphs')
  } catch (err) {
    alert(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="select-container">
    <Select
      style="width: 100%"
      v-model="selected"
      :options="options"
      option-label="label"
      option-value="value"
      :loading="loading"
      placeholder="Select..."
    />
  </div>
</template>

<style lang="css" scoped>
.select-container {
  margin-left: 0.3rem;
}
</style>
