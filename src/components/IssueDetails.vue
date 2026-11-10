<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import FormStatus from './ui/FormStatus.vue'
import useUser from '../composables/useUser'
import {
  assign,
  changeStatus,
  createComment,
  deleteComment,
  deleteIssue,
  fetchComments,
  fetchHistory,
  fetchIssue,
  updateComment,
  vote,
} from '../core/data/issueService'
import { fetchStatuses } from '../core/data/statusService'
import { fetchServices } from '../core/data/serviceDirectoryService'
import { contrastText } from '../core/utils/color'
import { formatDate, formatDateTime, resolveLabel } from '../core/utils/format'
import { formatPoint } from '../core/constants/city'
import type { Comment, HistoryEntry, Issue } from '../core/models/Issue'
import type { Service, Status } from '../core/models/Catalog'

const props = defineProps<{
  issueId: number
  canManage: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: [issue: Issue]
  deleted: [id: number]
  edit: [issue: Issue]
  auth: []
}>()

const { user } = useUser()

const issue = ref<Issue | null>(null)
const comments = ref<Comment[]>([])
const history = ref<HistoryEntry[]>([])
const statuses = ref<Status[]>([])
const services = ref<Service[]>([])

const loading = ref(true)
const error = ref('')

const voteBusy = ref(false)
const actionError = ref('')
const actionNotice = ref('')

const commentText = ref('')
const commentBusy = ref(false)
const editingId = ref<number | null>(null)
const editingText = ref('')

const targetStatusId = ref('')
const statusComment = ref('')
const resolvedFile = ref<File | null>(null)
const statusBusy = ref(false)
const assigneeId = ref('')
const assignBusy = ref(false)

const isOwner = computed(() => issue.value && Number(user.value.id) === issue.value.author.id)
const canEditIssue = computed(
  () => Boolean(issue.value) && (props.canManage || (isOwner.value && issue.value!.status.key === 'pending')),
)

const canChangeStatus = computed(() => props.canManage)
const canComment = computed(() => !user.value.isGuest)

const statusOptions = computed(() =>
  statuses.value
    .filter((item) => item.key !== 'pending' && item.id !== issue.value?.status.id)
    .map((item) => ({ value: item.id, label: item.name })),
)

const serviceOptions = computed(() =>
  services.value.map((item) => ({ value: item.id, label: item.name })),
)

const targetStatus = computed(
  () => statuses.value.find((item) => item.id === Number(targetStatusId.value)) ?? null,
)

const statusStyle = (status: Status) => ({
  background: status.color,
  color: contrastText(status.color),
})

const categoryStyle = (category: { color: string }) => ({
  background: category.color,
  color: contrastText(category.color),
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [loadedIssue, loadedComments, loadedHistory] = await Promise.all([
      fetchIssue(props.issueId),
      fetchComments(props.issueId),
      fetchHistory(props.issueId),
    ])
    issue.value = loadedIssue
    comments.value = loadedComments
    history.value = loadedHistory
    assigneeId.value = loadedIssue.assignee ? String(loadedIssue.assignee.id) : ''
    if (props.canManage) {
      try {
        const [loadedStatuses, loadedServices] = await Promise.all([fetchStatuses(), fetchServices()])
        statuses.value = loadedStatuses
        services.value = loadedServices
      } catch {
        actionError.value = 'Не удалось загрузить справочники для модерации'
      }
    }
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить обращение'
  } finally {
    loading.value = false
  }
}

watch(() => props.issueId, load, { immediate: true })

const reloadHistory = async () => {
  try {
    history.value = await fetchHistory(props.issueId)
  } catch {
    history.value = []
  }
}

const patch = (next: Issue) => {
  issue.value = next
  emit('updated', next)
}

const onVote = async () => {
  if (!issue.value) return
  if (!canComment.value) {
    emit('auth')
    return
  }
  voteBusy.value = true
  actionError.value = ''
  try {
    const result = await vote(issue.value.id)
    patch({ ...issue.value, votes: result.votes, voted: result.voted })
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось проголосовать'
  } finally {
    voteBusy.value = false
  }
}

const onComment = async () => {
  if (!issue.value) return
  if (!canComment.value) {
    emit('auth')
    return
  }
  const text = commentText.value.trim()
  if (!text) return
  commentBusy.value = true
  actionError.value = ''
  try {
    const created = await createComment(issue.value.id, text)
    comments.value.push(created)
    commentText.value = ''
    patch({ ...issue.value, commentsCount: issue.value.commentsCount + 1 })
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось отправить комментарий'
  } finally {
    commentBusy.value = false
  }
}

const startEdit = (comment: Comment) => {
  editingId.value = comment.id
  editingText.value = comment.text
}

const cancelEdit = () => {
  editingId.value = null
  editingText.value = ''
}

const saveEdit = async (comment: Comment) => {
  const text = editingText.value.trim()
  if (!text) return
  actionError.value = ''
  try {
    const updated = await updateComment(props.issueId, comment.id, text)
    const index = comments.value.findIndex((item) => item.id === comment.id)
    if (index !== -1) comments.value[index] = updated
    cancelEdit()
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось изменить комментарий'
  }
}

const removeComment = async (comment: Comment) => {
  if (!issue.value) return
  if (!window.confirm('Удалить комментарий?')) return
  actionError.value = ''
  try {
    await deleteComment(props.issueId, comment.id)
    comments.value = comments.value.filter((item) => item.id !== comment.id)
    patch({ ...issue.value, commentsCount: Math.max(issue.value.commentsCount - 1, 0) })
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось удалить комментарий'
  }
}

const canManageComment = (comment: Comment) =>
  props.canManage || Number(user.value.id) === comment.userId

const onResolvedFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  resolvedFile.value = target.files?.[0] ?? null
  target.value = ''
}

const applyStatus = async () => {
  if (!issue.value) return
  if (!targetStatusId.value) {
    actionError.value = 'Выберите статус'
    return
  }
  if (targetStatus.value?.key === 'rejected' && !statusComment.value.trim()) {
    actionError.value = 'Укажите причину отклонения'
    return
  }
  if (targetStatus.value?.key === 'resolved' && !statusComment.value.trim() && !resolvedFile.value) {
    actionError.value = 'Добавьте фото или отчёт о решении'
    return
  }

  statusBusy.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await changeStatus(issue.value.id, {
      statusId: Number(targetStatusId.value),
      comment: statusComment.value.trim() || undefined,
      resolvedPhoto: resolvedFile.value,
    })
    patch(updated)
    targetStatusId.value = ''
    statusComment.value = ''
    resolvedFile.value = null
    await reloadHistory()
    actionNotice.value = 'Статус изменён'
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось изменить статус'
  } finally {
    statusBusy.value = false
  }
}

const applyAssignee = async () => {
  if (!issue.value) return
  assignBusy.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const updated = await assign(issue.value.id, assigneeId.value ? Number(assigneeId.value) : null)
    patch(updated)
    actionNotice.value = updated.assignee ? 'Ответственный назначен' : 'Ответственный снят'
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось назначить службу'
  } finally {
    assignBusy.value = false
  }
}

const removeIssue = async () => {
  if (!issue.value) return
  if (!window.confirm('Удалить обращение? Действие необратимо.')) return
  try {
    await deleteIssue(issue.value.id)
    emit('deleted', issue.value.id)
  } catch (err: any) {
    actionError.value = err?.message || 'Не удалось удалить обращение'
  }
}

const onEdit = () => {
  if (issue.value) emit('edit', issue.value)
}

const openPhoto = (url: string) => {
  window.open(url, '_blank', 'noopener')
}

onBeforeUnmount(() => {
  resolvedFile.value = null
})
</script>

<template>
  <section class="details">
    <header class="details__head">
      <div class="details__head-text">
        <span class="details__eyebrow">Обращение #{{ issueId }}</span>
        <h2 class="details__title">{{ issue?.category.name || 'Загрузка' }}</h2>
      </div>
      <button class="details__close" title="Закрыть" @click="emit('close')">
        <AppIcon name="close" :size="15" />
      </button>
    </header>

    <div class="details__body">
      <div v-if="loading" class="details__loading">Загрузка обращения…</div>
      <div v-else-if="error" class="details__loading details__loading--error">{{ error }}</div>

      <template v-else-if="issue">
        <div class="tags">
          <span class="tag" :style="statusStyle(issue.status)">
            {{ issue.status.name }}
          </span>
          <span class="tag" :style="categoryStyle(issue.category)">
            <AppIcon :name="issue.category.icon" :size="11" />
            {{ issue.category.name }}
          </span>
          <span v-if="issue.assignee" class="tag tag--service">
            <AppIcon name="shield" :size="11" />
            {{ issue.assignee.name }}
          </span>
        </div>

        <p class="description">{{ issue.description }}</p>

        <div v-if="issue.photos.length" class="gallery">
          <button
            v-for="photo in issue.photos"
            :key="photo"
            class="gallery__item"
            @click="openPhoto(photo)"
          >
            <img :src="photo" alt="" />
          </button>
        </div>

        <div class="info">
          <div class="info__row">
            <span class="info__key">Адрес</span>
            <span class="info__value">{{ issue.address || 'Не указан' }}</span>
          </div>
          <div class="info__row">
            <span class="info__key">Координаты</span>
            <span class="info__value info__value--mono">
              {{ formatPoint({ lat: issue.lat, lng: issue.lng }) }}
            </span>
          </div>
          <div class="info__row">
            <span class="info__key">Автор</span>
            <span class="info__value">{{ issue.author.nickname }}</span>
          </div>
          <div class="info__row">
            <span class="info__key">Создано</span>
            <span class="info__value">{{ formatDateTime(issue.createdAt) }}</span>
          </div>
          <div v-if="issue.category.resolveHours" class="info__row">
            <span class="info__key">Срок решения</span>
            <span class="info__value">{{ resolveLabel(issue.category.resolveHours) }}</span>
          </div>
        </div>

        <div v-if="issue.status.key === 'rejected' && issue.rejectReason" class="callout callout--reject">
          <AppIcon name="warning" :size="14" />
          <div>
            <b>Причина отклонения</b>
            <p>{{ issue.rejectReason }}</p>
          </div>
        </div>

        <div v-if="issue.status.key === 'resolved'" class="callout callout--resolved">
          <AppIcon name="check" :size="14" />
          <div>
            <b>Решение</b>
            <p v-if="issue.resolvedPhotoUrl">
              <img class="callout__photo" :src="issue.resolvedPhotoUrl" alt="" />
            </p>
            <p v-else>Проблема отмечена решённой</p>
          </div>
        </div>

        <div class="actions-row">
          <button
            class="vote"
            :class="{ 'vote--on': issue.voted }"
            :disabled="voteBusy"
            @click="onVote"
          >
            <AppIcon name="vote" :size="15" />
            {{ issue.voted ? 'Вы проголосовали' : 'Поддержать' }}
            <span class="vote__count">{{ issue.votes }}</span>
          </button>
          <span class="actions-row__stat">
            <AppIcon name="message" :size="13" />
            {{ comments.length }}
          </span>
        </div>

        <div v-if="canEditIssue" class="owner-actions">
          <button class="btn btn--outline btn--sm" @click="onEdit">
            <AppIcon name="edit" :size="12" />
            Редактировать
          </button>
          <button class="btn btn--outline btn--sm owner-actions__delete" @click="removeIssue">
            <AppIcon name="trash" :size="12" />
            Удалить
          </button>
        </div>

        <div v-if="canChangeStatus" class="manage">
          <div class="section-head">
            <span>Модерация</span>
          </div>

          <div class="manage__grid">
            <label class="manage__label" for="status-select">Новый статус</label>
            <select id="status-select" v-model="targetStatusId" class="input">
              <option value="">Выберите статус</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <label class="manage__label" for="status-comment">
              {{ targetStatus?.key === 'rejected' ? 'Причина отклонения' : 'Комментарий' }}
            </label>
            <textarea
              id="status-comment"
              v-model="statusComment"
              class="input input--area"
              rows="2"
              placeholder="Что изменилось или что сделать"
            ></textarea>

            <template v-if="targetStatus?.key === 'resolved'">
              <label class="manage__label" for="resolved-photo">Фото результата</label>
              <input
                id="resolved-photo"
                class="manage__file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="onResolvedFile"
              />
              <span v-if="resolvedFile" class="manage__file-name">{{ resolvedFile.name }}</span>
            </template>

            <button class="btn btn--primary btn--sm manage__submit" :disabled="statusBusy" @click="applyStatus">
              {{ statusBusy ? 'Применяем…' : 'Применить статус' }}
            </button>
          </div>

          <div class="manage__assign">
            <label class="manage__label" for="assignee-select">Ответственная служба</label>
            <div class="manage__assign-row">
              <select id="assignee-select" v-model="assigneeId" class="input">
                <option value="">Не назначена</option>
                <option v-for="option in serviceOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <button class="btn btn--outline btn--sm" :disabled="assignBusy" @click="applyAssignee">
                {{ assignBusy ? '…' : 'Назначить' }}
              </button>
            </div>
          </div>

          <FormStatus :error="actionError" :notice="actionNotice" />
        </div>

        <div class="section">
          <div class="section-head">
            <span>Комментарии</span>
            <span class="section-head__count">{{ comments.length }}</span>
          </div>

          <div v-if="comments.length" class="comments">
            <article v-for="comment in comments" :key="comment.id" class="comment">
              <div class="comment__head">
                <span class="comment__author">{{ comment.author.nickname }}</span>
                <span class="comment__date">{{ formatDateTime(comment.createdAt) }}</span>
              </div>

              <template v-if="editingId === comment.id">
                <textarea v-model="editingText" class="input input--area" rows="2"></textarea>
                <div class="comment__edit-actions">
                  <button class="btn btn--primary btn--sm" @click="saveEdit(comment)">Сохранить</button>
                  <button class="btn btn--outline btn--sm" @click="cancelEdit">Отмена</button>
                </div>
              </template>

              <template v-else>
                <p class="comment__text">{{ comment.text }}</p>
                <div v-if="canManageComment(comment)" class="comment__actions">
                  <button v-if="Number(user.id) === comment.userId" @click="startEdit(comment)">Изменить</button>
                  <button @click="removeComment(comment)">Удалить</button>
                </div>
              </template>
            </article>
          </div>
          <p v-else class="empty-note">Комментариев пока нет</p>

          <div class="comment-form">
            <textarea
              v-model="commentText"
              class="input input--area"
              rows="2"
              maxlength="1000"
              :placeholder="canComment ? 'Написать комментарий…' : 'Войдите, чтобы комментировать'"
              :disabled="!canComment"
            ></textarea>
            <button
              class="btn btn--primary btn--sm"
              :disabled="commentBusy || !commentText.trim()"
              @click="onComment"
            >
              {{ commentBusy ? 'Отправка…' : 'Отправить' }}
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <span>История статусов</span>
          </div>

          <ol v-if="history.length" class="history">
            <li v-for="entry in history" :key="entry.id" class="history__item">
              <span class="history__dot" :style="{ background: entry.toColor || 'var(--text-muted)' }"></span>
              <div class="history__body">
                <div class="history__line">
                  <span v-if="entry.fromName" class="history__from">{{ entry.fromName }}</span>
                  <AppIcon v-if="entry.fromName" name="arrow-left" :size="11" />
                  <span class="history__to">{{ entry.toName || 'Статус удалён' }}</span>
                </div>
                <div class="history__meta">
                  {{ entry.changedBy }} · {{ formatDate(entry.createdAt) }}
                </div>
                <p v-if="entry.comment" class="history__comment">{{ entry.comment }}</p>
              </div>
            </li>
          </ol>
          <p v-else class="empty-note">Переходов ещё не было</p>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.details {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}

.details__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.details__eyebrow {
  display: block;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.details__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.details__close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.details__close:hover {
  color: var(--text);
  background: var(--surface-2);
}

.details__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.details__loading {
  padding: 30px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.details__loading--error {
  color: #e07b6a;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
}

.tag--service {
  background: var(--surface-3);
  color: var(--text-dim);
  border: 1px solid var(--border);
}

.description {
  font-size: 13px;
  color: var(--text-dim);
  white-space: pre-wrap;
  line-height: 1.55;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.gallery__item {
  aspect-ratio: 4 / 3;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.15s;
}

.gallery__item:hover img {
  transform: scale(1.04);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.info__row {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.info__key {
  width: 88px;
  flex-shrink: 0;
  color: var(--text-muted);
}

.info__value {
  flex: 1;
  color: var(--text-dim);
  overflow-wrap: anywhere;
}

.info__value--mono {
  font-family: var(--mono);
  font-size: 11px;
}

.callout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  line-height: 1.5;
}

.callout b {
  display: block;
  font-size: 11.5px;
  margin-bottom: 2px;
}

.callout--reject {
  background: color-mix(in srgb, #e07b6a 12%, transparent);
  border: 1px solid color-mix(in srgb, #e07b6a 32%, transparent);
  color: #e8a096;
}

.callout--resolved {
  background: color-mix(in srgb, #5b9cf5 10%, transparent);
  border: 1px solid color-mix(in srgb, #5b9cf5 30%, transparent);
  color: #a7c6ef;
}

.callout__photo {
  margin-top: 6px;
  max-width: 100%;
  border-radius: 6px;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vote {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 12.5px;
  font-weight: 500;
  transition:
    border-color 0.12s,
    color 0.12s,
    background 0.12s;
}

.vote:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.vote--on {
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  color: var(--accent);
}

.vote__count {
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--surface-3);
  font-size: 11px;
  color: var(--text-dim);
}

.vote--on .vote__count {
  background: color-mix(in srgb, var(--accent) 24%, transparent);
  color: var(--accent);
}

.actions-row__stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-muted);
}

.owner-actions {
  display: flex;
  gap: 7px;
}

.owner-actions__delete:hover {
  border-color: #b3473b;
  color: #e07b6a;
}

.manage {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
}

.manage__grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.manage__label {
  font-size: 11.5px;
  color: var(--text-muted);
}

.manage__file {
  font-size: 11.5px;
  color: var(--text-dim);
}

.manage__file-name {
  font-size: 11px;
  color: var(--text-muted);
}

.manage__submit {
  align-self: flex-start;
  margin-top: 2px;
}

.manage__assign {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.manage__assign-row {
  display: flex;
  gap: 6px;
}

.manage__assign-row .input {
  flex: 1;
}

.input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 12.5px;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.input--area {
  resize: vertical;
  min-height: 54px;
  line-height: 1.5;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 8px;
}

.section-head__count {
  font-weight: 400;
  color: var(--text-muted);
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 10px;
  border-radius: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.comment__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.comment__author {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
}

.comment__date {
  font-size: 10.5px;
  color: var(--text-muted);
}

.comment__text {
  font-size: 12.5px;
  color: var(--text-dim);
  white-space: pre-wrap;
}

.comment__actions {
  display: flex;
  gap: 10px;
  padding-top: 2px;
}

.comment__actions button {
  font-size: 11px;
  color: var(--text-muted);
}

.comment__actions button:hover {
  color: var(--accent);
}

.comment__edit-actions {
  display: flex;
  gap: 6px;
  padding-top: 4px;
}

.comment-form {
  display: flex;
  align-items: flex-end;
  gap: 7px;
}

.comment-form textarea {
  flex: 1;
}

.empty-note {
  font-size: 12px;
  color: var(--text-muted);
  padding: 2px 0;
}

.history {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history__item {
  display: flex;
  gap: 9px;
}

.history__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 12%, transparent);
}

.history__body {
  flex: 1;
  min-width: 0;
}

.history__line {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-dim);
}

.history__line svg {
  color: var(--text-muted);
  transform: rotate(180deg);
}

.history__from {
  color: var(--text-muted);
}

.history__to {
  font-weight: 600;
}

.history__meta {
  font-size: 10.5px;
  color: var(--text-muted);
  margin-top: 1px;
}

.history__comment {
  margin-top: 3px;
  font-size: 11.5px;
  color: var(--text-dim);
  background: var(--surface-2);
  border-radius: 5px;
  padding: 5px 8px;
}
</style>
