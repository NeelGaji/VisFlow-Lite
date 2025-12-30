import { ref, computed } from 'vue'
import { useDataflowStore } from '@/stores/dataflow'
import type { PortSpec } from '@/stores/dataflow/types'

// Constants - VisTrails defaults
const PORT_SIZE = 8 // pixels - VisTrails port size (SVG uses 8x8)
const PORT_MARGIN = 2 // pixels - matches original PORT_MARGIN_PX (not used in VisTrails style)
const ICONIZED_SIZE = 40 // pixels
const DEFAULT_WIDTH = 120 // VisTrails default module width
const DEFAULT_HEIGHT = 60 // VisTrails default module height

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
  inputs?: PortSpec[]
  outputs?: PortSpec[]
}

// Estimate text width for module sizing (matches VisTrails calculation)
// Uses ~0.6 * font_size per character for Arial bold 14px
function estimateTextWidth(text: string, fontSize: number = 14): number {
  const charWidth = fontSize * 0.6
  return text.length * charWidth
}

export function useNode(props: NodeProps) {
  const nodeElement = ref<HTMLElement | null>(null)
  const dataflowStore = useDataflowStore()

  // Computed properties
  const actualWidth = computed(() => {
    if (props.isIconized) return ICONIZED_SIZE

    // If width is explicitly set, use it
    if (props.width) return props.width

    // Otherwise, calculate based on label text (VisTra ils style)
    if (props.label) {
      const textWidth = estimateTextWidth(props.label)
      const minWidth = 80
      // Add padding: 20px on each side
      return Math.max(minWidth, textWidth + 40)
    }

    return DEFAULT_WIDTH
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

  // Generate ports from props or use defaults
  const inputPorts = computed<Port[]>(() => {
    // If props.inputs is defined (even if empty), use it
    if (props.inputs !== undefined) {
      const ports = props.inputs.map((portSpec) => ({
        id: portSpec.name,
        type: 'input',
        dataType: portSpec.type
      }))
      console.log(`[Node ${props.id}] Input ports:`, ports.length, ports)
      return ports
    }
    // Default fallback for nodes created manually (not from backend)
    console.log(`[Node ${props.id}] Using default input port`)
    return [{ id: 'in-0', type: 'input', dataType: 'table' }]
  })

  const outputPorts = computed<Port[]>(() => {
    // If props.outputs is defined (even if empty), use it
    if (props.outputs !== undefined) {
      const ports = props.outputs.map((portSpec) => ({
        id: portSpec.name,
        type: 'output',
        dataType: portSpec.type
      }))
      console.log(`[Node ${props.id}] Output ports:`, ports.length, ports)
      return ports
    }
    // Default fallback for nodes created manually (not from backend)
    console.log(`[Node ${props.id}] Using default output port`)
    return [{ id: 'out-0', type: 'output', dataType: 'table' }]
  })

  // Port positioning - VisTrails style
  // Input ports: top edge, left to right
  // Output ports: bottom edge, right to left
  function getPortStyle(port: Port, index: number, isInput: boolean) {
    const ports = isInput ? inputPorts.value : outputPorts.value
    const count = ports.length
    const edgePadding = 8 // Distance from module edge (inside box)
    const portSpacing = PORT_SIZE + 4 // Space between ports
    const width = actualWidth.value

    if (isInput) {
      // Input ports: top-left, going left to right
      const left = edgePadding + index * portSpacing
      const top = edgePadding

      return {
        left: `${left}px`,
        top: `${top}px`,
      }
    } else {
      // Output ports: bottom-right, going right to left
      // First port (index 0) is rightmost: width - edgePadding - PORT_SIZE
      // Each subsequent port moves left by portSpacing
      const left = width - edgePadding - PORT_SIZE - (index * portSpacing)
      const bottom = edgePadding

      return {
        left: `${left}px`,
        bottom: `${bottom}px`,
      }
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
