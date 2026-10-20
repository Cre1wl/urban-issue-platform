<script setup>
import AppIcon from '../AppIcon.vue'

defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  desc: { type: String, default: '' },
})
</script>

<template>
  <section class="card">
    <header v-if="title" class="card__head">
      <h2 class="card__title">
        <AppIcon v-if="icon" :name="icon" :size="14" />
        {{ title }}
      </h2>
      <p v-if="desc" class="card__desc">{{ desc }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text);
}

.card__title svg {
  color: var(--accent);
}

.card__desc {
  font-size: 12.5px;
  color: var(--text-muted);
}
</style>
