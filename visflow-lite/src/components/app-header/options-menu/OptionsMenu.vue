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
    </ul>
  </li>
</template>

<script setup lang="ts">
import { useOptionsMenu } from './OptionsMenu'

const { nodePanelVisible, toggleNodePanel } = useOptionsMenu()
</script>

<style scoped lang="scss" src="./OptionsMenu.scss"></style>
