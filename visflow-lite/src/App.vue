<script setup lang="ts">
import AppHeader from './components/app-header/AppHeader.vue'
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <router-view />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
