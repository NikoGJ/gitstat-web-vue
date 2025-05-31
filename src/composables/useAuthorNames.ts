import { computed } from 'vue'
import { useGitData } from '../stores/useGitData'
import type { Config } from '../types/configTypes'
import type {
  Commit,
  GitStatData,
  Project,
  Signature,
} from '../types/gitStatData'
import { useConfig } from './useConfig'
import { useMemoize } from '@vueuse/core'

/**
 * Memoized function returning a list of all author names in the data set.
 * Any aliases are resolved.
 */
export function useRealAuthorNames() {
  const { config } = useConfig()
  const allAuthors = useAuthorSignatures()

  return computed(() => {
    const realNames = allAuthors.value.reduce(
      (names: Set<string>, sig: Signature): Set<string> =>
        names.add(findRealName(sig, config.value).name),
      new Set<string>(),
    )
    const result = Array.from(realNames)
    result.sort(caseInsensitiveSort)
    return result
  })
}

function caseInsensitiveSort(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase())
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
 * Memoized function that returns all author names in the dataset.
 *
 * Ignores any aliases.
 */
export function useAuthorNames() {
  const allAuthors = useAuthorSignatures()

  return computed(() => {
    const realNames = allAuthors.value.reduce(
      (names: Set<string>, sig: Signature): Set<string> => names.add(sig.name),
      new Set<string>(),
    )
    const result = Array.from(realNames)
    result.sort(caseInsensitiveSort)
    return result
  })
}

/**
 * Memoized function that returns all author signatures in the dataset.
 */
function useAuthorSignatures() {
  const { data } = useGitData()
  const memo = useMemoize((data: GitStatData | undefined) => {
    console.log('compute AuthorSignature')
    const originals = new Set<Signature>()
    if (data) {
      data.projects.forEach((project: Project) => {
        project.commits.forEach((commit: Commit) => {
          originals.add(commit.author)
        })
      })
    }
    return Array.from(originals)
  })
  return computed(() => memo(data.value))
}
