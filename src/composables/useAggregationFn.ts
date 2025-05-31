import { type MaybeRefOrGetter } from '@vueuse/core'
import type { CommitAggregationFn, ExtendedCommit } from '../types/commits'
import { computed, toValue, type Ref } from 'vue'

export enum AggregationFnType {
  COMMITS = 'commits',
  MUTATIONS = 'mutations',
  DIFF = 'difference',
  ADDITIONS = 'additions',
  DELETIONS = 'deletions',
}

export function useAggregationFn(
  aggregation: MaybeRefOrGetter<AggregationFnType>,
): Ref<CommitAggregationFn> {
  const fn = computed(() => {
    switch (toValue(aggregation)) {
      case AggregationFnType.MUTATIONS:
        return (commit: ExtendedCommit): number =>
          commit.additions + commit.deletions
      case AggregationFnType.DIFF:
        return (commit: ExtendedCommit): number =>
          commit.additions - commit.deletions
      case AggregationFnType.ADDITIONS:
        return (commit: ExtendedCommit): number => commit.additions
      case AggregationFnType.DELETIONS:
        return (commit: ExtendedCommit): number => commit.deletions
      case AggregationFnType.COMMITS:
      default:
        return (): number => 1
    }
  })
  return fn
}
