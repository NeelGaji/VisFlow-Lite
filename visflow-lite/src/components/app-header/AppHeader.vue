<template>
  <div>
    <nav class="app-header navbar navbar-expand-sm navbar-light bg-white border-bottom">
      <a id="logo" class="navbar-brand">
        <img src="/logo.png" alt="VisFlow Logo">
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
          <OptionsMenu />
        </ul>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import OptionsMenu from './options-menu/OptionsMenu.vue'
</script>

<style scoped lang="scss" src="./AppHeader.scss"></style>
