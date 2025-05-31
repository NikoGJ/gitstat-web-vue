import { useLocalStorage } from '@vueuse/core'
import type { Config } from '../types/configTypes'

export function useConfig() {
  const config = useLocalStorage<Config>('config', {
    includeMergeCommits: false,
    includeFileFilters: ['.*'],
    excludeFileFilters: [],
    authorAliases: [],
    excludeAuthors: [],
    excludeCommits: [],
  })
  return { config }
}
