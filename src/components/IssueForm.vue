<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import FormField from './ui/FormField.vue'
import FormSelect from './ui/FormSelect.vue'
import FormTextarea from './ui/FormTextarea.vue'
import FormStatus from './ui/FormStatus.vue'
import { createIssue, updateIssue } from '../core/data/issueService'
import { reverseGeocode } from '../core/data/geoService'
import { isInCity, formatPoint, type Point } from '../core/constants/city'
import { markerSource } from '../map/markers'
import type { Category, Status } from '../core/models/Catalog'
import type { Issue } from '../core/models/Issue'

const props = withDefaults(
  defineProps<{
    issue: Issue | null
    categories: Category[]
    statuses: Status[]
    point: Point | null
    picking: boolean
    allowMapPick?: boolean
  }>(),
  { allowMapPick: true },
)

const emit = defineEmits<{
  close: []
  saved: [issue: Issue]
  'update:point': [point: Point | null]
  'set-picking': [value: boolean]
}>()

const categoryId = ref(String(props.issue?.category.id ?? props.categories[0]?.id ?? ''))
const description = ref(props.issue?.description ?? '')
const address = ref(props.issue?.address ?? '')
const keepPhotos = ref<string[]>([...(props.issue?.photos ?? [])])
const newFiles = ref<File[]>([])
const previews = ref<{ file: File; url: string }[]>([])
const error = ref('')
const busy = ref(false)
const locating = ref(false)
const geocoding = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const categoryOptions = computed(() => {
  const list = [...props.categories]
  if (props.issue && !list.some((item) => item.id === props.issue!.category.id)) {
    list.push(props.issue.category)
  }
  return list.map((item) => ({ value: item.id, label: item.name }))
})

const selectedCategory = computed<Category | null>(() => {
  const id = Number(categoryId.value)
  return (
    props.categories.find((item) => item.id === id) ??
    (props.issue?.category.id === id ? props.issue.category : null)
  )
})

const previewStatus = computed<Status | null>(() => {
  if (props.issue) return props.issue.status
  return props.statuses.find((item) => item.key === 'pending') ?? null
})

const previewMarker = computed(() => {
  const category = selectedCategory.value
  if (!category) return ''
  return markerSource(category, previewStatus.value).src
})

const totalPhotos = computed(() => keepPhotos.value.length + newFiles.value.length)
const canAddPhoto = computed(() => totalPhotos.value < 3)

const remaining = computed(() => 500 - description.value.length)

const removeExisting = (index: number) => {
  keepPhotos.value.splice(index, 1)
}

const pickFiles = () => fileInput.value?.click()

const onFiles = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  target.value = ''
  error.value = ''

  for (const file of files) {
    if (totalPhotos.value >= 3) break
    if (!file.type.startsWith('image/')) {
      error.value = 'Можно загрузить только изображения'
      continue
    }
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Файл больше 5 МБ'
      continue
    }
    newFiles.value.push(file)
    previews.value.push({ file, url: URL.createObjectURL(file) })
  }
}

const removeNew = (index: number) => {
  const preview = previews.value[index]
  if (preview) URL.revokeObjectURL(preview.url)
  previews.value.splice(index, 1)
  newFiles.value.splice(index, 1)
}

const clearPreviews = () => {
  for (const preview of previews.value) URL.revokeObjectURL(preview.url)
  previews.value = []
  newFiles.value = []
}

onBeforeUnmount(clearPreviews)

let lastRequested = ''

const requestAddress = async (point: Point) => {
  const key = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`
  if (key === lastRequested) return
  lastRequested = key
  geocoding.value = true
  const value = await reverseGeocode(point)
  geocoding.value = false
  if (value) address.value = value
}

watch(
  () => props.point,
  (point) => {
    if (point) void requestAddress(point)
  },
)

const locate = () => {
  error.value = ''
  if (!navigator.geolocation) {
    error.value = 'Браузер не поддерживает геолокацию'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locating.value = false
      const point = { lat: position.coords.latitude, lng: position.coords.longitude }
      if (!isInCity(point.lat, point.lng)) {
        error.value = 'Вы находитесь вне границ города'
        return
      }
      emit('update:point', point)
      emit('set-picking', false)
    },
    () => {
      locating.value = false
      error.value = 'Не удалось получить геопозицию'
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

const close = () => {
  clearPreviews()
  emit('close')
}

const submit = async () => {
  error.value = ''
  if (!selectedCategory.value) {
    error.value = 'Выберите категорию'
    return
  }
  if (description.value.trim().length < 10) {
    error.value = 'Описание должно содержать минимум 10 символов'
    return
  }
  if (!props.point) {
    error.value = 'Укажите точку на карте'
    return
  }
  if (!isInCity(props.point.lat, props.point.lng)) {
    error.value = 'Точка находится вне границ города'
    return
  }
  if (!address.value.trim()) {
    error.value = 'Укажите адрес'
    return
  }

  busy.value = true
  try {
    const payload = {
      categoryId: selectedCategory.value.id,
      description: description.value.trim(),
      address: address.value.trim(),
      lat: props.point.lat,
      lng: props.point.lng,
      photos: newFiles.value,
      keepPhotos: keepPhotos.value,
    }
    const saved = props.issue
      ? await updateIssue(props.issue.id, payload)
      : await createIssue(payload)
    emit('saved', saved)
  } catch (err: any) {
    error.value = err?.message || 'Не удалось сохранить обращение'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="issue-form" @submit.prevent="submit">
    <header class="head">
      <div>
        <span class="head__eyebrow">{{ issue ? 'Редактирование' : 'Новое обращение' }}</span>
        <h2 class="head__title">{{ issue ? 'Изменить обращение' : 'Сообщить о проблеме' }}</h2>
      </div>
      <button class="head__close" type="button" title="Закрыть" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </header>

    <div class="body">
      <FormSelect
        id="issue-category"
        v-model="categoryId"
        label="Категория"
        :options="categoryOptions"
        placeholder="Выберите категорию"
      />

      <div class="preview">
        <img v-if="previewMarker" class="preview__marker" :src="previewMarker" alt="" />
        <div class="preview__info">
          <span class="preview__label">Маркер на карте</span>
          <span class="preview__name">
            <span
              v-if="selectedCategory"
              class="preview__dot"
              :style="{ background: selectedCategory.color }"
            ></span>
            {{ selectedCategory?.name || 'Категория не выбрана' }}
          </span>
          <span v-if="previewStatus" class="preview__status">
            Статус: {{ previewStatus.name }}
          </span>
        </div>
      </div>

      <div class="field">
        <div class="field__head">
          <label class="field__label" for="issue-description">Описание</label>
          <span class="field__counter" :class="{ 'field__counter--low': remaining < 40 }">
            {{ description.length }}/500
          </span>
        </div>
        <textarea
          id="issue-description"
          v-model="description"
          class="textarea"
          rows="4"
          maxlength="500"
          placeholder="Что случилось и где: детали, которые помогут службам"
        ></textarea>
      </div>

      <FormField
        id="issue-address"
        v-model="address"
        label="Адрес"
        placeholder="Улица, дом или ориентир"
      />
      <p v-if="geocoding" class="hint hint--active">Определяем адрес по координатам…</p>

      <div class="point">
        <div class="point__head">
          <span class="field__label">Точка на карте</span>
          <span v-if="point" class="point__coords">{{ formatPoint(point) }}</span>
        </div>
        <div class="point__actions">
          <button
            v-if="allowMapPick"
            type="button"
            class="btn btn--outline btn--sm"
            :class="{ 'btn--active': picking }"
            @click="emit('set-picking', true)"
          >
            <AppIcon name="map-pin" :size="13" />
            Указать на карте
          </button>
          <button type="button" class="btn btn--outline btn--sm" :disabled="locating" @click="locate">
            <AppIcon name="map-pin" :size="13" />
            {{ locating ? 'Поиск…' : 'Моя геопозиция' }}
          </button>
        </div>
        <p class="hint">
          {{ picking && allowMapPick ? 'Кликните по карте слева, чтобы поставить точку' : point ? 'Точка выбрана' : 'Точка не выбрана' }}
        </p>
      </div>

      <div class="photos">
        <div class="photos__head">
          <span class="field__label">Фото</span>
          <span class="photos__count">{{ totalPhotos }}/3</span>
        </div>

        <div class="photos__grid">
          <div v-for="(photo, index) in keepPhotos" :key="photo" class="photo">
            <img :src="photo" alt="" />
            <button type="button" class="photo__remove" title="Удалить" @click="removeExisting(index)">
              <AppIcon name="close" :size="10" />
            </button>
          </div>

          <div v-for="(preview, index) in previews" :key="preview.url" class="photo photo--new">
            <img :src="preview.url" alt="" />
            <button type="button" class="photo__remove" title="Удалить" @click="removeNew(index)">
              <AppIcon name="close" :size="10" />
            </button>
          </div>

          <button
            v-if="canAddPhoto"
            type="button"
            class="photo photo--add"
            title="Добавить фото"
            @click="pickFiles"
          >
            <AppIcon name="image" :size="18" />
            <span>Добавить</span>
          </button>
        </div>

        <input
          ref="fileInput"
          class="photos__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          @change="onFiles"
        />
        <p class="hint">JPG, PNG, WebP или GIF, до 5 МБ каждое</p>
      </div>

      <FormStatus :error="error" />
    </div>

    <footer class="foot">
      <button type="button" class="btn btn--outline" @click="close">Отмена</button>
      <button type="submit" class="btn btn--primary" :disabled="busy">
        {{ busy ? 'Сохраняем…' : issue ? 'Сохранить' : 'Отправить' }}
      </button>
    </footer>
  </form>
</template>

<style scoped>
.issue-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: var(--surface);
  border-right: 1px solid var(--border);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border);
}

.head__eyebrow {
  display: block;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.head__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.head__close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.head__close:hover {
  color: var(--text);
  background: var(--surface-2);
}

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.preview__marker {
  width: 42px;
  height: 54px;
  object-fit: contain;
  flex-shrink: 0;
}

.preview__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preview__label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.preview__name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-dim);
}

.preview__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.preview__status {
  font-size: 11.5px;
  color: var(--text-muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dim);
}

.field__counter {
  font-size: 11px;
  color: var(--text-muted);
}

.field__counter--low {
  color: #e0a06a;
}

.textarea {
  resize: vertical;
  min-height: 82px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
}

.textarea::placeholder {
  color: var(--text-muted);
}

.textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}

.point {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px 11px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.point__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.point__coords {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-muted);
}

.point__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.btn--active {
  border-color: var(--accent);
  color: var(--accent);
}

.hint {
  font-size: 11.5px;
  color: var(--text-muted);
}

.hint--active {
  margin-top: -6px;
  color: var(--accent);
}

.photos {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.photos__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.photos__count {
  font-size: 11px;
  color: var(--text-muted);
}

.photos__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.photo {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-3);
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo__remove {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(15, 15, 17, 0.82);
  color: var(--text-dim);
}

.photo__remove:hover {
  color: #fff;
  background: #b3473b;
}

.photo--add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-style: dashed;
  color: var(--text-muted);
  font-size: 10.5px;
}

.photo--add:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.photos__input {
  display: none;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}
</style>
