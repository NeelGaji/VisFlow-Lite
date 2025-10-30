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
  }
})
