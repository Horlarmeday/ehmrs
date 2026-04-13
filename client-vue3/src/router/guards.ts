import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Auth Guard
 * 
 * Protects routes that require authentication
 * Redirects to login if not authenticated
 */
export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'auth-login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Check role-based access
  if (to.meta.roles && Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
    const userRole = authStore.userRole
    
    if (!userRole || !to.meta.roles.includes(userRole)) {
      next({ name: 'unauthorized' })
      return
    }
  }

  next()
}

/**
 * Guest Guard
 * 
 * Prevents authenticated users from accessing login/register pages
 * Redirects to dashboard if already authenticated
 */
export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
}
