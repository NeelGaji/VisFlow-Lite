import { ref, computed } from 'vue'
import { useDataflowStore } from '@/stores/dataflow'

interface PortProps {
  id: string
  nodeId: string
  portType: 'input' | 'output'
  dataType: string
}

export function usePort(props: PortProps) {
  const portElement = ref<HTMLElement | null>(null)
  const dataflowStore = useDataflowStore()
  
  // State
  const isDragging = ref(false)

  // Computed
  const isConnected = computed(() => {
    // Check if this port has any edges connected to it
    const edges = dataflowStore.edges || []
    if (props.portType === 'input') {
      return edges.some(edge => edge.targetNodeId === props.nodeId && edge.targetPortId === props.id)
    } else {
      return edges.some(edge => edge.sourceNodeId === props.nodeId && edge.sourcePortId === props.id)
    }
  })

  const iconClass = computed(() => {
    // Different icons based on data type (using Font Awesome classes)
    if (props.dataType === 'table') {
      return 'fas fa-square'
    } else if (props.dataType === 'selection') {
      return 'fas fa-circle'
    } else if (props.dataType === 'constants') {
      return 'fas fa-circle'
    }
    // Default for input/output
    if (props.portType === 'input') {
      return 'fas fa-caret-right'
    } else {
      return 'fas fa-caret-left'
    }
  })

  // Get port center coordinates (for edge rendering)
  function getCenterCoordinates(): { x: number; y: number } {
    if (!portElement.value) {
      return { x: 0, y: 0 }
    }
    const rect = portElement.value.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  // Event handlers
  function onPortMouseDown(event: MouseEvent) {
    if (event.button !== 0) return // Only left click

    console.log('Port mousedown:', props.id, props.portType)
    
    isDragging.value = true
    
    // Start edge creation
    dataflowStore.startEdgeCreation({
      sourceNodeId: props.portType === 'output' ? props.nodeId : '',
      sourcePortId: props.portType === 'output' ? props.id : '',
      targetNodeId: props.portType === 'input' ? props.nodeId : '',
      targetPortId: props.portType === 'input' ? props.id : '',
      portType: props.portType,
      dataType: props.dataType,
    })

    event.stopPropagation()
    event.preventDefault()
  }

  return {
    portElement,
    isConnected,
    isDragging,
    iconClass,
    getCenterCoordinates,
    onPortMouseDown,
  }
}
