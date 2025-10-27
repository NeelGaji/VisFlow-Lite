<template>
  <div class="node-list">
    <div v-for="nodeType in nodeTypes" :key="nodeType.id" class="node-button" :title="nodeType.title">
      <img class="square-icon" :src="nodeType.icon" :alt="nodeType.title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeType } from '@/stores/dataflow/nodeTypes'

defineProps<{
  nodeTypes: NodeType[]
}>()
</script>

<style scoped lang="scss" src="./NodeList.scss"></style>
