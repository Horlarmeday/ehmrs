# API Conventions & Type Contracts

**Version**: 2.0.0  
**Created**: March 6, 2026  
**Owner**: @contract-architect  
**Status**: ✅ VALIDATED - Based on actual server models

---

## Overview

This document defines the **single source of truth** for all API contracts between the EHMRS Vue 3 client and the backend server.

**All types are based on actual server models from `/server/src/database/models/`**

**All shared types must be defined in `types/` folder. Neither client nor server may define their own version of a shared type.**

---

## API Base Configuration

### Base URL
```
Development: /api
Production: https://api.ehmrs.com/api
```

### Authentication
```
Header: Authorization: Bearer {token}
```

### Content Type
```
Content-Type: application/json
```

### Timeout
```
180000ms (3 minutes)
```

---

## Response Format Standards

### Success Response (200/201 OK)

**Based on**: `/server/src/common/responses/success-responses.ts`

```typescript
interface SuccessResponse<T> {
  status: 'success'
  message: string
  data: T
}
```

**Example**:
```json
{
  "status": "success",
  "message": "Patient created successfully",
  "data": {
    "id": 123,
    "firstname": "John",
    "lastname": "Doe",
    ...
  }
}
```

### Error Response

**Based on**: `/server/src/common/responses/error-responses.ts`

```typescript
interface ErrorResponse {
  status: 'error'
  httpCode: number
  message: string
  errors?: Record<string, string[]>
}
```

**Example**:
```json
{
  "status": "error",
  "httpCode": 400,
  "message": "Validation failed",
  "errors": {
    "firstname": ["First name is required"],
    "phone": ["Invalid phone number format"]
  }
}
```

### Pagination - Standard Format

**Based on**: `/server/src/core/helpers/helper.ts` (paginate function)

**Used by**: Patient, Visit, Staff endpoints

```typescript
interface PaginatedResult<T> {
  docs: T[]          // Array of items
  total: number      // Total count
  pages: number      // Total pages
  perPage: number    // Items per page
  currentPage: number
}
```

**Example**:
```json
{
  "status": "success",
  "message": "Patients retrieved",
  "data": {
    "docs": [
      { "id": 1, "firstname": "John", ... },
      { "id": 2, "firstname": "Jane", ... }
    ],
    "total": 100,
    "pages": 5,
    "perPage": 20,
    "currentPage": 1
  }
}
```

### Pagination - Alternative Format

**⚠️ IMPORTANT**: Appointment endpoint uses a different format

**Used by**: Appointment endpoint only

```typescript
interface PaginatedResultAlt<T> {
  rows: T[]          // Array of items (same as docs)
  count: number      // Total count
  pages: number      // Total pages
  currentPage: number
  pageLimit: number  // Items per page
}
```

**Example**:
```json
{
  "status": "success",
  "message": "Appointments retrieved",
  "data": {
    "rows": [
      { "id": 1, "patient_id": 123, ... },
      { "id": 2, "patient_id": 124, ... }
    ],
    "count": 100,
    "pages": 5,
    "currentPage": 1,
    "pageLimit": 20
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Client Action |
|------|---------|---------------|
| 200 | Success | Process response data |
| 201 | Created | Show success notification, navigate |
| 204 | No Content | Success, no data to process |
| 400 | Bad Request | Display validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied |
| 404 | Not Found | Show not found page |
| 409 | Conflict | Display conflict message |
| 422 | Unprocessable Entity | Display validation errors |
| 500 | Internal Server Error | Show error notification |
| 503 | Service Unavailable | Show maintenance page |

---

## Common Types

### Gender Enum

```typescript
enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}
```

### Base Entity

All entities extend this base:

```typescript
interface BaseEntity {
  id: number  // Server uses number IDs, not strings
  createdAt: Date
  updatedAt: Date
}
```

---

## Module-Specific Types

### Authentication

**Location**: `types/auth.ts`

```typescript
// Request
interface LoginRequest {
  username: string  // Server uses 'username', not 'email'
  password: string
  rememberMe?: boolean
}

// Response: Token string (not object)
type LoginResponse = string  // JWT token

// Other requests
interface ForgotPasswordRequest {
  email: string
}

interface ResetPasswordRequest {
  token: string
  newPassword: string
}
```

**API Endpoints**:
```
POST /api/auth/login              → LoginResponse (token string)
POST /api/auth/forgot-password    → Staff
PUT  /api/auth/change-password    → Staff
```

### Patient

**Location**: `types/patient.ts`  
**Model**: `/server/src/database/models/patient.ts`

```typescript
// Enums
enum PatientStatus {
  INPATIENT = 'Inpatient',
  OUTPATIENT = 'Outpatient',
  DECEASED = 'Deceased',
}

enum PatientAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

enum PatientType {
  PATIENT = 'Patient',
  DEPENDANT = 'Dependant',
}

// Main interface
interface Patient extends BaseEntity {
  // Basic Info (snake_case to match server)
  firstname: string
  lastname: string
  middlename?: string
  fullname?: string  // Virtual field
  gender: Gender
  date_of_birth: Date
  
  // Contact
  phone: string
  alt_phone?: string
  address: string  // Full address as single string
  country?: string
  state?: string
  lga?: string  // Local Government Area
  email?: string
  
  // Identification
  hospital_id?: string
  old_patient_id?: number
  
  // Additional
  occupation?: string
  marital_status?: string
  religion?: string
  photo?: string
  photo_url?: string
  
  // Next of Kin
  next_of_kin_name?: string
  next_of_kin_address?: string
  next_of_kin_phone?: string
  next_of_kin_relationship?: string
  
  // Insurance
  has_insurance: boolean
  
  // Dependant
  patient_type: PatientType
  relationship_to_principal?: string
  principal_id?: number
  
  // Status
  patient_status: PatientStatus
  status: PatientAccountStatus
  is_difficult_patient?: boolean
  admitted_days_in_year: number
  
  // Deceased
  date_of_death?: Date
  cause_of_death?: string
  death_certificate_number?: string
  marked_deceased_by?: number
  marked_deceased_at?: Date
  revival_reason?: string
  revived_by?: number
  revived_at?: Date
  
  // Audit
  staff_id?: number
  created_date?: Date
  updated_by?: number
}

// Query params
interface PatientQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  start?: string
  end?: string
  filter?: string
  patient_status?: PatientStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

**API Endpoints**:
```
POST /api/patients/create                    → Patient
POST /api/patients/create/emergency          → Patient
POST /api/patients/create/dependant/:id      → Patient
GET  /api/patients/get                       → PaginatedResult<Patient>
GET  /api/patients/get/:id                   → Patient
GET  /api/patients/profile/get/:id           → Patient (with insurance)
PUT  /api/patients/update/:id                → Patient
PUT  /api/patients/mark-deceased/:id          → Patient
PUT  /api/patients/revive/:id                → Patient
GET  /api/patients/deceased                  → PaginatedResult<Patient>
```

### Appointment

**Location**: `types/appointment.ts`  
**Model**: `/server/src/database/models/appointment.ts`

```typescript
// Enums
enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  NO_SHOW = 'No Show',
  RESCHEDULED = 'Rescheduled',
}

enum AppointmentType {
  CONSULTATION = 'Consultation',
  FOLLOW_UP = 'Follow Up',
  PROCEDURE = 'Procedure',
  VACCINATION = 'Vaccination',
  DIALYSIS = 'Dialysis',
  ANTENATAL = 'Antenatal',
}

// Main interface
interface Appointment extends BaseEntity {
  patient_id: number
  doctor_id: number
  scheduled_by: number
  
  appointment_date: string  // "YYYY-MM-DD"
  appointment_time: string  // "HH:MM:SS"
  duration_minutes: number  // 15-240, default: 30
  type: AppointmentType
  status: AppointmentStatus
  
  department: string
  professional: string
  priority?: string
  notes?: string
  reason_for_visit?: string
  
  visit_id?: number
  
  cancelled_at?: Date
  cancelled_by?: number
  cancellation_reason?: string
  
  rescheduled_at?: Date
  rescheduled_by?: number
  rescheduling_reason?: string
  
  confirmed_at?: Date
  confirmed_by?: number
}

// Query params (uses alternative pagination)
interface AppointmentQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  start?: string
  end?: string
  status?: AppointmentStatus
  type?: AppointmentType
  doctor_id?: number
  patient_id?: number
  department?: string
}
```

**API Endpoints**:
```
POST /api/appointments/create              → Appointment
GET  /api/appointments/get                 → PaginatedResultAlt<Appointment>
GET  /api/appointments/:id                 → Appointment
PUT  /api/appointments/:id                 → Appointment
PUT  /api/appointments/:id/cancel           → Appointment
PUT  /api/appointments/:id/reschedule       → Appointment
PUT  /api/appointments/:id/confirm          → Appointment
POST /api/appointments/:id/check-in        → { appointment, visit }
```

### Visit

**Location**: `types/visit.ts`  
**Model**: `/server/src/database/models/visit.ts`

```typescript
// Enums
enum VisitCategory {
  IPD = 'Inpatient',
  OPD = 'Outpatient',
  EMERGENCY = 'Emergency',
  ANC = 'Antenatal',
  IMMUNIZATION = 'Immunization',
  MATERNITY = 'Maternity',
  DIALYSIS = 'Dialysis',
}

enum VisitStatus {
  ONGOING = 'Ongoing',
  ENDED = 'Ended',
}

// Main interface
interface Visit extends BaseEntity {
  patient_id: number
  staff_id?: number
  
  category: VisitCategory
  type: string  // Custom string
  status: VisitStatus
  department: string
  professional?: string
  priority?: string
  
  date_visit_start: Date
  date_visit_ended?: Date
  visit_date?: string  // "YYYY-MM-DD"
  
  has_done_vitals: boolean
  is_taken: boolean
  is_from_appointment: boolean
  
  ante_natal_id?: number
  admission_id?: number
  immunization_id?: number
  consultation_id?: number
}

// Query params
interface VisitQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  start?: string
  end?: string
  category?: VisitCategory
  filter?: string
}
```

**API Endpoints**:
```
POST /api/visits/create              → Visit
POST /api/visits/last-active         → Visit
GET  /api/visits/active/get          → PaginatedResult<Visit>
GET  /api/visits/all/get             → PaginatedResult<Visit>
GET  /api/visits/category/get        → PaginatedResult<Visit>
GET  /api/visits/:id                 → Visit
PUT  /api/visits/update/:id          → Visit
PUT  /api/visits/end/:id             → Visit
```

### Staff (Employee)

**Location**: `types/employee.ts`  
**Model**: `/server/src/database/models/staff.ts`

```typescript
// Enum
enum StaffStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

// Main interface
interface Staff extends BaseEntity {
  firstname: string
  lastname?: string
  middlename?: string
  fullname?: string  // Virtual field
  
  email: string
  department: string
  date_of_birth: Date
  gender: Gender
  photo?: string
  status: StaffStatus
  role: string
  sub_role?: string
  phone: string
  username: string
  address: string
  
  // Career
  date_of_first_appointment?: Date
  date_of_commencement?: Date
  dolp?: Date  // Date of last promotion
  qualification?: string
  present_rank?: string
  chs_cms?: string
  step?: number
  dd_for_retirement?: Date
  nin?: string  // National ID
}

// Query params
interface StaffQueryParams {
  currentPage?: number
  pageLimit?: number
  search?: string
  department?: string
  status?: StaffStatus
  role?: string
}
```

**API Endpoints**:
```
POST /api/staffs/create              → Staff
GET  /api/staffs/get                 → PaginatedResult<Staff>
GET  /api/staffs/:id                 → Staff
PUT  /api/staffs                     → Staff
PUT  /api/staffs/reset-password/:id  → Staff
```

---

## Field Naming Conventions

### Server Uses snake_case

**IMPORTANT**: All database fields use snake_case naming:

- `firstname` (not `firstName`)
- `lastname` (not `lastName`)
- `middlename` (not `middleName`)
- `date_of_birth` (not `dateOfBirth`)
- `appointment_date` (not `appointmentDate`)
- `patient_id` (not `patientId`)

### Client Type Definitions

TypeScript types **MUST** use snake_case to match server:

```typescript
// ✅ Correct
interface Patient {
  firstname: string
  date_of_birth: Date
  patient_id: number
}

// ❌ Wrong - will cause type mismatch
interface Patient {
  firstName: string
  dateOfBirth: Date
  patientId: number
}
```

---

## Data Type Mappings

### Server → TypeScript

| Server Type | TypeScript Type | Notes |
|-------------|----------------|-------|
| INTEGER | `number` | Auto-increment IDs |
| STRING | `string` | VARCHAR, TEXT |
| DATE | `Date` | TIMESTAMP, DATETIME |
| DATEONLY | `string` | "YYYY-MM-DD" format |
| TIME | `string` | "HH:MM:SS" format |
| BOOLEAN | `boolean` | TINYINT(1) |
| ENUM | `enum` | String enum values |
| TEXT | `string` | Long text fields |

---

## Validation Rules

### Common Validations

```typescript
// Phone (Nigeria)
phone: string  // +234XXXXXXXXXX or 08XXXXXXXXX

// Date
date_of_birth: string  // ISO 8601 (YYYY-MM-DD) for forms

// DateTime
createdAt: Date  // ISO 8601 for API responses

// Required Fields (Patient)
- firstname: string (required)
- lastname: string (required)
- gender: Gender (required)
- date_of_birth: Date (required)
- phone: string (required)
- address: string (required)
```

---

## Response Handling

### Axios Response Structure

```typescript
// Full response structure
response: {
  data: {              // Axios wrapper
    status: 'success',
    message: string,
    data: T            // Actual payload
  }
}

// Access payload
const payload = response.data.data
```

### Client Store Pattern

```typescript
// Pinia store action
async fetchPatients({ commit }, params: PatientQueryParams) {
  const response = await apiClient.get('/api/patients/get', { params })
  const result = response.data.data as PaginatedResult<Patient>
  
  commit('SET_PATIENTS', result.docs)
  commit('SET_TOTAL', result.total)
  commit('SET_PAGES', result.pages)
}
```

---

## Known Inconsistencies

### 1. Pagination Format

**Issue**: Appointment endpoint uses different pagination format

**Standard**:
```typescript
{ docs, total, pages, perPage, currentPage }
```

**Appointment**:
```typescript
{ rows, count, pages, currentPage, pageLimit }
```

**Mitigation**: Use helper functions from `types/api.ts`:
```typescript
import { getItems, extractPaginationInfo } from '@/types/api'

const items = getItems(result)
const pagination = extractPaginationInfo(result)
```

### 2. Field Naming

**Issue**: Some fields may have inconsistent casing in legacy code

**Resolution**: Always use snake_case in type definitions to match server

---

## Type Versioning

### Current Version: 2.0.0

**Changes from 1.0.0**:
- All types now match actual server models
- Field names use snake_case
- IDs are `number` type (not `string`)
- Added actual enums from server
- Pagination formats documented

---

## Approval

**Contract Architect**: @contract-architect  
**Date**: March 6, 2026  
**Status**: ✅ VALIDATED - Based on server analysis

**Approvals**:
- [x] @contract-architect (Type contracts)
- [ ] @software-architect (Architecture alignment)
- [ ] @code-executor (Implementation feasibility)
- [ ] @skeptical-verifier (Type safety review)

---

**Next Step**: Use these types in Vue 3 client implementation
