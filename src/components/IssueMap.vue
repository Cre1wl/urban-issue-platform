<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import AppIcon from './AppIcon.vue'
import { useCityMap } from '../composables/useCityMap'
import { contrastText } from '../core/utils/color'
import { formatDate, plural } from '../core/utils/format'
import type { Category } from '../core/models/Catalog'
import type { Issue } from '../core/models/Issue'
import type { Point } from '../core/constants/city'

const props = defineProps<{
  issues: Issue[]
  categories: Category[]
  selectedId: number | null
  hiddenCategories: Set<number>
  point: Point | null
  picking: boolean
}>()

const emit = defineEmits<{
  select: [id: number | null]
  open: [id: number]
  pick: [point: Point]
  'toggle-category': [id: number]
}>()

const mapEl = useTemplateRef<HTMLElement>('map')
const popupEl = useTemplateRef<HTMLElement>('popup')
const popupIssue = ref<Issue | null>(null)

const selectedRef = computed(() => props.selectedId)
const hiddenRef = computed(() => props.hiddenCategories)
const pickingRef = computed(() => props.picking)
const pointRef = computed(() => props.point)
const issuesRef = computed(() => props.issues)

const { cursor, hidePopup } = useCityMap({
  target: mapEl,
  popupEl,
  issues: issuesRef,
  selectedId: selectedRef,
  hiddenCategories: hiddenRef,
  picking: pickingRef,
  point: pointRef,
  onSelect: (id) => emit('select', id),
  onOpen: (issue) => {
    popupIssue.value = issue
  },
  onPick: (point) => emit('pick', point),
})

const counts = computed(() => {
  const result = new Map<number, number>()
  for (const issue of props.issues) {
    result.set(issue.category.id, (result.get(issue.category.id) ?? 0) + 1)
  }
  return result
})

const visibleCount = computed(
  () => props.categories.filter((category) => !props.hiddenCategories.has(category.id)).length,
)

const statusStyle = (issue: Issue) => ({
  background: issue.status.color,
  color: contrastText(issue.status.color),
})

const categoryStyle = (category: Category) => ({
  background: category.color,
  color: contrastText(category.color),
})

const closePopup = () => {
  popupIssue.value = null
  hidePopup()
}

const openDetails = () => {
  if (!popupIssue.value) return
  emit('open', popupIssue.value.id)
  closePopup()
}

const toggleCategory = (id: number) => emit('toggle-category', id)
</script>

<template>
  <main class="map-wrap">
    <div ref="map" class="map"></div>

    <div ref="popup" class="popup">
      <template v-if="popupIssue">
        <button class="popup__close" title="Закрыть" @click.stop="closePopup">
          <AppIcon name="close" :size="12" />
        </button>

        <img
          v-if="popupIssue.photos.length"
          class="popup__photo"
          :src="popupIssue.photos[0]"
          alt=""
        />

        <div class="popup__body">
          <div class="popup__tags">
            <span class="popup__tag" :style="statusStyle(popupIssue)">
              {{ popupIssue.status.name }}
            </span>
            <span class="popup__tag" :style="categoryStyle(popupIssue.category)">
              <AppIcon :name="popupIssue.category.icon" :size="11" />
              {{ popupIssue.category.name }}
            </span>
          </div>

          <p class="popup__text">{{ popupIssue.description }}</p>

          <div class="popup__address">
            <AppIcon name="map-pin" :size="12" />
            {{ popupIssue.address || 'Адрес не указан' }}
          </div>

          <div class="popup__meta">
            <span>{{ formatDate(popupIssue.createdAt) }}</span>
            <span class="popup__meta-item">
              <AppIcon name="vote" :size="12" />
              {{ popupIssue.votes }}
            </span>
            <span class="popup__meta-item">
              <AppIcon name="message" :size="12" />
              {{ popupIssue.commentsCount }}
            </span>
          </div>

          <button class="btn btn--primary btn--block btn--sm" @click.stop="openDetails">
            Подробнее
          </button>
        </div>
      </template>
    </div>

    <section class="legend">
      <header class="legend__head">
        <span>Категории</span>
        <span class="legend__count">{{ visibleCount }}/{{ categories.length }}</span>
      </header>

      <div class="legend__list">
        <button
          v-for="category in categories"
          :key="category.id"
          class="legend__item"
          :class="{ 'legend__item--off': hiddenCategories.has(category.id) }"
          @click="toggleCategory(category.id)"
        >
          <span class="legend__swatch" :style="categoryStyle(category)">
            <AppIcon :name="category.icon" :size="11" />
          </span>
          <span class="legend__name">{{ category.name }}</span>
          <span class="legend__number">{{ counts.get(category.id) ?? 0 }}</span>
        </button>
      </div>

      <p v-if="!categories.length" class="legend__empty">Нет активных категорий</p>
    </section>

    <div v-if="picking" class="pick-hint">
      <AppIcon name="map-pin" :size="14" />
      Кликните по карте, чтобы поставить точку
    </div>

    <div class="map-readout">
      <span class="map-readout__label">{{ point && picking ? 'точка' : 'курсор' }}</span>
      <span class="map-readout__value">
        {{ point && picking ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : cursor || '—' }}
      </span>
    </div>

    <div class="map-counter">
      {{ issues.length }} {{ plural(issues.length, 'обращение', 'обращения', 'обращений') }}
    </div>
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

.legend {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  width: 224px;
  max-height: calc(100% - 92px);
  display: flex;
  flex-direction: column;
  background: rgba(21, 21, 26, 0.92);
  backdrop-filter: blur(6px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.legend__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  border-bottom: 1px solid var(--border);
}

.legend__count {
  font-weight: 400;
  color: var(--text-muted);
}

.legend__list {
  overflow-y: auto;
  padding: 6px;
}

.legend__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px;
  border-radius: 5px;
  color: var(--text-dim);
  text-align: left;
  transition:
    background 0.12s,
    opacity 0.12s;
}

.legend__item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.legend__item--off {
  opacity: 0.38;
}

.legend__swatch {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.legend__name {
  flex: 1;
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend__number {
  font-size: 11px;
  color: var(--text-muted);
}

.legend__empty {
  padding: 10px 12px 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.pick-hint {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 7;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  color: var(--accent);
  font-size: 12.5px;
  font-weight: 500;
  pointer-events: none;
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

.map-readout__label {
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 9.5px;
  letter-spacing: 0.06em;
}

.map-readout__value {
  font-family: var(--mono);
  letter-spacing: -0.01em;
}

.map-counter {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 5;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(21, 21, 26, 0.85);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11.5px;
}

/* Popup создаётся как элемент Overlay и позиционируется библиотекой */
.popup {
  width: 286px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.popup__close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(15, 15, 17, 0.72);
  color: var(--text-dim);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.popup__close:hover {
  color: var(--text);
  background: rgba(15, 15, 17, 0.92);
}

.popup__photo {
  display: block;
  width: 100%;
  height: 132px;
  object-fit: cover;
}

.popup__body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.popup__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.popup__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.5;
}

.popup__text {
  font-size: 12.5px;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popup__address {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 11.5px;
  color: var(--text-muted);
}

.popup__address svg {
  margin-top: 1px;
  flex-shrink: 0;
}

.popup__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
}

.popup__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 900px) {
  .legend {
    width: 190px;
  }
}
</style>
