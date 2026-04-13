/**
 * Common Types
 * 
 * Base types used across multiple modules
 * 
 * Based on actual server models
 */

/**
 * Gender enum from server models
 */
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

/**
 * Yes/No boolean type for medical forms
 */
export type YesNo = 'yes' | 'no'

/**
 * Base entity interface - all entities extend this
 * Note: Server uses number IDs, not strings
 */
export interface BaseEntity {
  id: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Address as stored in server (single string field)
 */
export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  lga?: string  // Local Government Area (Nigeria specific)
  fullAddress: string  // Mapped to 'address' field in Patient
}

/**
 * Contact information
 * Note: Server stores phone and alt_phone as separate fields
 */
export interface Contact {
  email?: string
  phone: string
  alternatePhone?: string  // Mapped to 'alt_phone'
}

/**
 * Next of kin information (Patient specific)
 */
export interface NextOfKin {
  name: string  // next_of_kin_name
  address: string  // next_of_kin_address
  phone: string  // next_of_kin_phone
  relationship: string  // next_of_kin_relationship
}
