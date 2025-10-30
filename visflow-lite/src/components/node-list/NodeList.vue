<template>
  <div class="node-list">
    <div
      v-for="nodeType in nodeTypes"
      :key="nodeType.id"
      class="node-button"
      :title="nodeType.title"
      draggable="true"
      @dragstart="onDragStart($event, nodeType)"
    >
      <img class="square-icon" :src="nodeType.icon" :alt="nodeType.title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeType } from '@/stores/dataflow/nodeTypes'

defineProps<{
  nodeTypes: NodeType[]
}>()

function onDragStart(event: DragEvent, nodeType: NodeType) {
  if (!event.dataTransfer) return
  
  // Store the node type id in the drag data
  event.dataTransfer.setData('application/visflow-node-type', nodeType.id)
  event.dataTransfer.effectAllowed = 'copy'
  
  // Set drag image to the icon
  const img = event.target as HTMLElement
  const icon = img.querySelector('img') as HTMLImageElement
  if (icon) {
    event.dataTransfer.setDragImage(icon, icon.width / 2, icon.height / 2)
  }
}
</script>

<style scoped lang="scss" src="./NodeList.scss"></style>
