<script setup lang="ts">
import { useDropZone } from '@vueuse/core'
import { computed, useTemplateRef, watch } from 'vue'
import { useGitData } from '../stores/useGitData'

const dropzone = useTemplateRef('dropzone')
const { isOverDropZone, files } = useDropZone(dropzone, {
  dataTypes: ['application/json'],
  multiple: false,
})
watch(files, (newVal) => loadFile(newVal?.[0]))

const fileInput = useTemplateRef('input')

const borderColor = computed(() => {
  if (isOverDropZone.value) {
    return 'var(--primary)'
  }
  return 'var(--border)'
})

const { loadData } = useGitData()

async function loadFile(file?: File | null) {
  if (file) loadData(JSON.parse(await file.text()))
}
</script>

<template>
  <div
    class="dropzone"
    ref="dropzone"
    :style="{
      borderColor: borderColor,
    }"
    @click="() => fileInput?.click()"
  >
    <p style="text-align: center">
      Drag &apos;n&apos; drop your JSON file here, or click to select one
    </p>
    <input
      type="file"
      style="display: none"
      ref="input"
      accept="application/json"
      @change="loadFile(($event.target as HTMLInputElement).files?.item(0))"
    />
  </div>
</template>

<style lang="scss" scoped>
.dropzone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  cursor: pointer;
  margin: 0 0;
  border-width: 1px;
  border-style: dashed;
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textSecondary);
  outline: none;
  transition: all 200ms ease-in-out;

  &:hover {
    background-color: lighten(#0f0f0f, 1%);
    border-color: var(--inputBorderHover);
    color: var(--text);
  }
}
</style>
