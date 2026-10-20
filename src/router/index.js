import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../pages/WelcomePage.vue'
import IssuesPage from '../pages/IssuesPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'welcome', component: WelcomePage },
    { path: '/map', name: 'map', component: IssuesPage },
    { path: '/profile', name: 'profile', component: ProfilePage },
  ],
})

export default router