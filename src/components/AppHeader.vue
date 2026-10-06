<script setup>
import AppBrand from './AppBrand.vue'
import AppIcon from './AppIcon.vue'
</script>

<template>
  <header class="header">
    <AppBrand />

    <nav class="nav">
      <a class="nav__link nav__link--active">Карта обращений</a>
      <a class="nav__link">Объявления</a>
      <a class="nav__link">О проекте</a>
    </nav>

    <div class="header-actions">
      <button class="icon-btn" title="Уведомления">
        <AppIcon name="bell" />
        <span class="icon-btn__dot"></span>
      </button>
      <button class="avatar" title="Профиль">
        <AppIcon name="user" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  z-index: 20;
}

.nav {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: center;
}

.nav__link {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  color: var(--text-muted);
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
  gap: 8px;
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

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surface-3);
  transition:
    color 0.12s,
    background 0.12s;
}

.avatar:hover {
  color: var(--accent);
  background: var(--surface-2);
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
}
</style>
