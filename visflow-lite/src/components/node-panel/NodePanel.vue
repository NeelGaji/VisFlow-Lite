<template>
  <transition name="slide-fade-left">
    <div class="node-panel" v-if="isVisible">
      <div v-if="isLoadingModules" class="loading-message">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Loading modules...
      </div>
      <div v-else>
        <div v-for="[packageName, modules] in modulesByPackage" :key="packageName" class="package-group">
          <div class="package-header">{{ formatPackageName(packageName) }}</div>
          <NodeList :modules="modules" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import NodeList from '@/components/node-list/NodeList.vue'
import { useNodePanel } from './NodePanel'

const { isVisible, modulesByPackage, isLoadingModules } = useNodePanel()

function formatPackageName(packageName: string): string {
  // Convert "org.vistrails.vistrails.basic" to "Basic"
  const parts = packageName.split('.')
  const lastPart = parts[parts.length - 1]
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
}
</script>

<style scoped lang="scss" src="./NodePanel.scss"></style>
