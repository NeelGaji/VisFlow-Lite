<template>
  <transition name="slide-fade-left">
    <div class="node-panel" v-if="isVisible">
      <NodeList :nodeTypes="availableNodeTypes" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import NodeList from '@/components/node-list/NodeList.vue'
import { useNodePanel } from './NodePanel'

const { isVisible, availableNodeTypes } = useNodePanel()
</script>

<style scoped lang="scss" src="./NodePanel.scss"></style>
