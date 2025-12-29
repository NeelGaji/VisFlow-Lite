import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface HistoryEntry {
  id: string
  timestamp: number
  action: string
  description: string
  state: any // Snapshot of dataflow state
}

export const useHistoryStore = defineStore('history', () => {
  // State
  const history = ref<HistoryEntry[]>([])
  const currentIndex = ref(-1)
  const maxHistorySize = ref(50)

  // Computed
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)
  const currentEntry = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < history.value.length) {
      return history.value[currentIndex.value]
    }
    return null
  })

  // Actions
  function addEntry(action: string, description: string, state: any) {
    const entry: HistoryEntry = {
      id: `history-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      action,
      description,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
    }

    // Remove any entries after current index (when adding new entry after undo)
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // Add new entry
    history.value.push(entry)
    currentIndex.value = history.value.length - 1

    // Trim history if it exceeds max size
    if (history.value.length > maxHistorySize.value) {
      const excess = history.value.length - maxHistorySize.value
      history.value = history.value.slice(excess)
      currentIndex.value -= excess
    }
  }

  function undo(): HistoryEntry | null {
    if (!canUndo.value) return null

    currentIndex.value--
    return currentEntry.value || null
  }

  function redo(): HistoryEntry | null {
    if (!canRedo.value) return null

    currentIndex.value++
    return currentEntry.value || null
  }

  function jumpToEntry(entryId: string): HistoryEntry | null {
    const index = history.value.findIndex((e) => e.id === entryId)
    if (index === -1) return null

    currentIndex.value = index
    return currentEntry.value || null
  }

  function clearHistory() {
    history.value = []
    currentIndex.value = -1
  }

  function getEntryAtIndex(index: number): HistoryEntry | null {
    if (index >= 0 && index < history.value.length) {
      return history.value[index] || null
    }
    return null
  }

  return {
    // State
    history,
    currentIndex,
    maxHistorySize,
    // Computed
    canUndo,
    canRedo,
    currentEntry,
    // Actions
    addEntry,
    undo,
    redo,
    jumpToEntry,
    clearHistory,
    getEntryAtIndex,
  }
})
