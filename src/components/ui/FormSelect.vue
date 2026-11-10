<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
}

defineProps<{
  id: string
  label: string
  modelValue: string | number | null
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="field">
    <label class="field__label" :for="id">{{ label }}</label>
    <select
      :id="id"
      class="field__select"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="onChange"
    >
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
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

.field__select {
  appearance: none;
  padding: 9px 30px 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background:
    linear-gradient(45deg, transparent 50%, var(--text-muted) 50%) right 15px center / 4px 4px no-repeat,
    linear-gradient(135deg, var(--text-muted) 50%, transparent 50%) right 11px center / 4px 4px no-repeat,
    var(--surface-2);
  color: var(--text);
  font-size: 13px;
  transition:
    border-color 0.12s,
    box-shadow 0.12s;
  cursor: pointer;
}

.field__select:hover:not(:disabled) {
  border-color: var(--border-strong);
}

.field__select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}

.field__select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
