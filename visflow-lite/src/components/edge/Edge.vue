<template>
  <svg v-if="edgeData" class="edge" :class="{ 'is-selected': isSelected }">
    <path
      :d="pathData"
      :stroke="strokeColor"
      stroke-width="2"
      fill="none"
      :data-edge-id="edgeData.id"
    />
  </svg>
</template>

<script setup lang="ts">
import { useEdge } from './Edge'
import type { EdgeData } from '@/stores/dataflow/types'

const props = defineProps<{
  edgeData: EdgeData
}>()

const { pathData, strokeColor, isSelected } = useEdge(props)
</script>

<style scoped lang="scss" src="./Edge.scss"></style>
