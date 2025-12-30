/**
 * API Service Layer
 *
 * Provides functions to communicate with the VisTrailsJL backend.
 */

const API_BASE = 'http://localhost:8000/api'

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

export interface WorkflowResponse {
  success: boolean
  workflow_id: string
  name: string
  version_id: number
  message: string
}

export interface ModuleResponse {
  module_id: number
  descriptor: {
    name: string
    package: string
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
  position: {
    x: number
    y: number
  }
  parameters: Record<string, any>
}

export interface ConnectionResponse {
  connection_id: number
  source_module_id: number
  source_port: string
  dest_module_id: number
  dest_port: string
}

/**
 * Fetch all available modules from the backend
 */
export async function fetchModules(): Promise<{ modules: BackendModule[]; count: number }> {
  const response = await fetch(`${API_BASE}/modules`)
  if (!response.ok) {
    throw new Error(`Failed to fetch modules: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Create a new workflow
 * @param name - Optional workflow name (auto-generated if not provided)
 * @param user - Optional user name
 */
export async function createWorkflow(name?: string, user?: string): Promise<WorkflowResponse> {
  const body: any = {}
  if (name) body.name = name
  if (user) body.user = user

  const response = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Failed to create workflow: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Add a module to a workflow
 */
export async function addModuleToWorkflow(
  workflowId: string,
  moduleType: string,
  position: { x: number; y: number },
  parameters: Record<string, any> = {}
): Promise<ModuleResponse> {
  const response = await fetch(`${API_BASE}/workflow/${workflowId}/module`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: moduleType, position, parameters })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `Failed to add module: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Create a connection between two modules
 */
export async function createConnection(
  workflowId: string,
  sourceModuleId: number,
  sourcePort: string,
  destModuleId: number,
  destPort: string
): Promise<ConnectionResponse> {
  const response = await fetch(`${API_BASE}/workflow/${workflowId}/connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_module_id: sourceModuleId,
      source_port: sourcePort,
      dest_module_id: destModuleId,
      dest_port: destPort
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `Failed to create connection: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Update a module's position
 */
export async function updateModulePosition(
  workflowId: string,
  moduleId: number,
  position: { x: number; y: number }
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/workflow/${workflowId}/module/${moduleId}/position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position })
  })

  if (!response.ok) {
    throw new Error(`Failed to update module position: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Delete a connection
 */
export async function deleteConnection(
  workflowId: string,
  connectionId: number
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/workflow/${workflowId}/connection/${connectionId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error(`Failed to delete connection: ${response.statusText}`)
  }
  return response.json()
}
