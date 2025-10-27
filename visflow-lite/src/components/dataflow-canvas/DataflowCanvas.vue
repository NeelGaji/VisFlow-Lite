<template>
  <div id="dataflow-canvas" :class="{ panning: isPanning, selecting: isSelecting }" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp">
    <div v-if="isSelecting" class="select-box" :style="selectBoxStyle"></div>
    <div ref="nodes"></div>
    <svg ref="edges"></svg>
    
    <!-- Debug overlay to show mouse position and mode -->
    <div class="debug-overlay">
      Mouse: {{ Math.round(mousePosition.x) }}, {{ Math.round(mousePosition.y) }}
      <br>
      Mode: {{ isPanning ? 'Panning' : isSelecting ? 'Selecting' : 'None' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataflowCanvas } from './DataflowCanvas'

const { nodes, edges, mousePosition, isPanning, isSelecting, selectBoxStyle, onMouseMove, onMouseDown, onMouseUp } = useDataflowCanvas()
</script>

<style scoped lang="scss" src="./DataflowCanvas.scss"></style>
