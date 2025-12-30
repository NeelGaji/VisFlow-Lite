import { computed, ref, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataflowStore } from '@/stores/dataflow'
import type { EdgeData } from '@/stores/dataflow/types'

interface EdgeProps {
  edgeData: EdgeData
}

export function useEdge(props: EdgeProps) {
  const dataflowStore = useDataflowStore()
  const { nodes, selectedEdgeId } = storeToRefs(dataflowStore)
  const { selectEdge } = dataflowStore

  // State
  const isSelected = computed(() => selectedEdgeId.value === props.edgeData.id)
  const retryCount = ref(0) // Force recompute when ports are ready

  // Handle edge click
  function onEdgeClick(event: MouseEvent) {
    event.stopPropagation()
    selectEdge(props.edgeData.id)
  }

  // Get port element by searching in DOM
  function getPortElement(nodeId: string, portId: string): HTMLElement | null {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`)
    if (!nodeElement) return null
    
    const portElement = nodeElement.querySelector(`[data-port-id="${portId}"]`) as HTMLElement
    return portElement
  }

  // Get port center coordinates in LOCAL space (before transform)
  function getPortCoordinates(nodeId: string, portId: string): { x: number; y: number } {
    const portElement = getPortElement(nodeId, portId)
    if (!portElement) {
      console.warn(`[Edge ${props.edgeData.id}] Port not found: node=${nodeId}, port=${portId}`)
      return { x: 0, y: 0 }
    }

    const nodeElement = portElement.closest('.node') as HTMLElement
    if (!nodeElement) {
      console.warn(`[Edge ${props.edgeData.id}] Node element not found for port`)
      return { x: 0, y: 0 }
    }

    // Get node's position in local coordinates (from style)
    const nodeStyle = window.getComputedStyle(nodeElement)
    const nodeLeft = parseFloat(nodeStyle.left) || 0
    const nodeTop = parseFloat(nodeStyle.top) || 0

    // Get port's offset within the node
    const portStyle = window.getComputedStyle(portElement)
    const portLeft = parseFloat(portStyle.left) || 0
    const portTop = parseFloat(portStyle.top) || 0
    const portWidth = parseFloat(portStyle.width) || 0
    const portHeight = parseFloat(portStyle.height) || 0

    // Calculate coordinates in local space (before transform)
    return {
      x: nodeLeft + portLeft + portWidth / 2,
      y: nodeTop + portTop + portHeight / 2,
    }
  }

  // Compute SVG path data
  // This is reactive because it depends on the connected nodes' positions
  const pathData = computed(() => {
    // Include retryCount to force recomputation when ports become available
    const _ = retryCount.value

    // Find the nodes this edge connects
    const sourceNode = nodes.value.find(n => n.id === props.edgeData.sourceNodeId)
    const targetNode = nodes.value.find(n => n.id === props.edgeData.targetNodeId)

    // Access x, y to make this reactive to position changes
    if (sourceNode) { const __ = sourceNode.x + sourceNode.y }
    if (targetNode) { const __ = targetNode.x + targetNode.y }

    const source = getPortCoordinates(
      props.edgeData.sourceNodeId,
      props.edgeData.sourcePortId
    )
    const target = getPortCoordinates(
      props.edgeData.targetNodeId,
      props.edgeData.targetPortId
    )

    // Create a curved path (Vertical Bezier curve - VisTrails style)
    // Output ports are at bottom, input ports at top, so curve goes down then up
    const verticalDistance = Math.abs(target.y - source.y)
    const controlOffset = verticalDistance * 0.4

    // Control points offset vertically (not horizontally like before)
    const control1X = source.x
    const control1Y = source.y + controlOffset
    const control2X = target.x
    const control2Y = target.y - controlOffset

    return `M ${source.x} ${source.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${target.x} ${target.y}`
  })

  // Retry finding ports after DOM updates
  onMounted(() => {
    // Wait for next tick to ensure all nodes/ports are rendered
    nextTick(() => {
      retryCount.value++
    })

    // Also retry after a short delay for safety
    setTimeout(() => {
      retryCount.value++
    }, 100)
  })

  // Stroke color (match backend: black stroke)
  const strokeColor = computed(() => {
    return isSelected.value ? '#0d6efd' : '#000'
  })

  return {
    pathData,
    strokeColor,
    isSelected,
    onEdgeClick,
  }
}
