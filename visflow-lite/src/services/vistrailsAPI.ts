/**
 * VisTrailsJL Backend API Service
 *
 * Provides functions to interact with the VisTrailsJL backend server.
 * Base URL: http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000'

/**
 * .vt file (Vistrail) metadata from the backend
 */
export interface VistrailFile {
  id: string
  name: string
  path: string
  size: number
  modified: number
  version_count: number
}

/**
 * Version metadata from a vistrail
 */
export interface VersionInfo {
  id: number
  parent: number
  timestamp: string
  user: string
  notes: string
}

/**
 * Tag metadata (named workflow)
 */
export interface TagInfo {
  name: string
  version_id: number
}

/**
 * Version tree metadata
 */
export interface VersionTreeMetadata {
  versions: VersionInfo[]
  tags: TagInfo[]
  current_version: number
  count: number
}

/**
 * Tagged workflow (flat list item combining vistrail + tag)
 */
export interface TaggedWorkflow {
  vistrailId: string
  vistrailName: string
  tagName: string
  versionId: number
  displayName: string // "vistrail.vt - Tag Name"
}

/**
 * Workflow metadata from the backend (keeping for backward compatibility)
 */
export interface WorkflowInfo extends VistrailFile {}

/**
 * Fetch the list of available .vt files (vistrails) from VisTrailsJL backend
 */
export async function fetchVistrails(): Promise<VistrailFile[]> {
  const response = await fetch(`${BASE_URL}/api/workflows`)

  if (!response.ok) {
    throw new Error(`Failed to fetch vistrails: ${response.statusText}`)
  }

  const data = await response.json()
  // API returns array directly, not { workflows: [...] }
  return Array.isArray(data) ? data : []
}

/**
 * Fetch version tree metadata for a specific vistrail
 */
export async function fetchVersions(vistrailId: string): Promise<VersionTreeMetadata> {
  const response = await fetch(`${BASE_URL}/api/workflow/${vistrailId}/versions`)

  if (!response.ok) {
    throw new Error(`Failed to fetch versions: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch all tagged workflows across all vistrails (flat list)
 */
export async function fetchTaggedWorkflows(): Promise<TaggedWorkflow[]> {
  // First, get all vistrails
  const vistrails = await fetchVistrails()

  // Then fetch versions for each vistrail and extract tagged workflows
  const taggedWorkflows: TaggedWorkflow[] = []

  for (const vistrail of vistrails) {
    try {
      const metadata = await fetchVersions(vistrail.id)

      // Add each tagged version as a separate workflow
      for (const tag of metadata.tags) {
        taggedWorkflows.push({
          vistrailId: vistrail.id,
          vistrailName: vistrail.name,
          tagName: tag.name,
          versionId: tag.version_id,
          displayName: `${vistrail.name} - ${tag.name}`,
        })
      }

      // Also add the current version if it's not already tagged
      const currentVersionTagged = metadata.tags.some(
        (tag) => tag.version_id === metadata.current_version
      )
      if (!currentVersionTagged) {
        taggedWorkflows.push({
          vistrailId: vistrail.id,
          vistrailName: vistrail.name,
          tagName: 'Current',
          versionId: metadata.current_version,
          displayName: `${vistrail.name} - Current (v${metadata.current_version})`,
        })
      }
    } catch (err) {
      console.warn(`Failed to fetch versions for ${vistrail.name}:`, err)
      // Continue with other vistrails even if one fails
    }
  }

  return taggedWorkflows
}

/**
 * Fetch the list of available workflows from VisTrailsJL backend
 * @deprecated Use fetchTaggedWorkflows() instead
 */
export async function fetchWorkflows(): Promise<WorkflowInfo[]> {
  return fetchVistrails()
}

/**
 * Workflow version data from backend
 */
export interface WorkflowVersionData {
  modules: Array<{
    id: number
    name: string
    package: string
    x: number
    y: number
    inputs: Array<{ name: string; type: string; optional?: boolean }>
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
  version_id: number
}

/**
 * Fetch a specific version of a workflow
 */
export async function fetchWorkflowVersion(
  vistrailId: string,
  versionId: number
): Promise<WorkflowVersionData> {
  const response = await fetch(`${BASE_URL}/api/workflow/${vistrailId}/version/${versionId}/json`)

  if (!response.ok) {
    throw new Error(`Failed to fetch workflow version: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Check if the VisTrailsJL backend is healthy and reachable
 */
export async function checkHealth(): Promise<{ status: string; service: string; version: string }> {
  const response = await fetch(`${BASE_URL}/health`)

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`)
  }

  return response.json()
}
