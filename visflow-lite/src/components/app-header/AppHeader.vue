<template>
  <div>
    <nav class="app-header navbar navbar-expand-sm navbar-light bg-white border-bottom">
      <a id="logo" class="navbar-brand">
        <img src="/logo.png" alt="VisFlow Logo" />
        <span class="vis">Vis</span>
        <span class="flow">Flow</span>
        <span class="flow">Lite</span>
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <button class="btn btn-primary btn-sm me-2" @click="handleNewWorkflow">
              <i class="bi bi-file-earmark-plus"></i> New Workflow
            </button>
          </li>
          <li class="nav-item" v-if="currentWorkflowName">
            <span class="navbar-text me-3">
              <i class="bi bi-diagram-3"></i> {{ currentWorkflowName }}
            </span>
          </li>
          <OptionsMenu />
          <li class="nav-item d-flex align-items-center ms-3">
            <div class="form-check form-switch mb-0">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="imagesViewToggle"
                :checked="imagesViewActive"
                @change="toggleImagesView"
              />
              <label class="form-check-label" for="imagesViewToggle">Images</label>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import OptionsMenu from './options-menu/OptionsMenu.vue'
import { useAppHeader } from './AppHeader'

const { handleNewWorkflow, currentWorkflowName, imagesViewActive, toggleImagesView } =
  useAppHeader()
</script>

<style scoped lang="scss" src="./AppHeader.scss"></style>
