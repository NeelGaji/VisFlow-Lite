<template>
  <div
    ref="portElement"
    class="port"
    :class="[portType, { 'is-connected': isConnected, 'is-dragging': isDragging }]"
    :data-port-id="id"
    :data-node-id="nodeId"
    @mousedown.stop="onPortMouseDown"
  >
    <div class="port-icon">
      <i :class="iconClass"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePort } from './Port'

const props = defineProps<{
  id: string
  nodeId: string
  portType: 'input' | 'output'
  dataType: string
}>()

const { portElement, isConnected, isDragging, iconClass, onPortMouseDown } = usePort(props)
</script>

<style scoped lang="scss" src="./Port.scss"></style>
