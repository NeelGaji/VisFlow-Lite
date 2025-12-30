import { useDataflowStore } from '@/stores/dataflow'

export function useAppHeader() {
  const dataflowStore = useDataflowStore()

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

  return {
    handleNewWorkflow,
    currentWorkflowName: dataflowStore.currentWorkflowName,
  }
}
