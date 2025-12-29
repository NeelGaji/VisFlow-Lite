import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import loader from '@monaco-editor/loader'

export interface CodeEditorModalProps {
  modelValue: string
  language?: string
}

export interface CodeEditorModalEmits {
  (event: 'update:modelValue', value: string): void
  (event: 'change', newValue: string, oldValue: string): void
  (event: 'run'): void
}

export const useCodeEditorModal = (
  props: CodeEditorModalProps,
  emit: CodeEditorModalEmits
) => {
  const isVisible = ref(false)
  const editorContainer = ref<HTMLElement | null>(null)
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  let currentCode = props.modelValue
  let codeBeforeOpen = ''

  // Initialize Monaco
  loader.config({ monaco })

  const createEditor = async () => {
    if (!editorContainer.value) return

    await loader.init()

    editor = monaco.editor.create(editorContainer.value, {
      value: currentCode,
      language: props.language,
      theme: 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on'
    })

    // Listen to content changes
    editor.onDidChangeModelContent(() => {
      if (editor) {
        const newValue = editor.getValue()
        currentCode = newValue
        emit('update:modelValue', newValue)
      }
    })
  }

  const open = async () => {
    console.log('CodeEditorModal: open() called, props.modelValue =', props.modelValue)
    console.log('CodeEditorModal: existing editor?', !!editor)
    isVisible.value = true
    // Sync currentCode with props.modelValue when opening
    currentCode = props.modelValue
    codeBeforeOpen = currentCode
    console.log('CodeEditorModal: currentCode set to', currentCode)

    await nextTick()

    // Always recreate the editor to ensure clean state
    if (editor) {
      console.log('CodeEditorModal: Disposing existing editor')
      editor.dispose()
      editor = null
    }

    console.log('CodeEditorModal: Creating new editor')
    await createEditor()
  }

  const close = () => {
    console.log('CodeEditorModal: close() called')
    isVisible.value = false
  }

  const save = () => {
    console.log('CodeEditorModal: save() called', {
      currentCode,
      codeBeforeOpen,
      hasChanged: currentCode !== codeBeforeOpen
    })
    if (currentCode !== codeBeforeOpen) {
      console.log('CodeEditorModal: Emitting change event')
      emit('change', currentCode, codeBeforeOpen)
      codeBeforeOpen = currentCode
    } else {
      console.log('CodeEditorModal: No changes detected, not emitting change event')
    }
    close()
  }

  const run = () => {
    emit('run')
  }

  const onBackdropClick = () => {
    close()
  }

  // Watch for external changes to modelValue
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== currentCode) {
      currentCode = newValue
      if (editor) {
        editor.setValue(newValue)
      }
    }
  })

  // Cleanup
  onUnmounted(() => {
    if (editor) {
      editor.dispose()
      editor = null
    }
  })

  return {
    isVisible,
    editorContainer,
    open,
    close,
    save,
    run,
    onBackdropClick
  }
}
