import type { PortSpec } from './types'

// Node Type interface for the registry
export interface NodeType {
  id: string
  title: string
  icon: string // Path to icon image
  tags: string // Search tags for FlowSense
  aliases?: string[]
  // Default port specifications for manually created nodes
  defaultInputs?: PortSpec[]
  defaultOutputs?: PortSpec[]
}

// Minimal node types registry - starting with 2 types
export const nodeTypes: NodeType[] = [
  {
    id: 'data-source',
    title: 'Data Source',
    icon: '/icons/data-source.svg',
    tags: 'read load table csv',
    defaultInputs: [],
    defaultOutputs: [
      { name: 'output', type: 'table' }
    ],
  },
  {
    id: 'script-editor',
    title: 'Script Editor',
    icon: '/icons/script-editor.svg',
    tags: 'script code editor',
    defaultInputs: [
      { name: 'input', type: 'table' }
    ],
    defaultOutputs: [
      { name: 'output', type: 'table' }
    ],
  },
]
