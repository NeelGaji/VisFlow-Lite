// Node Type interface for the registry
export interface NodeType {
  id: string
  title: string
  icon: string // Path to icon image
  tags: string // Search tags for FlowSense
  aliases?: string[]
}

// Minimal node types registry - starting with 2 types
export const nodeTypes: NodeType[] = [
  {
    id: 'data-source',
    title: 'Data Source',
    icon: '/icons/data-source.svg',
    tags: 'read load table csv',
  },
  {
    id: 'script-editor',
    title: 'Script Editor',
    icon: '/icons/script-editor.svg',
    tags: 'script code editor',
  },
]
