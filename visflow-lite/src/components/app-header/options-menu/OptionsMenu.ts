import { storeToRefs } from 'pinia'
import { usePanelsStore } from '@/stores/panels'

export function useOptionsMenu() {
  const panelsStore = usePanelsStore()
  const { nodePanelVisible, historyPanelVisible } = storeToRefs(panelsStore)
  const { toggleNodePanel, toggleHistoryPanel } = panelsStore

  return {
    nodePanelVisible,
    historyPanelVisible,
    toggleNodePanel,
    toggleHistoryPanel,
  }
}
