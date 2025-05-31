<script setup lang="ts">
import { useNavigatorLanguage, useSessionStorage } from '@vueuse/core'
import { OrderByType, useSortedCommits } from '../composables/useSortedCommits'
import type { ExtendedCommit } from '../types/commits'
import type {
  DataTableExpandedRows,
  DataTableRowClickEvent,
} from 'primevue/datatable'
import { ref } from 'vue'
import CommitDetail from './CommitDetail.vue'

const orderBy = useSessionStorage<OrderByType>(
  'commits:orderby',
  OrderByType.TIME,
)
const orderByOptions = [
  { label: 'Commit date ↓', value: OrderByType.TIME },
  { label: 'Additions + deletions ↓', value: OrderByType.MUTATIONS },
  { label: 'Additions ↓', value: OrderByType.ADDITIONS },
  { label: 'Deletions ↓', value: OrderByType.DELETIONS },
]

const itemsPerPage = useSessionStorage('commits:itemspp', 20)
const itemsPerPageOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '500', value: 500 },
]

const commits = useSortedCommits(orderBy)

const language = useNavigatorLanguage()
const dateFormatter = new Intl.DateTimeFormat(
  language.language.value ?? 'en-us',
  {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
)

const expandedRows = ref<DataTableExpandedRows>({})
function onRowClick(e: DataTableRowClickEvent) {
  const id = (e.data as ExtendedCommit).hash
  if (expandedRows.value[id]) {
    delete expandedRows.value[id]
  } else {
    expandedRows.value = {
      ...expandedRows.value,
      [id]: true,
    }
  }
}

const styleColor = (data: ExtendedCommit, colorVariableName: string) => ({
  color: data.excluded ? 'var(--textDisabled)' : `var(${colorVariableName})`,
})
</script>

<template>
  <h1>Commits</h1>

  <div style="margin: 1rem 0; display: flex; flex-direction: row; gap: 0.4em">
    <Select
      style="width: 18em"
      :options="orderByOptions"
      option-label="label"
      option-value="value"
      v-model="orderBy"
    />
  </div>

  <DataTable
    :value="commits"
    class="p-datatable-sm"
    data-key="hash"
    table-style="table-layout: fixed"
    :rows="itemsPerPage"
    :rowsPerPageOptions="itemsPerPageOptions.map((x) => x.value)"
    paginator
    paginator-position="both"
    :always-show-paginator="false"
    selection-mode="single"
    v-model:expanded-rows="expandedRows"
    @row-click="onRowClick"
  >
    <template #empty> No data to display. </template>

    <template #expansion="{ data }: { data: ExtendedCommit }">
      <CommitDetail :commit="data" />
    </template>

    <Column header="Project" column-key="project" style="width: 10rem">
      <template #body="{ data }: { data: ExtendedCommit }">
        <span :style="styleColor(data, '--textSecondary')">
          {{ data.project }}
        </span>
      </template>
    </Column>
    <Column header="Time" column-key="time" style="width: 11rem">
      <template #body="{ data }: { data: ExtendedCommit }">
        <span :style="styleColor(data, '--textSecondary')">
          {{ dateFormatter.format(new Date(data.committer.time)) }}
        </span>
      </template>
    </Column>
    <Column header="Title" column-key="title">
      <template #body="{ data }: { data: ExtendedCommit }">
        <div
          style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap"
          :style="styleColor(data, '--textPrimary')"
        >
          <MergeIcon v-if="data.isMerge" />
          {{ data.message }}
        </div>
      </template>
    </Column>
    <Column header="Author" column-key="author" style="width: 7rem">
      <template #body="{ data }: { data: ExtendedCommit }">
        <div
          style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap"
          :style="styleColor(data, '--textSecondary')"
        >
          {{ data.author.name }}
        </div>
      </template>
    </Column>
    <Column
      column-key="additions"
      style="width: 4rem; color: var(--success)"
      body-style="text-align: right"
    >
      <template #header>
        <code style="flex-grow: 1; font-weight: bold; text-align: right">
          +
        </code>
      </template>
      <template #body="{ data }: { data: ExtendedCommit }">
        <code :style="styleColor(data, '--success')">
          {{ data.additions }}
        </code>
      </template>
    </Column>
    <Column
      column-key="deletions"
      style="width: 4rem; color: var(--error)"
      body-style="text-align: right"
    >
      <template #header>
        <code style="flex-grow: 1; font-weight: bold; text-align: right">
          -
        </code>
      </template>
      <template #body="{ data }: { data: ExtendedCommit }">
        <code :style="styleColor(data, '--error')">
          {{ data.deletions }}
        </code>
      </template>
    </Column>
  </DataTable>
</template>
