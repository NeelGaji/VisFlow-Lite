import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataflowStore } from '@/stores/dataflow'

const DEFAULT_CODE = `(input, content, state) => {
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

const TYPEDEF_ANNOTATION = `@typedef {{
  columns: string[],
  rows: Array<Array<number | string>>
}} Table`

const SINGLE_INPUT_ANNOTATION = '@param {Table | undefined} input'
const MULTIPLE_INPUTS_ANNOTATION = '@param {Table[]} input'
const COMMON_ANNOTATION = `@param {HTMLElement | undefined} content
@param {object | undefined} state
@returns {Table}`

export const useScriptEditorPanel = () => {
  const dataflowStore = useDataflowStore()
  const { selectedNodeId } = storeToRefs(dataflowStore)

  const codeEditorRef = ref<any>(null)
  const isInstructionVisible = ref(true)

  // Get the currently selected node
  const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null
    return dataflowStore.nodes.find(n => n.id === selectedNodeId.value)
  })

  // Local reactive state synced with the selected node
  const code = ref(DEFAULT_CODE)
  const displayTitle = ref('')
  const isRenderingEnabled = ref(false)
  const isStateEnabled = ref(false)
  const successMessage = ref('')
  const warningMessage = ref('')
  const executionError = ref('')

  // Compute method annotation based on number of inputs
  const methodAnnotation = computed(() => {
    // TODO: get actual number of input ports from node
    const numInputs = 1
    let annotation = TYPEDEF_ANNOTATION + '\n'
    annotation += (numInputs === 1 ? SINGLE_INPUT_ANNOTATION : MULTIPLE_INPUTS_ANNOTATION) + '\n'
    annotation += COMMON_ANNOTATION
    return annotation
  })

  // Watch for selected node changes and update local state
  watch(selectedNode, (node, oldNode) => {
    if (node && node.type === 'script-editor') {
      console.log('ScriptEditorPanel: Node changed', {
        nodeId: node.id,
        nodeCode: node.code,
        currentCodeValue: code.value,
        isDifferentNode: !oldNode || oldNode.id !== node.id,
        hasCodeChanged: node.code !== code.value
      })

      // Only update if switching to a different node or if code has changed in the store
      const isDifferentNode = !oldNode || oldNode.id !== node.id
      const hasCodeChanged = node.code !== code.value

      if (isDifferentNode || hasCodeChanged) {
        console.log('ScriptEditorPanel: Updating code.value to:', node.code || DEFAULT_CODE)
        code.value = node.code || DEFAULT_CODE
      }

      displayTitle.value = node.displayTitle || ''
      isRenderingEnabled.value = node.isRenderingEnabled || false
      isStateEnabled.value = node.isStateEnabled || false
      successMessage.value = node.successMessage || ''
      warningMessage.value = node.warningMessage || ''
      executionError.value = node.executionError || ''
    }
  }, { immediate: true })

  const updateNodeProperty = (updates: Record<string, any>) => {
    if (selectedNode.value) {
      dataflowStore.updateNode(selectedNode.value.id, updates)
    }
  }

  const openCodeEditor = () => {
    console.log('ScriptEditorPanel: openCodeEditor() called, code.value =', code.value)
    console.log('ScriptEditorPanel: selectedNode.value?.code =', selectedNode.value?.code)
    if (codeEditorRef.value) {
      codeEditorRef.value.open()
    }
  }

  const onCodeChange = (newCode: string, oldCode: string) => {
    console.log('ScriptEditorPanel: onCodeChange called', { newCode, oldCode })
    code.value = newCode
    console.log('ScriptEditorPanel: Updating node property with code:', newCode)
    updateNodeProperty({ code: newCode })
    // Execute script when code changes
    executeScript()
  }

  const onRunScript = () => {
    executeScript()
  }

  const executeScript = () => {
    if (!selectedNode.value) return

    // Clear previous messages
    successMessage.value = ''
    warningMessage.value = ''
    executionError.value = ''

    try {
      // Get input data from connected ports
      // TODO: implement proper port input retrieval
      const input = {
        columns: [],
        rows: []
      }

      // Prepare execution context
      const renderingContent = isRenderingEnabled.value ? null : undefined // TODO: get actual DOM element
      const state = isStateEnabled.value ? (selectedNode.value.state || {}) : undefined

      // Execute the script
      // Wrap user code in a function and execute it
      const userCode = code.value || 'function(input, content, state) { return { columns: [], rows: [] } }'
      const execute = new Function('input', 'content', 'state', `
        try {
          const method = (${userCode});
          return method(input, content, state);
        } catch (err) {
          return { error: err };
        }
      `)

      const result = execute(input, renderingContent, state)

      if (result.error) {
        throw result.error
      }

      // Validate output
      if (!result.columns || !Array.isArray(result.columns)) {
        throw new Error('Output must have a "columns" array')
      }
      if (!result.rows || !Array.isArray(result.rows)) {
        throw new Error('Output must have a "rows" array')
      }

      // Validate row structure
      for (const row of result.rows) {
        if (!Array.isArray(row)) {
          throw new Error('All rows must be arrays')
        }
        if (row.length !== result.columns.length) {
          throw new Error('Row length does not match number of columns')
        }
      }

      // Update node with result
      updateNodeProperty({
        dataset: result,
        successMessage: `Success: ${result.columns.length} column(s), ${result.rows.length} row(s)`,
        warningMessage: result.columns.length === 0 ? 'Output table is empty' : '',
        executionError: ''
      })

      successMessage.value = `Success: ${result.columns.length} column(s), ${result.rows.length} row(s)`
      if (result.columns.length === 0) {
        warningMessage.value = 'Output table is empty'
      }

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
        updateNodeProperty({ successMessage: '' })
      }, 3000)

    } catch (err: any) {
      const errorMsg = err.toString()
      executionError.value = errorMsg
      updateNodeProperty({
        executionError: errorMsg,
        successMessage: '',
        warningMessage: ''
      })
      console.error('Script execution error:', err)
    }
  }

  const onDisplayTitleChange = () => {
    updateNodeProperty({ displayTitle: displayTitle.value })
  }

  const onRenderingToggle = () => {
    updateNodeProperty({ isRenderingEnabled: isRenderingEnabled.value })
    if (isRenderingEnabled.value) {
      // Re-run script when rendering is enabled
      executeScript()
    }
  }

  const onStateToggle = () => {
    updateNodeProperty({ isStateEnabled: isStateEnabled.value })
  }

  const onClearState = () => {
    updateNodeProperty({ state: {} })
    // Re-run script after clearing state
    executeScript()
  }

  const onOpenSettings = () => {
    // TODO: implement settings modal
    console.log('Open settings modal')
  }

  const toggleInstruction = () => {
    isInstructionVisible.value = !isInstructionVisible.value
  }

  return {
    code,
    displayTitle,
    isRenderingEnabled,
    isStateEnabled,
    successMessage,
    warningMessage,
    executionError,
    isInstructionVisible,
    methodAnnotation,
    codeEditorRef,
    openCodeEditor,
    onCodeChange,
    onRunScript,
    onDisplayTitleChange,
    onRenderingToggle,
    onStateToggle,
    onClearState,
    onOpenSettings,
    toggleInstruction
  }
}
