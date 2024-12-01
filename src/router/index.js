import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/SignInView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('../views/ManagementView.vue'),
      meta: { requiresAuth: true, requiresManagement: true }
    },
  ],
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Check if route requires guest access (like signin page)
  if (to.meta.requiresGuest && userStore.isLoggedIn) {
    return next('/')
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return next('/signin')
  }

  // Check if route requires management access
  if (to.meta.requiresManagement && !userStore.hasManagementAccess) {
    return next('/')
  }

  next()
})

export default router
