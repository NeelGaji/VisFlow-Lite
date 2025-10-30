<template>
  <svg v-if="edgeData" class="edge-preview">
    <path
      :d="pathData"
      stroke="#0d6efd"
      stroke-width="2"
      stroke-dasharray="5,5"
      fill="none"
      opacity="0.7"
    />
  </svg>
</template>

<script setup lang="ts">
import { useEdgePreview } from './EdgePreview'
import type { EdgeCreationData } from '@/stores/dataflow/types'

const props = defineProps<{
  edgeData: EdgeCreationData
  mouseX: number
  mouseY: number
}>()

const { pathData } = useEdgePreview(props)
</script>

<style scoped lang="scss" src="./EdgePreview.scss"></style>
