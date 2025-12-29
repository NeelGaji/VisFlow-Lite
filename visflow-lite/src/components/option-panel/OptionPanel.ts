import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataflowStore } from '@/stores/dataflow'

export interface OptionPanelProps {
  hasSettings?: boolean
}

export interface OptionPanelEmits {
  (event: 'settings'): void
}

export const useOptionPanel = (
  props: OptionPanelProps,
  emit: OptionPanelEmits
) => {
  const dataflowStore = useDataflowStore()
  const { selectedNodeId } = storeToRefs(dataflowStore)

  // Get the currently selected node
  const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null
    return dataflowStore.nodes.find(n => n.id === selectedNodeId.value)
  })

  // Local reactive state synced with the selected node
  const label = ref('')
  const isIconized = ref(false)
  const isLabelVisible = ref(true)

  // Watch for selected node changes and update local state
  watch(selectedNode, (node) => {
    if (node) {
      label.value = node.label || node.type
      isIconized.value = node.isIconized || false
      isLabelVisible.value = node.isLabelVisible !== false // default to true
    } else {
      label.value = ''
      isIconized.value = false
      isLabelVisible.value = true
    }
  }, { immediate: true })

  const onLabelChange = (newLabel: string) => {
    label.value = newLabel
    if (selectedNode.value) {
      dataflowStore.updateNode(selectedNode.value.id, { label: newLabel })
    }
  }

  const toggleIconized = () => {
    isIconized.value = !isIconized.value
    if (selectedNode.value) {
      dataflowStore.updateNode(selectedNode.value.id, { isIconized: isIconized.value })
    }
  }

  const toggleLabelVisible = () => {
    isLabelVisible.value = !isLabelVisible.value
    if (selectedNode.value) {
      dataflowStore.updateNode(selectedNode.value.id, { isLabelVisible: isLabelVisible.value })
    }
  }

  const onSettings = () => {
    emit('settings')
  }

  return {
    selectedNode,
    label,
    isIconized,
    isLabelVisible,
    onLabelChange,
    toggleIconized,
    toggleLabelVisible,
    onSettings
  }
}
