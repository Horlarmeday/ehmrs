import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { Staff } from '@/types/employee'

/**
 * Authentication Store
 * 
 * Manages authentication state, login/logout, and user session
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('user_token'))
  const user = ref<Staff | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || '')
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstname} ${user.value.lastname}`
  })
  const userDepartment = computed(() => user.value?.department || '')

  // Actions
  async function login(username: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const authToken = await authService.login({ username, password })
      
      // Store token
      token.value = authToken
      localStorage.setItem('user_token', authToken)
      
      // Set auth header
      // (axios interceptor will pick it up from localStorage)
      
      // Load user info
      await loadUser()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadUser(): Promise<void> {
    if (!token.value) return

    try {
      user.value = await authService.getCurrentUser()
    } catch (err) {
      console.error('Failed to load user:', err)
      user.value = null
    }
  }

  function logout(): void {
    // Clear state
    token.value = null
    user.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('user_token')

    // Redirect to login
    window.location.replace('/auth/login')
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    token,
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    userName,
    userDepartment,
    // Actions
    login,
    logout,
    loadUser,
    clearError,
  }
})

export default useAuthStore
