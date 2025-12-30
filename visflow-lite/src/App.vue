<script setup lang="ts">
  import AppHeader from './components/app-header/AppHeader.vue'
  import NodePanel from './components/node-panel/NodePanel.vue'
  import WorkflowPanel from './components/workflow-panel/WorkflowPanel.vue'
  import VersionTreePanel from './components/version-tree-panel/VersionTreePanel.vue'
  import HistoryPanel from './components/history-panel/HistoryPanel.vue'
  import DataflowCanvas from './components/dataflow-canvas/DataflowCanvas.vue'
  import NodePropertiesPanel from './components/node-properties-panel/NodePropertiesPanel.vue'
  import { useDataflowStore } from './stores/dataflow'
  import { storeToRefs } from 'pinia'

  const dataflowStore = useDataflowStore()
  const { selectedNodeId } = storeToRefs(dataflowStore)
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <div class="main-content">
      <NodePanel />
      <WorkflowPanel />
      <VersionTreePanel />
      <HistoryPanel />
      <DataflowCanvas />
      <div v-if="selectedNodeId" class="right-panel">
        <NodePropertiesPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .right-panel {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: white;
    border-left: 1px solid #ccc;
    overflow-y: auto;
    z-index: 100;
  }
</style>
