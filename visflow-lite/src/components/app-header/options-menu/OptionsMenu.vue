<template>
  <li class="nav-item dropdown">
    <a
      class="nav-link dropdown-toggle"
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      Options
    </a>
    <ul class="dropdown-menu">
      <li>
        <a class="dropdown-item" href="#" @click.prevent="toggleNodePanel">
          <i :class="nodePanelVisible ? 'bi bi-check-square-fill' : 'bi bi-square'" class="me-2"></i>
          Node Panel
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click.prevent="toggleHistoryPanel">
          <i :class="historyPanelVisible ? 'bi bi-check-square-fill' : 'bi bi-square'" class="me-2"></i>
          History Panel
        </a>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item" href="#" @click.prevent="toggleBackendOverlay">
          <i :class="backendOverlayVisible ? 'bi bi-check-square-fill' : 'bi bi-square'" class="me-2"></i>
          Backend SVG Overlay (Debug)
        </a>
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { useOptionsMenu } from './OptionsMenu'

const { nodePanelVisible, historyPanelVisible, backendOverlayVisible, toggleNodePanel, toggleHistoryPanel, toggleBackendOverlay } = useOptionsMenu()
</script>

<style scoped lang="scss" src="./OptionsMenu.scss"></style>
