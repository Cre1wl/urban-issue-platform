<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
  placeholder?: string
  rows?: number
  maxlength?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="field">
    <label class="field__label" :for="id">{{ label }}</label>
    <textarea
      :id="id"
      class="field__textarea"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 3"
      :maxlength="maxlength"
      @input="onInput"
    ></textarea>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dim);
}

.field__textarea {
  resize: vertical;
  min-height: 70px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
  transition:
    border-color 0.12s,
    box-shadow 0.12s;
}

.field__textarea::placeholder {
  color: var(--text-muted);
}

.field__textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
</style>
