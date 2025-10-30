<template>
  <div
    id="dataflow-canvas"
    :class="{ panning: isPanning, selecting: isSelecting, 'dragging-nodes': isDraggingNodes, 'drop-target': isDragOver }"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div v-if="isSelecting" class="select-box" :style="selectBoxStyle"></div>
    
    <!-- Edges SVG layer -->
    <svg class="edges-layer">
      <Edge
        v-for="edge in canvasEdges"
        :key="edge.id"
        :edge-data="edge"
      />
      <!-- Edge preview while dragging -->
      <EdgePreview
        v-if="edgeBeingCreated"
        :edge-data="edgeBeingCreated"
        :mouse-x="mousePosition.x"
        :mouse-y="mousePosition.y"
      />
    </svg>
    
    <div ref="nodesContainer" class="nodes-container">
      <!-- Render Node components -->
      <Node
        v-for="node in canvasNodes"
        :key="node.id"
        :id="node.id"
        :type="node.type"
        :x="node.x"
        :y="node.y"
        :label="node.label"
        :width="node.width"
        :height="node.height"
        :isIconized="node.isIconized"
        :isSelected="node.isSelected"
        :isActive="node.isActive"
      />
    </div>
    
    <!-- Debug overlay to show mouse position and mode -->
    <!-- <div class="debug-overlay">
      Mouse: {{ Math.round(mousePosition.x) }}, {{ Math.round(mousePosition.y) }}
      <br>
      Mode: {{ isPanning ? 'Panning' : isSelecting ? 'Selecting' : isDraggingNodes ? 'Dragging Nodes' : 'None' }}
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { useDataflowCanvas } from './DataflowCanvas'
import Node from '@/components/node/Node.vue'
import Edge from '@/components/edge/Edge.vue'
import EdgePreview from '@/components/edge-preview/EdgePreview.vue'

const { nodesContainer, canvasNodes, canvasEdges, edgeBeingCreated, mousePosition, isPanning, isSelecting, isDraggingNodes, isDragOver, selectBoxStyle, onMouseMove, onMouseDown, onMouseUp, onDragOver, onDragLeave, onDrop } = useDataflowCanvas()
</script>

<style scoped lang="scss" src="./DataflowCanvas.scss"></style>
