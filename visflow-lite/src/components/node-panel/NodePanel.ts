import { computed } from 'vue'
import { usePanelsStore } from '@/stores/panels'
import { useDataflowStore } from '@/stores/dataflow'

export function useNodePanel() {
  const panelsStore = usePanelsStore()
  const dataflowStore = useDataflowStore()

  // For now, we'll assume isSystemInVisMode is false
  // This will be properly implemented when we migrate the interaction store
  const isSystemInVisMode = false

  const isVisible = computed(() => {
    return panelsStore.nodePanelVisible && !isSystemInVisMode
  })

  const availableNodeTypes = computed(() => {
    return dataflowStore.availableNodeTypes
  })

  return {
    isVisible,
    availableNodeTypes,
  }
}
