<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import Card from '../ui/Card.vue'
import FormStatus from '../ui/FormStatus.vue'
import useUser from '../../composables/useUser'
import { roleLabel } from '../../core/constants/roles'

const { user, uploadAvatar } = useUser()

const avatarInput = ref(null)
const pendingFile = ref(null)
const previewUrl = ref('')
const notice = ref('')
const error = ref('')

const initials = computed(() => user.value.nickname.trim().charAt(0).toUpperCase())
const role = computed(() => roleLabel(user.value.role))

const createdAt = computed(() => {
  if (!user.value.createdAt) return ''
  return new Date(user.value.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const pickAvatar = () => avatarInput.value?.click()

const onAvatarSelected = (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  error.value = ''
  notice.value = ''
  pendingFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const resetDraft = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  pendingFile.value = null
}

const cancelAvatar = () => {
  resetDraft()
  error.value = ''
}

const saveAvatar = async () => {
  if (!pendingFile.value) return
  error.value = ''
  notice.value = ''
  try {
    await uploadAvatar(pendingFile.value)
    resetDraft()
    notice.value = 'Аватар сохранён'
  } catch (err) {
    error.value = err.message
  }
}

onBeforeUnmount(resetDraft)
</script>

<template>
  <Card title="Аватар" icon="image">
    <div class="avatar-big" :class="{ 'avatar-big--draft': pendingFile }">
      <img v-if="previewUrl" class="avatar-big__img" :src="previewUrl" alt="" />
      <img v-else-if="user.avatar" class="avatar-big__img" :src="user.avatar" alt="" />
      <span v-else class="avatar-big__initials">{{ initials }}</span>
      <span v-if="pendingFile" class="avatar-big__badge">Новое фото</span>
    </div>

    <input
      ref="avatarInput"
      class="avatar-big__file"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      @change="onAvatarSelected"
    />

    <div v-if="pendingFile" class="actions">
      <button class="btn btn--primary btn--block" type="button" @click="saveAvatar">
        Сохранить аватар
      </button>
      <button class="btn btn--outline btn--block" type="button" @click="cancelAvatar">
        Отмена
      </button>
    </div>
    <button v-else class="btn btn--outline btn--block" type="button" @click="pickAvatar">
      Выбрать фото
    </button>

    <p class="hint">JPG, PNG, WebP или GIF, до 5 МБ</p>
    <FormStatus :error="error" :notice="notice" />

    <div class="meta">
      <span class="meta__role">{{ role }}</span>
      <span v-if="createdAt" class="meta__date">На проекте с {{ createdAt }}</span>
    </div>
  </Card>
</template>

<style scoped>
.avatar-big {
  position: relative;
  width: 150px;
  height: 150px;
  align-self: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-3);
  border: 1px solid var(--border-strong);
  display: grid;
  place-items: center;
  transition: border-color 0.15s;
}

.avatar-big--draft {
  border-color: var(--accent);
}

.avatar-big__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-big__initials {
  font-size: 48px;
  font-weight: 600;
  color: var(--accent);
  opacity: 0.85;
}

.avatar-big__badge {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--accent);
  color: #1a1408;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.avatar-big__file {
  display: none;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 12.5px;
  color: var(--text-muted);
}

.meta__role {
  padding: 2px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  color: var(--accent);
}
</style>
