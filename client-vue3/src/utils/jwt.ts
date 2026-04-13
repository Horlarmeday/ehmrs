/**
 * JWT Utilities
 */

export interface JwtPayload {
  sub: number  // User ID
  username: string
  role: string
  department?: string
  sub_role?: string
  iat: number  // Issued at
  exp: number  // Expiration
}

/**
 * Parse JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded payload
 */
export function parseJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    throw new Error('Invalid token')
  }
}

/**
 * Check if JWT token is expired
 * 
 * @param token - JWT token string
 * @returns true if expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwt(token)
    const now = Date.now() / 1000
    return payload.exp < now
  } catch {
    return true
  }
}
