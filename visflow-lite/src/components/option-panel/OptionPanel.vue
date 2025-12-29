<template>
  <div v-if="selectedNode" class="option-panel">
    <div class="header">
      <div class="node-label">
        <span class="label-title">Label: </span>
        <editable-text
          :model-value="label"
          @update:model-value="onLabelChange"
        />
      </div>

      <hr class="divider">

      <div class="button-group">
        <button
          @click="toggleIconized"
          class="btn btn-sm btn-outline-secondary mini"
          :class="{ active: isIconized }"
          title="Iconize/Expand"
        >
          <i class="bi bi-arrows-angle-contract"></i>
        </button>

        <button
          @click="toggleLabelVisible"
          class="btn btn-sm btn-outline-secondary mini"
          :class="{ active: isLabelVisible }"
          title="Show/Hide Label"
        >
          <i class="bi bi-tag"></i>
        </button>

        <button
          v-if="hasSettings"
          @click="onSettings"
          class="btn btn-sm btn-outline-secondary mini"
          title="Settings"
        >
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>

    <hr class="divider">

    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOptionPanel } from './OptionPanel'
import EditableText from '../editable-text/EditableText.vue'

const props = withDefaults(defineProps<{
  hasSettings?: boolean
}>(), {
  hasSettings: false
})

const emit = defineEmits<{
  settings: []
}>()

const {
  selectedNode,
  label,
  isIconized,
  isLabelVisible,
  onLabelChange,
  toggleIconized,
  toggleLabelVisible,
  onSettings
} = useOptionPanel(props, emit)
</script>

<style scoped lang="scss" src="./OptionPanel.scss"></style>
