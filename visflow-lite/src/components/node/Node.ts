import { ref, computed } from 'vue'
import { useDataflowStore } from '@/stores/dataflow'

// Constants
const PORT_SIZE = 15 // pixels - matches original PORT_SIZE_PX
const PORT_MARGIN = 2 // pixels - matches original PORT_MARGIN_PX
const ICONIZED_SIZE = 40 // pixels
const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 80

export interface Port {
  id: string
  type: string
  dataType: string
}

interface NodeProps {
  id: string
  type: string
  x: number
  y: number
  label?: string
  width?: number
  height?: number
  isIconized?: boolean
  isSelected?: boolean
  isActive?: boolean
}

export function useNode(props: NodeProps) {
  const nodeElement = ref<HTMLElement | null>(null)
  const dataflowStore = useDataflowStore()

  // Computed properties
  const actualWidth = computed(() => {
    if (props.isIconized) return ICONIZED_SIZE
    return props.width || DEFAULT_WIDTH
  })

  const actualHeight = computed(() => {
    if (props.isIconized) return ICONIZED_SIZE
    return props.height || DEFAULT_HEIGHT
  })

  const nodeStyle = computed(() => ({
    left: `${props.x}px`,
    top: `${props.y}px`,
    width: `${actualWidth.value}px`,
    height: `${actualHeight.value}px`,
  }))

  const iconPath = computed(() => {
    return `/icons/${props.type}.svg`
  })

  const showLabel = computed(() => {
    return props.label !== undefined && props.label !== ''
  })

  // Ports (to be overridden by specific node types)
  const inputPorts = ref<Port[]>([
    { id: 'in-0', type: 'input', dataType: 'table' }
  ])
  const outputPorts = ref<Port[]>([
    { id: 'out-0', type: 'output', dataType: 'table' }
  ])

  // Port positioning
  function getPortStyle(port: Port, index: number, isInput: boolean) {
    const ports = isInput ? inputPorts.value : outputPorts.value
    const count = ports.length
    const totalHeight = count * PORT_SIZE + (count - 1) * PORT_MARGIN
    const top = actualHeight.value / 2 - totalHeight / 2 + index * (PORT_SIZE + PORT_MARGIN)

    return {
      // Position ports completely outside the node (matches original at -PORT_SIZE_PX)
      // The visual "touching" effect comes from the border-touch styling
      left: isInput ? `-${PORT_SIZE}px` : `${actualWidth.value}px`,
      top: `${top}px`,
    }
  }

  // Event handlers
  function onMouseDown(event: MouseEvent) {
    // Select this node on click
    dataflowStore.selectNode(props.id)

    // Node dragging will be handled by the canvas
    // Don't stop propagation - let the canvas handle it
  }

  return {
    nodeElement,
    nodeStyle,
    iconPath,
    showLabel,
    inputPorts,
    outputPorts,
    getPortStyle,
    onMouseDown,
  }
}
