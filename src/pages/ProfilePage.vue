<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import ProfileAvatarCard from '../components/profile/ProfileAvatarCard.vue'
import ProfileAccountCard from '../components/profile/ProfileAccountCard.vue'
import ProfilePasswordCard from '../components/profile/ProfilePasswordCard.vue'
import useUser from '../composables/useUser'

const router = useRouter()
const { user, load } = useUser()

onMounted(async () => {
  await load()
  if (user.value.isGuest) router.push('/map')
})
</script>

<template>
  <div class="page">
    <AppHeader />

    <main class="profile">
      <div class="profile__top">
        <h1>Профиль</h1>
        <span class="profile__email">{{ user.email }}</span>
      </div>

      <div class="profile__grid">
        <ProfileAvatarCard />
        <ProfileAccountCard />
        <ProfilePasswordCard />
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.profile {
  flex: 1;
  overflow-y: auto;
  padding: 28px 24px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile__top {
  width: 100%;
  max-width: 1080px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.profile__email {
  font-size: 13px;
  color: var(--text-muted);
}

.profile__grid {
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 250px minmax(240px, 1fr) minmax(240px, 1fr);
  gap: 16px;
  align-items: start;
}

@media (max-width: 960px) {
  .profile__grid {
    grid-template-columns: 1fr;
    max-width: 440px;
  }
}
</style>
