<script setup lang="ts">
  import { useHistoryPanel } from './HistoryPanel'

  const {
    panelsStore,
    historyStore,
    formattedHistory,
    closePanel,
    handleEntryClick,
    handleUndo,
    handleRedo,
    handleClear,
  } = useHistoryPanel()
</script>

<template>
  <div v-if="panelsStore.historyPanelVisible" class="history-panel">
    <div class="history-header">
      <h5 class="history-title">
        <i class="bi bi-clock-history"></i>
        History
      </h5>
      <button class="btn btn-sm btn-link close-btn" @click="closePanel" title="Close">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div class="history-controls">
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="handleUndo"
        :disabled="!historyStore.canUndo"
        title="Undo (Ctrl+Z)"
      >
        <i class="bi bi-arrow-counterclockwise"></i>
        Undo
      </button>
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="handleRedo"
        :disabled="!historyStore.canRedo"
        title="Redo (Ctrl+Y)"
      >
        <i class="bi bi-arrow-clockwise"></i>
        Redo
      </button>
      <button
        class="btn btn-sm btn-outline-danger"
        @click="handleClear"
        :disabled="historyStore.history.length === 0"
        title="Clear history"
      >
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="history-list">
      <div v-if="historyStore.history.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>No history yet</p>
      </div>
      <div
        v-for="(entry, index) in formattedHistory"
        :key="entry.id"
        class="history-entry"
        :class="{
          current: index === historyStore.currentIndex,
          future: index > historyStore.currentIndex,
        }"
        @click="handleEntryClick(entry.id)"
      >
        <div class="entry-indicator">
          <i
            v-if="index === historyStore.currentIndex"
            class="bi bi-circle-fill current-indicator"
          ></i>
          <i v-else class="bi bi-circle"></i>
        </div>
        <div class="entry-content">
          <div class="entry-description">{{ entry.description }}</div>
          <div class="entry-time">{{ entry.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./HistoryPanel.scss"></style>
