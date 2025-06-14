import { ref, shallowRef, triggerRef } from 'vue'
import type { GitStatData } from '../types/gitStatData'

const loading = ref(false)
const gitData = shallowRef<GitStatData>()

export function useGitData() {
  function loadData(data: GitStatData) {
    gitData.value = data
    triggerRef(gitData)
  }

  return {
    data: gitData,
    loading,
    loadData,
  }
}
