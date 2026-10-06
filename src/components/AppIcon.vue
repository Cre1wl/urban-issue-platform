<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: null },
})

const ICONS = {
  bell: { viewBox: '0 0 24 24', stroke: 1.8, size: 16 },
  user: { viewBox: '0 0 24 24', stroke: 1.8, size: 15 },
  plus: { viewBox: '0 0 24 24', stroke: 2.4, size: 12 },
  search: { viewBox: '0 0 24 24', stroke: 1.8, size: 14 },
  'chevron-down': { viewBox: '0 0 24 24', stroke: 2, size: 10 },
  warning: { viewBox: '0 0 32 32', stroke: 2.4, size: 36 },
}

const icon = computed(() => ICONS[props.name] ?? ICONS.warning)
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
  >
    <template v-if="name === 'bell'">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </template>

    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </template>

    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>

    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </template>

    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>

    <template v-else>
      <path d="M16 5.2 26.5 26H5.5Z" />
      <circle cx="16" cy="16.8" r="3.4" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>
