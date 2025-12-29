import { computed } from 'vue'
import { usePanelsStore } from '@/stores/panels'

export function useWorkflowPanel() {
  const panelsStore = usePanelsStore()

  const isVisible = computed(() => {
    return panelsStore.workflowPanelVisible
  })

  return {
    isVisible,
  }
}
