<script setup>
import { ref } from 'vue'
import Card from '../ui/Card.vue'
import FormField from '../ui/FormField.vue'
import FormStatus from '../ui/FormStatus.vue'
import useUser from '../../composables/useUser'

const { updateProfile } = useUser()

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const notice = ref('')
const error = ref('')

const save = async () => {
  notice.value = ''
  error.value = ''
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = 'Новые пароли не совпадают'
    return
  }
  try {
    await updateProfile({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    currentPassword.value = newPassword.value = confirmNewPassword.value = ''
    notice.value = 'Пароль обновлён'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <Card
    title="Смена пароля"
    icon="lock"
    desc="Используйте надёжный пароль — не повторяйте пароль от почты"
  >
    <form class="form" @submit.prevent="save">
      <FormField
        id="current-password"
        v-model="currentPassword"
        label="Текущий пароль"
        type="password"
        autocomplete="current-password"
      />
      <FormField
        id="new-password"
        v-model="newPassword"
        label="Новый пароль"
        type="password"
        placeholder="Минимум 6 символов"
        autocomplete="new-password"
      />
      <FormField
        id="confirm-password"
        v-model="confirmNewPassword"
        label="Повторите новый пароль"
        type="password"
        autocomplete="new-password"
      />

      <div class="form__foot">
        <FormStatus :error="error" :notice="notice" />
        <button class="btn btn--primary" type="submit">Обновить</button>
      </div>
    </form>
  </Card>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.form__foot {
  margin-top: auto;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
