<template>
  <transition name="slide-fade-right">
    <div class="workflow-panel" v-if="isVisible">
      <WorkflowList />
    </div>
  </transition>
</template>

<script setup lang="ts">
import WorkflowList from '@/components/workflow-list/WorkflowList.vue'
import { useWorkflowPanel } from './WorkflowPanel'

const { isVisible } = useWorkflowPanel()
</script>

<style scoped lang="scss" src="./WorkflowPanel.scss"></style>
