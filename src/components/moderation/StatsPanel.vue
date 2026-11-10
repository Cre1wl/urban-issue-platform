<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import { fetchStats } from '../../core/data/adminService'
import { formatHours } from '../../core/utils/format'
import type { ModerationStats } from '../../core/models/Admin'

const stats = ref<ModerationStats | null>(null)
const loading = ref(true)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    stats.value = await fetchStats()
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить статистику'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const maxStatus = computed(() =>
  Math.max(1, ...(stats.value?.byStatus.map((item) => item.count) ?? [1])),
)

const maxCategory = computed(() =>
  Math.max(1, ...(stats.value?.byCategory.map((item) => item.count) ?? [1])),
)

const pending = computed(
  () => stats.value?.byStatus.find((item) => item.key === 'pending')?.count ?? 0,
)

const resolved = computed(
  () => stats.value?.byStatus.find((item) => item.key === 'resolved')?.count ?? 0,
)
</script>

<template>
  <section class="stats">
    <header class="stats__head">
      <div>
        <h2>Дашборд</h2>
        <p>Сводка по обращениям, статусам и категориям</p>
      </div>
      <button class="btn btn--outline btn--sm" :disabled="loading" @click="load">
        <AppIcon name="refresh" :size="13" />
        {{ loading ? 'Обновление…' : 'Обновить' }}
      </button>
    </header>

    <p v-if="error" class="stats__error">{{ error }}</p>

    <div class="cards">
      <article class="card">
        <span class="card__label">Всего обращений</span>
        <span class="card__value">{{ stats?.total ?? '—' }}</span>
        <span class="card__hint">в базе портала</span>
      </article>
      <article class="card">
        <span class="card__label">На модерации</span>
        <span class="card__value card__value--accent">{{ pending }}</span>
        <span class="card__hint">ожидают проверки</span>
      </article>
      <article class="card">
        <span class="card__label">Решено</span>
        <span class="card__value card__value--green">{{ resolved }}</span>
        <span class="card__hint">за всё время</span>
      </article>
      <article class="card">
        <span class="card__label">Среднее решение</span>
        <span class="card__value">{{ formatHours(stats?.avgResolveHours ?? null) }}</span>
        <span class="card__hint">от создания до решения</span>
      </article>
    </div>

    <div class="columns">
      <article class="panel">
        <h3 class="panel__title">По статусам</h3>
        <div v-if="stats?.byStatus.length" class="bars">
          <div v-for="item in stats.byStatus" :key="item.id" class="bar">
            <div class="bar__head">
              <span class="bar__name">
                <span class="bar__dot" :style="{ background: item.color }"></span>
                {{ item.name }}
              </span>
              <span class="bar__count">{{ item.count }}</span>
            </div>
            <div class="bar__track">
              <span
                class="bar__fill"
                :style="{ width: `${(item.count / maxStatus) * 100}%`, background: item.color }"
              ></span>
            </div>
          </div>
        </div>
        <p v-else class="panel__empty">Нет данных</p>
      </article>

      <article class="panel">
        <h3 class="panel__title">По категориям</h3>
        <div v-if="stats?.byCategory.length" class="bars">
          <div v-for="item in stats.byCategory" :key="item.id" class="bar">
            <div class="bar__head">
              <span class="bar__name">
                <span class="bar__dot" :style="{ background: item.color }"></span>
                {{ item.name }}
              </span>
              <span class="bar__count">{{ item.count }}</span>
            </div>
            <div class="bar__track">
              <span
                class="bar__fill"
                :style="{ width: `${(item.count / maxCategory) * 100}%`, background: item.color }"
              ></span>
            </div>
          </div>
        </div>
        <p v-else class="panel__empty">Нет данных</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.stats__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.stats__head h2 {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.stats__head p {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.stats__error {
  font-size: 12.5px;
  color: #e07b6a;
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.card__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.card__value {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.card__value--accent {
  color: var(--accent);
}

.card__value--green {
  color: #6cc08f;
}

.card__hint {
  font-size: 11px;
  color: var(--text-muted);
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.panel {
  padding: 16px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
}

.panel__empty {
  font-size: 12px;
  color: var(--text-muted);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}

.bar__name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bar__count {
  color: var(--text-muted);
  font-size: 11.5px;
}

.bar__track {
  height: 5px;
  border-radius: 3px;
  background: var(--surface-3);
  overflow: hidden;
}

.bar__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  min-width: 2px;
  opacity: 0.9;
  transition: width 0.25s;
}

@media (max-width: 900px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }

  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
