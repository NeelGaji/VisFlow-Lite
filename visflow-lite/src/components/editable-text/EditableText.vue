<template>
  <div @click="onClick" class="editable-text">
    <span
      ref="textRef"
      @keydown.enter.prevent="onEnter"
      @blur="onBlur"
    >{{ displayText }}</span>
    <i v-if="useEditButton" class="bi bi-pencil edit-icon" @click.stop="makeEditable"></i>
  </div>
</template>

<script setup lang="ts">
import { useEditableText } from './EditableText'

const props = withDefaults(defineProps<{
  modelValue: string
  useEditButton?: boolean
}>(), {
  useEditButton: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const {
  textRef,
  displayText,
  onClick,
  onEnter,
  onBlur,
  makeEditable
} = useEditableText(props, emit)
</script>

<style scoped lang="scss" src="./EditableText.scss"></style>
