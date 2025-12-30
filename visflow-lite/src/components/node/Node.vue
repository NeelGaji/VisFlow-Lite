<template>
  <div
    ref="nodeElement"
    class="node"
    :class="{ selected: isSelected, active: isActive }"
    :style="nodeStyle"
    :data-node-id="id"
    @mousedown="onMouseDown"
  >
    <!-- Background -->
    <div class="background"></div>

    <!-- Icon when iconized -->
    <div v-if="isIconized" class="icon">
      <img :src="iconPath" :alt="label" />
    </div>

    <!-- Content when expanded -->
    <div v-else class="content">
      <slot name="content"></slot>
    </div>

    <!-- Label -->
    <div v-if="showLabel" class="label">{{ label }}</div>

    <!-- Input Ports -->
    <div v-if="!isIconized" class="port-group input">
      <Port
        v-for="(port, index) in inputPorts"
        :key="port.id"
        :id="port.id"
        :node-id="id"
        port-type="input"
        :data-type="port.dataType"
        :style="getPortStyle(port, index, true)"
      />
    </div>

    <!-- Output Ports -->
    <div v-if="!isIconized" class="port-group output">
      <Port
        v-for="(port, index) in outputPorts"
        :key="port.id"
        :id="port.id"
        :node-id="id"
        port-type="output"
        :data-type="port.dataType"
        :style="getPortStyle(port, index, false)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNode } from './Node'
import Port from '@/components/port/Port.vue'

import type { PortSpec } from '@/stores/dataflow/types'

const props = defineProps<{
  id: string
  type: string
  x: number
  y: number
  label?: string
  width?: number
  height?: number
  isIconized?: boolean
  isSelected?: boolean
  isActive?: boolean
  inputs?: PortSpec[]
  outputs?: PortSpec[]
}>()

const {
  nodeElement,
  nodeStyle,
  iconPath,
  showLabel,
  inputPorts,
  outputPorts,
  getPortStyle,
  onMouseDown,
} = useNode(props)
</script>

<style scoped lang="scss" src="./Node.scss"></style>
