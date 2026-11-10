<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatsPanel from '../components/moderation/StatsPanel.vue'
import UserManager from '../components/moderation/UserManager.vue'

type Tab = 'dashboard' | 'users'

const tab = ref<Tab>('dashboard')

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Статистика', icon: 'dashboard' },
  { id: 'users', label: 'Пользователи и роли', icon: 'users' },
]
</script>

<template>
  <div class="page">
    <AppHeader />

    <div class="tabs">
      <button
        v-for="item in TABS"
        :key="item.id"
        class="tab"
        :class="{ 'tab--on': tab === item.id }"
        @click="tab = item.id"
      >
        <AppIcon :name="item.icon" :size="13" />
        {{ item.label }}
      </button>
    </div>

    <main class="content">
      <div class="inner">
        <StatsPanel v-if="tab === 'dashboard'" />
        <UserManager v-else :can-manage-roles="true" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: grid;
  grid-template-rows: 58px auto 1fr;
  overflow: hidden;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 500;
  transition:
    color 0.12s,
    background 0.12s;
}

.tab:hover {
  color: var(--text);
  background: var(--surface);
}

.tab--on {
  color: var(--text);
  background: var(--surface-2);
}

.content {
  overflow-y: auto;
  padding: 20px 24px 44px;
}

.inner {
  max-width: 1180px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .content {
    padding: 16px 14px 34px;
  }
}
</style>
