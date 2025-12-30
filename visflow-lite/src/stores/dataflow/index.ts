import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { nodeTypes, type NodeType } from './nodeTypes'
import type { NodeData, EdgeData, EdgeCreationData, BackendModule } from './types'
import { useHistoryStore } from '../history'
import * as api from '@/services/api'

export const useDataflowStore = defineStore('dataflow', () => {
  // State
  const diagramOffsetX = ref(0)
  const diagramOffsetY = ref(0)
  const zoomLevel = ref(1) // 1 = 100%, 0.5 = 50%, 2 = 200%
  const nodes = ref<NodeData[]>([])
  const edges = ref<EdgeData[]>([])
  const edgeBeingCreated = ref<EdgeCreationData | null>(null)
  const canvas = ref<any>(null) // Reference to DataflowCanvas component
  const selectedNodeId = ref<string | null>(null)
  const selectedEdgeId = ref<string | null>(null)
  const backendSvgContent = ref<string | null>(null) // Backend SVG for overlay comparison
  const showBackendOverlay = ref(false) // Toggle for showing backend SVG overlay

  // Backend integration state
  const currentWorkflowId = ref<string | null>(null)
  const currentWorkflowName = ref<string | null>(null)
  const availableModules = ref<BackendModule[]>([])
  const moduleRegistry = ref<Map<string, BackendModule>>(new Map())
  const isLoadingModules = ref(false)

  // Getters
  const availableNodeTypes = computed(() => {
    return nodeTypes
  })

  const diagramOffset = computed(() => ({
    x: diagramOffsetX.value,
    y: diagramOffsetY.value,
  }))

  // Helper function to capture current state
  function captureState() {
    return {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
      diagramOffset: {
        x: diagramOffsetX.value,
        y: diagramOffsetY.value,
      },
    }
  }

  // Helper function to add history entry
  function addToHistory(action: string, description: string) {
    const historyStore = useHistoryStore()
    historyStore.addEntry(action, description, captureState())
  }

  // Actions
  function moveDiagram(dx: number, dy: number) {
    diagramOffsetX.value += dx
    diagramOffsetY.value += dy
  }

  function setZoom(newZoom: number, centerX?: number, centerY?: number) {
    // Clamp zoom between 0.1 (10%) and 5 (500%)
    const clampedZoom = Math.max(0.1, Math.min(5, newZoom))

    // If center point is provided, adjust offset to zoom towards that point
    if (centerX !== undefined && centerY !== undefined) {
      const oldZoom = zoomLevel.value
      const zoomRatio = clampedZoom / oldZoom

      // Calculate the point in world coordinates
      const worldX = (centerX - diagramOffsetX.value) / oldZoom
      const worldY = (centerY - diagramOffsetY.value) / oldZoom

      // Adjust offset so the world point stays at the same screen position
      diagramOffsetX.value = centerX - worldX * clampedZoom
      diagramOffsetY.value = centerY - worldY * clampedZoom
    }

    zoomLevel.value = clampedZoom
  }

  function resetZoom() {
    zoomLevel.value = 1
  }

  function setCanvas(canvasInstance: any) {
    canvas.value = canvasInstance
  }

  async function createNode(type: string, x: number, y: number) {
    // Check if this is a backend module type (contains ::)
    const isBackendModule = type.includes('::')

    // Auto-create workflow if needed for backend modules
    if (isBackendModule && !currentWorkflowId.value) {
      console.log('No workflow set, creating new workflow...')
      await createNewWorkflow()
    }

    if (isBackendModule && currentWorkflowId.value) {
      // Create node via backend API
      try {
        const response = await api.addModuleToWorkflow(
          currentWorkflowId.value,
          type,
          { x, y }
        )

        // Get module info from registry
        const backendModule = moduleRegistry.value.get(type)
        console.log('Backend module from registry:', type, backendModule)
        console.log('Registry size:', moduleRegistry.value.size)

        // Create frontend node with backend data
        const node: NodeData = {
          id: `node-${response.module_id}`,
          type,
          x,
          y,
          label: backendModule?.name || type.split('::')[1],
          width: 120,
          height: 60,
          isIconized: false,
          isSelected: false,
          isActive: false,
          // Use backend port specifications
          inputs: backendModule?.input_ports.map(p => ({
            name: p.name,
            type: p.type,
            optional: p.optional
          })) || [],
          outputs: backendModule?.output_ports.map(p => ({
            name: p.name,
            type: p.type
          })) || [],
          // Store backend IDs for future operations
          backendModuleId: response.module_id,
          backendModuleType: type,
        }

        nodes.value.push(node)
        addToHistory('create-node', `Created ${node.label} module`)
        return node
      } catch (error) {
        console.error('Failed to create backend module:', error)
        throw error
      }
    } else {
      // Legacy: Create local-only node (for old node types or no workflow)
      const nodeType = nodeTypes.find(nt => nt.id === type)
      const node: NodeData = {
        id: `node-${Date.now()}-${Math.random()}`,
        type,
        x,
        y,
        label: nodeType?.title || type,
        width: 120,
        height: 60,
        isIconized: false,
        isSelected: false,
        isActive: false,
        inputs: nodeType?.defaultInputs || [],
        outputs: nodeType?.defaultOutputs || [],
      }

      // Initialize type-specific fields
      if (type === 'script-editor') {
        node.code = `(input, content, state) => {
  // Process input table(s) and return output table
  // input: single table object or array of table objects
  // content: HTML element for rendering (if enabled)
  // state: persistent state object (if enabled)

  return {
    columns: [],
    rows: [],
  };
};
`
        node.isRenderingEnabled = false
        node.isStateEnabled = false
      }

      nodes.value.push(node)
      addToHistory('create-node', `Created ${nodeType?.title || type} node`)
      return node
    }
  }

  function removeNode(nodeId: string) {
    const node = nodes.value.find((n) => n.id === nodeId)
    const index = nodes.value.findIndex((n) => n.id === nodeId)
    if (index !== -1) {
      nodes.value.splice(index, 1)
    }
    // Also remove all edges connected to this node
    edges.value = edges.value.filter(
      (edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
    )
    if (node) {
      addToHistory('delete-node', `Deleted ${node.label || node.type} node`)
    }
  }

  async function updateNodeParameters(nodeId: string, parameters: Record<string, any>) {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node) {
      console.error('Node not found:', nodeId)
      return
    }

    // Update local state
    if (!node.parameters) {
      node.parameters = {}
    }
    Object.assign(node.parameters, parameters)

    // If this is a backend node, update the backend
    if (node.backendModuleId && currentWorkflowId.value) {
      try {
        await api.updateModuleParameters(
          currentWorkflowId.value,
          node.backendModuleId,
          parameters
        )
        console.log('Updated backend parameters for module', node.backendModuleId)
      } catch (error) {
        console.error('Failed to update backend parameters:', error)
        throw error
      }
    }
  }

  async function createEdge(
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

    // Find source and target nodes
    const sourceNode = nodes.value.find(n => n.id === sourceNodeId)
    const targetNode = nodes.value.find(n => n.id === targetNodeId)

    // Check if both nodes are backend modules
    const isBackendConnection = sourceNode?.backendModuleId && targetNode?.backendModuleId && currentWorkflowId.value

    if (isBackendConnection) {
      // Create connection via backend API
      try {
        const response = await api.createConnection(
          currentWorkflowId.value!,
          sourceNode!.backendModuleId!,
          sourcePortId,
          targetNode!.backendModuleId!,
          targetPortId
        )

        // Create frontend edge with backend connection ID
        const edge: EdgeData = {
          id: `edge-${response.connection_id}`,
          sourceNodeId,
          sourcePortId,
          targetNodeId,
          targetPortId,
          backendConnectionId: response.connection_id,
        }

        edges.value.push(edge)
        addToHistory('create-edge', 'Created connection')
        return edge
      } catch (error) {
        console.error('Failed to create backend connection:', error)
        throw error
      }
    } else {
      // Legacy: Create local-only edge
      const edge: EdgeData = {
        id: `edge-${Date.now()}-${Math.random()}`,
        sourceNodeId,
        sourcePortId,
        targetNodeId,
        targetPortId,
      }
      edges.value.push(edge)
      addToHistory('create-edge', 'Created connection')
      return edge
    }
  }

  function removeEdge(edgeId: string) {
    const index = edges.value.findIndex((e) => e.id === edgeId)
    if (index !== -1) {
      edges.value.splice(index, 1)
      addToHistory('delete-edge', 'Deleted connection')
    }
  }

  function startEdgeCreation(data: EdgeCreationData) {
    console.log('Store: startEdgeCreation', data)
    edgeBeingCreated.value = data
  }

  async function completeEdgeCreation(
    targetNodeId: string,
    targetPortId: string
  ): Promise<EdgeData | null> {
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

    try {
      return await createEdge(
        finalSourceNodeId,
        finalSourcePortId,
        finalTargetNodeId,
        finalTargetPortId
      )
    } catch (error) {
      console.error('Failed to complete edge creation:', error)
      return null
    }
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
      parameters?: Record<string, any>
      annotations?: Record<string, any>
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

    // WORKAROUND: Backend sends empty inputs/outputs arrays
    // Infer port specifications from connection data
    const moduleInputs = new Map<number, Set<string>>()
    const moduleOutputs = new Map<number, Set<string>>()

    workflowData.connections.forEach(conn => {
      // Target port is an input
      if (!moduleInputs.has(conn.target_id)) {
        moduleInputs.set(conn.target_id, new Set())
      }
      moduleInputs.get(conn.target_id)!.add(conn.target_port)

      // Source port is an output
      if (!moduleOutputs.has(conn.source_id)) {
        moduleOutputs.set(conn.source_id, new Set())
      }
      moduleOutputs.get(conn.source_id)!.add(conn.source_port)
    })

    console.log('[loadWorkflow] Inferred ports from connections:', {
      inputs: Array.from(moduleInputs.entries()).map(([id, ports]) => ({ id, ports: Array.from(ports) })),
      outputs: Array.from(moduleOutputs.entries()).map(([id, ports]) => ({ id, ports: Array.from(ports) }))
    })

    // Calculate bounding box to center the workflow
    if (workflowData.modules.length === 0) {
      return
    }

    // VisTrails module dimensions (before scaling)
    const moduleHeight = 60  // VisTrails default height

    // Function to estimate text width (matching Node.ts implementation)
    function estimateTextWidth(text: string, fontSize: number = 14): number {
      const charWidth = fontSize * 0.6
      return text.length * charWidth
    }

    // Calculate actual width for each module based on its label
    function getModuleWidth(moduleName: string): number {
      const textWidth = estimateTextWidth(moduleName)
      return Math.max(80, textWidth + 40) // Match Node.ts calculation
    }

    // Calculate bounding box to find coordinates range
    // VisTrails positions are CENTER points
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    workflowData.modules.forEach(m => {
      const width = getModuleWidth(m.name)
      minX = Math.min(minX, m.x - width / 2)
      maxX = Math.max(maxX, m.x + width / 2)
      minY = Math.min(minY, m.y - moduleHeight / 2)
      maxY = Math.max(maxY, m.y + moduleHeight / 2)
    })

    const workflowWidth = maxX - minX
    const workflowHeight = maxY - minY

    console.log('Workflow bounds:', { minX, maxX, minY, maxY, width: workflowWidth, height: workflowHeight })

    // Convert backend modules to frontend nodes
    // VisTrails uses center-based positioning with Y-axis pointing up
    // We convert to top-left positioning with Y-axis pointing down
    // Just translate to start from (0,0), no scaling
    nodes.value = workflowData.modules.map((module) => {
      // Translate so minimum X is at 0, and flip Y axis
      const x = module.x - minX
      const y = maxY - module.y

      console.log(`Module ${module.id} (${module.name}):`, {
        vistrails: { x: module.x, y: module.y },
        frontend: { x: x.toFixed(1), y: y.toFixed(1) },
        inputs: module.inputs,
        outputs: module.outputs
      })

      // Use inferred ports if backend sent empty arrays (workaround for backend bug)
      const inferredInputs = moduleInputs.get(module.id)
      const inferredOutputs = moduleOutputs.get(module.id)

      const inputs = (module.inputs && module.inputs.length > 0)
        ? module.inputs
        : (inferredInputs ? Array.from(inferredInputs).map(name => ({ name, type: 'any' })) : [])

      const outputs = (module.outputs && module.outputs.length > 0)
        ? module.outputs
        : (inferredOutputs ? Array.from(inferredOutputs).map(name => ({ name, type: 'any' })) : [])

      const nodeData = {
        id: `node-${module.id}`,
        type: module.name,
        x: x,
        y: y,
        label: module.name,
        // Don't set width - let Node component calculate it dynamically based on label
        // width will be calculated as: max(80, labelWidth + 40)
        height: 60,  // VisTrails default module height
        isIconized: false,
        isSelected: false,
        isActive: false,
        // Use inferred ports from connections (workaround for backend bug)
        inputs: inputs,
        outputs: outputs,
        // Store parameters and annotations from backend
        parameters: module.parameters || {},
        annotations: module.annotations || {},
        package: module.package,
      }

      console.log(`[loadWorkflow] Created node data for ${nodeData.id}:`, {
        hasInputs: nodeData.inputs !== undefined,
        hasOutputs: nodeData.outputs !== undefined,
        inputCount: nodeData.inputs?.length,
        outputCount: nodeData.outputs?.length
      })

      return nodeData
    })

    // Convert backend connections to frontend edges
    edges.value = workflowData.connections.map((conn) => ({
      id: `edge-${conn.id}`,
      sourceNodeId: `node-${conn.source_id}`,
      sourcePortId: conn.source_port,
      targetNodeId: `node-${conn.target_id}`,
      targetPortId: conn.target_port,
    }))

    // Set initial zoom and pan to center and fit the workflow
    // Assume canvas is 800x600 with 50px margin
    const canvasWidth = 800
    const canvasHeight = 600
    const margin = 50
    const availableWidth = canvasWidth - 2 * margin
    const availableHeight = canvasHeight - 2 * margin

    // Calculate scale to fit workflow in viewport
    const scaleX = workflowWidth > 0 ? availableWidth / workflowWidth : 1
    const scaleY = workflowHeight > 0 ? availableHeight / workflowHeight : 1
    const initialZoom = Math.min(scaleX, scaleY, 1) // Don't zoom in, only out

    // Calculate center position
    // The workflow after translation starts at (0, 0) and extends to (workflowWidth, workflowHeight)
    const workflowCenterX = workflowWidth / 2
    const workflowCenterY = workflowHeight / 2

    // Center it in the viewport
    const viewportCenterX = canvasWidth / 2
    const viewportCenterY = canvasHeight / 2

    // Initial offset to center the workflow
    diagramOffsetX.value = viewportCenterX - workflowCenterX * initialZoom
    diagramOffsetY.value = viewportCenterY - workflowCenterY * initialZoom
    zoomLevel.value = initialZoom

    console.log('Initial view:', {
      zoom: initialZoom.toFixed(3),
      offset: { x: diagramOffsetX.value.toFixed(1), y: diagramOffsetY.value.toFixed(1) }
    })

    console.log('Loaded workflow:', {
      modules: nodes.value.length,
      connections: edges.value.length,
    })
  }

  function clearWorkflow() {
    nodes.value = []
    edges.value = []
  }

  function selectNode(nodeId: string | null) {
    // Deselect all nodes
    nodes.value.forEach(node => {
      node.isSelected = false
    })

    // Select the specified node
    if (nodeId) {
      const node = nodes.value.find(n => n.id === nodeId)
      if (node) {
        node.isSelected = true
      }
    }

    selectedNodeId.value = nodeId
  }

  function updateNode(nodeId: string, updates: Partial<NodeData>) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      Object.assign(node, updates)
    }
  }

  function selectEdge(edgeId: string | null) {
    // Deselect all nodes when selecting an edge
    if (edgeId) {
      nodes.value.forEach(node => {
        node.isSelected = false
      })
      selectedNodeId.value = null
    }
    selectedEdgeId.value = edgeId
  }

  async function loadBackendSvg(vistrailName: string, version: number) {
    try {
      const response = await fetch(`http://localhost:8000/api/workflow/${vistrailName}/version/${version}/svg`)
      if (response.ok) {
        const svgText = await response.text()
        backendSvgContent.value = svgText
        console.log('Backend SVG loaded successfully, length:', svgText.length)
      } else {
        console.error('Failed to load backend SVG:', response.status, response.statusText)
        backendSvgContent.value = null
      }
    } catch (error) {
      console.error('Error loading backend SVG:', error)
      backendSvgContent.value = null
    }
  }

  function toggleBackendOverlay() {
    showBackendOverlay.value = !showBackendOverlay.value
  }

  // Backend Integration Functions
  async function loadAvailableModules() {
    try {
      isLoadingModules.value = true
      const data = await api.fetchModules()
      availableModules.value = data.modules

      // Build registry for quick lookup
      moduleRegistry.value.clear()
      data.modules.forEach((mod: BackendModule) => {
        moduleRegistry.value.set(mod.type, mod)
      })

      console.log(`Loaded ${data.modules.length} modules from backend`)
    } catch (error) {
      console.error('Failed to load modules from backend:', error)
      throw error
    } finally {
      isLoadingModules.value = false
    }
  }

  async function createNewWorkflow(name?: string) {
    try {
      const data = await api.createWorkflow(name)
      currentWorkflowId.value = data.workflow_id
      currentWorkflowName.value = data.name

      // Clear canvas
      nodes.value = []
      edges.value = []
      selectedNodeId.value = null
      selectedEdgeId.value = null

      console.log(`Created new workflow: ${data.name} (ID: ${data.workflow_id})`)
      return data
    } catch (error) {
      console.error('Failed to create workflow:', error)
      throw error
    }
  }

  return {
    // State
    diagramOffsetX,
    diagramOffsetY,
    zoomLevel,
    nodes,
    edges,
    edgeBeingCreated,
    canvas,
    selectedNodeId,
    selectedEdgeId,
    backendSvgContent,
    showBackendOverlay,
    // Backend state
    currentWorkflowId,
    currentWorkflowName,
    availableModules,
    moduleRegistry,
    isLoadingModules,
    // Getters
    availableNodeTypes,
    diagramOffset,
    // Actions
    moveDiagram,
    setZoom,
    resetZoom,
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
    selectNode,
    selectEdge,
    updateNode,
    loadBackendSvg,
    toggleBackendOverlay,
    // Backend integration actions
    loadAvailableModules,
    createNewWorkflow,
    updateNodeParameters,
  }
})
