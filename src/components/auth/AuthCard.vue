<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Card from '../ui/Card.vue'
import FormField from '../ui/FormField.vue'
import FormStatus from '../ui/FormStatus.vue'
import useUser from '../../composables/useUser'

const router = useRouter()
const { login, register } = useUser()

const mode = ref('login')
const nickname = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

const submit = async () => {
  error.value = ''
  busy.value = true
  try {
    if (mode.value === 'login') {
      await login(email.value, password.value)
    } else {
      await register({ email: email.value, nickname: nickname.value, password: password.value })
    }
    router.push('/map')
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}

const switchMode = (next) => {
  mode.value = next
  error.value = ''
}
</script>

<template>
  <Card class="auth-card">
    <div class="auth-tabs">
      <button
        class="auth-tab"
        :class="{ 'auth-tab--on': mode === 'login' }"
        @click="switchMode('login')"
      >
        Вход
      </button>
      <button
        class="auth-tab"
        :class="{ 'auth-tab--on': mode === 'register' }"
        @click="switchMode('register')"
      >
        Регистрация
      </button>
    </div>

    <form class="form" @submit.prevent="submit">
      <FormField
        v-if="mode === 'register'"
        id="nickname"
        v-model="nickname"
        label="Ник"
        placeholder="Как вас будут видеть другие"
        autocomplete="nickname"
      />
      <FormField
        id="email"
        v-model="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
      />
      <FormField
        id="password"
        v-model="password"
        label="Пароль"
        type="password"
        placeholder="Минимум 6 символов"
        :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
      />

      <FormStatus :error="error" />

      <button class="btn btn--primary btn--block" type="submit" :disabled="busy">
        {{ busy ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Создать аккаунт' }}
      </button>
    </form>

    <div class="divider">
      <span>или</span>
    </div>

    <RouterLink class="btn btn--outline btn--block" to="/map">Продолжить как гость</RouterLink>

    <p class="hint">Гость может смотреть карту обращений без регистрации</p>
  </Card>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-tabs {
  display: flex;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.auth-tab {
  flex: 1;
  padding: 7px 0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition:
    color 0.12s,
    background 0.12s;
}

.auth-tab--on {
  background: var(--surface-3);
  color: var(--text);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
</style>
