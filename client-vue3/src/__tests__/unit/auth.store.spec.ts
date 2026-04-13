import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'

// Mock auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    forgotPassword: vi.fn(),
    changePassword: vi.fn(),
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Create fresh Pinia instance for each test
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore()
      
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should load token from localStorage on initialization', () => {
      localStorage.setItem('user_token', 'test-token-123')
      
      // Need to re-initialize store after setting localStorage
      const store = useAuthStore()
      
      expect(store.token).toBe('test-token-123')
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const store = useAuthStore()
      const mockToken = 'mock-jwt-token'
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', role: 'Admin', department: 'Administration' }
      
      // Mock service responses
      vi.mocked(authService.login).mockResolvedValue(mockToken)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any)
      
      // Perform login
      await store.login('testuser', 'password123')
      
      // Verify service was called correctly
      expect(authService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' })
      expect(authService.getCurrentUser).toHaveBeenCalled()
      
      // Verify state updates
      expect(store.token).toBe(mockToken)
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(localStorage.getItem('user_token')).toBe(mockToken)
    })

    it('should handle login failure', async () => {
      const store = useAuthStore()
      const errorMessage = 'Invalid credentials'
      
      // Mock service to throw error
      vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage))
      
      // Perform login and expect error
      await expect(store.login('wronguser', 'wrongpass')).rejects.toThrow(errorMessage)
      
      // Verify state
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBe(errorMessage)
      expect(localStorage.getItem('user_token')).toBeNull()
    })

    it('should pass credentials to auth service', async () => {
      const store = useAuthStore()
      const mockToken = 'mock-jwt-token'
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', role: 'Admin', department: 'Administration' }

      vi.mocked(authService.login).mockResolvedValue(mockToken)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any)

      await store.login('ab', 'password123')

      // Service should be called even with short username (validation is server-side)
      expect(authService.login).toHaveBeenCalledWith({ username: 'ab', password: 'password123' })
    })
  })

  describe('logout', () => {
    it('should clear state and localStorage on logout', () => {
      const store = useAuthStore()

      // Set initial state
      store.token = 'test-token'
      store.user = { id: 1, firstname: 'John', lastname: 'Doe' } as any
      localStorage.setItem('user_token', 'test-token')

      // Mock window.location.replace by redefining the property
      const originalLocation = window.location
      delete (window as Partial<Window>).location
      const mockReplace = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, replace: mockReplace },
        configurable: true,
        writable: true,
      })

      // Mock authService.getCurrentUser to prevent loadUser from being called during store setup
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null as any)

      // Perform logout
      store.logout()

      // Verify state cleared
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('user_token')).toBeNull()
      expect(mockReplace).toHaveBeenCalledWith('/auth/login')

      // Restore original location
      delete (window as Partial<Window>).location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      })
    })
  })

  describe('getters', () => {
    it('should compute userName correctly', () => {
      const store = useAuthStore()
      
      // No user
      expect(store.userName).toBe('')
      
      // With user
      store.user = { firstname: 'John', lastname: 'Doe' } as any
      expect(store.userName).toBe('John Doe')
    })

    it('should compute userRole correctly', () => {
      const store = useAuthStore()
      
      // No user
      expect(store.userRole).toBe('')
      
      // With user
      store.user = { role: 'Admin' } as any
      expect(store.userRole).toBe('Admin')
    })

    it('should compute userDepartment correctly', () => {
      const store = useAuthStore()
      
      // No user
      expect(store.userDepartment).toBe('')
      
      // With user
      store.user = { department: 'Administration' } as any
      expect(store.userDepartment).toBe('Administration')
    })
  })
})
