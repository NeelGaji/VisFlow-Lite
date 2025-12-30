// Backend module interface from VisTrailsJL
export interface BackendModule {
  package: string
  name: string
  type: string  // Full type like "org.vistrails.vistrails.basic::Integer"
  input_ports: Array<{
    name: string
    type: string
    optional: boolean
  }>
  output_ports: Array<{
    name: string
    type: string
  }>
}

// Port interface for nodes
export interface PortSpec {
  name: string
  type: string
  optional?: boolean
}

// Node data interface
export interface NodeData {
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
  isLabelVisible?: boolean
  // Port specifications from backend
  inputs?: PortSpec[]
  outputs?: PortSpec[]
  // Module metadata from backend
  parameters?: Record<string, any>
  annotations?: Record<string, any>
  package?: string
  // Script editor specific properties
  code?: string
  isRenderingEnabled?: boolean
  isStateEnabled?: boolean
  state?: Record<string, any>
  displayTitle?: string
  transparentBackground?: boolean
  // Data properties
  dataset?: any // Will hold the processed data
  executionError?: string
  warningMessage?: string
  successMessage?: string
  // Backend integration fields
  backendModuleId?: number  // Backend module ID for API calls
  backendModuleType?: string  // Full backend type (e.g., "org.vistrails.vistrails.basic::Integer")
  backendConnectionId?: number  // Backend connection ID (for edges)
}

// Edge data interface
export interface EdgeData {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  backendConnectionId?: number  // Backend connection ID for API calls
}

// Temporary edge being created
export interface EdgeCreationData {
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  portType: 'input' | 'output'
  dataType: string
}
