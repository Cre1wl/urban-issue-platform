<script setup>
import { ref, watch } from 'vue'
import Card from '../ui/Card.vue'
import FormField from '../ui/FormField.vue'
import FormStatus from '../ui/FormStatus.vue'
import useUser from '../../composables/useUser'

const { user, updateProfile } = useUser()

const nickname = ref('')
const email = ref('')
const notice = ref('')
const error = ref('')

// Заполняем поля, когда пользователь загрузился (и после каждого сохранения)
watch(user, () => {
  nickname.value = user.value.nickname
  email.value = user.value.email
}, { immediate: true })

const save = async () => {
  notice.value = ''
  error.value = ''
  try {
    await updateProfile({ nickname: nickname.value, email: email.value })
    notice.value = 'Данные сохранены'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <Card
    title="Данные аккаунта"
    icon="user"
    desc="Ник и email видят другие жители портала"
  >
    <form class="form" @submit.prevent="save">
      <FormField
        id="nickname"
        v-model="nickname"
        label="Ник"
        autocomplete="nickname"
      />
      <FormField
        id="email"
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
      />

      <div class="form__foot">
        <FormStatus :error="error" :notice="notice" />
        <button class="btn btn--primary" type="submit">Сохранить</button>
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
