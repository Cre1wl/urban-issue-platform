<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'
import FormStatus from '../ui/FormStatus.vue'
import useUser from '../../composables/useUser'
import { fetchUsers, updateUser } from '../../core/data/adminService'
import { roleLabel, type UserRole } from '../../core/constants/roles'
import { formatDate } from '../../core/utils/format'
import type { AdminUser } from '../../core/models/Admin'

const props = defineProps<{
  canManageRoles: boolean
}>()

const { user: current } = useUser()

const users = ref<AdminUser[]>([])
const search = ref('')
const loading = ref(false)
const error = ref('')
const notice = ref('')
const busyId = ref<number | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'resident', label: 'Житель' },
  { value: 'moderator', label: 'Модератор' },
  { value: 'admin', label: 'Администратор' },
]

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    users.value = await fetchUsers(search.value)
  } catch (err: any) {
    error.value = err?.message || 'Не удалось загрузить пользователей'
  } finally {
    loading.value = false
  }
}

onMounted(load)

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 300)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const isSelf = (target: AdminUser) => Number(current.value.id) === target.id

const canEditRole = (target: AdminUser) =>
  props.canManageRoles && !isSelf(target) && busyId.value !== target.id

const canToggleBlock = (target: AdminUser) => {
  if (isSelf(target) || busyId.value === target.id) return false
  if (props.canManageRoles) return true
  return target.role === 'resident'
}

const applyPatch = async (target: AdminUser, patch: { role?: UserRole; isBlocked?: boolean }) => {
  busyId.value = target.id
  error.value = ''
  notice.value = ''
  try {
    const updated = await updateUser(target.id, patch)
    const index = users.value.findIndex((item) => item.id === target.id)
    if (index !== -1) users.value[index] = updated
    notice.value = 'Данные пользователя обновлены'
  } catch (err: any) {
    error.value = err?.message || 'Не удалось обновить пользователя'
    await load()
  } finally {
    busyId.value = null
  }
}

const onRole = (target: AdminUser, event: Event) => {
  const role = (event.target as HTMLSelectElement).value as UserRole
  if (role === target.role) return
  void applyPatch(target, { role })
}

const toggleBlock = (target: AdminUser) => {
  const action = target.isBlocked ? 'разблокировать' : 'заблокировать'
  if (!window.confirm(`Вы уверены, что хотите ${action} пользователя ${target.nickname}?`)) return
  void applyPatch(target, { isBlocked: !target.isBlocked })
}

const totalUsers = computed(() => users.value.length)
</script>

<template>
  <section class="users">
    <header class="users__head">
      <div>
        <h2>Пользователи</h2>
        <p>{{ totalUsers }} записей · роли и блокировка</p>
      </div>
      <div class="users__search">
        <AppIcon name="search" :size="13" />
        <input v-model="search" type="text" placeholder="Ник или email" />
      </div>
    </header>

    <FormStatus :error="error" :notice="notice" />

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Регистрация</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="table__empty">Загрузка…</td>
          </tr>
          <tr v-else-if="!users.length">
            <td colspan="5" class="table__empty">Пользователи не найдены</td>
          </tr>
          <template v-else>
            <tr v-for="item in users" :key="item.id" :class="{ 'row--blocked': item.isBlocked }">
            <td>
              <div class="user">
                <span class="user__avatar">
                  <img v-if="item.avatar" :src="item.avatar" alt="" />
                  <AppIcon v-else name="user" :size="14" />
                </span>
                <div class="user__info">
                  <span class="user__name">
                    {{ item.nickname }}
                    <span v-if="isSelf(item)" class="user__you">вы</span>
                  </span>
                  <span class="user__email">{{ item.email }}</span>
                </div>
              </div>
            </td>
            <td>
              <select
                v-if="props.canManageRoles"
                class="role-select"
                :value="item.role"
                :disabled="!canEditRole(item)"
                @change="onRole(item, $event)"
              >
                <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
              <span v-else class="role-text">{{ roleLabel(item.role) }}</span>
            </td>
            <td>
              <span class="state" :class="item.isBlocked ? 'state--blocked' : 'state--ok'">
                {{ item.isBlocked ? 'Заблокирован' : 'Активен' }}
              </span>
            </td>
            <td class="table__date">{{ formatDate(item.createdAt) }}</td>
            <td class="table__actions">
              <button
                class="btn btn--outline btn--sm"
                :disabled="!canToggleBlock(item)"
                @click="toggleBlock(item)"
              >
                <AppIcon :name="item.isBlocked ? 'check' : 'lock'" :size="12" />
                {{ item.isBlocked ? 'Разблокировать' : 'Блокировать' }}
              </button>
            </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p v-if="!props.canManageRoles" class="hint">
      Модератор может блокировать только жителей. Роли изменяет администратор.
    </p>
  </section>
</template>

<style scoped>
.users {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.users__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.users__head h2 {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.users__head p {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.users__search {
  position: relative;
  width: 240px;
}

.users__search svg {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.users__search input {
  width: 100%;
  padding: 7px 10px 7px 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 12.5px;
}

.users__search input:focus {
  outline: none;
  border-color: var(--accent);
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.table th {
  text-align: left;
  padding: 9px 12px;
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border);
}

.table td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.table tr:last-child td {
  border-bottom: none;
}

.row--blocked {
  opacity: 0.62;
}

.table__empty {
  text-align: center;
  color: var(--text-muted);
  padding: 26px 12px !important;
}

.table__date {
  color: var(--text-muted);
  white-space: nowrap;
}

.table__actions {
  text-align: right;
}

.user {
  display: flex;
  align-items: center;
  gap: 9px;
}

.user__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--surface-3);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--text-muted);
  flex-shrink: 0;
}

.user__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user__name {
  color: var(--text-dim);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user__you {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  border-radius: 3px;
  padding: 0 3px;
}

.user__email {
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-select {
  padding: 5px 24px 5px 8px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 12px;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--text-muted) 50%),
    linear-gradient(135deg, var(--text-muted) 50%, transparent 50%);
  background-position:
    right 11px center,
    right 7px center;
  background-size:
    4px 4px,
    4px 4px;
  background-repeat: no-repeat;
}

.role-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.role-text {
  color: var(--text-dim);
}

.state {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.state--ok {
  background: color-mix(in srgb, #4caf7d 16%, transparent);
  color: #77c99a;
}

.state--blocked {
  background: color-mix(in srgb, #e07b6a 15%, transparent);
  color: #e39a8c;
}

.hint {
  font-size: 11.5px;
  color: var(--text-muted);
}

@media (max-width: 760px) {
  .table__date,
  .table th:nth-child(4) {
    display: none;
  }
}
</style>
