import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { authGuard, guestGuard } from './guards'

/**
 * Vue Router Configuration
 * 
 * - History mode for clean URLs
 * - Auth guards for protected routes
 * - Scroll behavior
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

/**
 * Global Navigation Guards
 */
router.beforeEach((to, from, next) => {
  // Apply auth guard
  if (to.meta.requiresAuth === false) {
    guestGuard(to, from, next)
  } else {
    authGuard(to, from, next)
  }
})

/**
 * Page Title Updates
 */
router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - EHMRS`
  }
})

export default router
