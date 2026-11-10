<script setup lang="ts">
import { computed } from 'vue'
import { iconDefinition } from '../core/constants/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: null },
})

const icon = computed(() => iconDefinition(props.name))
const width = computed(() => props.size ?? icon.value.size)
</script>

<template>
  <svg
    :width="width"
    :height="width"
    :viewBox="icon.viewBox"
    fill="none"
    stroke="currentColor"
    :stroke-width="icon.stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="icon.body"
  />
</template>
