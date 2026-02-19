<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useImagesStore, type LayoutMode, type ImageItem } from '@/stores/images'
import { storeToRefs } from 'pinia'

const imagesStore = useImagesStore()
const { activeLayout, images, focalImage, surroundingImages, isLoading, error } =
  storeToRefs(imagesStore)

// ── Hover state ──────────────────────────────────────────
const hoveredImage = ref<ImageItem | null>(null)

function onImageEnter(img: ImageItem) {
  hoveredImage.value = img
}

function onImageLeave() {
  hoveredImage.value = null
}

// ── Layout toggle buttons ────────────────────────────────
const layouts: { mode: LayoutMode; icon: string; label: string }[] = [
  { mode: 'grid', icon: 'bi-grid-3x3-gap', label: 'Grid' },
  { mode: 'randomized', icon: 'bi-shuffle', label: 'Scatter' },
  { mode: 'focal', icon: 'bi-bullseye', label: 'Focal' },
]

function switchLayout(mode: LayoutMode) {
  imagesStore.setLayout(mode)
}

// ── Focal swap logic ─────────────────────────────────────
function handleImageClick(imageId: string) {
  if (activeLayout.value === 'focal') {
    imagesStore.setFocalImage(imageId)
  }
}

// ── Surrounding positions for focal layout (circular) ────
function getSurroundingStyle(index: number, total: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  const radiusX = 34 // % from center
  const radiusY = 34
  const x = 50 + radiusX * Math.cos(angle)
  const y = 50 + radiusY * Math.sin(angle)
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  }
}

// ── Randomized layout style per image ────────────────────
function getRandomStyle(img: {
  randomTop: number
  randomLeft: number
  randomRotation: number
  randomWidth: number
  randomScale: number
  randomZIndex: number
}) {
  return {
    top: `${img.randomTop}%`,
    left: `${img.randomLeft}%`,
    width: `${img.randomWidth}px`,
    transform: `rotate(${img.randomRotation}deg) scale(${img.randomScale})`,
    zIndex: img.randomZIndex,
  }
}

// ── Fetch workflows and populate images on mount ─────────
onMounted(() => {
  imagesStore.populateFromWorkflows()
})
</script>

<template>
  <div class="images-view">
    <!-- ── 3-Way Layout Toggle ────────────────────────── -->
    <div class="layout-toggle">
      <button
        v-for="l in layouts"
        :key="l.mode"
        class="toggle-btn"
        :class="{ active: activeLayout === l.mode }"
        @click="switchLayout(l.mode)"
        :title="l.label"
      >
        <i :class="['bi', l.icon]"></i>
      </button>
    </div>

    <!-- ── LOADING STATE ──────────────────────────────── -->
    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <span class="state-text">Loading workflows…</span>
    </div>

    <!-- ── ERROR STATE ────────────────────────────────── -->
    <div v-else-if="error" class="state-container state-error">
      <i class="bi bi-exclamation-triangle"></i>
      <span class="state-text">{{ error }}</span>
      <button class="retry-btn" @click="imagesStore.populateFromWorkflows()">Retry</button>
    </div>

    <!-- ── EMPTY STATE ────────────────────────────────── -->
    <div v-else-if="images.length === 0" class="state-container">
      <i class="bi bi-images"></i>
      <span class="state-text">No workflows found</span>
    </div>

    <!-- ── GRID LAYOUT ────────────────────────────────── -->
    <div v-else-if="activeLayout === 'grid'" class="layout-container grid-layout">
      <TransitionGroup name="grid-card">
        <div
          v-for="img in images"
          :key="img.id"
          class="grid-card"
          @mouseenter="onImageEnter(img)"
          @mouseleave="onImageLeave"
        >
          <div class="card-image-wrapper">
            <img :src="img.src" :alt="img.alt" />
            <!-- Hover overlay -->
            <Transition name="overlay-fade">
              <div v-if="hoveredImage?.id === img.id && img.workflow" class="workflow-overlay">
                <span class="overlay-name">{{ img.workflow.displayName }}</span>
                <span class="overlay-meta">
                  <i class="bi bi-tag"></i> {{ img.workflow.tagName }}
                </span>
                <span class="overlay-meta">
                  <i class="bi bi-diagram-3"></i> v{{ img.workflow.versionId }}
                </span>
              </div>
            </Transition>
          </div>
          <span class="card-label">{{ img.alt }}</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- ── RANDOMIZED LAYOUT ──────────────────────────── -->
    <div v-else-if="activeLayout === 'randomized'" class="layout-container random-layout">
      <TransitionGroup name="scatter">
        <div
          v-for="img in images"
          :key="img.id"
          class="random-card"
          :style="getRandomStyle(img)"
          @mouseenter="onImageEnter(img)"
          @mouseleave="onImageLeave"
        >
          <div class="card-image-wrapper">
            <img :src="img.src" :alt="img.alt" />
            <Transition name="overlay-fade">
              <div v-if="hoveredImage?.id === img.id && img.workflow" class="workflow-overlay">
                <span class="overlay-name">{{ img.workflow.displayName }}</span>
                <span class="overlay-meta">
                  <i class="bi bi-tag"></i> {{ img.workflow.tagName }}
                </span>
                <span class="overlay-meta">
                  <i class="bi bi-diagram-3"></i> v{{ img.workflow.versionId }}
                </span>
              </div>
            </Transition>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ── FOCAL POINT LAYOUT ─────────────────────────── -->
    <div v-else-if="activeLayout === 'focal'" class="layout-container focal-layout">
      <!-- Focal (center) image -->
      <Transition name="focal-swap" mode="out-in">
        <div
          v-if="focalImage"
          class="focal-center"
          :key="focalImage.id"
          @mouseenter="onImageEnter(focalImage)"
          @mouseleave="onImageLeave"
        >
          <div class="card-image-wrapper focal-image-wrapper">
            <img :src="focalImage.src" :alt="focalImage.alt" />
            <Transition name="overlay-fade">
              <div v-if="hoveredImage?.id === focalImage.id && focalImage.workflow" class="workflow-overlay">
                <span class="overlay-name">{{ focalImage.workflow.displayName }}</span>
                <span class="overlay-meta">
                  <i class="bi bi-tag"></i> {{ focalImage.workflow.tagName }}
                </span>
                <span class="overlay-meta">
                  <i class="bi bi-diagram-3"></i> v{{ focalImage.workflow.versionId }}
                </span>
              </div>
            </Transition>
          </div>
          <span class="focal-label">{{ focalImage.alt }}</span>
        </div>
      </Transition>

      <!-- Surrounding images (circular) -->
      <TransitionGroup name="surround">
        <div
          v-for="(img, idx) in surroundingImages"
          :key="img.id"
          class="surround-card"
          :style="getSurroundingStyle(idx, surroundingImages.length)"
          @click="handleImageClick(img.id)"
          @mouseenter="onImageEnter(img)"
          @mouseleave="onImageLeave"
        >
          <div class="card-image-wrapper">
            <img :src="img.src" :alt="img.alt" />
            <Transition name="overlay-fade">
              <div v-if="hoveredImage?.id === img.id && img.workflow" class="workflow-overlay workflow-overlay--small">
                <span class="overlay-name">{{ img.workflow.displayName }}</span>
              </div>
            </Transition>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ──────────────────────────────────────────── */
.images-view {
  flex: 1;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

/* ── Loading / Error / Empty states ─────────────────────── */
.state-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
  font-size: 0.95rem;
}

.state-container i {
  font-size: 2rem;
  color: #999;
}

.state-error i {
  color: #dc3545;
}

.state-text {
  max-width: 320px;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #ddd;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 4px;
  padding: 6px 20px;
  border: 1px solid #0d6efd;
  background: transparent;
  color: #0d6efd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;
}

.retry-btn:hover {
  background: #0d6efd;
  color: white;
}

/* ── 3-Way Toggle ───────────────────────────────────────── */
.layout-toggle {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 40px;
  border: none;
  background: white;
  color: #555;
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.toggle-btn:not(:last-child) {
  border-right: 1px solid #ccc;
}

.toggle-btn:hover {
  background: #e9ecef;
}

.toggle-btn.active {
  background: #0d6efd;
  color: white;
}

/* ── Shared layout container ────────────────────────────── */
.layout-container {
  position: absolute;
  inset: 0;
  padding-top: 72px;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
}

/* ── Image wrapper (relative container for overlay) ─────── */
.card-image-wrapper {
  position: relative;
  overflow: hidden;
}

/* ── Workflow hover overlay ─────────────────────────────── */
.workflow-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
}

.overlay-name {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}

.overlay-meta {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.overlay-meta i {
  font-size: 0.7rem;
}

.workflow-overlay--small {
  padding: 8px;
  gap: 2px;
}

.workflow-overlay--small .overlay-name {
  font-size: 0.75rem;
}

/* Overlay fade transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ── GRID LAYOUT ────────────────────────────────────────── */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  align-content: start;
  overflow-y: auto;
}

.grid-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.grid-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
}

.grid-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.card-label {
  display: block;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

/* Grid TransitionGroup */
.grid-card-enter-active,
.grid-card-leave-active {
  transition: all 0.4s ease;
}
.grid-card-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.grid-card-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* ── RANDOMIZED (SCATTER) LAYOUT ────────────────────────── */
.random-layout {
  position: relative;
}

.random-card {
  position: absolute;
  width: 180px; /* overridden by inline style */
  background: white;
  padding: 6px;
  border-radius: 4px;
  box-shadow: 2px 4px 16px rgba(0, 0, 0, 0.15);
  transition:
    top 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease;
  cursor: default;
}

.random-card:hover {
  z-index: 5;
  box-shadow: 4px 8px 24px rgba(0, 0, 0, 0.25);
  transform: rotate(0deg) scale(1.08) !important;
}

.random-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  border-radius: 2px;
}

/* Scatter TransitionGroup */
.scatter-enter-active,
.scatter-leave-active {
  transition: all 0.5s ease;
}
.scatter-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(0deg);
}
.scatter-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(0deg);
}

/* ── FOCAL POINT LAYOUT ─────────────────────────────────── */
.focal-layout {
  display: flex;
  align-items: center;
  justify-content: center;
}

.focal-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 340px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.focal-center img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.focal-image-wrapper {
  border-radius: 0;
}

.focal-label {
  display: block;
  padding: 10px 14px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  text-align: center;
}

/* Focal swap transition */
.focal-swap-enter-active,
.focal-swap-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.focal-swap-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}
.focal-swap-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}

/* Surrounding cards */
.surround-card {
  position: absolute;
  width: 130px;
  z-index: 2;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition:
    top 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease;
}

.surround-card:hover {
  z-index: 4;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  transform: translate(-50%, -50%) scale(1.12) !important;
}

.surround-card img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  display: block;
}

/* Surround TransitionGroup */
.surround-enter-active,
.surround-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.surround-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4);
}
.surround-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4);
}
</style>
