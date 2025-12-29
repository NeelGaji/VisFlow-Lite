import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePanelsStore = defineStore('panels', () => {
  // State
  const nodePanelVisible = ref(true)
  const quickNodePanelVisible = ref(false)
  const historyPanelVisible = ref(false)
  const logPanelVisible = ref(false)
  const workflowPanelVisible = ref(true)
  const versionTreePanelVisible = ref(false)
  const selectedWorkflowForVersionTree = ref<string | null>(null)

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

  function toggleWorkflowPanel() {
    workflowPanelVisible.value = !workflowPanelVisible.value
  }

  function openVersionTreePanel(workflowId: string) {
    selectedWorkflowForVersionTree.value = workflowId
    versionTreePanelVisible.value = true
  }

  function closeVersionTreePanel() {
    versionTreePanelVisible.value = false
    selectedWorkflowForVersionTree.value = null
  }

  return {
    // State
    nodePanelVisible,
    quickNodePanelVisible,
    historyPanelVisible,
    logPanelVisible,
    workflowPanelVisible,
    versionTreePanelVisible,
    selectedWorkflowForVersionTree,
    // Actions
    toggleNodePanel,
    openQuickNodePanel,
    closeQuickNodePanel,
    toggleHistoryPanel,
    closeHistoryPanel,
    openLogPanel,
    closeLogPanel,
    toggleWorkflowPanel,
    openVersionTreePanel,
    closeVersionTreePanel,
  }
})
