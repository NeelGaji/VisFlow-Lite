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
      <li><hr class="dropdown-divider" /></li>
      <li>
        <a class="dropdown-item" href="#" @click.prevent="testAddNode">
          <i class="bi bi-plus-circle me-2"></i>
          Test Add Node
        </a>
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { useOptionsMenu } from './OptionsMenu'

const { nodePanelVisible, toggleNodePanel, testAddNode } = useOptionsMenu()
</script>

<style scoped lang="scss" src="./OptionsMenu.scss"></style>
