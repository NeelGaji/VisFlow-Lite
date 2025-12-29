import { computed, ref, watch } from 'vue'
import { usePanelsStore } from '@/stores/panels'

export function useVersionTreePanel() {
  const panelsStore = usePanelsStore()
  const svgContent = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isVisible = computed(() => panelsStore.versionTreePanelVisible)
  const workflowId = computed(() => panelsStore.selectedWorkflowForVersionTree)
  const treeUrl = computed(() =>
    workflowId.value ? `http://localhost:8000/api/workflow/${workflowId.value}/tree/svg` : ''
  )

  async function fetchVersionTree() {
    if (!workflowId.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `http://localhost:8000/api/workflow/${workflowId.value}/tree/svg`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch version tree: ${response.statusText}`)
      }

      svgContent.value = await response.text()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load version tree'
      console.error('Error loading version tree:', err)
    } finally {
      isLoading.value = false
    }
  }

  function close() {
    panelsStore.closeVersionTreePanel()
  }

  // Watch for workflow ID changes and fetch the tree
  watch(workflowId, (newId) => {
    if (newId) {
      fetchVersionTree()
    } else {
      svgContent.value = ''
      error.value = null
    }
  })

  return {
    isVisible,
    workflowId,
    svgContent,
    isLoading,
    error,
    treeUrl,
    close,
    fetchVersionTree,
  }
}
