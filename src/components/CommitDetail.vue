<script setup lang="ts">
import { useNavigatorLanguage } from '@vueuse/core'
import type { ExtendedCommit, ExtendedCommitFile } from '../types/commits'
import MergeIcon from './MergeIcon.vue'
import { computed } from 'vue'
import { useConfig } from '../composables/useConfig'
import { marked } from 'marked'

const props = defineProps<{ commit: ExtendedCommit }>()

const language = useNavigatorLanguage()
const dateFormatter = new Intl.DateTimeFormat(
  language.language.value ?? 'en-us',
  {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
)

const { config } = useConfig()
const excluded = computed({
  get() {
    return config.value.excludeCommits.some((x) => x === props.commit.hash)
  },
  set(val: boolean) {
    if (val) {
      config.value.excludeCommits.push(props.commit.hash)
    } else {
      const idx = config.value.excludeCommits.findIndex(
        (x) => x === props.commit.hash,
      )
      if (idx > -1) {
        config.value.excludeCommits.splice(idx, 1)
      }
    }
  },
})

const styleColor = (colorVariableName: string) => ({
  color: props.commit.excluded
    ? 'var(--textDisabled)'
    : `var(${colorVariableName})`,
})
</script>
<template>
  <div class="commit-detail">
    <h3>
      <MergeIcon v-if="commit.isMerge" />
      {{ commit.title }}
    </h3>

    <div class="sub-header">
      {{ commit.project }} - {{ commit.author.name }} -
      {{ dateFormatter.format(new Date(commit.committer.time)) }} -
      {{ commit.hash }}
    </div>

    <Checkbox
      binary
      v-model="excluded"
      input-id="exclude-commit"
      style="margin-right: 0.5rem"
    />
    <label for="exclude-commit">Exclude commit</label>

    <blockquote
      v-if="commit.description"
      v-html="marked.parse(commit.description)"
    />
    <div v-else style="height: 1rem" />

    <DataTable :value="commit.extendedFiles">
      <Column header="File" :body-style="styleColor('--textPrimary')">
        <template #body="{ data }: { data: ExtendedCommitFile }">
          <code>{{ data.filepath }}</code>
        </template>
      </Column>
      <Column
        column-key="additions"
        style="width: 4rem; color: var(--success)"
        body-style="text-align: right"
        footer-style="text-align: right"
      >
        <template #header>
          <code style="flex-grow: 1; font-weight: bold; text-align: right">
            +
          </code>
        </template>
        <template #body="{ data }: { data: ExtendedCommitFile }">
          <code :style="styleColor('--success')">
            {{ data.additions }}
          </code>
        </template>
        <template #footer>
          <strong :style="styleColor('--success')">{{
            commit.additions
          }}</strong>
        </template>
      </Column>
      <Column
        column-key="deletions"
        style="width: 4rem; color: var(--error)"
        body-style="text-align: right"
        footer-style="text-align: right"
      >
        <template #header>
          <code style="flex-grow: 1; font-weight: bold; text-align: right">
            -
          </code>
        </template>
        <template #body="{ data }: { data: ExtendedCommitFile }">
          <code :style="styleColor('--error')">
            {{ data.deletions }}
          </code>
        </template>
        <template #footer>
          <strong :style="styleColor('--error')">{{ commit.deletions }}</strong>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="scss" scoped>
.commit-detail {
  margin: 1rem;
  white-space: normal;
  width: fit-content;
}

.sub-header {
  color: var(--textSecondary);
  margin-top: 0.3rem;
  margin-bottom: 1rem;
}
</style>
