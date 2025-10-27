import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInteractionStore, type Point } from '@/stores/interaction'
import { useDataflowStore } from '@/stores/dataflow'
import type { NodeData } from '@/stores/dataflow/types'

enum DragMode {
  NONE = 'none',
  PAN = 'pan',
  SELECT = 'select',
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

export function useDataflowCanvas() {
  // Template refs
  const nodes = ref<HTMLElement | null>(null)
  const edges = ref<SVGElement | null>(null)

  // Stores
  const interactionStore = useInteractionStore()
  const dataflowStore = useDataflowStore()
  const { mousePosition, isShiftPressed } = storeToRefs(interactionStore)
  const { trackMouseMove, setShiftPressed } = interactionStore
  const { moveDiagram, setCanvas } = dataflowStore

  // Local state for dragging
  const dragMode = ref<DragMode>(DragMode.NONE)
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)
  const dragStartPoint = ref<Point>({ x: 0, y: 0 })
  const dragEndPoint = ref<Point>({ x: 0, y: 0 })

  // Computed
  const isPanning = computed(() => dragMode.value === DragMode.PAN)
  const isSelecting = computed(() => dragMode.value === DragMode.SELECT)

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
  function addNode(node: NodeData): HTMLDivElement {
    if (!nodes.value) {
      throw new Error('Canvas nodes container not ready')
    }
    
    // Create a simple placeholder div for the node
    const nodeElement = document.createElement('div')
    nodeElement.id = node.id
    nodeElement.className = 'node-placeholder'
    nodeElement.style.position = 'absolute'
    nodeElement.style.left = `${node.x}px`
    nodeElement.style.top = `${node.y}px`
    nodeElement.style.width = '100px'
    nodeElement.style.height = '60px'
    nodeElement.style.backgroundColor = '#fff'
    nodeElement.style.border = '2px solid #333'
    nodeElement.style.borderRadius = '4px'
    nodeElement.style.padding = '8px'
    nodeElement.textContent = `${node.type}\n(${node.id.slice(0, 8)}...)`
    
    nodes.value.appendChild(nodeElement)
    return nodeElement
  }

  function removeNode(nodeId: string) {
    if (!nodes.value) return
    
    const nodeElement = document.getElementById(nodeId)
    if (nodeElement && nodeElement.parentElement === nodes.value) {
      nodes.value.removeChild(nodeElement)
    }
  }

  function addEdge(edgeData: any) {
    // Placeholder for edge addition
    console.log('addEdge called (not implemented yet)', edgeData)
  }

  function removeEdge(edgeId: string) {
    // Placeholder for edge removal
    console.log('removeEdge called (not implemented yet)', edgeId)
  }

  function getWidth(): number {
    return nodes.value?.offsetWidth || 0
  }

  function getHeight(): number {
    return nodes.value?.offsetHeight || 0
  }

  // Keyboard event handlers
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      setShiftPressed(true)
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      setShiftPressed(false)
    }
  }

  // Mouse event handlers
  function onMouseDown(event: MouseEvent) {
    // Only respond to left click on the SVG background
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
    }
  }

  function onMouseUp(event: MouseEvent) {
    if (dragMode.value === DragMode.NONE) {
      return
    }

    if (dragMode.value === DragMode.SELECT) {
      // TODO: Select nodes in box (when we have nodes)
      console.log('Selection box:', selectBox.value)
    }

    dragMode.value = DragMode.NONE
    dragStartPoint.value = dragEndPoint.value = { x: 0, y: 0 }
  }

  // Lifecycle
  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    
    // Register canvas instance with store
    setCanvas({
      addNode,
      removeNode,
      addEdge,
      removeEdge,
      getWidth,
      getHeight,
    })
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    setCanvas(null)
  })

  return {
    // Refs
    nodes,
    edges,
    // State
    mousePosition,
    isPanning,
    isSelecting,
    selectBoxStyle,
    // Methods
    onMouseDown,
    onMouseMove,
    onMouseUp,
    addNode,
    removeNode,
    addEdge,
    removeEdge,
  }
}
