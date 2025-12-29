<template>
  <option-panel :has-settings="true" @settings="onOpenSettings">
    <!-- Script Editor Specific Options -->
    <div class="section">
      <button
        @click="openCodeEditor"
        class="btn btn-outline-secondary w-100"
        id="btn-edit-script"
      >
        <i class="bi bi-code-square"></i> Edit Script
      </button>
    </div>

    <hr class="divider">

    <div v-if="!isRenderingEnabled" class="section">
      <label class="form-label">Display Title</label>
      <input
        v-model="displayTitle"
        @change="onDisplayTitleChange"
        type="text"
        class="form-control form-control-sm"
        placeholder="Enter title..."
      />
    </div>

    <div class="section">
      <div class="form-check">
        <input
          v-model="isRenderingEnabled"
          @change="onRenderingToggle"
          class="form-check-input"
          type="checkbox"
          id="rendering-enabled"
        >
        <label class="form-check-label" for="rendering-enabled">
          Enable Rendering
        </label>
      </div>
      <small class="text-muted">Allow script to render custom visualizations</small>
    </div>

    <div class="section">
      <div class="form-check">
        <input
          v-model="isStateEnabled"
          @change="onStateToggle"
          class="form-check-input"
          type="checkbox"
          id="state-enabled"
        >
        <label class="form-check-label" for="state-enabled">
          Enable State
        </label>
      </div>
      <small class="text-muted">Maintain state across script executions</small>
    </div>

    <div v-if="isStateEnabled" class="section">
      <button
        @click="onClearState"
        class="btn btn-outline-warning btn-sm w-100"
        id="btn-clear-state"
      >
        <i class="bi bi-trash"></i> Clear State
      </button>
    </div>

    <hr class="divider">

    <!-- Messages -->
    <div v-if="successMessage" class="alert alert-success" role="alert">
      <i class="bi bi-check-circle"></i> {{ successMessage }}
    </div>
    <div v-if="warningMessage" class="alert alert-warning" role="alert">
      <i class="bi bi-exclamation-triangle"></i> {{ warningMessage }}
    </div>
    <div v-if="executionError" class="alert alert-danger" role="alert">
      <i class="bi bi-x-circle"></i> {{ executionError }}
    </div>

    <!-- Code Editor Modal -->
    <code-editor-modal
      ref="codeEditorRef"
      v-model="code"
      @change="onCodeChange"
      @run="onRunScript"
    >
      <div class="instruction-section">
        <button
          @click="toggleInstruction"
          class="btn btn-outline-secondary btn-sm mb-2"
        >
          <i class="bi" :class="isInstructionVisible ? 'bi-dash' : 'bi-plus'"></i>
          Instructions
        </button>

        <div v-if="isInstructionVisible" class="instruction-content">
          <p>
            Write a method that reads input table(s) and outputs a new table.
            A table is given by a list of column names and a 2D array of values.
          </p>
          <pre class="code-annotation">{{ methodAnnotation }}</pre>
        </div>
      </div>
    </code-editor-modal>
  </option-panel>
</template>

<script setup lang="ts">
import { useScriptEditorPanel } from './ScriptEditorPanel'
import OptionPanel from '../option-panel/OptionPanel.vue'
import CodeEditorModal from '../code-editor-modal/CodeEditorModal.vue'

const {
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
} = useScriptEditorPanel()
</script>

<style scoped lang="scss" src="./ScriptEditorPanel.scss"></style>
