<script setup>
defineProps({
  error: { type: String, default: '' },
  notice: { type: String, default: '' },
})
</script>

<template>
  <p v-if="error" class="msg msg--error">{{ error }}</p>
  <p v-else-if="notice" class="msg">{{ notice }}</p>
</template>

<style scoped>
.msg {
  font-size: 12.5px;
  color: var(--text-dim);
}

.msg--error {
  color: #e07b6a;
}
</style>
