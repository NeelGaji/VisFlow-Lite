<template>
  <div
    id="dataflow-canvas"
    :class="{ panning: isPanning, selecting: isSelecting, 'dragging-nodes': isDraggingNodes, 'drop-target': isDragOver }"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @wheel="onWheel"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div v-if="isSelecting" class="select-box" :style="selectBoxStyle"></div>

    <!-- Backend SVG Overlay (for debugging) -->
    <img
      v-if="showBackendOverlay && backendSvgDataUrl"
      class="backend-svg-overlay"
      :src="backendSvgDataUrl"
      alt="Backend SVG"
      @load="() => console.log('Backend SVG image loaded successfully')"
      @error="(e) => console.error('Backend SVG image failed to load', e)"
    />

    <!-- Nodes layer - render first (bottom layer) -->
    <div ref="nodesContainer" class="nodes-container" :style="transformStyle">
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
        :inputs="node.inputs"
        :outputs="node.outputs"
      />
    </div>

    <!-- Edges SVG layer - render second (top layer, above nodes) -->
    <svg class="edges-layer">
      <g :style="transformStyle">
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
      </g>
    </svg>
    
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

const { nodesContainer, canvasNodes, canvasEdges, edgeBeingCreated, mousePosition, isPanning, isSelecting, isDraggingNodes, isDragOver, selectBoxStyle, transformStyle, showBackendOverlay, backendSvgDataUrl, onMouseMove, onMouseDown, onMouseUp, onWheel, onDragOver, onDragLeave, onDrop } = useDataflowCanvas()
</script>

<style scoped lang="scss" src="./DataflowCanvas.scss"></style>
