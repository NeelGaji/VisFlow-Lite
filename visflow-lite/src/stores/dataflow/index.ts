import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { nodeTypes, type NodeType } from './nodeTypes'
import type { NodeData, EdgeData, EdgeCreationData } from './types'

export const useDataflowStore = defineStore('dataflow', () => {
  // State
  const diagramOffsetX = ref(0)
  const diagramOffsetY = ref(0)
  const nodes = ref<NodeData[]>([])
  const edges = ref<EdgeData[]>([])
  const edgeBeingCreated = ref<EdgeCreationData | null>(null)
  const canvas = ref<any>(null) // Reference to DataflowCanvas component

  // Getters
  const availableNodeTypes = computed(() => {
    return nodeTypes
  })

  // Actions
  function moveDiagram(dx: number, dy: number) {
    diagramOffsetX.value += dx
    diagramOffsetY.value += dy
  }

  function setCanvas(canvasInstance: any) {
    canvas.value = canvasInstance
  }

  function createNode(type: string, x: number, y: number) {
    const nodeType = nodeTypes.find(nt => nt.id === type)
    const node: NodeData = {
      id: `node-${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      label: nodeType?.title || type,
      width: 120,
      height: 80,
      isIconized: false,
      isSelected: false,
      isActive: false,
    }
    nodes.value.push(node)
    return node
  }

  function removeNode(nodeId: string) {
    const index = nodes.value.findIndex((n) => n.id === nodeId)
    if (index !== -1) {
      nodes.value.splice(index, 1)
    }
    // Also remove all edges connected to this node
    edges.value = edges.value.filter(
      (edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
    )
  }

  function createEdge(
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ) {
    // Check if edge already exists
    const exists = edges.value.some(
      (edge) =>
        edge.sourceNodeId === sourceNodeId &&
        edge.sourcePortId === sourcePortId &&
        edge.targetNodeId === targetNodeId &&
        edge.targetPortId === targetPortId
    )
    if (exists) {
      return null
    }

    const edge: EdgeData = {
      id: `edge-${Date.now()}-${Math.random()}`,
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId,
    }
    edges.value.push(edge)
    return edge
  }

  function removeEdge(edgeId: string) {
    const index = edges.value.findIndex((e) => e.id === edgeId)
    if (index !== -1) {
      edges.value.splice(index, 1)
    }
  }

  function startEdgeCreation(data: EdgeCreationData) {
    console.log('Store: startEdgeCreation', data)
    edgeBeingCreated.value = data
  }

  function completeEdgeCreation(
    targetNodeId: string,
    targetPortId: string
  ): EdgeData | null {
    console.log('Store: completeEdgeCreation', { targetNodeId, targetPortId, edgeBeingCreated: edgeBeingCreated.value })
    
    if (!edgeBeingCreated.value) {
      console.log('Store: No edge being created!')
      return null
    }

    const { sourceNodeId, sourcePortId, portType } = edgeBeingCreated.value

    // Determine which is source and which is target based on where drag started
    let finalSourceNodeId: string
    let finalSourcePortId: string
    let finalTargetNodeId: string
    let finalTargetPortId: string

    if (portType === 'output') {
      // Dragged from output to input
      finalSourceNodeId = sourceNodeId
      finalSourcePortId = sourcePortId
      finalTargetNodeId = targetNodeId
      finalTargetPortId = targetPortId
    } else {
      // Dragged from input to output
      finalSourceNodeId = targetNodeId
      finalSourcePortId = targetPortId
      finalTargetNodeId = sourceNodeId
      finalTargetPortId = sourcePortId
    }

    console.log('Store: Creating edge', { finalSourceNodeId, finalSourcePortId, finalTargetNodeId, finalTargetPortId })

    edgeBeingCreated.value = null
    return createEdge(
      finalSourceNodeId,
      finalSourcePortId,
      finalTargetNodeId,
      finalTargetPortId
    )
  }

  function cancelEdgeCreation() {
    console.log('Store: cancelEdgeCreation')
    edgeBeingCreated.value = null
  }

  function loadWorkflow(workflowData: {
    modules: Array<{
      id: number
      name: string
      package: string
      x: number
      y: number
      inputs: Array<{ name: string; type: string }>
      outputs: Array<{ name: string; type: string }>
    }>
    connections: Array<{
      id: number
      source_id: number
      source_port: string
      target_id: number
      target_port: string
    }>
  }) {
    // Clear existing workflow
    nodes.value = []
    edges.value = []

    // Calculate bounding box to center the workflow
    if (workflowData.modules.length === 0) {
      return
    }

    const xs = workflowData.modules.map(m => m.x)
    const ys = workflowData.modules.map(m => m.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)

    // Calculate workflow dimensions
    const workflowWidth = maxX - minX
    const workflowHeight = maxY - minY

    // Target canvas area (conservative estimate to leave room for panels)
    const canvasWidth = 800
    const canvasHeight = 600

    // Add buffer/margin (20% of the workflow size, minimum 100px)
    const bufferX = Math.max(workflowWidth * 0.2, 100)
    const bufferY = Math.max(workflowHeight * 0.2, 100)

    // Calculate required space including buffer
    const requiredWidth = workflowWidth + 2 * bufferX
    const requiredHeight = workflowHeight + 2 * bufferY

    // Calculate scale factor to fit within canvas (if needed)
    const scaleX = requiredWidth > canvasWidth ? canvasWidth / requiredWidth : 1
    const scaleY = requiredHeight > canvasHeight ? canvasHeight / requiredHeight : 1
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down

    // Apply scaling to workflow coordinates
    const scaledMinX = minX * scale
    const scaledMinY = minY * scale
    const scaledMaxX = maxX * scale
    const scaledMaxY = maxY * scale
    const scaledCenterX = (scaledMinX + scaledMaxX) / 2
    const scaledCenterY = (scaledMinY + scaledMaxY) / 2

    // Offset to center the scaled workflow at (400, 300)
    const offsetX = 400 - scaledCenterX
    const offsetY = 300 - scaledCenterY

    console.log('Workflow layout:', {
      original: { minX, minY, maxX, maxY, width: workflowWidth, height: workflowHeight },
      buffer: { x: bufferX, y: bufferY },
      required: { width: requiredWidth, height: requiredHeight },
      scale: scale.toFixed(3),
      final: { centerX: scaledCenterX, centerY: scaledCenterY, offsetX, offsetY }
    })

    // Convert backend modules to frontend nodes with scaling and offset
    nodes.value = workflowData.modules.map((module) => ({
      id: `node-${module.id}`,
      type: module.name,
      x: module.x * scale + offsetX,
      y: module.y * scale + offsetY,
      label: module.name,
      width: 120,
      height: 80,
      isIconized: false,
      isSelected: false,
      isActive: false,
    }))

    // Convert backend connections to frontend edges
    edges.value = workflowData.connections.map((conn) => ({
      id: `edge-${conn.id}`,
      sourceNodeId: `node-${conn.source_id}`,
      sourcePortId: conn.source_port,
      targetNodeId: `node-${conn.target_id}`,
      targetPortId: conn.target_port,
    }))

    console.log('Loaded workflow:', {
      modules: nodes.value.length,
      connections: edges.value.length,
    })
  }

  function clearWorkflow() {
    nodes.value = []
    edges.value = []
  }

  return {
    // State
    diagramOffsetX,
        diagramOffsetY,
    nodes,
    edges,
    edgeBeingCreated,
    canvas,
    // Getters
    availableNodeTypes,
    // Actions
    moveDiagram,
    setCanvas,
    createNode,
    removeNode,
    createEdge,
    removeEdge,
    startEdgeCreation,
    completeEdgeCreation,
    cancelEdgeCreation,
    loadWorkflow,
    clearWorkflow,
  }
})
