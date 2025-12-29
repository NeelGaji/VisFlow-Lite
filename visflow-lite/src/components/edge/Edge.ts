import { computed } from 'vue'
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

  // Get port center coordinates
  function getPortCoordinates(nodeId: string, portId: string): { x: number; y: number } {
    const portElement = getPortElement(nodeId, portId)
    if (!portElement) {
      return { x: 0, y: 0 }
    }
    
    const canvasElement = document.querySelector('#dataflow-canvas')
    if (!canvasElement) {
      return { x: 0, y: 0 }
    }

    const portRect = portElement.getBoundingClientRect()
    const canvasRect = canvasElement.getBoundingClientRect()
    
    // Calculate coordinates relative to canvas
    return {
      x: portRect.left + portRect.width / 2 - canvasRect.left,
      y: portRect.top + portRect.height / 2 - canvasRect.top,
    }
  }

  // Compute SVG path data
  // This is reactive because it depends on the connected nodes' positions
  const pathData = computed(() => {
    // Find the nodes this edge connects
    const sourceNode = nodes.value.find(n => n.id === props.edgeData.sourceNodeId)
    const targetNode = nodes.value.find(n => n.id === props.edgeData.targetNodeId)
    
    // Access x, y to make this reactive to position changes
    if (sourceNode) { const _ = sourceNode.x + sourceNode.y }
    if (targetNode) { const _ = targetNode.x + targetNode.y }
    
    const source = getPortCoordinates(
      props.edgeData.sourceNodeId,
      props.edgeData.sourcePortId
    )
    const target = getPortCoordinates(
      props.edgeData.targetNodeId,
      props.edgeData.targetPortId
    )

    // Create a curved path (Bezier curve)
    const dx = Math.abs(target.x - source.x)
    const controlPointOffset = Math.min(dx * 0.5, 100)

    return `M ${source.x} ${source.y} C ${source.x + controlPointOffset} ${source.y}, ${target.x - controlPointOffset} ${target.y}, ${target.x} ${target.y}`
  })

  // Stroke color
  const strokeColor = computed(() => {
    return isSelected.value ? '#0d6efd' : '#6c757d'
  })

  return {
    pathData,
    strokeColor,
    isSelected,
    onEdgeClick,
  }
}
