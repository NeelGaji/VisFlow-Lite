import { storeToRefs } from 'pinia'
import { usePanelsStore } from '@/stores/panels'

export function useOptionsMenu() {
  const panelsStore = usePanelsStore()
  const { nodePanelVisible } = storeToRefs(panelsStore)
  const { toggleNodePanel } = panelsStore

  return {
    nodePanelVisible,
    toggleNodePanel,
  }
}
