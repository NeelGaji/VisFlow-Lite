import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePanelsStore } from '../../stores/panels'
import { useHistoryStore } from '../../stores/history'
import { useDataflowStore } from '../../stores/dataflow'

export function useHistoryPanel() {
  const panelsStore = usePanelsStore()
  const historyStore = useHistoryStore()
  const dataflowStore = useDataflowStore()

  const { history } = storeToRefs(historyStore)

  // Format history entries for display
  const formattedHistory = computed(() => {
    return history.value.map((entry) => {
      const date = new Date(entry.timestamp)
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      return {
        id: entry.id,
        description: entry.description,
        time,
        action: entry.action,
      }
    })
  })

  function closePanel() {
    panelsStore.closeHistoryPanel()
  }

  function handleEntryClick(entryId: string) {
    const entry = historyStore.jumpToEntry(entryId)
    if (entry) {
      restoreState(entry.state)
    }
  }

  function handleUndo() {
    const entry = historyStore.undo()
    if (entry) {
      restoreState(entry.state)
    }
  }

  function handleRedo() {
    const entry = historyStore.redo()
    if (entry) {
      restoreState(entry.state)
    }
  }

  function handleClear() {
    if (confirm('Are you sure you want to clear the history? This cannot be undone.')) {
      historyStore.clearHistory()
    }
  }

  function restoreState(state: any) {
    // Restore the dataflow state
    if (state.nodes) {
      dataflowStore.nodes = state.nodes
    }
    if (state.edges) {
      dataflowStore.edges = state.edges
    }
    if (state.diagramOffset) {
      dataflowStore.diagramOffsetX = state.diagramOffset.x
      dataflowStore.diagramOffsetY = state.diagramOffset.y
    }
  }

  function captureCurrentState() {
    return {
      nodes: JSON.parse(JSON.stringify(dataflowStore.nodes)),
      edges: JSON.parse(JSON.stringify(dataflowStore.edges)),
      diagramOffset: { ...dataflowStore.diagramOffset },
    }
  }

  // Keyboard shortcuts
  function handleKeyDown(event: KeyboardEvent) {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey

    if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      handleUndo()
    } else if (isCtrlOrCmd && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault()
      handleRedo()
    }
  }

  // Setup keyboard listeners
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    panelsStore,
    historyStore,
    formattedHistory,
    closePanel,
    handleEntryClick,
    handleUndo,
    handleRedo,
    handleClear,
    captureCurrentState,
  }
}
