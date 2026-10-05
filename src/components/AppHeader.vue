<script setup>
import AppBrand from './AppBrand.vue'
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        <span class="icon-btn__dot"></span>
      </button>
      <button class="avatar" title="Профиль">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
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
