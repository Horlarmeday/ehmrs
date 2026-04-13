/**
 * Authentication Types
 * 
 * Based on actual server implementation
 * Note: Server returns token string, not object
 */

import type { Staff } from './employee'

/**
 * Login request
 */
export interface LoginRequest {
  username: string  // Server uses 'username', not 'email'
  password: string
  rememberMe?: boolean
}

/**
 * Login response
 * Note: Server returns token as string in response.data.data
 */
export type LoginResponse = string  // JWT token string

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/**
 * User session (client-side only)
 */
export interface UserSession {
  token: string
  user: Staff  // User is a Staff member
  expiresAt?: Date
}

/**
 * Auth state for Pinia store
 */
export interface AuthState {
  token: string | null
  user: Staff | null
  isAuthenticated: boolean
  isLoading: boolean
}
