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