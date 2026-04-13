import { toast } from 'vue-sonner'
import type { AxiosError } from 'axios'

/**
 * Notification Utilities
 *
 * Uses vue-sonner toast notifications for user feedback.
 * Also logs to console for debugging purposes.
 */

/**
 * Show error notification
 */
export function notifyError(error: AxiosError | Error | string): void {
  let message = 'An error occurred'

  if (typeof error === 'string') {
    message = error
  } else if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<{ message?: string }>
    message = axiosError.response?.data?.message ?? axiosError.message
  } else if (error instanceof Error) {
    message = error.message
  }

  console.error('[Error Notification]', message)
  toast.error('Error', { description: message })
}

/**
 * Show success notification
 */
export function notifySuccess(message: string): void {
  console.log('[Success Notification]', message)
  toast.success(message)
}

/**
 * Show info notification
 */
export function notifyInfo(message: string): void {
  console.log('[Info Notification]', message)
  toast.info(message)
}

/**
 * Show warning notification
 */
export function notifyWarning(message: string): void {
  console.warn('[Warning Notification]', message)
  toast.warning(message)
}
