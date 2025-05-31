<script setup lang="ts">
import { computed } from 'vue'
import { useAuthorNames } from '../composables/useAuthorNames'
import { useConfig } from '../composables/useConfig'
import type { Aliases } from '../types/configTypes'

const { config } = useConfig()

const authorNames = useAuthorNames()

const allConfiguredNames = computed(() =>
  config.value.authorAliases
    .flatMap((x) => [x.realName, ...x.aliases])
    .filter((x) => x != ''),
)

// Contains only names not already part of another alias
const filteredNames = computed(() => {
  return authorNames.value.filter(
    (name) => !config.value.authorAliases.some((elm) => elm.realName === name),
  )
})

function authorNameOptions(currentAlias: Aliases) {
  const excludedNames = allConfiguredNames.value.filter(
    (x) => x != currentAlias.realName,
  )

  if (authorNames.value.length == 0 && currentAlias.realName != '') {
    return [currentAlias.realName]
  } else {
    if (currentAlias.realName == '')
      return authorNames.value.filter((n) => !excludedNames.some((x) => x == n))
    else
      return [
        currentAlias.realName,
        ...authorNames.value.filter((n) => !excludedNames.some((x) => x == n)),
      ]
  }
}
</script>

<template>
  <div style="max-width: 800px">
    <h1>Config</h1>
    <table class="config">
      <tbody>
        <tr>
          <td class="first">General</td>
          <td class="second">
            <div style="display: flex; gap: 0.6em; align-items: center">
              <Checkbox
                input-id="includeMergeCommits"
                v-model="config.includeMergeCommits"
                binary
                size="small"
              />
              <label for="includeMergeCommits"> Include merge commits </label>
            </div>
          </td>
        </tr>
        <tr>
          <td class="first">Include files</td>
          <td class="second">
            <p class="description">
              Regex expression to specify which files are included. Defaults to
              all files (<code>.*</code>).
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem">
              <div
                style="display: flex; gap: 0.6rem"
                v-for="(filter, index) in config.includeFileFilters"
                :key="index"
              >
                <InputText
                  style="width: 100%"
                  :value="filter"
                  @update:model-value="
                    (val) => (config.includeFileFilters[index] = val ?? '')
                  "
                  placeholder="Filepath regex..."
                />
                <Button
                  v-if="config.includeFileFilters.length > 1"
                  class="p-button-secondary p-button-text"
                  icon="pi pi-times"
                  @click="config.includeFileFilters.splice(index, 1)"
                />
              </div>

              <Button
                style="justify-content: flex-start"
                class="p-button-text p-button-secondary"
                icon="pi pi-plus"
                label="Add regex pattern"
                @click="config.includeFileFilters.push('')"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td class="first">Exclude files</td>
          <td class="second">
            <p class="description">
              Regex expressions to exclude files. This overrides &ldquo;Include
              files&rdquo;.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem">
              <div
                style="display: flex; gap: 0.6rem"
                v-for="(filter, index) in config.excludeFileFilters"
                :key="index"
              >
                <InputText
                  style="width: 100%"
                  :value="filter"
                  @update:model-value="
                    (val) => (config.excludeFileFilters[index] = val ?? '')
                  "
                  placeholder="Filepath regex..."
                />
                <Button
                  v-if="config.excludeFileFilters.length > 0"
                  class="p-button-secondary p-button-text"
                  icon="pi pi-times"
                  @click="config.excludeFileFilters.splice(index, 1)"
                />
              </div>

              <Button
                style="justify-content: flex-start"
                class="p-button-text p-button-secondary"
                icon="pi pi-plus"
                label="Add regex pattern"
                @click="config.excludeFileFilters.push('')"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td class="first">Aliases</td>
          <td class="second">
            <p class="description">Deduplicate user names.</p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem">
              <div
                style="display: flex; gap: 0.6rem"
                v-for="(alias, index) in config.authorAliases"
                :key="alias.realName"
              >
                <Select
                  style="width: 20rem"
                  v-model="alias.realName"
                  :options="authorNameOptions(alias)"
                  placeholder="Real name..."
                  :virtualScrollerOptions="{
                    itemSize: 38,
                  }"
                />
                <MultiSelect
                  fluid
                  v-model="alias.aliases"
                  display="chip"
                  :show-toggle-all="false"
                  :options="filteredNames"
                  placeholder="Aliases..."
                  :virtualScrollerOptions="{
                    itemSize: 38,
                  }"
                />
                <Button
                  v-if="config.authorAliases.length > 0"
                  class="p-button-secondary p-button-text"
                  icon="pi pi-times"
                  @click="config.authorAliases.splice(index, 1)"
                />
              </div>

              <Button
                style="justify-content: flex-start"
                class="p-button-text p-button-secondary"
                icon="pi pi-plus"
                label="Add alias"
                @click="
                  config.authorAliases.push({ realName: '', aliases: [] })
                "
              />
            </div>
          </td>
        </tr>
        <tr>
          <td class="first">Exclude commits</td>
          <td class="second">
            <p class="description">
              Exclude commits in the
              <RouterLink to="/commits">Commits</RouterLink> page.
            </p>
            <Button
              v-if="config.excludeCommits.length > 0"
              :label="`Reset all excluded commits (${config.excludeCommits.length})`"
              @click="config.excludeCommits = []"
            />
          </td>
        </tr>
        <tr>
          <td class="first">Exclude authors</td>
          <td class="second">
            <p class="description">
              Exclude the following authors from the stats (including totals).
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
table.config {
  width: 100%;
  table-layout: fixed;

  td {
    border-top: 1px solid var(--border);
    padding: 0.4rem;

    &.first {
      vertical-align: top;
      font-weight: bold;
      padding: 0.8rem 0.4rem;
      width: 10rem;
    }

    &.second {
      vertical-align: top;
      padding: 0.8rem 0.4rem;
    }
  }
  th {
    padding: 0.4rem;
  }
}

p.description {
  margin: 0 0 0.5rem 0;
}
</style>
