<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import useUser from '../composables/useUser'

const router = useRouter()
const { user, load, updateProfile, uploadAvatar } = useUser()

const nickname = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const notice = ref('')
const error = ref('')
const avatarInput = ref(null)

onMounted(async () => {
  await load()
  if (user.value.isGuest) return router.push('/')
  nickname.value = user.value.nickname
  email.value = user.value.email
})

const createdAt = computed(() => {
  if (!user.value.createdAt) return ''
  return new Date(user.value.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const saveAccount = async () => {
  notice.value = ''
  error.value = ''
  try {
    await updateProfile({ nickname: nickname.value, email: email.value })
    notice.value = 'Данные аккаунта сохранены'
  } catch (err) {
    error.value = err.message
  }
}

const savePassword = async () => {
  notice.value = ''
  error.value = ''
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = 'Новые пароли не совпадают'
    return
  }
  try {
    await updateProfile({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    currentPassword.value = newPassword.value = confirmNewPassword.value = ''
    notice.value = 'Пароль обновлён'
  } catch (err) {
    error.value = err.message
  }
}

const onAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  notice.value = ''
  error.value = ''
  try {
    await uploadAvatar(file)
    notice.value = 'Аватар обновлён'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="page">
    <AppHeader />

    <main class="profile">
      <h1>Профиль</h1>

      <section class="card profile__card">
        <button
          class="profile__avatar"
          type="button"
          title="Загрузить аватар"
          @click="avatarInput?.click()"
        >
          <img v-if="user.avatar" class="profile__avatar-img" :src="user.avatar" alt="" />
          <AppIcon v-else name="user" :size="26" />
        </button>
        <input
          ref="avatarInput"
          class="profile__file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="onAvatarChange"
        />

        <div class="profile__id">
          <div class="profile__nick">{{ user.nickname }}</div>
          <div class="profile__meta">
            <span class="profile__role">{{ user.role }}</span>
            <span v-if="createdAt">на проекте с {{ createdAt }}</span>
          </div>
        </div>
      </section>

      <section class="card profile__card">
        <h2 class="profile__title">Данные аккаунта</h2>
        <form class="form" @submit.prevent="saveAccount">
          <div class="field">
            <label class="field__label" for="nickname">Ник</label>
            <input id="nickname" v-model="nickname" type="text" autocomplete="nickname" />
          </div>
          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input id="email" v-model="email" type="email" autocomplete="email" />
          </div>
          <button class="btn btn--primary" type="submit">Сохранить</button>
        </form>
      </section>

      <section class="card profile__card">
        <h2 class="profile__title">Смена пароля</h2>
        <form class="form" @submit.prevent="savePassword">
          <div class="field">
            <label class="field__label" for="current-password">Текущий пароль</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
            />
          </div>
          <div class="field">
            <label class="field__label" for="new-password">Новый пароль</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              placeholder="Минимум 6 символов"
              autocomplete="new-password"
            />
          </div>
          <div class="field">
            <label class="field__label" for="confirm-password">Повторите новый пароль</label>
            <input
              id="confirm-password"
              v-model="confirmNewPassword"
              type="password"
              autocomplete="new-password"
            />
          </div>
          <button class="btn btn--primary" type="submit">Обновить пароль</button>
        </form>
      </section>

      <p v-if="error" class="profile__notice profile__notice--error">{{ error }}</p>
      <p v-else-if="notice" class="profile__notice">{{ notice }}</p>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.profile {
  flex: 1;
  overflow-y: auto;
  padding: 28px 20px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.card {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 20px;
}

.profile__card:first-of-type {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile__avatar {
  width: 72px;
  height: 72px;
  flex: none;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surface-3);
  border: 1px solid var(--border);
  overflow: hidden;
  transition:
    color 0.12s,
    border-color 0.12s;
}

.profile__avatar:hover {
  color: var(--accent);
  border-color: var(--border-strong);
}

.profile__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile__file {
  display: none;
}

.profile__nick {
  font-size: 17px;
  font-weight: 600;
}

.profile__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.profile__role {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-dim);
  text-transform: capitalize;
}

.profile__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dim);
}

.field input {
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  transition:
    border-color 0.12s,
    background 0.12s;
}

.field input:focus {
  border-color: var(--border-strong);
  background: var(--surface-3);
}

.profile__notice {
  font-size: 12.5px;
  color: var(--text-dim);
}

.profile__notice--error {
  color: #e07b6a;
}
</style>
