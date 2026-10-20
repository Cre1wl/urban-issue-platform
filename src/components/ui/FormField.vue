<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: '' },
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field">
    <label class="field__label" :for="id">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      @input="$emit('update:modelValue', $event.target.value)"
    />
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

.field input {
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  transition:
    border-color 0.12s,
    box-shadow 0.12s;
}

.field input::placeholder {
  color: var(--text-muted);
}

.field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
</style>
