/**
 * EHMRS Shared Types
 * 
 * This is the single source of truth for all types shared between
 * client and server. Neither side may define their own version
 * of these shared types.
 * 
 * Based on actual server models from /server/src/database/models/
 * 
 * @version 2.0.0
 * @maintainer @contract-architect
 */

// Re-export all types
export * from './common'
export * from './api'
export * from './auth'
export * from './patient'
export * from './appointment'
export * from './visit'
export * from './employee'
