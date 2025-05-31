import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Commit, GitStatData } from '../types/gitStatData'
import { DateTime } from 'luxon'

export function useCommits(data: MaybeRefOrGetter<GitStatData | undefined>) {
  return computed(
    () =>
      (toValue(data)?.projects ?? []).flatMap((x) =>
        x.commits.map((c) => ({ project: x.name, ...c })),
      ) ?? [],
  )
}

/**
 * Returns the timestamp of the first commit.
 */
export function useFirstCommitTimestamp(commits: MaybeRefOrGetter<Commit[]>) {
  return {
    minDate: computed(() => {
      if (toValue(commits).length > 0) {
        return DateTime.fromISO(toValue(commits)[0].committer.time).toJSDate()
      }
      return null
    }),
  }
}
