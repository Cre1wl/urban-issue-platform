<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import IssueDetails from '../components/IssueDetails.vue'
import IssueForm from '../components/IssueForm.vue'
import StatsPanel from '../components/moderation/StatsPanel.vue'
import CategoryManager from '../components/moderation/CategoryManager.vue'
import StatusManager from '../components/moderation/StatusManager.vue'
import ServiceManager from '../components/moderation/ServiceManager.vue'
import UserManager from '../components/moderation/UserManager.vue'
import { fetchIssues } from '../core/data/issueService'
import { fetchAllCategories } from '../core/data/categoryService'
import { fetchAllStatuses } from '../core/data/statusService'
import { contrastText } from '../core/utils/color'
import { formatDate, formatTime, plural } from '../core/utils/format'
import type { Category, Status } from '../core/models/Catalog'
import type { Issue, IssueFilters, IssueSort } from '../core/models/Issue'
import type { Point } from '../core/constants/city'

type Tab = 'dashboard' | 'queue' | 'issues' | 'categories' | 'statuses' | 'services' | 'users'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'queue', label: 'Очередь', icon: 'clock' },
  { id: 'issues', label: 'Обращения', icon: 'list' },
  { id: 'dashboard', label: 'Дашборд', icon: 'dashboard' },
  { id: 'categories', label: 'Категории', icon: 'tag' },
  { id: 'statuses', label: 'Статусы', icon: 'filter' },
  { id: 'services', label: 'Службы', icon: 'shield' },
  { id: 'users', label: 'Пользователи', icon: 'users' },
]

const SORTS: { value: IssueSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'votes', label: 'По голосам' },
  { value: 'category', label: 'По категории' },
  { value: 'status', label: 'По статусу' },
]

const tab = ref<Tab>('queue')

const categories = ref<Category[]>([])
const statuses = ref<Status[]>([])
const catalogError = ref('')

const pendingStatus = computed(() => statuses.value.find((item) => item.key === 'pending') ?? null)

const queue = ref<Issue[]>([])
const queueLoading = ref(false)
const queueError = ref('')
const queueCategory = ref('')
const queueFrom = ref('')
const queueTo = ref('')
const queueSort = ref<IssueSort>('oldest')

const issues = ref<Issue[]>([])
const issuesLoading = ref(false)
const issuesError = ref('')
const issueFilters = reactive<IssueFilters>({
  search: '',
  categoryId: null,
  statusId: null,
  sort: 'newest',
})
const issueFrom = ref('')
const issueTo = ref('')

const selectedId = ref<number | null>(null)
const detailsVersion = ref(0)

const formOpen = ref(false)
const editing = ref<Issue | null>(null)
const formPoint = ref<Point | null>(null)
const picking = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const loadQueue = async () => {
  if (!pendingStatus.value) {
    queue.value = []
    return
  }
  queueLoading.value = true
  queueError.value = ''
  try {
    queue.value = await fetchIssues({
      search: '',
      categoryId: queueCategory.value ? Number(queueCategory.value) : null,
      statusId: pendingStatus.value.id,
      sort: queueSort.value,
      from: queueFrom.value || undefined,
      to: queueTo.value || undefined,
    })
  } catch (err: any) {
    queueError.value = err?.message || 'Не удалось загрузить очередь'
  } finally {
    queueLoading.value = false
  }
}

const loadIssues = async () => {
  issuesLoading.value = true
  issuesError.value = ''
  try {
    issues.value = await fetchIssues({
      ...issueFilters,
      from: issueFrom.value || undefined,
      to: issueTo.value || undefined,
    })
  } catch (err: any) {
    issuesError.value = err?.message || 'Не удалось загрузить обращения'
  } finally {
    issuesLoading.value = false
  }
}

const loadCatalog = async () => {
  catalogError.value = ''
  const [loadedCategories, loadedStatuses] = await Promise.allSettled([
    fetchAllCategories(),
    fetchAllStatuses(),
  ])
  if (loadedCategories.status === 'fulfilled') categories.value = loadedCategories.value
  if (loadedStatuses.status === 'fulfilled') statuses.value = loadedStatuses.value
  if (loadedCategories.status === 'rejected' || loadedStatuses.status === 'rejected') {
    catalogError.value = 'Не удалось загрузить справочники'
  }
}

onMounted(async () => {
  await loadCatalog()
  await Promise.all([loadQueue(), loadIssues()])
})

watch([queueCategory, queueFrom, queueTo, queueSort], loadQueue)
watch(
  [() => issueFilters.categoryId, () => issueFilters.statusId, () => issueFilters.sort, issueFrom, issueTo],
  loadIssues,
)
watch(
  () => issueFilters.search,
  () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(loadIssues, 300)
  },
)

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const statusStyle = (status: Status) => ({
  background: status.color,
  color: contrastText(status.color),
})

const categoryStyle = (category: Category) => ({
  background: category.color,
  color: contrastText(category.color),
})

const openIssue = (id: number) => {
  selectedId.value = id
  detailsVersion.value += 1
}

const patchIssue = (updated: Issue) => {
  if (issues.value.some((item) => item.id === updated.id)) {
    issues.value = issues.value.map((item) => (item.id === updated.id ? updated : item))
  }

  if (queue.value.some((item) => item.id === updated.id)) {
    queue.value =
      pendingStatus.value && updated.status.id === pendingStatus.value.id
        ? queue.value.map((item) => (item.id === updated.id ? updated : item))
        : queue.value.filter((item) => item.id !== updated.id)
  }
}

const removeIssue = (id: number) => {
  queue.value = queue.value.filter((item) => item.id !== id)
  issues.value = issues.value.filter((item) => item.id !== id)
  if (selectedId.value === id) selectedId.value = null
}

const startEdit = (issue: Issue) => {
  editing.value = issue
  formPoint.value = { lat: issue.lat, lng: issue.lng }
  picking.value = false
  formOpen.value = true
}

const closeForm = () => {
  formOpen.value = false
  editing.value = null
  formPoint.value = null
  picking.value = false
}

const onSaved = async (saved: Issue) => {
  closeForm()
  patchIssue(saved)
  await Promise.all([loadQueue(), loadIssues()])
  selectedId.value = saved.id
  detailsVersion.value += 1
}

const onCatalogChanged = async () => {
  await loadCatalog()
  await Promise.all([loadQueue(), loadIssues()])
}

const queueCount = computed(() => queue.value.length)

const issueCount = computed(() => issues.value.length)
</script>

<template>
  <div class="page">
    <AppHeader />

    <div class="tabs">
      <button
        v-for="item in TABS"
        :key="item.id"
        class="tab"
        :class="{ 'tab--on': tab === item.id }"
        @click="tab = item.id"
      >
        <AppIcon :name="item.icon" :size="13" />
        {{ item.label }}
        <span v-if="item.id === 'queue' && queueCount" class="tab__badge">{{ queueCount }}</span>
      </button>
    </div>

    <main class="content">
      <p v-if="catalogError" class="notice">{{ catalogError }}</p>

      <StatsPanel v-if="tab === 'dashboard'" />

      <section v-else-if="tab === 'queue'" class="panel-section">
        <header class="section-head">
          <div>
            <h2>Очередь на модерацию</h2>
            <p>Обращения со статусом «{{ pendingStatus?.name || 'На модерации' }}»</p>
          </div>
          <span class="section-count">{{ queueCount }} {{ plural(queueCount, 'запись', 'записи', 'записей') }}</span>
        </header>

        <div class="filters">
          <select v-model="queueCategory" class="select">
            <option value="">Все категории</option>
            <option v-for="category in categories" :key="category.id" :value="String(category.id)">
              {{ category.name }}
            </option>
          </select>

          <label class="date">
            <span>с</span>
            <input v-model="queueFrom" class="input input--date" type="date" />
          </label>
          <label class="date">
            <span>по</span>
            <input v-model="queueTo" class="input input--date" type="date" />
          </label>

          <select v-model="queueSort" class="select">
            <option v-for="sort in SORTS" :key="sort.value" :value="sort.value">{{ sort.label }}</option>
          </select>

          <button class="btn btn--outline btn--sm" :disabled="queueLoading" @click="loadQueue">
            <AppIcon name="refresh" :size="12" />
            Обновить
          </button>
        </div>

        <p v-if="queueError" class="notice notice--error">{{ queueError }}</p>

        <div v-if="queueLoading" class="empty">Загрузка очереди…</div>
        <div v-else-if="!queue.length" class="empty">
          <AppIcon name="check" :size="28" />
          <span>Очередь пуста — все обращения проверены</span>
        </div>

        <div v-else class="queue">
          <article v-for="issue in queue" :key="issue.id" class="queue-card">
            <div class="queue-card__media">
              <img v-if="issue.photos.length" :src="issue.photos[0]" alt="" />
              <span
                v-else
                class="queue-card__icon"
                :style="{ background: categoryStyle(issue.category).background }"
              >
                <AppIcon :name="issue.category.icon" :size="18" />
              </span>
            </div>

            <div class="queue-card__body">
              <div class="queue-card__tags">
                <span class="badge" :style="statusStyle(issue.status)">{{ issue.status.name }}</span>
                <span class="badge" :style="categoryStyle(issue.category)">
                  {{ issue.category.name }}
                </span>
              </div>
              <p class="queue-card__text">{{ issue.description }}</p>
              <div class="queue-card__meta">
                <span>
                  <AppIcon name="map-pin" :size="11" />
                  {{ issue.address || 'Адрес не указан' }}
                </span>
                <span>{{ issue.author.nickname }}</span>
                <span>{{ formatDate(issue.createdAt) }}, {{ formatTime(issue.createdAt) }}</span>
              </div>
            </div>

            <button class="btn btn--outline btn--sm queue-card__open" @click="openIssue(issue.id)">
              Проверить
            </button>
          </article>
        </div>
      </section>

      <section v-else-if="tab === 'issues'" class="panel-section">
        <header class="section-head">
          <div>
            <h2>Все обращения</h2>
            <p>Поиск, фильтры и смена статусов</p>
          </div>
          <span class="section-count">{{ issueCount }} шт.</span>
        </header>

        <div class="filters">
          <div class="search">
            <AppIcon name="search" :size="13" />
            <input v-model="issueFilters.search" class="input" placeholder="Адрес или описание" />
          </div>

          <select v-model="issueFilters.categoryId" class="select">
            <option :value="null">Все категории</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <select v-model="issueFilters.statusId" class="select">
            <option :value="null">Все статусы</option>
            <option v-for="status in statuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>

          <select v-model="issueFilters.sort" class="select">
            <option v-for="sort in SORTS" :key="sort.value" :value="sort.value">{{ sort.label }}</option>
          </select>

          <label class="date">
            <span>с</span>
            <input v-model="issueFrom" class="input input--date" type="date" />
          </label>
          <label class="date">
            <span>по</span>
            <input v-model="issueTo" class="input input--date" type="date" />
          </label>
        </div>

        <p v-if="issuesError" class="notice notice--error">{{ issuesError }}</p>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Обращение</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Автор</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="issuesLoading">
                <td colspan="6" class="table__empty">Загрузка…</td>
              </tr>
              <tr v-else-if="!issues.length">
                <td colspan="6" class="table__empty">Обращения не найдены</td>
              </tr>
              <template v-else>
                <tr v-for="issue in issues" :key="issue.id">
                  <td>
                    <div class="cell-issue">
                      <span class="cell-issue__id">#{{ issue.id }}</span>
                      <span class="cell-issue__text">{{ issue.description }}</span>
                      <span class="cell-issue__address">{{ issue.address || 'Адрес не указан' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="cat">
                      <span class="cat__dot" :style="{ background: issue.category.color }"></span>
                      {{ issue.category.name }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :style="statusStyle(issue.status)">{{ issue.status.name }}</span>
                  </td>
                  <td class="table__muted">{{ issue.author.nickname }}</td>
                  <td class="table__muted">{{ formatDate(issue.createdAt) }}</td>
                  <td class="table__actions">
                    <button class="btn btn--outline btn--sm" @click="openIssue(issue.id)">Открыть</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <CategoryManager v-else-if="tab === 'categories'" @changed="onCatalogChanged" />
      <StatusManager v-else-if="tab === 'statuses'" @changed="onCatalogChanged" />
      <ServiceManager v-else-if="tab === 'services'" />
      <UserManager v-else-if="tab === 'users'" :can-manage-roles="false" />
    </main>

    <div v-if="selectedId" class="drawer-backdrop" @click.self="selectedId = null">
      <div class="drawer">
        <IssueDetails
          :key="`${selectedId}-${detailsVersion}`"
          :issue-id="selectedId"
          :can-manage="true"
          @close="selectedId = null"
          @updated="patchIssue"
          @deleted="removeIssue"
          @edit="startEdit"
        />
      </div>
    </div>

    <div v-if="formOpen" class="drawer-backdrop" @click.self="closeForm">
      <div class="form-modal">
        <IssueForm
          :issue="editing"
          :categories="categories"
          :statuses="statuses"
          :point="formPoint"
          :picking="picking"
          :allow-map-pick="false"
          @close="closeForm"
          @saved="onSaved"
          @update:point="formPoint = $event"
          @set-picking="picking = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: grid;
  grid-template-rows: 58px auto 1fr;
  overflow: hidden;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  overflow-x: auto;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  transition:
    color 0.12s,
    background 0.12s;
}

.tab:hover {
  color: var(--text);
  background: var(--surface);
}

.tab--on {
  color: var(--text);
  background: var(--surface-2);
}

.tab__badge {
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  color: var(--accent);
  font-size: 10px;
  font-weight: 600;
}

.content {
  overflow-y: auto;
  padding: 20px 24px 44px;
}

.content > * {
  max-width: 1180px;
  margin: 0 auto;
}

.notice {
  font-size: 12.5px;
  color: var(--text-muted);
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 12px;
}

.notice--error {
  color: #e07b6a;
  border-color: color-mix(in srgb, #e07b6a 35%, var(--border));
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2 {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.section-head p {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.section-count {
  font-size: 12px;
  color: var(--text-muted);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.select {
  appearance: none;
  padding: 7px 28px 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background:
    linear-gradient(45deg, transparent 50%, var(--text-muted) 50%) right 12px center / 4px 4px no-repeat,
    linear-gradient(135deg, var(--text-muted) 50%, transparent 50%) right 8px center / 4px 4px no-repeat,
    var(--surface-2);
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: var(--accent);
}

.search {
  position: relative;
}

.search svg {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search .input {
  padding-left: 29px;
  width: 210px;
}

.input {
  padding: 7px 9px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 12.5px;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.input--date {
  width: 132px;
  color-scheme: dark;
}

.date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--text-muted);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 42px 20px;
  color: var(--text-muted);
  font-size: 12.5px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: 10px;
}

.empty svg {
  color: #6b9e7f;
}

.queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.queue-card:hover {
  border-color: var(--border-strong);
}

.queue-card__media {
  width: 86px;
  height: 70px;
  border-radius: 7px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
}

.queue-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.queue-card__icon {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #16130d;
}

.queue-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.queue-card__text {
  font-size: 12.5px;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.queue-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
}

.queue-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-card__open {
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.table th {
  text-align: left;
  padding: 9px 12px;
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.table td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.table tr:last-child td {
  border-bottom: none;
}

.table__empty {
  text-align: center;
  color: var(--text-muted);
  padding: 26px 12px !important;
}

.table__muted {
  color: var(--text-muted);
  white-space: nowrap;
}

.table__actions {
  text-align: right;
}

.cell-issue {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-width: 440px;
}

.cell-issue__id {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-muted);
}

.cell-issue__text {
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-issue__address {
  font-size: 10.5px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
  white-space: nowrap;
}

.cat__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(8, 8, 10, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.drawer {
  width: 440px;
  max-width: 100%;
  padding: 12px;
  display: flex;
}

.form-modal {
  margin: auto;
  width: 460px;
  max-width: calc(100% - 32px);
  height: min(720px, calc(100vh - 48px));
  display: flex;
}

.form-modal :deep(.issue-form) {
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
}

@media (max-width: 900px) {
  .content {
    padding: 16px 14px 34px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .table {
    min-width: 760px;
  }
}
</style>
