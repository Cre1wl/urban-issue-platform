<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import FormStatus from '../ui/FormStatus.vue'
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from '../../core/data/serviceDirectoryService'
import type { Service } from '../../core/models/Catalog'

const services = ref<Service[]>([])
const loading = ref(true)
const error = ref('')
const notice = ref('')
const newName = ref('')
const creating = ref(false)
const editingId = ref<number | null>(null)
const editingName = ref('')
const busyId = ref<number | null>(null)

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    services.value = await fetchServices()
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить службы'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const create = async () => {
  const name = newName.value.trim()
  if (name.length < 2) {
    error.value = 'Название должно содержать минимум 2 символа'
    return
  }
  creating.value = true
  error.value = ''
  notice.value = ''
  try {
    const service = await createService(name)
    services.value.push(service)
    services.value.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    newName.value = ''
    notice.value = 'Служба добавлена'
  } catch (err: any) {
    error.value = err?.message || 'Не удалось добавить службу'
  } finally {
    creating.value = false
  }
}

const startEdit = (service: Service) => {
  editingId.value = service.id
  editingName.value = service.name
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const save = async (service: Service) => {
  const name = editingName.value.trim()
  if (name.length < 2) {
    error.value = 'Название должно содержать минимум 2 символа'
    return
  }
  busyId.value = service.id
  error.value = ''
  notice.value = ''
  try {
    const updated = await updateService(service.id, name)
    const index = services.value.findIndex((item) => item.id === service.id)
    if (index !== -1) services.value[index] = updated
    services.value.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    cancelEdit()
    notice.value = 'Служба переименована'
  } catch (err: any) {
    error.value = err?.message || 'Не удалось переименовать службу'
  } finally {
    busyId.value = null
  }
}

const remove = async (service: Service) => {
  if (!window.confirm(`Удалить службу «${service.name}»?`)) return
  busyId.value = service.id
  error.value = ''
  notice.value = ''
  try {
    await deleteService(service.id)
    services.value = services.value.filter((item) => item.id !== service.id)
    notice.value = 'Служба удалена'
  } catch (err: any) {
    error.value = err?.message || 'Не удалось удалить службу'
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <section class="services">
    <header class="head">
      <div>
        <h2>Ответственные службы</h2>
        <p>Справочник используется при назначении ответственного по обращению</p>
      </div>
    </header>

    <FormStatus :error="error" :notice="notice" />

    <form class="create" @submit.prevent="create">
      <input
        v-model="newName"
        class="input"
        maxlength="120"
        placeholder="Название службы или подразделения"
      />
      <button class="btn btn--primary btn--sm" type="submit" :disabled="creating">
        <AppIcon name="plus" />
        {{ creating ? 'Добавление…' : 'Добавить' }}
      </button>
    </form>

    <div class="list">
      <div v-if="loading" class="empty">Загрузка…</div>
      <div v-else-if="!services.length" class="empty">Служб пока нет</div>
      <template v-else>
        <div v-for="service in services" :key="service.id" class="row">
        <span class="row__icon">
          <AppIcon name="shield" :size="14" />
        </span>

        <template v-if="editingId === service.id">
          <input v-model="editingName" class="input row__input" maxlength="120" />
          <div class="row__actions">
            <button class="btn btn--primary btn--sm" :disabled="busyId === service.id" @click="save(service)">
              Сохранить
            </button>
            <button class="btn btn--outline btn--sm" @click="cancelEdit">Отмена</button>
          </div>
        </template>

        <template v-else>
          <span class="row__name">{{ service.name }}</span>
          <div class="row__actions">
            <button class="icon-action" title="Переименовать" @click="startEdit(service)">
              <AppIcon name="edit" :size="13" />
            </button>
            <button
              class="icon-action icon-action--danger"
              title="Удалить"
              :disabled="busyId === service.id"
              @click="remove(service)"
            >
              <AppIcon name="trash" :size="13" />
            </button>
          </div>
        </template>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.services {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.head h2 {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.head p {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.create {
  display: flex;
  gap: 7px;
}

.input {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 12.5px;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.create .input {
  flex: 1;
}

.list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
}

.row:last-child {
  border-bottom: none;
}

.row__icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: var(--surface-3);
  color: var(--text-muted);
  flex-shrink: 0;
}

.row__name {
  flex: 1;
  font-size: 12.5px;
  color: var(--text-dim);
}

.row__input {
  flex: 1;
}

.row__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12.5px;
}

.icon-action {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  display: inline-grid;
  place-items: center;
  color: var(--text-muted);
}

.icon-action:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text);
}

.icon-action--danger:hover:not(:disabled) {
  color: #e07b6a;
}

.icon-action:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
