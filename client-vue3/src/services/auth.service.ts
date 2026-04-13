import { apiClient } from './api'
import type { LoginRequest, LoginResponse } from '@/types/auth'
import type { Staff } from '@/types/employee'

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login with username and password
   * 
   * @param credentials - Username and password
   * @returns JWT token string (not object)
   */
  async login(credentials: LoginRequest): Promise<string> {
    const response = await apiClient.post('/auth/login', credentials)
    // Server returns: { status: 'success', message: string, data: token_string }
    return response.data.data as unknown as string
  },

  /**
   * Forgot password - request reset
   * 
   * @param phone - Phone number for password reset
   * @returns Staff object
   */
  async forgotPassword(phone: { phone: string }): Promise<Staff> {
    const { data } = await apiClient.post('/auth/forgot-password', phone)
    return data.data
  },

  /**
   * Change password
   * 
   * @param passwords - Old and new passwords
   * @returns Updated staff object
   */
  async changePassword(passwords: { oldPassword: string; newPassword: string }): Promise<Staff> {
    const { data } = await apiClient.put('/auth/change-password', passwords)
    return data.data
  },

  /**
   * Get current user info
   * 
   * @returns Staff object with user details
   */
  async getCurrentUser(): Promise<Staff> {
    const { data } = await apiClient.get('/auth/me')
    return data.data
  },
}

export default authService
