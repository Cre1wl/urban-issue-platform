import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../pages/WelcomePage.vue'
import IssuesPage from '../pages/IssuesPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import ModerationPage from '../pages/ModerationPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import { hasToken } from '../core/auth/tokenStorage'
import useUser from '../composables/useUser'
import type { UserRole } from '../core/constants/roles'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'welcome', component: WelcomePage },
    { path: '/map', name: 'map', component: IssuesPage },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/moderation',
      name: 'moderation',
      component: ModerationPage,
      meta: { requiresAuth: true, roles: ['moderator', 'admin'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { requiresAuth: true, roles: ['admin'] },
    },
  ],
})

// Гварды повторяют серверные проверки: гость не попадает в панели, роль — по назначению
router.beforeEach(async (to) => {
  const { user, load } = useUser()

  if (user.value.isGuest && hasToken()) await load()

  const roles = to.meta.roles
  const needsAuth = to.meta.requiresAuth || Boolean(roles?.length)

  if (needsAuth && user.value.isGuest) {
    return { path: '/', query: { redirect: to.fullPath } }
  }

  if (roles?.length && !roles.includes(user.value.role)) {
    return { path: '/map' }
  }
})

export default router
