import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { nodeTypes, type NodeType } from './nodeTypes'
import type { NodeData } from './types'

export const useDataflowStore = defineStore('dataflow', () => {
  // State
  const diagramOffsetX = ref(0)
  const diagramOffsetY = ref(0)
  const nodes = ref<NodeData[]>([])
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
    const node: NodeData = {
      id: `node-${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
    }
    nodes.value.push(node)
    return node
  }

  function removeNode(nodeId: string) {
    const index = nodes.value.findIndex((n) => n.id === nodeId)
    if (index !== -1) {
      nodes.value.splice(index, 1)
    }
  }

  return {
    // State
    diagramOffsetX,
    diagramOffsetY,
    nodes,
    canvas,
    // Getters
    availableNodeTypes,
    // Actions
    moveDiagram,
    setCanvas,
    createNode,
    removeNode,
  }
})
