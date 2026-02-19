import { useDataflowStore } from '@/stores/dataflow'
import { usePanelsStore } from '@/stores/panels'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

export function useAppHeader() {
  const dataflowStore = useDataflowStore()
  const panelsStore = usePanelsStore()
  const router = useRouter()
  const { imagesViewActive } = storeToRefs(panelsStore)

  async function handleNewWorkflow() {
    try {
      // Load modules if not already loaded
      if (dataflowStore.availableModules.length === 0) {
        await dataflowStore.loadAvailableModules()
      }

      // Create new workflow (backend will generate name)
      await dataflowStore.createNewWorkflow()
    } catch (error) {
      console.error('Failed to create new workflow:', error)
      alert('Failed to create new workflow. Please check the console for details.')
    }
  }

  function toggleImagesView() {
    panelsStore.toggleImagesView()
    if (panelsStore.imagesViewActive) {
      router.push('/images')
    } else {
      router.push('/')
    }
  }

  return {
    handleNewWorkflow,
    currentWorkflowName: dataflowStore.currentWorkflowName,
    imagesViewActive,
    toggleImagesView,
  }
}
