<script setup>
const issues = []
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__head">
      <div class="sidebar__title">
        Обращения
        <span class="sidebar__title-count">{{ issues.length }}</span>
      </div>
      <button class="btn btn--outline btn--sm">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Новое
      </button>
    </div>

    <div class="sidebar__search">
      <svg
        class="sidebar__search-icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input type="text" placeholder="Адрес, описание…" />
    </div>

    <div class="sidebar__filterbar">
      <button class="filterbar__sort">
        Сортировка: <b>свежие</b>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <span>{{ issues.length }} шт.</span>
    </div>

    <div class="list">
      <div class="empty">
        <svg
          width="36"
          height="36"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M16 5.2 26.5 26H5.5Z"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linejoin="round"
          />
          <circle cx="16" cy="16.8" r="3.4" fill="currentColor" />
        </svg>
        <div class="empty__title">Пока нет обращений</div>
        <div>Когда жители сообщат о проблемах, они появятся здесь и на карте</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  min-height: 0;
}

.sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.sidebar__title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar__title-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--surface-3);
}

.sidebar__search {
  padding: 0 16px 10px;
  position: relative;
}

.sidebar__search input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  outline: none;
  font-size: 13px;
}

.sidebar__search input::placeholder {
  color: var(--text-muted);
}

.sidebar__search input:focus {
  border-color: var(--border-strong);
  background: var(--surface-3);
}

.sidebar__search-icon {
  position: absolute;
  left: 26px;
  top: 50%;
  transform: translateY(calc(-50% - 5px));
  color: var(--text-muted);
  pointer-events: none;
}

.sidebar__filterbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 12.5px;
  color: var(--text-muted);
}

.filterbar__sort {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  padding: 4px 6px;
  border-radius: 4px;
  transition:
    color 0.12s,
    background 0.12s;
}

.filterbar__sort:hover {
  color: var(--text);
  background: var(--surface-2);
}

.filterbar__sort b {
  color: var(--text-dim);
  font-weight: 500;
}

.list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
}

.empty {
  margin: auto;
  text-align: center;
  padding: 32px 20px;
  color: var(--text-muted);
  font-size: 13px;
  max-width: 240px;
}

.empty svg {
  margin: 0 auto 10px;
  color: var(--border-strong);
}

.empty__title {
  color: var(--text-dim);
  margin-bottom: 4px;
  font-size: 13.5px;
  font-weight: 600;
}
</style>
