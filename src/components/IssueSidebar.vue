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