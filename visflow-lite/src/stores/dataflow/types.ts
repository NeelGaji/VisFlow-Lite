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
}

// Edge data interface
export interface EdgeData {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
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
