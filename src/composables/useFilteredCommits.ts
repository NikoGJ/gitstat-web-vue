import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { ExtendedCommit } from '../types/commits'

export function useFilteredCommits(
  commits: MaybeRefOrGetter<ExtendedCommit[]>,
  startDate: MaybeRefOrGetter<Date>,
  endDate: MaybeRefOrGetter<Date>,
) {
  return {
    filteredCommits: computed(() => {
      const start = toValue(startDate)
      const end = toValue(endDate)
      return toValue(commits).filter(
        (x) =>
          new Date(x.committer.time).getTime() >= start.getTime() &&
          new Date(x.committer.time).getTime() <= end.getTime(),
      )
    }),
  }
}
