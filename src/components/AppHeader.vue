<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppBrand from './AppBrand.vue'
import AppIcon from './AppIcon.vue'
import useUser from '../composables/useUser'

const route = useRoute()
const router = useRouter()
const { user, logout } = useUser()

const onLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <header class="header">
    <AppBrand />

    <nav class="nav">
      <RouterLink
        class="nav__link"
        :class="{ 'nav__link--active': route.path === '/map' }"
        to="/map"
      >
        Карта обращений
      </RouterLink>
      <a class="nav__link">Объявления</a>
      <a class="nav__link">О проекте</a>
    </nav>

    <div class="header-actions">
      <button class="icon-btn" title="Уведомления">
        <AppIcon name="bell" />
        <span class="icon-btn__dot"></span>
      </button>

      <RouterLink v-if="user.isGuest" class="btn btn--outline btn--sm" to="/">Войти</RouterLink>

      <template v-else>
        <span class="header-user">{{ user.nickname }}</span>
        <RouterLink
          class="avatar"
          :class="{ 'avatar--on': route.path === '/profile' }"
          to="/profile"
          title="Профиль"
        >
          <img v-if="user.avatar" class="avatar__img" :src="user.avatar" alt="" />
          <AppIcon v-else name="user" />
        </RouterLink>
        <button class="icon-btn" title="Выйти" @click="onLogout">
          <AppIcon name="logout" />
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 58px;
  padding: 0 24px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  z-index: 20;
}

.nav {
  display: flex;
  gap: 4px;
  height: 100%;
  align-items: center;
}

.nav__link {
  padding: 7px 13px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  color: var(--text-muted);
  text-decoration: none;
  transition:
    color 0.12s,
    background 0.12s;
}

.nav__link:hover {
  color: var(--text);
  background: var(--surface);
}

.nav__link--active {
  color: var(--text);
  background: var(--surface-2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  color: var(--text-muted);
  transition:
    color 0.12s,
    background 0.12s;
  position: relative;
}

.icon-btn:hover {
  color: var(--text);
  background: var(--surface);
}

.icon-btn__dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  border: 1.5px solid var(--bg);
}

.header-user {
  font-size: 13.5px;
  color: var(--text-dim);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surface-3);
  border: 1.5px solid var(--border);
  overflow: hidden;
  transition:
    color 0.12s,
    border-color 0.12s;
}

.avatar:hover {
  color: var(--accent);
  border-color: var(--border-strong);
}

.avatar--on {
  color: var(--accent);
  border-color: var(--accent);
}

.avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
}
</style>
