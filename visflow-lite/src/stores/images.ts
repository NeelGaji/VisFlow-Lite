import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchTaggedWorkflows, type TaggedWorkflow } from '@/services/vistrailsAPI'

export type LayoutMode = 'grid' | 'randomized' | 'focal'

export interface ImageItem {
  id: string
  src: string
  alt: string
  workflow: TaggedWorkflow | null
  // Randomized layout: scatter values (regenerated each time)
  randomTop: number
  randomLeft: number
  randomRotation: number
  randomWidth: number
  randomScale: number
  randomZIndex: number
}

export const useImagesStore = defineStore('images', () => {
  // ── State ──────────────────────────────────────────────
  const activeLayout = ref<LayoutMode>('grid')
  const focalImageId = ref<string>('img-1')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Start with an empty array — populated dynamically from backend workflows
  const images = ref<ImageItem[]>([])

  // ── Helpers ────────────────────────────────────────────
  function generateRandomProps() {
    return {
      randomTop: Math.random() * 70,
      randomLeft: Math.random() * 78,
      randomRotation: (Math.random() - 0.5) * 40,
      randomWidth: 140 + Math.random() * 100,
      randomScale: 0.85 + Math.random() * 0.35,
      randomZIndex: Math.floor(Math.random() * 10),
    }
  }

  // ── Getters ────────────────────────────────────────────
  const focalImage = computed(() =>
    images.value.find((img) => img.id === focalImageId.value) ?? images.value[0],
  )

  const surroundingImages = computed(() =>
    images.value.filter((img) => img.id !== focalImageId.value),
  )

  // ── Actions ────────────────────────────────────────────

  /**
   * Fetch workflows from the backend and create one image per workflow.
   * Images use random picsum photos; the workflow data is attached for mapping.
   */
  async function populateFromWorkflows() {
    isLoading.value = true
    error.value = null

    try {
      const workflows = await fetchTaggedWorkflows()

      images.value = workflows.map((workflow, index) => ({
        id: `img-${index + 1}`,
        src: `https://picsum.photos/seed/v${index + 1}/600/400`,
        alt: workflow.displayName,
        workflow,
        ...generateRandomProps(),
      }))

      // Default focal image to the first one
      const firstImage = images.value[0]
      if (firstImage) {
        focalImageId.value = firstImage.id
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load workflows'
      console.error('Error populating images from workflows:', err)
    } finally {
      isLoading.value = false
    }
  }

  function setLayout(mode: LayoutMode) {
    if (mode === 'randomized') {
      shuffleRandomPositions()
    }
    activeLayout.value = mode
  }

  function setFocalImage(imageId: string) {
    focalImageId.value = imageId
  }

  function shuffleRandomPositions() {
    images.value.forEach((img) => {
      const props = generateRandomProps()
      img.randomTop = props.randomTop
      img.randomLeft = props.randomLeft
      img.randomRotation = props.randomRotation
      img.randomWidth = props.randomWidth
      img.randomScale = props.randomScale
      img.randomZIndex = props.randomZIndex
    })
  }

  return {
    // State
    activeLayout,
    focalImageId,
    images,
    isLoading,
    error,
    // Getters
    focalImage,
    surroundingImages,
    // Actions
    setLayout,
    setFocalImage,
    shuffleRandomPositions,
    populateFromWorkflows,
  }
})
