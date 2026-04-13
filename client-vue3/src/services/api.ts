import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { notifyError } from '@/utils/notifications'

/**
 * API Client Instance
 *
 * Configured with:
 * - Base URL from environment
 * - Request interceptor for auth token
 * - Response interceptor for error handling
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 180000, // 3 minutes
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * - Adds Authorization header with JWT token
 * - Token retrieved from localStorage
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('user_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * - Handles 401 Unauthorized (logout)
 * - Handles network errors
 * - Shows error notifications
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - logout user
      const authStore = useAuthStore();
      authStore.logout();
    }

    notifyError(error);
    return Promise.reject(error);
  }
);

export default apiClient
