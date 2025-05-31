import { computed } from 'vue'
import { useGitData } from '../stores/useGitData'
import type {
  CommitMutations,
  ExtendedCommit,
  ExtendedCommitFile,
} from '../types/commits'
import type {
  Commit,
  GitStatData,
  Project,
  Signature,
} from '../types/gitStatData'
import type { Config } from '../types/configTypes'
import { useConfig } from './useConfig'
import { useMemoize } from '@vueuse/core'

/**
 * Splits string a number of times and returns the remainder as a the last element of the array.
 */
function splitRemainder(
  str: string,
  separator: string,
  limit: number,
): string[] {
  const pieces = str.split(separator)
  if (pieces.length > limit) {
    const rest = pieces.splice(0, limit)
    rest.push(pieces.join(separator))
    return rest
  }
  return pieces
}

/**
 * Resolves any author aliases.
 */
export function findRealName(sig: Signature, config: Config): Signature {
  const aliases = config.authorAliases.find(({ aliases }) =>
    aliases.includes(sig.name),
  )
  const name = aliases ? aliases.realName : sig.name
  return { ...sig, name }
}

/**
 * Adds additional properties to the default gitstat dataset.
 * Returns an array of extended commits ordered by their commit timestamp.
 */
export function useExtendedCommits() {
  const { data } = useGitData()
  const { config } = useConfig()

  const memo = useMemoize(
    (data: GitStatData | undefined, config: Config) => {
      const extendedCommits: ExtendedCommit[] = []
      if (data) {
        data.projects.forEach((project: Project) => {
          project.commits.forEach((commit: Commit) => {
            const author = findRealName(commit.author, config)
            if (
              config.excludeAuthors &&
              config.excludeAuthors.includes(author.name)
            ) {
              return
            }

            let excluded = config.excludeCommits.includes(commit.hash)
            if (!excluded) {
              excluded = !config.includeMergeCommits && commit.isMerge
            }

            const extendedFiles = getExtendedFiles(commit, excluded, config)
            const commitMutations = calculateTotalMutations(
              extendedFiles,
              excluded,
            )
            const [title, description] = splitRemainder(commit.message, '\n', 1)
            extendedCommits.push({
              ...commit,
              project: project.name,
              title: title?.trim() || '',
              description: description?.trim() || '',
              author,
              committer: findRealName(commit.committer, config),
              extendedFiles: extendedFiles,
              ...commitMutations,
              excluded:
                commitMutations.deletions === 0 &&
                commitMutations.additions === 0,
            })
          })
        })
      }
      extendedCommits.sort(sortCommitsByTime)
      return extendedCommits
    },
    { getKey: (_, c) => JSON.stringify(c) },
  )

  return computed(() => memo(data.value, config.value))
}

function sortCommitsByTime(a: ExtendedCommit, b: ExtendedCommit) {
  return a.committer.time < b.committer.time ? -1 : 1
}

/**
 * Sets the `excluded`-value on commit files based on a given configuration
 * and filters out any files that are renamed.
 *
 * Exclusion file filters override inclusion file filters.
 */
export const getExtendedFiles = (
  commit: Commit,
  commitExcluded: boolean,
  config: Config,
): ExtendedCommitFile[] => {
  const includeFileFilters = config.includeFileFilters
    .filter((value) => !!value)
    .map((value) => new RegExp(value))
  const excludeFileFilters = config.excludeFileFilters
    .filter((value) => !!value)
    .map((value) => new RegExp(value))

  return commit.files
    .filter((file) => typeof file.renameTo === 'undefined') // Rename origin files can be ignored completely
    .map((file): ExtendedCommitFile => {
      let excluded = commitExcluded

      if (!excluded) {
        excluded = excludeFileFilters.some((excludeFilter): boolean =>
          excludeFilter.test(file.filepath),
        )
      }

      if (!excluded) {
        excluded = !includeFileFilters.some((includeFilter): boolean =>
          includeFilter.test(file.filepath),
        )
      }

      if (!excluded) {
        excluded = file.similarity === 100
      }

      return {
        ...file,
        excluded,
      }
    })
}

/**
 * Calculates the addition/deletion statistics for a set of commit files.
 *
 * Should be run after applying any inclusion/exclusion file filters.
 */
export const calculateTotalMutations = (
  files: ExtendedCommitFile[],
  commitExcluded: boolean,
): CommitMutations => {
  return files.reduce(
    (acc, file: ExtendedCommitFile): CommitMutations => {
      if (!file.isBinary) {
        if (!file.excluded && !commitExcluded) {
          acc.additions += file.additions
          acc.deletions += file.deletions
        }
        acc.rawAdditions += file.rawAdditions
        acc.rawDeletions += file.rawDeletions
      }
      return acc
    },
    {
      additions: 0,
      deletions: 0,
      rawAdditions: 0,
      rawDeletions: 0,
    },
  )
}
