<template>
  <div class="node-list">
    <div
      v-for="module in modules"
      :key="module.type"
      class="node-button"
      :title="`${module.name}\n${module.input_ports.length} inputs, ${module.output_ports.length} outputs`"
      draggable="true"
      @dragstart="onDragStart($event, module)"
    >
      <div class="module-icon">
        {{ getModuleIcon(module) }}
      </div>
      <div class="module-name">{{ module.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BackendModule } from '@/stores/dataflow/types'

defineProps<{
  modules: BackendModule[]
}>()

function onDragStart(event: DragEvent, module: BackendModule) {
  if (!event.dataTransfer) return

  // Store the backend module type (e.g., "org.vistrails.vistrails.basic::Integer")
  event.dataTransfer.setData('application/visflow-backend-module', module.type)
  event.dataTransfer.effectAllowed = 'copy'
}

function getModuleIcon(module: BackendModule): string {
  // Return a simple text icon based on module type
  const name = module.name.toLowerCase()

  if (name.includes('string')) return '📝'
  if (name.includes('integer') || name.includes('float')) return '🔢'
  if (name.includes('boolean')) return '✓'
  if (name.includes('list')) return '📋'
  if (name.includes('file')) return '📁'
  if (name.includes('path')) return '🗂️'
  if (name.includes('pythoncalc')) return '🐍'
  if (name.includes('matplotlib')) return '📊'
  if (name.includes('if')) return '🔀'
  if (name.includes('map')) return '🔄'

  return '⚙️' // Default gear icon
}
</script>

<style scoped lang="scss" src="./NodeList.scss"></style>
