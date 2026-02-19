<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div
        v-if="visible"
        class="workflow-preview-overlay"
        :style="positionStyle"
        @mouseenter="$emit('overlay-enter')"
        @mouseleave="$emit('overlay-leave')"
      >
        <!-- Arrow pointer -->
        <div class="preview-arrow" :class="arrowSide"></div>

        <!-- Header -->
        <div class="preview-header">
          <i class="bi bi-diagram-3"></i>
          <span class="preview-title">{{ title }}</span>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="preview-loading">
          <div class="preview-spinner"></div>
          <span>Loading workflow…</span>
        </div>

        <!-- Error state -->
        <div v-else-if="loadError" class="preview-error">
          <i class="bi bi-exclamation-triangle"></i>
          <span>{{ loadError }}</span>
        </div>

        <!-- Workflow graph -->
        <svg
          v-else-if="workflowData"
          class="preview-svg"
          :viewBox="svgViewBox"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Connections -->
          <line
            v-for="conn in svgConnections"
            :key="conn.id"
            :x1="conn.x1"
            :y1="conn.y1"
            :x2="conn.x2"
            :y2="conn.y2"
            class="preview-connection"
          />
          <!-- Modules -->
          <g v-for="mod in svgModules" :key="mod.id">
            <rect
              :x="mod.x"
              :y="mod.y"
              :width="mod.width"
              :height="mod.height"
              class="preview-module"
              rx="4"
              ry="4"
            />
            <text
              :x="mod.x + mod.width / 2"
              :y="mod.y + mod.height / 2 + 4"
              class="preview-module-label"
              text-anchor="middle"
            >
              {{ mod.shortName }}
            </text>
          </g>
        </svg>

        <!-- Metadata -->
        <div v-if="workflowData" class="preview-meta">
          <span><i class="bi bi-puzzle"></i> {{ workflowData.modules.length }} modules</span>
          <span><i class="bi bi-link-45deg"></i> {{ workflowData.connections.length }} connections</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchWorkflowVersion, type WorkflowVersionData } from '@/services/vistrailsAPI'

interface Props {
  visible: boolean
  vistrailId: string
  versionId: number
  title: string
  anchorRect: DOMRect | null
}

const props = defineProps<Props>()
defineEmits(['overlay-enter', 'overlay-leave'])

// ── State ──────────────────────────────────────────────────
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const workflowData = ref<WorkflowVersionData | null>(null)

// ── Cache ──────────────────────────────────────────────────
const cache = new Map<string, WorkflowVersionData>()

function cacheKey(vistrailId: string, versionId: number) {
  return `${vistrailId}::${versionId}`
}

// ── Fetch workflow when visible changes ────────────────────
watch(
  () => props.visible,
  async (nowVisible) => {
    if (!nowVisible) return
    if (!props.vistrailId || props.versionId == null) return

    const key = cacheKey(props.vistrailId, props.versionId)

    // Use cache if available
    if (cache.has(key)) {
      workflowData.value = cache.get(key)!
      loadError.value = null
      return
    }

    isLoading.value = true
    loadError.value = null
    workflowData.value = null

    try {
      const data = await fetchWorkflowVersion(props.vistrailId, props.versionId)
      cache.set(key, data)
      workflowData.value = data
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load'
      console.error('WorkflowPreview fetch error:', err)
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)

// ── Position logic ─────────────────────────────────────────
const POPUP_W = 420
const POPUP_H = 320
const GAP = 12

const positionInfo = computed(() => {
  if (!props.anchorRect) {
    return {
      style: { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' } as Record<string, string>,
      arrow: 'left' as const,
    }
  }

  const rect = props.anchorRect
  const vw = window.innerWidth
  const vh = window.innerHeight

  let top: number
  let left: number
  let arrow: 'left' | 'right' | 'top' | 'bottom'

  // Try to position to the right of the anchor
  if (rect.right + GAP + POPUP_W < vw) {
    left = rect.right + GAP
    top = rect.top + rect.height / 2 - POPUP_H / 2
    arrow = 'left'
  }
  // Try left
  else if (rect.left - GAP - POPUP_W > 0) {
    left = rect.left - GAP - POPUP_W
    top = rect.top + rect.height / 2 - POPUP_H / 2
    arrow = 'right'
  }
  // Try below
  else if (rect.bottom + GAP + POPUP_H < vh) {
    left = rect.left + rect.width / 2 - POPUP_W / 2
    top = rect.bottom + GAP
    arrow = 'top'
  }
  // Fallback: above
  else {
    left = rect.left + rect.width / 2 - POPUP_W / 2
    top = rect.top - GAP - POPUP_H
    arrow = 'bottom'
  }

  // Clamp to viewport
  top = Math.max(8, Math.min(top, vh - POPUP_H - 8))
  left = Math.max(8, Math.min(left, vw - POPUP_W - 8))

  return {
    style: {
      top: `${top}px`,
      left: `${left}px`,
      width: `${POPUP_W}px`,
    },
    arrow,
  }
})

const positionStyle = computed(() => positionInfo.value.style)
const arrowSide = computed(() => positionInfo.value.arrow)

// ── SVG computation ────────────────────────────────────────
const MODULE_W = 110
const MODULE_H = 32

const svgModules = computed(() => {
  if (!workflowData.value) return []
  return workflowData.value.modules.map((m) => ({
    id: m.id,
    x: m.x,
    y: m.y,
    width: MODULE_W,
    height: MODULE_H,
    shortName: m.name.length > 14 ? m.name.slice(0, 12) + '…' : m.name,
  }))
})

const svgConnections = computed(() => {
  if (!workflowData.value) return []
  const moduleMap = new Map(
    workflowData.value.modules.map((m) => [
      m.id,
      { cx: m.x + MODULE_W / 2, cy: m.y + MODULE_H / 2 },
    ]),
  )
  return workflowData.value.connections
    .map((c) => {
      const src = moduleMap.get(c.source_id)
      const tgt = moduleMap.get(c.target_id)
      if (!src || !tgt) return null
      return {
        id: c.id,
        x1: src.cx,
        y1: src.cy,
        x2: tgt.cx,
        y2: tgt.cy,
      }
    })
    .filter(Boolean) as { id: number; x1: number; y1: number; x2: number; y2: number }[]
})

const svgViewBox = computed(() => {
  if (!workflowData.value || workflowData.value.modules.length === 0) return '0 0 400 280'
  const xs = workflowData.value.modules.map((m) => m.x)
  const ys = workflowData.value.modules.map((m) => m.y)
  const minX = Math.min(...xs) - 20
  const minY = Math.min(...ys) - 20
  const maxX = Math.max(...xs) + MODULE_W + 20
  const maxY = Math.max(...ys) + MODULE_H + 20
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
})

</script>

<style scoped>
.workflow-preview-overlay {
  position: fixed;
  z-index: 9999;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* ── Arrow ────────────────────────────────────────────────── */
.preview-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.preview-arrow.left {
  left: -7px;
  top: 50%;
  margin-top: -6px;
  border-right: none;
  border-top: none;
}

.preview-arrow.right {
  right: -7px;
  top: 50%;
  margin-top: -6px;
  border-left: none;
  border-bottom: none;
}

.preview-arrow.top {
  top: -7px;
  left: 50%;
  margin-left: -6px;
  border-bottom: none;
  border-right: none;
}

.preview-arrow.bottom {
  bottom: -7px;
  left: 50%;
  margin-left: -6px;
  border-top: none;
  border-left: none;
}

/* ── Header ───────────────────────────────────────────────── */
.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.preview-header i {
  font-size: 1rem;
}

.preview-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Loading ──────────────────────────────────────────────── */
.preview-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: #888;
  font-size: 0.85rem;
}

.preview-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: preview-spin 0.7s linear infinite;
}

@keyframes preview-spin {
  to { transform: rotate(360deg); }
}

/* ── Error ────────────────────────────────────────────────── */
.preview-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #dc3545;
  font-size: 0.85rem;
}

.preview-error i {
  font-size: 1.5rem;
}

/* ── SVG graph ────────────────────────────────────────────── */
.preview-svg {
  flex: 1;
  min-height: 0;
  padding: 8px;
  background: #f9fafb;
}

.preview-module {
  fill: white;
  stroke: #0d6efd;
  stroke-width: 1.5;
}

.preview-module-label {
  fill: #333;
  font-size: 10px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  pointer-events: none;
}

.preview-connection {
  stroke: #adb5bd;
  stroke-width: 1.5;
  stroke-linecap: round;
}

/* ── Metadata footer ──────────────────────────────────────── */
.preview-meta {
  display: flex;
  gap: 16px;
  padding: 8px 14px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 0.75rem;
  color: #666;
}

.preview-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-meta i {
  font-size: 0.8rem;
  color: #999;
}

/* ── Transitions ──────────────────────────────────────────── */
.preview-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.preview-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.preview-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.preview-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
