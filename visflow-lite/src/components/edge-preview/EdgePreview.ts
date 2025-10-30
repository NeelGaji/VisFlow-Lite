import { computed } from 'vue'
import type { EdgeCreationData } from '@/stores/dataflow/types'

interface EdgePreviewProps {
  edgeData: EdgeCreationData
  mouseX: number
  mouseY: number
}

export function useEdgePreview(props: EdgePreviewProps) {
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

  // Convert mouse coordinates to canvas-relative coordinates
  function getCanvasRelativeMouseCoordinates(): { x: number; y: number } {
    const canvasElement = document.querySelector('#dataflow-canvas')
    if (!canvasElement) {
      return { x: props.mouseX, y: props.mouseY }
    }

    const canvasRect = canvasElement.getBoundingClientRect()
    
    return {
      x: props.mouseX - canvasRect.left,
      y: props.mouseY - canvasRect.top,
    }
  }

  // Compute SVG path data for preview edge
  const pathData = computed(() => {
    let sourceX: number, sourceY: number, targetX: number, targetY: number
    const mousePos = getCanvasRelativeMouseCoordinates()

    if (props.edgeData.portType === 'output') {
      // Dragging from output port to mouse
      const source = getPortCoordinates(
        props.edgeData.sourceNodeId,
        props.edgeData.sourcePortId
      )
      sourceX = source.x
      sourceY = source.y
      targetX = mousePos.x
      targetY = mousePos.y
    } else {
      // Dragging from input port to mouse
      sourceX = mousePos.x
      sourceY = mousePos.y
      const target = getPortCoordinates(
        props.edgeData.targetNodeId,
        props.edgeData.targetPortId
      )
      targetX = target.x
      targetY = target.y
    }

    // Create a curved path (Bezier curve)
    const dx = Math.abs(targetX - sourceX)
    const controlPointOffset = Math.min(dx * 0.5, 100)

    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${targetX - controlPointOffset} ${targetY}, ${targetX} ${targetY}`
  })

  return {
    pathData,
  }
}
