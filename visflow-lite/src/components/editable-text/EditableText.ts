import { ref, watch } from 'vue'

export interface EditableTextProps {
  modelValue: string
  useEditButton?: boolean
}

export interface EditableTextEmits {
  (event: 'update:modelValue', value: string): void
}

export const useEditableText = (
  props: EditableTextProps,
  emit: EditableTextEmits
) => {
  const textRef = ref<HTMLElement | null>(null)
  const displayText = ref(props.modelValue)
  const isEditable = ref(false)

  // Watch for external changes to modelValue
  watch(() => props.modelValue, (newValue) => {
    displayText.value = newValue
  })

  const makeEditable = () => {
    if (!textRef.value) return

    textRef.value.contentEditable = 'true'
    textRef.value.focus()
    isEditable.value = true

    // Select all text
    const range = document.createRange()
    range.selectNodeContents(textRef.value)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const save = () => {
    if (!textRef.value) return

    textRef.value.contentEditable = 'false'
    isEditable.value = false

    const newText = textRef.value.textContent || ''
    displayText.value = newText
    emit('update:modelValue', newText)
  }

  const onClick = () => {
    if (props.useEditButton) {
      return
    }
    makeEditable()
  }

  const onEnter = () => {
    if (!textRef.value) return
    textRef.value.blur()
  }

  const onBlur = () => {
    if (isEditable.value) {
      save()
    }
  }

  return {
    textRef,
    displayText,
    onClick,
    onEnter,
    onBlur,
    makeEditable
  }
}
