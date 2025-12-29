import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInteractionStore, type Point } from '@/stores/interaction'
import { useDataflowStore } from '@/stores/dataflow'
import { useHistoryStore } from '@/stores/history'
import type { NodeData } from '@/stores/dataflow/types'

enum DragMode {
  NONE = 'none',
  PAN = 'pan',
  SELECT = 'select',
  NODE_DRAG = 'node-drag',
  PORT_DRAG = 'port-drag',
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

export function useDataflowCanvas() {
  // Template refs
  const nodesContainer = ref<HTMLElement | null>(null)
  const edges = ref<SVGElement | null>(null)

  // Stores
  const interactionStore = useInteractionStore()
  const dataflowStore = useDataflowStore()
  const historyStore = useHistoryStore()
  const { mousePosition, isShiftPressed } = storeToRefs(interactionStore)
  const { nodes: canvasNodes, edges: canvasEdges, edgeBeingCreated } = storeToRefs(dataflowStore)
  const { trackMouseMove, setShiftPressed } = interactionStore
  const { moveDiagram, setCanvas } = dataflowStore

  // Local state for dragging
  const dragMode = ref<DragMode>(DragMode.NONE)
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)
  const dragStartPoint = ref<Point>({ x: 0, y: 0 })
  const dragEndPoint = ref<Point>({ x: 0, y: 0 })
  
  // Node dragging state
  const draggedNodeIds = ref<Set<string>>(new Set())
  const nodeStartPositions = ref<Map<string, Point>>(new Map())
  
  // Port dragging state
  const isPortDragging = ref(false)
  
  // Drag and drop state
  const isDragOver = ref(false)

  // Computed
  const isPanning = computed(() => dragMode.value === DragMode.PAN)
  const isSelecting = computed(() => dragMode.value === DragMode.SELECT)
  const isDraggingNodes = computed(() => dragMode.value === DragMode.NODE_DRAG)
  const isDraggingPort = computed(() => dragMode.value === DragMode.PORT_DRAG)

  const selectBox = computed<Box>(() => {
    const xl = Math.min(dragStartPoint.value.x, dragEndPoint.value.x)
    const xr = Math.max(dragStartPoint.value.x, dragEndPoint.value.x)
    const yl = Math.min(dragStartPoint.value.y, dragEndPoint.value.y)
    const yr = Math.max(dragStartPoint.value.y, dragEndPoint.value.y)
    return {
      x: xl,
      y: yl,
      width: xr - xl,
      height: yr - yl,
    }
  })

  const selectBoxStyle = computed(() => {
    const box = selectBox.value
    return {
      left: box.x + 'px',
      top: box.y + 'px',
      width: box.width + 'px',
      height: box.height + 'px',
    }
  })

  // Node/Edge management methods
  function onNodeMouseDown(event: MouseEvent, nodeId: string) {
    // Only respond to left click
    if (event.button !== 0) return
    
    console.log('Starting node drag for:', nodeId)
    
    // Enter node drag mode
    dragMode.value = DragMode.NODE_DRAG
    
    // For now, just drag the single clicked node
    // Later we'll support dragging multiple selected nodes
    draggedNodeIds.value = new Set([nodeId])
    
    // Store initial positions
    const node = canvasNodes.value.find(n => n.id === nodeId)
    if (node) {
      nodeStartPositions.value.set(nodeId, { x: node.x, y: node.y })
      console.log('Node initial position:', node.x, node.y)
    }
    
    lastMouseX.value = event.pageX
    lastMouseY.value = event.pageY
    
    event.stopPropagation()
    event.preventDefault()
  }

  // Canvas utility methods
  function getWidth(): number {
    return nodesContainer.value?.offsetWidth || 0
  }

  function getHeight(): number {
    return nodesContainer.value?.offsetHeight || 0
  }

  // Keyboard event handlers
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      setShiftPressed(true)
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      // Delete selected edge
      if (dataflowStore.selectedEdgeId) {
        dataflowStore.removeEdge(dataflowStore.selectedEdgeId)
        dataflowStore.selectEdge(null)
        event.preventDefault()
      }
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      setShiftPressed(false)
    }
  }

  // Mouse event handlers
  function onMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement
    
    // Port clicks are handled by Port component via startEdgeCreation
    // which triggers the watcher to set PORT_DRAG mode
    
    // Check if clicking on a node
    const nodeElement = target.closest('.node') as HTMLElement
    if (nodeElement && nodeElement.dataset.nodeId) {
      // Clicking on a node - start node drag
      onNodeMouseDown(event, nodeElement.dataset.nodeId)
      return
    }

    // Only respond to left click on the SVG background for panning/selecting
    if (event.target !== edges.value || event.button !== 0) {
      dragMode.value = DragMode.NONE
      return
    }

    // Choose mode based on Shift key
    dragMode.value = isShiftPressed.value ? DragMode.SELECT : DragMode.PAN
    dragStartPoint.value = dragEndPoint.value = { x: event.pageX, y: event.pageY }
    lastMouseX.value = event.pageX
    lastMouseY.value = event.pageY
    event.preventDefault()
  }

  function onMouseMove(event: MouseEvent) {
    trackMouseMove({ x: event.pageX, y: event.pageY })

    if (dragMode.value === DragMode.PAN) {
      const dx = event.pageX - lastMouseX.value
      const dy = event.pageY - lastMouseY.value
      moveDiagram(dx, dy)
      lastMouseX.value = event.pageX
      lastMouseY.value = event.pageY
    } else if (dragMode.value === DragMode.SELECT) {
      dragEndPoint.value = { x: event.pageX, y: event.pageY }
    } else if (dragMode.value === DragMode.NODE_DRAG) {
      const dx = event.pageX - lastMouseX.value
      const dy = event.pageY - lastMouseY.value
      
      // Update positions for all dragged nodes
      draggedNodeIds.value.forEach(nodeId => {
        const node = canvasNodes.value.find(n => n.id === nodeId)
        if (node) {
          // Update node data in store - Vue will reactively update the UI
          node.x += dx
          node.y += dy
        }
      })
      
      lastMouseX.value = event.pageX
      lastMouseY.value = event.pageY
    } else if (dragMode.value === DragMode.PORT_DRAG) {
      // Port dragging - the edge preview will be handled by the store's edgeBeingCreated
      // Just track mouse position for visual feedback
      trackMouseMove(event)
    }
  }

  function onMouseUp(event: MouseEvent) {
    if (dragMode.value === DragMode.NONE) {
      return
    }

    if (dragMode.value === DragMode.SELECT) {
      // TODO: Select nodes in box (when we have nodes)
      console.log('Selection box:', selectBox.value)
    } else if (dragMode.value === DragMode.NODE_DRAG) {
      // Check if any nodes actually moved
      let hasMoved = false
      const movedNodeLabels: string[] = []

      nodeStartPositions.value.forEach((startPos, nodeId) => {
        const node = canvasNodes.value.find(n => n.id === nodeId)
        if (node && (node.x !== startPos.x || node.y !== startPos.y)) {
          hasMoved = true
          movedNodeLabels.push(node.label || node.type)
        }
      })

      // Add to history if nodes actually moved
      if (hasMoved) {
        const description = movedNodeLabels.length === 1
          ? `Moved ${movedNodeLabels[0]} node`
          : `Moved ${movedNodeLabels.length} nodes`

        historyStore.addEntry('move-node', description, {
          nodes: JSON.parse(JSON.stringify(canvasNodes.value)),
          edges: JSON.parse(JSON.stringify(canvasEdges.value)),
          diagramOffset: {
            x: dataflowStore.diagramOffsetX,
            y: dataflowStore.diagramOffsetY,
          },
        })
      }

      // Clear node drag state
      draggedNodeIds.value.clear()
      nodeStartPositions.value.clear()
    } else if (dragMode.value === DragMode.PORT_DRAG) {
      // Check if mouse is over a valid target port
      // Use elementFromPoint to find what's under the mouse cursor
      const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY)
      const portElement = elementUnderMouse?.closest('.port') as HTMLElement
      
      console.log('Mouse up during port drag:', {
        elementUnderMouse,
        portElement,
        portId: portElement?.dataset.portId,
        nodeId: portElement?.dataset.nodeId,
        edgeBeingCreated: dataflowStore.edgeBeingCreated
      })
      
      if (portElement && portElement.dataset.portId && portElement.dataset.nodeId) {
        // Validate connection direction - can only connect output to input
        const targetPortType = portElement.classList.contains('input') ? 'input' : 'output'
        const sourcePortType = dataflowStore.edgeBeingCreated?.portType
        
        console.log('Port types:', { sourcePortType, targetPortType })
        
        // Only allow output -> input or input -> output (completeEdgeCreation will sort this out)
        if (sourcePortType !== targetPortType) {
          // Complete the edge connection
          const targetNodeId = portElement.dataset.nodeId
          const targetPortId = portElement.dataset.portId
          
          const edge = dataflowStore.completeEdgeCreation(targetNodeId, targetPortId)
          if (edge) {
            console.log('Created edge:', edge)
          } else {
            console.log('Edge creation failed - invalid connection')
          }
        } else {
          console.log('Cannot connect same port types:', sourcePortType, '->', targetPortType)
          dataflowStore.cancelEdgeCreation()
        }
      } else {
        // Released outside a port - cancel edge creation
        console.log('Released outside a port - canceling edge creation')
        dataflowStore.cancelEdgeCreation()
      }
      
      isPortDragging.value = false
    }

    dragMode.value = DragMode.NONE
    dragStartPoint.value = dragEndPoint.value = { x: 0, y: 0 }
  }

  // Drag and drop event handlers
  function onDragOver(event: DragEvent) {
    // Check if it's a node type being dragged
    if (event.dataTransfer?.types.includes('application/visflow-node-type')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      isDragOver.value = true
    }
  }

  function onDragLeave(event: DragEvent) {
    isDragOver.value = false
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = false

    const nodeType = event.dataTransfer?.getData('application/visflow-node-type')
    if (!nodeType) return

    // Calculate position relative to canvas, accounting for diagram offset
    const canvasRect = nodesContainer.value?.getBoundingClientRect()
    if (!canvasRect) return

    const x = event.clientX - canvasRect.left - dataflowStore.diagramOffsetX
    const y = event.clientY - canvasRect.top - dataflowStore.diagramOffsetY

    console.log('Creating node:', nodeType, 'at', x, y)

    // Create the node - it will automatically appear via Vue reactivity
    dataflowStore.createNode(nodeType, x, y)
  }

  // Lifecycle
  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    
    // Register canvas instance with store (for future use with edges, etc.)
    setCanvas({
      getWidth,
      getHeight,
    })
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    setCanvas(null)
  })

  // Watch for edge creation to set port drag mode
  watch(edgeBeingCreated, (newVal) => {
    if (newVal) {
      console.log('Edge creation started, setting PORT_DRAG mode')
      dragMode.value = DragMode.PORT_DRAG
      isPortDragging.value = true
    } else if (dragMode.value === DragMode.PORT_DRAG) {
      console.log('Edge creation ended, clearing PORT_DRAG mode')
      dragMode.value = DragMode.NONE
      isPortDragging.value = false
    }
  })

  return {
    // Refs
    nodesContainer,
    // State
    canvasNodes,
    canvasEdges,
    edgeBeingCreated,
    mousePosition,
    isPanning,
    isSelecting,
    isDraggingNodes,
    isDraggingPort,
    isPortDragging,
    isDragOver,
    selectBoxStyle,
    // Methods
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
