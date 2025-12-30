import { storeToRefs } from 'pinia'
import { usePanelsStore } from '@/stores/panels'
import { useDataflowStore } from '@/stores/dataflow'

export function useOptionsMenu() {
  const panelsStore = usePanelsStore()
  const dataflowStore = useDataflowStore()
  const { nodePanelVisible, historyPanelVisible } = storeToRefs(panelsStore)
  const { toggleNodePanel, toggleHistoryPanel } = panelsStore
  const { showBackendOverlay: backendOverlayVisible } = storeToRefs(dataflowStore)
  const { toggleBackendOverlay } = dataflowStore

  return {
    nodePanelVisible,
    historyPanelVisible,
    backendOverlayVisible,
    toggleNodePanel,
    toggleHistoryPanel,
    toggleBackendOverlay,
  }
}
