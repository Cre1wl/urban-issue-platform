<script setup>
import AppBrand from '../components/AppBrand.vue'
import AuthCard from '../components/auth/AuthCard.vue'
</script>

<template>
  <div class="welcome">
    <div class="welcome__head">
      <AppBrand :size="36" />
      <h1>Участвуйте в жизни города</h1>
      <p>Сообщайте о проблемах городской инфраструктуры и следите за их решением на карте</p>
    </div>

    <AuthCard />
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
</style>
