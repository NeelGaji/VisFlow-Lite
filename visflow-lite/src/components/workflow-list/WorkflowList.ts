import { ref, onMounted } from 'vue'
import { fetchTaggedWorkflows, fetchWorkflowVersion, type TaggedWorkflow } from '@/services/vistrailsAPI'
import { usePanelsStore } from '@/stores/panels'
import { useDataflowStore } from '@/stores/dataflow'

export function useWorkflowList() {
  const panelsStore = usePanelsStore()
  const dataflowStore = useDataflowStore()
  const workflows = ref<TaggedWorkflow[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedWorkflow = ref<TaggedWorkflow | null>(null)

  async function loadWorkflows() {
    isLoading.value = true
    error.value = null

    try {
      workflows.value = await fetchTaggedWorkflows()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tagged workflows'
      console.error('Error loading tagged workflows:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function selectWorkflow(workflow: TaggedWorkflow) {
    selectedWorkflow.value = workflow

    try {
      console.log('Loading workflow:', {
        vistrail: workflow.vistrailName,
        tag: workflow.tagName,
        version: workflow.versionId,
      })

      // Fetch the workflow data from the backend
      const workflowData = await fetchWorkflowVersion(workflow.vistrailId, workflow.versionId)

      // Load it into the dataflow canvas
      dataflowStore.loadWorkflow(workflowData)

      console.log('Workflow loaded successfully!')
    } catch (err) {
      console.error('Error loading workflow:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load workflow'
    }
  }

  function viewVersionTree(workflow: TaggedWorkflow) {
    // Open version tree panel for the vistrail
    panelsStore.openVersionTreePanel(workflow.vistrailId)
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  // Load workflows on mount
  onMounted(() => {
    loadWorkflows()
  })

  return {
    workflows,
    isLoading,
    error,
    selectedWorkflow,
    loadWorkflows,
    selectWorkflow,
    viewVersionTree,
    formatFileSize,
    formatDate,
  }
}
