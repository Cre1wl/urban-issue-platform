<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppBrand from '../components/AppBrand.vue'

const mode = ref('login')
</script>

<template>
  <div class="welcome">
    <div class="welcome__head">
      <AppBrand :size="36" />
      <h1>Участвуйте в жизни города</h1>
      <p>Сообщайте о проблемах городской инфраструктуры и следите за их решением на карте</p>
    </div>

    <div class="card">
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ 'auth-tab--on': mode === 'login' }"
          @click="mode = 'login'"
        >
          Вход
        </button>
        <button
          class="auth-tab"
          :class="{ 'auth-tab--on': mode === 'register' }"
          @click="mode = 'register'"
        >
          Регистрация
        </button>
      </div>

      <form class="form" @submit.prevent>
        <div v-if="mode === 'register'" class="field">
          <label class="field__label" for="name">Имя</label>
          <input id="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" />
        </div>

        <div class="field">
          <label class="field__label" for="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>

        <div class="field">
          <label class="field__label" for="password">Пароль</label>
          <input
            id="password"
            type="password"
            placeholder="Минимум 6 символов"
            autocomplete="current-password"
          />
        </div>

        <button class="btn btn--primary btn--block" type="submit">
          {{ mode === 'login' ? 'Войти' : 'Создать аккаунт' }}
        </button>
      </form>

      <div class="divider">
        <span>или</span>
      </div>

      <RouterLink class="btn btn--outline btn--block" to="/map">Продолжить как гость</RouterLink>

      <p class="welcome__hint">Гость может смотреть карту обращений без регистрации</p>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 32px 20px;
}

.welcome__head {
  text-align: center;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.welcome__head h1 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-top: 8px;
}

.welcome__head p {
  font-size: 13.5px;
  color: var(--text-dim);
}

.card {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.field input::placeholder {
  color: var(--text-muted);
}

.field input:focus {
  border-color: var(--border-strong);
  background: var(--surface-3);
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

.welcome__hint {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
</style>
