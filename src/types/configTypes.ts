//import { KeysOfType } from '../../types/util';

export interface Aliases {
  realName: string
  aliases: string[]
}

export interface Config {
  includeMergeCommits: boolean
  includeFileFilters: string[]
  excludeFileFilters: string[]
  authorAliases: Aliases[]
  excludeAuthors: string[]
  excludeCommits: string[]
}
