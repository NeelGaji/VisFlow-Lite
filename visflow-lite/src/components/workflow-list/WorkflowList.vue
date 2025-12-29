<template>
  <div class="workflow-list">
    <div class="workflow-list-header">
      <h3>Workflows</h3>
      <button
        class="btn btn-sm btn-outline-secondary refresh-btn"
        @click="loadWorkflows"
        :disabled="isLoading"
        title="Refresh workflow list"
      >
        <i class="bi bi-arrow-clockwise"></i>
      </button>
    </div>

    <div v-if="error" class="alert alert-danger alert-sm" role="alert">
      {{ error }}
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-2">Loading workflows...</span>
    </div>

    <div v-else-if="workflows.length === 0" class="empty-state">
      <i class="bi bi-folder2-open"></i>
      <p>No workflows found</p>
    </div>

    <ul v-else class="workflow-items">
      <li
        v-for="workflow in workflows"
        :key="`${workflow.vistrailId}-${workflow.versionId}`"
        class="workflow-item"
        :class="{ selected: selectedWorkflow?.vistrailId === workflow.vistrailId && selectedWorkflow?.versionId === workflow.versionId }"
      >
        <div class="workflow-main" @click="selectWorkflow(workflow)">
          <div class="workflow-icon">
            <i class="bi bi-diagram-3"></i>
          </div>
          <div class="workflow-info">
            <div class="workflow-name">{{ workflow.displayName }}</div>
            <div class="workflow-meta">
              v{{ workflow.versionId }}
            </div>
          </div>
        </div>
        <div class="workflow-actions">
          <button
            class="btn btn-sm btn-outline-primary"
            @click.stop="viewVersionTree(workflow)"
            title="View version tree"
          >
            <i class="bi bi-diagram-2"></i>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useWorkflowList } from './WorkflowList'

const {
  workflows,
  isLoading,
  error,
  selectedWorkflow,
  loadWorkflows,
  selectWorkflow,
  viewVersionTree,
} = useWorkflowList()
</script>

<style scoped lang="scss" src="./WorkflowList.scss"></style>
