import { computed, onMounted } from 'vue'
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

  // Group backend modules by package
  const modulesByPackage = computed(() => {
    const grouped = new Map<string, typeof dataflowStore.availableModules>()

    dataflowStore.availableModules.forEach(module => {
      if (!grouped.has(module.package)) {
        grouped.set(module.package, [])
      }
      grouped.get(module.package)!.push(module)
    })

    return grouped
  })

  // Load modules on mount if not already loaded
  onMounted(async () => {
    if (dataflowStore.availableModules.length === 0 && !dataflowStore.isLoadingModules) {
      try {
        await dataflowStore.loadAvailableModules()
      } catch (error) {
        console.error('Failed to load modules:', error)
      }
    }
  })

  return {
    isVisible,
    modulesByPackage,
    isLoadingModules: dataflowStore.isLoadingModules,
  }
}
