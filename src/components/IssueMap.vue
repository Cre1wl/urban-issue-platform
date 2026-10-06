<script setup>
import { useTemplateRef } from 'vue'
import { useCityMap } from '../composables/useCityMap'

const el = useTemplateRef('map')
const { cursor, pinned, clearPin } = useCityMap(el)
</script>

<template>
  <main class="map-wrap">
    <div ref="map" class="map"></div>

    <button class="map-readout" :title="pinned ? 'Снять точку' : ''" @click.stop="clearPin">
      <span v-if="pinned" class="map-readout__value">{{ pinned }}</span>
      <span v-if="pinned" class="map-readout__hint">снять</span>
      <span v-else class="map-readout__value map-readout__value--live">
        {{ cursor || 'наведите курсор' }}
      </span>
    </button>
  </main>
</template>

<style scoped>
.map-wrap {
  position: relative;
  min-width: 0;
  background: var(--bg);
}

.map {
  width: 100%;
  height: 100%;
}

/* Осветление растровой подложки: фильтр применяется только к базовому слою тайлов */
.map :deep(.ol-layer:first-child > canvas) {
  filter: brightness(1.3) saturate(1.4) contrast(1.1);
}

/* Элементы OpenLayers создаются библиотекой вне шаблона — к ним применяется :deep */

.map :deep(.ol-zoom) {
  top: 12px;
  left: 12px;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.map :deep(.ol-zoom button) {
  width: 32px;
  height: 32px;
  background: var(--surface);
  color: var(--text-dim);
  border: none;
  border-radius: 0;
  font-size: 16px;
  transition:
    background 0.12s,
    color 0.12s;
}

.map :deep(.ol-zoom button:hover) {
  background: var(--surface-3);
  color: var(--accent);
}

.map :deep(.ol-attribution) {
  background: rgba(21, 21, 26, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 6px;
}

.map :deep(.ol-attribution ul) {
  font-size: 10.5px;
  color: var(--text-muted);
}

.map :deep(.ol-attribution a) {
  color: var(--text-dim);
  text-decoration: none;
}

.map :deep(.ol-attribution a:hover) {
  color: var(--accent);
}

.map :deep(.ol-scale-line) {
  left: 12px;
  bottom: 12px;
  background: rgba(21, 21, 26, 0.8);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 6px;
}

.map :deep(.ol-scale-line-inner) {
  color: var(--text-dim);
  border-color: var(--text-dim);
  font-size: 10px;
}

.map-readout {
  position: absolute;
  left: 12px;
  bottom: 42px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 11.5px;
}

.map-readout__value {
  font-family: var(--mono);
  letter-spacing: -0.01em;
}

.map-readout__value--live {
  color: var(--text-muted);
}

.map-readout__hint {
  color: var(--text-muted);
  font-size: 11px;
}
</style>
