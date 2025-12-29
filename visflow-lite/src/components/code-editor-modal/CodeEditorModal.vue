<template>
  <div v-if="isVisible" class="modal-backdrop" @click="onBackdropClick">
    <div class="modal-dialog modal-lg" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Script Editor</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
          <div ref="editorContainer" class="editor-container"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-primary" @click="run">
            <i class="bi bi-play-fill"></i> Run
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="close">
            Cancel
          </button>
          <button type="button" class="btn btn-outline-success" @click="save">
            <i class="bi bi-check-lg"></i> Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCodeEditorModal } from './CodeEditorModal'

const props = withDefaults(defineProps<{
  modelValue: string
  language?: string
}>(), {
  language: 'javascript'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [newValue: string, oldValue: string]
  'run': []
}>()

const {
  isVisible,
  editorContainer,
  open,
  close,
  save,
  run,
  onBackdropClick
} = useCodeEditorModal(props, emit)

defineExpose({
  open,
  close
})
</script>

<style scoped lang="scss" src="./CodeEditorModal.scss"></style>
