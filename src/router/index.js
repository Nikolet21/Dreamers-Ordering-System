import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue')},
    { path: '/signin', name: 'signin', component: () => import('../views/SignInView.vue')}, // Optimized Form
  ],
})
export default router