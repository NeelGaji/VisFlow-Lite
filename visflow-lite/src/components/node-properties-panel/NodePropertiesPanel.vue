<template>
  <div class="node-properties-panel">
    <!-- Header with node info -->
    <div class="panel-header">
      <h3>{{ nodeData?.label || nodeData?.type || 'Node Properties' }}</h3>
      <span class="node-type">{{ nodeData?.type }}</span>
    </div>

    <!-- Script Editor Section (for script-editor nodes) -->
    <div v-if="nodeData?.type === 'script-editor'" class="script-editor-section">
      <ScriptEditorPanel />
    </div>

    <!-- Generic Module Info (for all other nodes) -->
    <div v-else class="module-info-section">
      <!-- Basic Info -->
      <div class="info-group">
        <h4>Module Information</h4>
        <div class="info-row">
          <span class="label">Name:</span>
          <span class="value">{{ nodeData?.type || 'N/A' }}</span>
        </div>
        <div class="info-row" v-if="nodeData?.package">
          <span class="label">Package:</span>
          <span class="value">{{ nodeData.package }}</span>
        </div>
        <div class="info-row">
          <span class="label">ID:</span>
          <span class="value">{{ nodeData?.id || 'N/A' }}</span>
        </div>
      </div>

      <!-- Input Ports -->
      <div class="info-group" v-if="nodeData?.inputs && nodeData.inputs.length > 0">
        <h4>Input Ports ({{ nodeData.inputs.length }})</h4>
        <div class="port-list">
          <div v-for="(port, index) in nodeData.inputs" :key="index" class="port-item">
            <i class="bi bi-square-fill port-icon input-port"></i>
            <span class="port-name">{{ port.name }}</span>
            <span class="port-type">{{ port.type || 'any' }}</span>
          </div>
        </div>
      </div>

      <!-- Output Ports -->
      <div class="info-group" v-if="nodeData?.outputs && nodeData.outputs.length > 0">
        <h4>Output Ports ({{ nodeData.outputs.length }})</h4>
        <div class="port-list">
          <div v-for="(port, index) in nodeData.outputs" :key="index" class="port-item">
            <i class="bi bi-square-fill port-icon output-port"></i>
            <span class="port-name">{{ port.name }}</span>
            <span class="port-type">{{ port.type || 'any' }}</span>
          </div>
        </div>
      </div>

      <!-- Source Code Parameters (special handling for code-containing modules) -->
      <div class="info-group" v-if="hasSourceParameter">
        <h4>Source Code</h4>
        <div class="source-code-section">
          <button class="btn btn-sm btn-primary" @click="viewSourceCode">
            <i class="bi bi-code-square"></i>
            View Source Code
          </button>
        </div>
      </div>

      <!-- Editable Parameters -->
      <div class="info-group" v-if="editableParameters.length > 0">
        <h4>Parameters</h4>
        <div class="param-list">
          <div v-for="param in editableParameters" :key="param.name" class="param-item editable">
            <label class="param-label">{{ param.name }}</label>
            <input
              type="text"
              class="param-input"
              :value="param.value"
              @change="updateParameter(param.name, ($event.target as HTMLInputElement).value)"
            />
            <span class="param-type">{{ param.typeLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Regular Parameters (excluding source, read-only) -->
      <div class="info-group" v-if="hasNonSourceParameters && editableParameters.length === 0">
        <h4>Parameters</h4>
        <div class="param-list">
          <div v-for="(value, key) in nonSourceParameters" :key="key" class="param-item">
            <span class="param-name">{{ key }}:</span>
            <span class="param-value">{{ formatValue(value) }}</span>
          </div>
        </div>
      </div>

      <!-- Annotations -->
      <div class="info-group" v-if="hasAnnotations">
        <h4>Annotations</h4>
        <div class="annotation-list">
          <div v-for="(value, key) in nodeData.annotations" :key="key" class="annotation-item">
            <span class="annotation-name">{{ key }}:</span>
            <span class="annotation-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!hasAnyData" class="empty-state">
        <i class="bi bi-info-circle"></i>
        <p>No additional information available for this module.</p>
      </div>
    </div>

    <!-- Code Editor Modal for viewing source -->
    <CodeEditorModal
      v-if="showCodeModal"
      v-model="sourceCode"
      :language="sourceLanguage"
      @close="showCodeModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDataflowStore } from '@/stores/dataflow'
import { storeToRefs } from 'pinia'
import ScriptEditorPanel from '../script-editor-panel/ScriptEditorPanel.vue'
import CodeEditorModal from '../code-editor-modal/CodeEditorModal.vue'

const dataflowStore = useDataflowStore()
const { selectedNodeId, nodes, moduleRegistry } = storeToRefs(dataflowStore)

const showCodeModal = ref(false)
const sourceCode = ref('')
const sourceLanguage = ref('python')

const nodeData = computed(() => {
  if (!selectedNodeId.value) return null
  return nodes.value.find(n => n.id === selectedNodeId.value)
})

// Define known parameter names for modules (just the parameter names, types are hints)
const PARAMETER_DEFINITIONS: Record<string, Array<{name: string, type: string}>> = {
  'org.vistrails.vistrails.basic::Integer': [{ name: 'value', type: 'Int64' }],
  'org.vistrails.vistrails.basic::Float': [{ name: 'value', type: 'Float64' }],
  'org.vistrails.vistrails.basic::String': [{ name: 'value', type: 'String' }],
  'org.vistrails.vistrails.basic::Boolean': [{ name: 'value', type: 'Bool' }],
  'org.vistrails.vistrails.basic::List': [{ name: 'value', type: 'Vector' }],
  'org.vistrails.vistrails.basic::Tuple': [{ name: 'value', type: 'Tuple' }],
  'org.vistrails.vistrails.pythoncalc::PythonCalc': [
    { name: 'op', type: 'String (+,-,*,/)' },
    { name: 'expression', type: 'String' }
  ],
}

// Get editable parameters for the current node
const editableParameters = computed(() => {
  if (!nodeData.value) return []

  const moduleType = nodeData.value.backendModuleType || nodeData.value.type
  const paramDefs = PARAMETER_DEFINITIONS[moduleType]

  if (!paramDefs) return []

  return paramDefs.map(def => {
    const currentValue = nodeData.value?.parameters?.[def.name] ?? ''
    return {
      name: def.name,
      value: currentValue,
      typeLabel: def.type
    }
  })
})

// Update a parameter value - send as string, let backend/Julia handle conversion
async function updateParameter(name: string, value: string) {
  if (!nodeData.value) return

  console.log('Updating parameter:', name, '=', value)

  try {
    await dataflowStore.updateNodeParameters(nodeData.value.id, { [name]: value })
  } catch (error) {
    console.error('Failed to update parameter:', error)
  }
}

// Check if this module has a source code parameter
// Common parameter names for source code (case-insensitive matching)
const SOURCE_PARAM_NAMES = ['source', 'plotcode', 'sourcecode', 'code', 'script', 'mplsource', 'setupscript', 'pythoncode', 'juliacode']
const hasSourceParameter = computed(() => {
  if (!nodeData.value?.parameters) {
    console.log('[NodePropertiesPanel] No parameters on node:', nodeData.value?.id)
    return false
  }
  const paramKeys = Object.keys(nodeData.value.parameters)
  // Case-insensitive matching
  const hasSource = paramKeys.some(key =>
    SOURCE_PARAM_NAMES.some(name => key.toLowerCase() === name.toLowerCase())
  )
  console.log('[NodePropertiesPanel] Checking source parameters:', {
    nodeId: nodeData.value.id,
    nodeType: nodeData.value.type,
    paramKeys,
    hasSource
  })
  return hasSource
})

// Get the source parameter key and value
const sourceParameter = computed(() => {
  if (!nodeData.value?.parameters) {
    console.log('[NodePropertiesPanel] sourceParameter: no parameters')
    return null
  }
  const paramKeys = Object.keys(nodeData.value.parameters)
  // Case-insensitive matching
  const sourceKey = paramKeys.find(key =>
    SOURCE_PARAM_NAMES.some(name => key.toLowerCase() === name.toLowerCase())
  )
  const result = sourceKey ? { key: sourceKey, value: nodeData.value.parameters[sourceKey] } : null
  console.log('[NodePropertiesPanel] sourceParameter computed:', {
    paramKeys,
    sourceKey,
    result: result ? { key: result.key, valueLength: result.value?.length } : null
  })
  return result
})

// Get all parameters except source code parameters
const nonSourceParameters = computed(() => {
  if (!nodeData.value?.parameters) return {}
  const params = { ...nodeData.value.parameters }
  // Case-insensitive filtering
  Object.keys(params).forEach(key => {
    if (SOURCE_PARAM_NAMES.some(name => key.toLowerCase() === name.toLowerCase())) {
      delete params[key]
    }
  })
  return params
})

const hasNonSourceParameters = computed(() => {
  return Object.keys(nonSourceParameters.value).length > 0
})

const hasParameters = computed(() => {
  return nodeData.value?.parameters && Object.keys(nodeData.value.parameters).length > 0
})

const hasAnnotations = computed(() => {
  return nodeData.value?.annotations && Object.keys(nodeData.value.annotations).length > 0
})

const hasAnyData = computed(() => {
  if (!nodeData.value) return false
  const hasInputs = nodeData.value.inputs && nodeData.value.inputs.length > 0
  const hasOutputs = nodeData.value.outputs && nodeData.value.outputs.length > 0
  return hasInputs || hasOutputs || hasParameters.value || hasAnnotations.value
})

function formatValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function viewSourceCode() {
  console.log('[NodePropertiesPanel] viewSourceCode called')
  const srcParam = sourceParameter.value
  console.log('[NodePropertiesPanel] sourceParameter:', srcParam)

  if (!srcParam) {
    console.log('[NodePropertiesPanel] No source parameter found, returning')
    return
  }

  // Decode URL-encoded source if needed
  let code = srcParam.value
  try {
    code = decodeURIComponent(code)
  } catch {
    // If decoding fails, use as-is
  }

  sourceCode.value = code
  console.log('[NodePropertiesPanel] Set sourceCode, length:', code.length)

  // Determine language from module type or parameter name
  const moduleName = nodeData.value?.type?.toLowerCase() || ''
  const paramName = srcParam.key.toLowerCase()

  if (moduleName.includes('python') || paramName.includes('python')) {
    sourceLanguage.value = 'python'
  } else if (moduleName.includes('julia') || paramName.includes('julia')) {
    sourceLanguage.value = 'julia'
  } else if (moduleName.includes('mpl') || paramName.includes('plot')) {
    // Matplotlib modules use Python
    sourceLanguage.value = 'python'
  } else {
    sourceLanguage.value = 'javascript' // Default
  }

  console.log('[NodePropertiesPanel] Set language:', sourceLanguage.value)
  console.log('[NodePropertiesPanel] Setting showCodeModal to true')
  showCodeModal.value = true
  console.log('[NodePropertiesPanel] showCodeModal is now:', showCodeModal.value)
}
</script>

<style scoped lang="scss">
.node-properties-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;

  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .node-type {
    font-size: 12px;
    color: #666;
    font-family: monospace;
  }
}

.script-editor-section,
.module-info-section {
  flex: 1;
  overflow-y: auto;
}

.module-info-section {
  padding: 16px;
}

.info-group {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #555;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 6px;
  }
}

.info-row {
  display: flex;
  padding: 6px 0;
  font-size: 13px;

  .label {
    font-weight: 500;
    color: #666;
    min-width: 80px;
  }

  .value {
    color: #333;
    font-family: monospace;
    word-break: break-all;
  }
}

.port-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;

  .port-icon {
    font-size: 10px;

    &.input-port {
      color: #4CAF50;
    }

    &.output-port {
      color: #2196F3;
    }
  }

  .port-name {
    font-weight: 500;
    color: #333;
    flex: 1;
  }

  .port-type {
    font-size: 11px;
    color: #666;
    font-family: monospace;
    background: white;
    padding: 2px 6px;
    border-radius: 3px;
  }
}

.source-code-section {
  .btn {
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 14px;
    }
  }
}

.param-list,
.annotation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item,
.annotation-item {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;

  .param-name,
  .annotation-name {
    font-weight: 500;
    color: #666;
    margin-right: 8px;
  }

  .param-value,
  .annotation-value {
    color: #333;
    font-family: monospace;
    word-break: break-all;
  }

  &.editable {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .param-label {
      font-weight: 500;
      color: #555;
      font-size: 12px;
    }

    .param-input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      font-family: monospace;

      &:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
      }
    }

    .param-type {
      font-size: 11px;
      color: #888;
      font-family: monospace;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  text-align: center;

  i {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>
