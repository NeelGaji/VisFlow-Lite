<script setup lang="ts">
  import AppHeader from './components/app-header/AppHeader.vue'
  import NodePanel from './components/node-panel/NodePanel.vue'
  import WorkflowPanel from './components/workflow-panel/WorkflowPanel.vue'
  import VersionTreePanel from './components/version-tree-panel/VersionTreePanel.vue'
  import DataflowCanvas from './components/dataflow-canvas/DataflowCanvas.vue'
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <NodePanel />
    <WorkflowPanel />
    <VersionTreePanel />
    <DataflowCanvas />
  </div>
</template>

<style scoped>
  .app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
