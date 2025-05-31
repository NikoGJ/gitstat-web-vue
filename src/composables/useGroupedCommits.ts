import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  type CommitGroup,
  type ExtendedCommit,
  GroupByType,
} from '../types/commits'

export function useGroupedCommits(
  commits: MaybeRefOrGetter<ExtendedCommit[]>,
  groupBy: MaybeRefOrGetter<GroupByType>,
) {
  return {
    groupedCommits: computed(() =>
      groupCommits(toValue(commits), toValue(groupBy)),
    ),
  }
}

function groupCommits(commits: ExtendedCommit[], groupBy: GroupByType) {
  function groupByFunction() {
    switch (groupBy) {
      case GroupByType.AUTHOR:
        return (c: ExtendedCommit) => c.author.name
      case GroupByType.PROJECT:
        return (c: ExtendedCommit) => c.project
      case GroupByType.FILETYPE:
        return (c: ExtendedCommit) => c.project
    }
  }
  const groupFn = groupByFunction()
  const groups = Array.from(
    commits
      .reduce<Map<string, CommitGroup>>((acc, commit) => {
        const groupName = groupFn(commit)
        if (!acc.has(groupName)) {
          acc.set(groupName, {
            commits: [],
            name: groupName,
            firstCommit: new Date(commit.author.time),
            lastCommit: new Date(commit.author.time),
          })
        }
        const group = acc.get(groupName)!
        group.commits.push(commit)
        group.firstCommit = new Date(
          Math.min(
            group.firstCommit.getTime(),
            new Date(commit.author.time).getTime(),
          ),
        )
        group.lastCommit = new Date(
          Math.max(
            group.lastCommit.getTime(),
            new Date(commit.author.time).getTime(),
          ),
        )
        return acc
      }, new Map<string, CommitGroup>())
      .values(),
  )
  groups.sort((a, b) => a.name.localeCompare(b.name))
  return groups
}
