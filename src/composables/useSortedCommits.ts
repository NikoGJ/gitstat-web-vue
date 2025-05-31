import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { ExtendedCommit } from '../types/commits'
import { useExtendedCommits } from './useExtendedCommits'
import { useMemoize } from '@vueuse/core'

export enum OrderByType {
  TIME = 'time',
  MUTATIONS = 'mutations',
  ADDITIONS = 'additions',
  DELETIONS = 'deletions',
}

function orderByValue(orderBy?: OrderByType) {
  return (commit: ExtendedCommit): string | number => {
    switch (orderBy) {
      case OrderByType.ADDITIONS:
        return commit.additions
      case OrderByType.DELETIONS:
        return commit.deletions
      case OrderByType.MUTATIONS:
        return Math.abs(commit.deletions) + commit.additions
      case OrderByType.TIME:
      default:
        return commit.committer.time
    }
  }
}

export function useSortedCommits(
  orderBy: MaybeRefOrGetter<OrderByType | undefined>,
) {
  const extendedCommits = useExtendedCommits()
  const memo = useMemoize(
    (extCommits: ExtendedCommit[], order?: OrderByType) => {
      const orderValueFn = orderByValue(order)
      const commits = [...extCommits]
      commits.sort((a, b) => (orderValueFn(a) > orderValueFn(b) ? -1 : 1))
      return commits
    },
  )

  return computed(() => memo(extendedCommits.value, toValue(orderBy)))
}
