import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Point {
  x: number
  y: number
}

export const useInteractionStore = defineStore('interaction', () => {
  // State
  const mousePosition = ref<Point>({ x: 0, y: 0 })
  const isShiftPressed = ref(false)

  // Actions
  function trackMouseMove(point: Point) {
    mousePosition.value = point
  }

  function setShiftPressed(pressed: boolean) {
    isShiftPressed.value = pressed
  }

  return {
    // State
    mousePosition,
    isShiftPressed,
    // Actions
    trackMouseMove,
    setShiftPressed,
  }
})
