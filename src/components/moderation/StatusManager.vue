<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import FormStatus from '../ui/FormStatus.vue'
import {
  createStatus,
  deleteStatus,
  fetchAllStatuses,
  setStatusActive,
  updateStatus,
} from '../../core/data/statusService'
import { contrastText } from '../../core/utils/color'
import type { Status } from '../../core/models/Catalog'

const emit = defineEmits<{
  changed: []
}>()

const statuses = ref<Status[]>([])
const loading = ref(true)
const error = ref('')
const notice = ref('')
const busyId = ref<number | null>(null)

const formOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  description: '',
  color: '#8b8b94',
  sortOrder: '',
})

const isEditing = computed(() => editingId.value !== null)

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    statuses.value = await fetchAllStatuses()
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить статусы'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const openCreate = () => {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.color = '#8b8b94'
  form.sortOrder = ''
  formOpen.value = true
  error.value = ''
  notice.value = ''
}

const openEdit = (status: Status) => {
  editingId.value = status.id
  form.name = status.name
  form.description = status.description
  form.color = status.color
  form.sortOrder = String(status.sortOrder)
  formOpen.value = true
  error.value = ''
  notice.value = ''
}

const closeForm = () => {
  formOpen.value = false
  editingId.value = null
}

const save = async () => {
  error.value = ''
  notice.value = ''
  if (form.name.trim().length < 2) {
    error.value = 'Название должно содержать минимум 2 символа'
    return
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(form.color)) {
    error.value = 'Цвет должен быть в формате #RRGGBB'
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      color: form.color.toLowerCase(),
      sortOrder: form.sortOrder ? Number(form.sortOrder) : null,
    }
    if (editingId.value) {
      await updateStatus(editingId.value, payload)
      notice.value = 'Статус обновлён'
    } else {
      await createStatus(payload)
      notice.value = 'Статус создан'
    }
    closeForm()
    await load()
    emit('changed')
  } catch (err: any) {
    error.value = err?.message || 'Не удалось сохранить статус'
  } finally {
    saving.value = false
  }
}

const toggleActive = async (status: Status) => {
  if (status.isDefault) return
  busyId.value = status.id
  error.value = ''
  notice.value = ''
  try {
    const updated = await setStatusActive(status.id, !status.isActive)
    const index = statuses.value.findIndex((item) => item.id === status.id)
    if (index !== -1) statuses.value[index] = updated
    notice.value = updated.isActive ? 'Статус активирован' : 'Статус деактивирован'
    emit('changed')
  } catch (err: any) {
    error.value = err?.message || 'Не удалось изменить статус'
  } finally {
    busyId.value = null
  }
}

const remove = async (status: Status) => {
  if (status.isDefault) return
  if (!window.confirm(`Удалить статус «${status.name}»?`)) return
  busyId.value = status.id
  error.value = ''
  notice.value = ''
  try {
    await deleteStatus(status.id)
    statuses.value = statuses.value.filter((item) => item.id !== status.id)
    notice.value = 'Статус удалён'
    emit('changed')
  } catch (err: any) {
    error.value = err?.message || 'Не удалось удалить статус'
  } finally {
    busyId.value = null
  }
}

const onColorPicker = (event: Event) => {
  form.color = (event.target as HTMLInputElement).value
}
</script>

<template>
  <section class="statuses">
    <header class="head">
      <div>
        <h2>Статусы</h2>
        <p>Системные статусы защищены, дополнительные настраивает модератор</p>
      </div>
      <button class="btn btn--primary btn--sm" @click="openCreate">
        <AppIcon name="plus" />
        Новый статус
      </button>
    </header>

    <FormStatus :error="error" :notice="notice" />

    <form v-if="formOpen" class="form" @submit.prevent="save">
      <div class="form__grid">
        <label class="field field--wide">
          <span class="field__label">Название</span>
          <input v-model="form.name" class="input" maxlength="60" placeholder="Например, В работе" />
        </label>

        <label class="field field--wide">
          <span class="field__label">Описание</span>
          <input
            v-model="form.description"
            class="input"
            maxlength="300"
            placeholder="Что означает статус"
          />
        </label>

        <div class="field">
          <span class="field__label">Цвет бейджа</span>
          <div class="color">
            <input class="color__picker" type="color" :value="form.color" @input="onColorPicker" />
            <input v-model="form.color" class="input color__value" maxlength="7" />
          </div>
        </div>

        <label class="field">
          <span class="field__label">Порядок</span>
          <input v-model="form.sortOrder" class="input" type="number" min="1" placeholder="Авто" />
        </label>
      </div>

      <div class="form__foot">
        <div class="badge-preview">
          <span class="badge" :style="{ background: form.color, color: contrastText(form.color) }">
            {{ form.name || 'Новый статус' }}
          </span>
        </div>
        <div class="form__actions">
          <button type="button" class="btn btn--outline btn--sm" @click="closeForm">Отмена</button>
          <button type="submit" class="btn btn--primary btn--sm" :disabled="saving">
            {{ saving ? 'Сохранение…' : isEditing ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>
    </form>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Статус</th>
            <th>Ключ</th>
            <th>Порядок</th>
            <th>Активен</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="table__empty">Загрузка…</td>
          </tr>
          <tr v-else-if="!statuses.length">
            <td colspan="5" class="table__empty">Статусов пока нет</td>
          </tr>
          <template v-else>
            <tr v-for="status in statuses" :key="status.id">
              <td>
                <div class="status-cell">
                  <span class="badge" :style="{ background: status.color, color: contrastText(status.color) }">
                    {{ status.name }}
                  </span>
                  <span v-if="status.description" class="status-cell__desc">
                    {{ status.description }}
                  </span>
                </div>
              </td>
              <td>
                <span v-if="status.isDefault" class="system">
                  <AppIcon name="lock" :size="9" />
                  {{ status.key }}
                </span>
                <span v-else class="table__muted">дополнительный</span>
              </td>
              <td class="table__muted">{{ status.sortOrder }}</td>
              <td>
                <span class="state" :class="status.isActive ? 'state--ok' : 'state--off'">
                  {{ status.isActive ? 'Да' : 'Скрыт' }}
                </span>
              </td>
              <td class="table__actions">
                <button class="icon-action" title="Изменить" @click="openEdit(status)">
                  <AppIcon name="edit" :size="13" />
                </button>
                <button
                  class="icon-action"
                  :title="status.isActive ? 'Деактивировать' : 'Активировать'"
                  :disabled="status.isDefault || busyId === status.id"
                  @click="toggleActive(status)"
                >
                  <AppIcon :name="status.isActive ? 'eye-off' : 'eye'" :size="13" />
                </button>
                <button
                  class="icon-action icon-action--danger"
                  title="Удалить"
                  :disabled="status.isDefault || busyId === status.id"
                  @click="remove(status)"
                >
                  <AppIcon name="trash" :size="13" />
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="hint">
      Удалить можно только статус, который не присвоен ни одному обращению.
    </p>
  </section>
</template>

<style scoped>
.statuses {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.head h2 {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.head p {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
}

.form__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field--wide {
  grid-column: span 2;
}

.field__label {
  font-size: 11.5px;
  color: var(--text-muted);
}

.input {
  width: 100%;
  padding: 7px 10px;
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

.color {
  display: flex;
  gap: 6px;
}

.color__picker {
  width: 36px;
  height: 32px;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  cursor: pointer;
  flex-shrink: 0;
}

.color__value {
  font-family: var(--mono);
  text-transform: uppercase;
}

.form__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.form__actions {
  display: flex;
  gap: 7px;
  margin-left: auto;
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
}

.table__actions {
  text-align: right;
  white-space: nowrap;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
}

.status-cell__desc {
  font-size: 11px;
  color: var(--text-muted);
}

.system {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0 4px;
}

.state {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
}

.state--ok {
  background: color-mix(in srgb, #4caf7d 16%, transparent);
  color: #77c99a;
}

.state--off {
  background: var(--surface-3);
  color: var(--text-muted);
}

.icon-action {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  display: inline-grid;
  place-items: center;
  color: var(--text-muted);
  margin-left: 2px;
}

.icon-action:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}

.icon-action--danger:hover:not(:disabled) {
  color: #e07b6a;
}

.icon-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.hint {
  font-size: 11.5px;
  color: var(--text-muted);
}
</style>
