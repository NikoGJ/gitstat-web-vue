import type {
  AggregatedCommitGroup,
  CommitAggregationFn,
  CommitGroup,
  ExtendedCommit,
} from '../types/commits'

const aggregate = (
  commits: ExtendedCommit[],
  aggregationFn: CommitAggregationFn,
): number =>
  commits.reduce((acc, commit: ExtendedCommit) => {
    return acc + aggregationFn(commit)
  }, 0)

/**
 * Applies an aggregation function on the CommitGroups and sorts them in
 * that order from highest to lowest.
 */
export const aggregateCommits = (
  groups: CommitGroup[],
  aggregationFn: CommitAggregationFn,
  periods: number,
): AggregatedCommitGroup[] => {
  const result = groups.map((group) => ({
    ...group,
    aggregate: aggregate(group.commits, aggregationFn),
    average: aggregate(group.commits, aggregationFn) / periods,
  }))
  result.sort((a, b) => (a.aggregate > b.aggregate ? -1 : 1))
  return result
}
