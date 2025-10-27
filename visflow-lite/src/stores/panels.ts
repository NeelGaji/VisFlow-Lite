import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePanelsStore = defineStore('panels', () => {
  // State
  const nodePanelVisible = ref(true)
  const quickNodePanelVisible = ref(false)
  const historyPanelVisible = ref(false)
  const logPanelVisible = ref(false)

  // Actions
  function toggleNodePanel() {
    nodePanelVisible.value = !nodePanelVisible.value
  }

  function openQuickNodePanel() {
    quickNodePanelVisible.value = true
  }

  function closeQuickNodePanel() {
    quickNodePanelVisible.value = false
  }

  function toggleHistoryPanel() {
    historyPanelVisible.value = !historyPanelVisible.value
  }

  function closeHistoryPanel() {
    historyPanelVisible.value = false
  }

  function openLogPanel() {
    logPanelVisible.value = true
  }

  function closeLogPanel() {
    logPanelVisible.value = false
  }

  return {
    // State
    nodePanelVisible,
    quickNodePanelVisible,
    historyPanelVisible,
    logPanelVisible,
    // Actions
    toggleNodePanel,
    openQuickNodePanel,
    closeQuickNodePanel,
    toggleHistoryPanel,
    closeHistoryPanel,
    openLogPanel,
    closeLogPanel,
  }
})
