<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import IssueSidebar from '../components/IssueSidebar.vue'
import IssueMap from '../components/IssueMap.vue'
import IssueForm from '../components/IssueForm.vue'
import IssueDetails from '../components/IssueDetails.vue'
import useUser from '../composables/useUser'
import { fetchIssues } from '../core/data/issueService'
import { fetchCategories } from '../core/data/categoryService'
import { fetchStatuses } from '../core/data/statusService'
import type { Category, Status } from '../core/models/Catalog'
import type { Issue, IssueFilters } from '../core/models/Issue'
import type { Point } from '../core/constants/city'

const router = useRouter()
const { user } = useUser()

const issues = ref<Issue[]>([])
const categories = ref<Category[]>([])
const statuses = ref<Status[]>([])
const loading = ref(false)
const listError = ref('')

const filters = reactive<IssueFilters>({
  search: '',
  categoryId: null,
  statusId: null,
  sort: 'newest',
})

const selectedId = ref<number | null>(null)
const detailsId = ref<number | null>(null)
const detailsVersion = ref(0)

const formOpen = ref(false)
const editing = ref<Issue | null>(null)
const formPoint = ref<Point | null>(null)
const picking = ref(false)

const hiddenCategories = ref(new Set<number>())

let requestId = 0

const loadIssues = async () => {
  const current = ++requestId
  loading.value = true
  listError.value = ''
  try {
    const result = await fetchIssues({ ...filters })
    if (current === requestId) issues.value = result
  } catch (err: any) {
    if (current === requestId) listError.value = err?.message || 'Не удалось загрузить обращения'
  } finally {
    if (current === requestId) loading.value = false
  }
}

onMounted(async () => {
  const [loadedCategories, loadedStatuses] = await Promise.allSettled([
    fetchCategories(),
    fetchStatuses(),
  ])
  if (loadedCategories.status === 'fulfilled') categories.value = loadedCategories.value
  if (loadedStatuses.status === 'fulfilled') statuses.value = loadedStatuses.value
  await loadIssues()
})

watch(filters, loadIssues, { deep: true })

const onFilters = (patch: Partial<IssueFilters>) => {
  Object.assign(filters, patch)
}

const openCreate = () => {
  if (user.value.isGuest) {
    router.push({ path: '/', query: { redirect: '/map' } })
    return
  }
  editing.value = null
  formPoint.value = null
  formOpen.value = true
  picking.value = true
  detailsId.value = null
}

const openEdit = (issue: Issue) => {
  editing.value = issue
  formPoint.value = { lat: issue.lat, lng: issue.lng }
  formOpen.value = true
  picking.value = false
  detailsId.value = null
}

const closeForm = () => {
  formOpen.value = false
  editing.value = null
  formPoint.value = null
  picking.value = false
}

const onSaved = async (saved: Issue) => {
  formOpen.value = false
  editing.value = null
  picking.value = false
  formPoint.value = null

  if (filters.categoryId && filters.categoryId !== saved.category.id) filters.categoryId = null
  if (filters.statusId && filters.statusId !== saved.status.id) filters.statusId = null
  if (hiddenCategories.value.has(saved.category.id)) {
    const next = new Set(hiddenCategories.value)
    next.delete(saved.category.id)
    hiddenCategories.value = next
  }

  await loadIssues()
  selectedId.value = saved.id
  detailsId.value = saved.id
  detailsVersion.value += 1
}

const selectFromList = (id: number) => {
  selectedId.value = id
  detailsId.value = id
  if (!formOpen.value) detailsVersion.value += 1
}

const selectFromMap = (id: number | null) => {
  selectedId.value = id
}

const openFromMap = (id: number) => {
  selectedId.value = id
  detailsId.value = id
  detailsVersion.value += 1
}

const onPoint = (point: Point | null) => {
  formPoint.value = point
  picking.value = false
}

const onToggleCategory = (id: number) => {
  const next = new Set(hiddenCategories.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  hiddenCategories.value = next
}

const onIssueUpdated = (updated: Issue) => {
  const exists = issues.value.some((item) => item.id === updated.id)
  if (!exists) {
    void loadIssues()
    return
  }
  issues.value = issues.value.map((item) => (item.id === updated.id ? updated : item))
}

const onIssueDeleted = (id: number) => {
  issues.value = issues.value.filter((item) => item.id !== id)
  if (detailsId.value === id) detailsId.value = null
  if (selectedId.value === id) selectedId.value = null
}

const requireAuth = () => {
  router.push({ path: '/', query: { redirect: '/map' } })
}
</script>

<template>
  <div class="map-page">
    <AppHeader />

    <div class="workspace">
      <IssueForm
        v-if="formOpen"
        class="column"
        :issue="editing"
        :categories="categories"
        :statuses="statuses"
        :point="formPoint"
        :picking="picking"
        @close="closeForm"
        @saved="onSaved"
        @update:point="onPoint"
        @set-picking="picking = $event"
      />

      <IssueSidebar
        v-else
        class="column"
        :issues="issues"
        :categories="categories"
        :statuses="statuses"
        :loading="loading"
        :active-id="selectedId"
        :filters="filters"
        @create="openCreate"
        @select="selectFromList"
        @update:filters="onFilters"
      />

      <IssueMap
        :issues="issues"
        :categories="categories"
        :selected-id="selectedId"
        :hidden-categories="hiddenCategories"
        :point="formOpen ? formPoint : null"
        :picking="picking"
        @select="selectFromMap"
        @open="openFromMap"
        @pick="onPoint"
        @toggle-category="onToggleCategory"
      />

      <div v-if="listError" class="toast">
        <AppIcon name="warning" :size="14" />
        {{ listError }}
        <button class="toast__close" @click="listError = ''">
          <AppIcon name="close" :size="11" />
        </button>
      </div>

      <Transition name="slide">
        <div v-if="detailsId" class="details-layer">
          <IssueDetails
            :key="`${detailsId}-${detailsVersion}`"
            :issue-id="detailsId"
            :can-manage="user.role === 'moderator' || user.role === 'admin'"
            @close="detailsId = null"
            @updated="onIssueUpdated"
            @deleted="onIssueDeleted"
            @edit="openEdit"
            @auth="requireAuth"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  height: 100%;
  display: grid;
  grid-template-rows: 58px 1fr;
  overflow: hidden;
}

.workspace {
  position: relative;
  display: grid;
  grid-template-columns: 340px 1fr;
  min-height: 0;
}

.column {
  min-height: 0;
}

.details-layer {
  position: absolute;
  top: 12px;
  right: 12px;
  bottom: 12px;
  width: 390px;
  z-index: 8;
  min-height: 0;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 44px;
  transform: translateX(-50%);
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid #b3473b;
  color: #e8a096;
  font-size: 12px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5);
}

.toast__close {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: inherit;
}

.toast__close:hover {
  background: rgba(255, 255, 255, 0.08);
}

.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(18px);
  opacity: 0;
}

@media (max-width: 1100px) {
  .details-layer {
    width: 360px;
  }
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 300px 1fr;
  }

  .details-layer {
    width: calc(100% - 24px);
    left: 12px;
  }
}
</style>
