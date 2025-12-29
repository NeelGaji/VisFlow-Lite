<template>
  <transition name="slide-fade-left">
    <div class="version-tree-panel" v-if="isVisible">
      <div class="panel-header">
        <h3>Version Tree</h3>
        <button class="btn btn-sm btn-close-panel" @click="close" title="Close version tree">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div v-if="error" class="alert alert-danger" role="alert">
        <div class="error-content">
          <strong>Version Tree Error</strong>
          <p class="mb-2 mt-2">{{ error }}</p>
          <p class="mb-2">
            <small>The backend has a bug in the version tree rendering. Try opening it directly:</small>
          </p>
          <div class="d-flex gap-2 align-items-center">
            <a :href="treeUrl" target="_blank" class="btn btn-sm btn-outline-secondary">
              Open in Browser <i class="bi bi-box-arrow-up-right"></i>
            </a>
            <button class="btn btn-sm btn-outline-primary" @click="fetchVersionTree">
              Retry
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading version tree...</span>
      </div>

      <div v-else-if="svgContent" class="svg-container" v-html="svgContent"></div>

      <div v-else-if="!workflowId" class="empty-state">
        <i class="bi bi-diagram-2"></i>
        <p>No workflow selected</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useVersionTreePanel } from './VersionTreePanel'

const { isVisible, workflowId, svgContent, isLoading, error, treeUrl, close, fetchVersionTree } =
  useVersionTreePanel()
</script>

<style scoped lang="scss" src="./VersionTreePanel.scss"></style>
