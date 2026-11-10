<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { contrastText } from '../core/utils/color'
import { formatDate } from '../core/utils/format'
import type { Category, Status } from '../core/models/Catalog'
import type { Issue, IssueFilters, IssueSort } from '../core/models/Issue'

const props = defineProps<{
  issues: Issue[]
  categories: Category[]
  statuses: Status[]
  loading: boolean
  activeId: number | null
  filters: IssueFilters
}>()

const emit = defineEmits<{
  create: []
  select: [id: number]
  'update:filters': [patch: Partial<IssueFilters>]
}>()

const SORTS: { value: IssueSort; label: string }[] = [
  { value: 'newest', label: 'свежие' },
  { value: 'oldest', label: 'старые' },
  { value: 'votes', label: 'по голосам' },
  { value: 'category', label: 'по категории' },
  { value: 'status', label: 'по статусу' },
]

const search = ref(props.filters.search)
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.filters.search,
  (value) => {
    if (value !== search.value) search.value = value
  },
)

const onSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emit('update:filters', { search: search.value }), 300)
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const onCategory = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  emit('update:filters', { categoryId: value || null })
}

const onStatus = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  emit('update:filters', { statusId: value || null })
}

const onSort = (event: Event) => {
  emit('update:filters', { sort: (event.target as HTMLSelectElement).value as IssueSort })
}

const hasFilters = computed(
  () => Boolean(props.filters.search || props.filters.categoryId || props.filters.statusId),
)

const reset = () => {
  search.value = ''
  emit('update:filters', { search: '', categoryId: null, statusId: null })
}

const statusStyle = (status: Status) => ({
  background: status.color,
  color: contrastText(status.color),
})
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__head">
      <div class="sidebar__title">
        Обращения
        <span class="sidebar__title-count">{{ issues.length }}</span>
      </div>
      <button class="btn btn--outline btn--sm" @click="emit('create')">
        <AppIcon name="plus" />
        Новое
      </button>
    </div>

    <div class="sidebar__search">
      <AppIcon name="search" class="sidebar__search-icon" />
      <input
        v-model="search"
        type="text"
        placeholder="Адрес, описание…"
        @input="onSearch"
      />
      <button v-if="search" class="sidebar__search-clear" title="Очистить" @click="reset">
        <AppIcon name="close" :size="11" />
      </button>
    </div>

    <div class="filters">
      <div class="filters__row">
        <select class="select" :value="filters.categoryId ?? ''" @change="onCategory">
          <option value="">Все категории</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <select class="select" :value="filters.statusId ?? ''" @change="onStatus">
          <option value="">Все статусы</option>
          <option v-for="status in statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>

      <div class="filters__row filters__row--meta">
        <label class="filters__sort">
          <AppIcon name="filter" :size="12" />
          <select class="select select--bare" :value="filters.sort" @change="onSort">
            <option v-for="item in SORTS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
        <button v-if="hasFilters" class="filters__reset" @click="reset">Сбросить</button>
        <span v-else class="filters__hint">{{ issues.length }} шт.</span>
      </div>
    </div>

    <div class="list">
      <div v-if="loading" class="skeleton">
        <div v-for="index in 3" :key="index" class="skeleton__item">
          <span class="skeleton__line skeleton__line--short"></span>
          <span class="skeleton__line"></span>
          <span class="skeleton__line skeleton__line--medium"></span>
        </div>
      </div>

      <template v-else-if="issues.length">
        <button
          v-for="issue in issues"
          :key="issue.id"
          class="issue"
          :class="{ 'issue--active': issue.id === activeId }"
          @click="emit('select', issue.id)"
        >
          <span class="issue__bar" :style="{ background: issue.category.color }"></span>

          <div class="issue__head">
            <span class="issue__date">{{ formatDate(issue.createdAt) }}</span>
            <span class="issue__status" :style="statusStyle(issue.status)">
              {{ issue.status.name }}
            </span>
          </div>

          <p class="issue__text">{{ issue.description }}</p>

          <div class="issue__address">
            <AppIcon name="map-pin" :size="11" />
            <span>{{ issue.address || 'Адрес не указан' }}</span>
          </div>

          <div class="issue__foot">
            <span class="issue__category">
              <span class="issue__category-icon" :style="{ color: issue.category.color }">
                <AppIcon :name="issue.category.icon" :size="11" />
              </span>
              {{ issue.category.name }}
            </span>
            <span class="issue__stat">
              <AppIcon name="vote" :size="11" />
              {{ issue.votes }}
            </span>
            <span class="issue__stat">
              <AppIcon name="message" :size="11" />
              {{ issue.commentsCount }}
            </span>
          </div>
        </button>
      </template>

      <div v-else class="empty">
        <AppIcon name="search" :size="30" />
        <div class="empty__title">{{ hasFilters ? 'Ничего не найдено' : 'Пока нет обращений' }}</div>
        <div v-if="hasFilters">
          Попробуйте изменить запрос или сбросить фильтры
          <button class="empty__reset" @click="reset">Сбросить</button>
        </div>
        <div v-else>Когда жители сообщат о проблемах, они появятся здесь и на карте</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  min-height: 0;
}

.sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.sidebar__title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar__title-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--surface-3);
}

.sidebar__search {
  padding: 0 16px 10px;
  position: relative;
}

.sidebar__search input {
  width: 100%;
  padding: 8px 30px 8px 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  outline: none;
  font-size: 13px;
}

.sidebar__search input::placeholder {
  color: var(--text-muted);
}

.sidebar__search input:focus {
  border-color: var(--border-strong);
  background: var(--surface-3);
}

.sidebar__search-icon {
  position: absolute;
  left: 26px;
  top: 50%;
  transform: translateY(calc(-50% - 5px));
  color: var(--text-muted);
  pointer-events: none;
}

.sidebar__search-clear {
  position: absolute;
  right: 23px;
  top: 50%;
  transform: translateY(calc(-50% - 5px));
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--text-muted);
}

.sidebar__search-clear:hover {
  color: var(--text);
  background: var(--border);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--border);
}

.filters__row {
  display: flex;
  gap: 6px;
}

.filters__row--meta {
  align-items: center;
  justify-content: space-between;
}

.select {
  flex: 1;
  min-width: 0;
  appearance: none;
  padding: 6px 24px 6px 9px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background:
    linear-gradient(45deg, transparent 50%, var(--text-muted) 50%) right 11px center / 4px 4px no-repeat,
    linear-gradient(135deg, var(--text-muted) 50%, transparent 50%) right 7px center / 4px 4px no-repeat,
    var(--surface-2);
  color: var(--text-dim);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.select:hover {
  border-color: var(--border-strong);
}

.select:focus {
  outline: none;
  border-color: var(--accent);
}

.filters__sort {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
}

.select--bare {
  flex: none;
  border: none;
  background: transparent;
  color: var(--text-muted);
  padding: 2px 16px 2px 0;
  font-size: 12px;
  background:
    linear-gradient(45deg, transparent 50%, var(--text-muted) 50%) right 5px center / 4px 4px no-repeat,
    linear-gradient(135deg, var(--text-muted) 50%, transparent 50%) right 1px center / 4px 4px no-repeat;
}

.select--bare:hover {
  color: var(--text);
}

.filters__reset {
  font-size: 11.5px;
  color: var(--text-muted);
  padding: 2px 4px;
  border-radius: 4px;
}

.filters__reset:hover {
  color: var(--accent);
  background: var(--surface-2);
}

.filters__hint {
  font-size: 11.5px;
  color: var(--text-muted);
}

.list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.issue {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 14px 11px 18px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}

.issue:hover {
  background: var(--surface-2);
}

.issue--active {
  background: var(--surface-2);
}

.issue--active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-left: 2px solid var(--accent);
  pointer-events: none;
}

.issue__bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0.9;
}

.issue__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.issue__date {
  font-size: 11px;
  color: var(--text-muted);
}

.issue__status {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.55;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue__text {
  font-size: 12.8px;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.issue__address {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.issue__address svg {
  margin-top: 1.5px;
  flex-shrink: 0;
}

.issue__address span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
}

.issue__category {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.issue__category-icon {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
}

.issue__stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.skeleton__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 18px;
  border-bottom: 1px solid var(--border);
}

.skeleton__line {
  height: 9px;
  border-radius: 4px;
  background: var(--surface-3);
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton__line--short {
  width: 38%;
}

.skeleton__line--medium {
  width: 64%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 0.95;
  }
}

.empty {
  margin: auto;
  text-align: center;
  padding: 32px 20px;
  color: var(--text-muted);
  font-size: 13px;
  max-width: 260px;
}

.empty svg {
  margin: 0 auto 10px;
  color: var(--border-strong);
}

.empty__title {
  color: var(--text-dim);
  margin-bottom: 4px;
  font-size: 13.5px;
  font-weight: 600;
}

.empty__reset {
  display: block;
  margin: 10px auto 0;
  color: var(--accent);
  font-size: 12.5px;
  padding: 3px 8px;
  border-radius: 4px;
}

.empty__reset:hover {
  background: var(--surface-2);
}
</style>
