<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import FormStatus from '../ui/FormStatus.vue'
import {
  createCategory,
  deleteCategory,
  fetchAllCategories,
  setCategoryActive,
  updateCategory,
} from '../../core/data/categoryService'
import { CATEGORY_ICONS } from '../../core/constants/icons'
import { contrastText } from '../../core/utils/color'
import { resolveLabel } from '../../core/utils/format'
import type { Category } from '../../core/models/Catalog'

const emit = defineEmits<{
  changed: []
}>()

const categories = ref<Category[]>([])
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
  color: '#e5a54b',
  icon: 'warning',
  sortOrder: '',
  resolveHours: '',
})

const isEditing = computed(() => editingId.value !== null)

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    categories.value = await fetchAllCategories()
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить категории'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.color = '#e5a54b'
  form.icon = 'warning'
  form.sortOrder = ''
  form.resolveHours = ''
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  formOpen.value = true
  error.value = ''
  notice.value = ''
}

const openEdit = (category: Category) => {
  editingId.value = category.id
  form.name = category.name
  form.description = category.description
  form.color = category.color
  form.icon = category.icon
  form.sortOrder = String(category.sortOrder)
  form.resolveHours = category.resolveHours === null ? '' : String(category.resolveHours)
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
      icon: form.icon,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : null,
      resolveHours: form.resolveHours ? Number(form.resolveHours) : null,
    }
    if (editingId.value) {
      await updateCategory(editingId.value, payload)
      notice.value = 'Категория обновлена'
    } else {
      await createCategory(payload)
      notice.value = 'Категория создана'
    }
    closeForm()
    await load()
    emit('changed')
  } catch (err: any) {
    error.value = err?.message || 'Не удалось сохранить категорию'
  } finally {
    saving.value = false
  }
}

const toggleActive = async (category: Category) => {
  if (category.isSystem) return
  busyId.value = category.id
  error.value = ''
  notice.value = ''
  try {
    const updated = await setCategoryActive(category.id, !category.isActive)
    const index = categories.value.findIndex((item) => item.id === category.id)
    if (index !== -1) categories.value[index] = updated
    notice.value = updated.isActive ? 'Категория активирована' : 'Категория деактивирована'
    emit('changed')
  } catch (err: any) {
    error.value = err?.message || 'Не удалось изменить категорию'
  } finally {
    busyId.value = null
  }
}

const remove = async (category: Category) => {
  if (category.isSystem) return
  if (!window.confirm(`Удалить категорию «${category.name}»?`)) return
  busyId.value = category.id
  error.value = ''
  notice.value = ''
  try {
    await deleteCategory(category.id)
    categories.value = categories.value.filter((item) => item.id !== category.id)
    notice.value = 'Категория удалена'
    emit('changed')
  } catch (err: any) {
    error.value = err?.message || 'Не удалось удалить категорию'
  } finally {
    busyId.value = null
  }
}

const onColorPicker = (event: Event) => {
  form.color = (event.target as HTMLInputElement).value
}

const onIcon = (event: Event) => {
  form.icon = (event.target as HTMLSelectElement).value
}
</script>

<template>
  <section class="categories">
    <header class="head">
      <div>
        <h2>Категории</h2>
        <p>Цвет, иконка и срок решения применяются ко всем маркерам категории</p>
      </div>
      <button class="btn btn--primary btn--sm" @click="openCreate">
        <AppIcon name="plus" />
        Новая категория
      </button>
    </header>

    <FormStatus :error="error" :notice="notice" />

    <form v-if="formOpen" class="form" @submit.prevent="save">
      <div class="form__grid">
        <label class="field field--wide">
          <span class="field__label">Название</span>
          <input v-model="form.name" class="input" maxlength="80" placeholder="Например, Дороги" />
        </label>

        <label class="field field--wide">
          <span class="field__label">Описание</span>
          <input
            v-model="form.description"
            class="input"
            maxlength="300"
            placeholder="Короткое пояснение для жителей"
          />
        </label>

        <div class="field">
          <span class="field__label">Цвет</span>
          <div class="color">
            <input
              class="color__picker"
              type="color"
              :value="form.color"
              @input="onColorPicker"
            />
            <input
              v-model="form.color"
              class="input color__value"
              maxlength="7"
              placeholder="#RRGGBB"
            />
          </div>
        </div>

        <label class="field">
          <span class="field__label">Иконка</span>
          <div class="icon-pick">
            <span
              class="icon-pick__preview"
              :style="{ background: form.color, color: contrastText(form.color) }"
            >
              <AppIcon :name="form.icon" :size="14" />
            </span>
            <select class="input icon-pick__select" :value="form.icon" @change="onIcon">
              <option v-for="icon in CATEGORY_ICONS" :key="icon.value" :value="icon.value">
                {{ icon.label }}
              </option>
            </select>
          </div>
        </label>

        <label class="field">
          <span class="field__label">Срок решения, ч</span>
          <input
            v-model="form.resolveHours"
            class="input"
            type="number"
            min="1"
            placeholder="Не задан"
          />
        </label>

        <label class="field">
          <span class="field__label">Порядок</span>
          <input v-model="form.sortOrder" class="input" type="number" min="1" placeholder="Авто" />
        </label>
      </div>

      <div class="form__foot">
        <span v-if="isEditing" class="form__id">Категория #{{ editingId }}</span>
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
            <th>Категория</th>
            <th>Срок</th>
            <th>Порядок</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="table__empty">Загрузка…</td>
          </tr>
          <tr v-else-if="!categories.length">
            <td colspan="5" class="table__empty">Категорий пока нет</td>
          </tr>
          <template v-else>
            <tr v-for="category in categories" :key="category.id">
              <td>
                <div class="cat">
                  <span
                    class="cat__icon"
                    :style="{ background: category.color, color: contrastText(category.color) }"
                  >
                    <AppIcon :name="category.icon" :size="14" />
                  </span>
                  <div class="cat__info">
                    <span class="cat__name">
                      {{ category.name }}
                      <span v-if="category.isSystem" class="cat__system">
                        <AppIcon name="lock" :size="9" />
                        системная
                      </span>
                    </span>
                    <span v-if="category.description" class="cat__desc">
                      {{ category.description }}
                    </span>
                  </div>
                </div>
              </td>
              <td>{{ resolveLabel(category.resolveHours) || '—' }}</td>
              <td class="table__muted">{{ category.sortOrder }}</td>
              <td>
                <span class="state" :class="category.isActive ? 'state--ok' : 'state--off'">
                  {{ category.isActive ? 'Активна' : 'Скрыта' }}
                </span>
              </td>
              <td class="table__actions">
                <button class="icon-action" title="Изменить" @click="openEdit(category)">
                  <AppIcon name="edit" :size="13" />
                </button>
                <button
                  class="icon-action"
                  :title="category.isActive ? 'Деактивировать' : 'Активировать'"
                  :disabled="category.isSystem || busyId === category.id"
                  @click="toggleActive(category)"
                >
                  <AppIcon :name="category.isActive ? 'eye-off' : 'eye'" :size="13" />
                </button>
                <button
                  class="icon-action icon-action--danger"
                  title="Удалить"
                  :disabled="category.isSystem || busyId === category.id"
                  @click="remove(category)"
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
      Категорию с обращениями удалить нельзя — сначала перенесите обращения в другую категорию.
    </p>
  </section>
</template>

<style scoped>
.categories {
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
  grid-template-columns: repeat(3, 1fr);
  gap: 11px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field--wide {
  grid-column: span 3;
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

.icon-pick {
  display: flex;
  gap: 6px;
}

.icon-pick__preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.icon-pick__select {
  flex: 1;
  appearance: none;
  padding-right: 22px;
}

.form__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.form__id {
  font-size: 11px;
  color: var(--text-muted);
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

.cat {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cat__icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.cat__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cat__name {
  color: var(--text-dim);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat__system {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 400;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0 4px;
}

.cat__desc {
  font-size: 11px;
  color: var(--text-muted);
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

@media (max-width: 860px) {
  .form__grid {
    grid-template-columns: 1fr 1fr;
  }

  .field--wide {
    grid-column: span 2;
  }
}
</style>
