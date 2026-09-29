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