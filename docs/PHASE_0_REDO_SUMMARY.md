# Phase 0 Redo - Server-Validated Type Definitions

**Date**: March 6, 2026  
**Status**: ✅ COMPLETE  
**Reason**: Initial types did not match actual server models

---

## What Was Wrong

The initial type definitions (v1.0.0) were based on assumptions and common patterns, NOT on the actual server code. This is a critical error that would have caused:

1. **Type mismatches** between client and server
2. **Runtime errors** when accessing fields
3. **Build failures** due to incorrect type expectations
4. **API integration failures** due to wrong response formats

### Specific Issues in v1.0.0 Types

| Issue | v1.0.0 (Wrong) | v2.0.0 (Correct) |
|-------|----------------|------------------|
| ID Type | `string` | `number` (server uses INTEGER AUTO_INCREMENT) |
| Name Fields | `firstName`, `lastName` | `firstname`, `lastname` (snake_case) |
| Date Fields | `dateOfBirth` | `date_of_birth` |
| Foreign Keys | `patientId` | `patient_id` |
| API Response | `{ data, message }` | `{ status: 'success', message, data }` |
| Pagination | Standard only | Documented both standard AND alternative format |
| Enums | Made up | Actual server enums |

---

## What Was Done

### 1. Comprehensive Server Analysis

**Analyzed**:
- ✅ All model files in `/server/src/database/models/`
  - `patient.ts`
  - `appointment.ts`
  - `visit.ts`
  - `encounter.ts`
  - `staff.ts`
  
- ✅ Response handlers in `/server/src/common/responses/`
  - `success-responses.ts`
  - `error-responses.ts`

- ✅ Pagination helper in `/server/src/core/helpers/helper.ts`

- ✅ Client Vuex stores in `/client/src/core/services/store/`
  - Expected data structures
  - Response transformations

### 2. Complete Type Rewrite

**Files Updated**:
- `types/index.ts` (v2.0.0)
- `types/common.ts` (v2.0.0)
- `types/api.ts` (v2.0.0)
- `types/auth.ts` (v2.0.0)
- `types/patient.ts` (v2.0.0)
- `types/appointment.ts` (v2.0.0)
- `types/visit.ts` (v2.0.0)
- `types/employee.ts` (v2.0.0)

### 3. Documentation Updates

**Updated**:
- `docs/API_CONVENTIONS.md` (v2.0.0) - Now reflects actual server response formats
- `docs/CHANGELOG.md` - Documents the redo

---

## Key Discoveries from Server Analysis

### 1. ID Types are Numbers, Not Strings

**Server Model**:
```typescript
// /server/src/database/models/patient.ts
id: {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true
}
```

**Correct Type**:
```typescript
interface Patient {
  id: number  // ✅ Correct
  // id: string  // ❌ Wrong
}
```

### 2. Field Names Use snake_case

**Server Model**:
```typescript
// /server/src/database/models/patient.ts
firstname: { type: DataTypes.STRING, allowNull: false },
lastname: { type: DataTypes.STRING, allowNull: false },
date_of_birth: { type: DataTypes.DATE, allowNull: false },
```

**Correct Type**:
```typescript
interface Patient {
  firstname: string  // ✅ Correct
  lastname: string
  date_of_birth: Date
  // firstName: string  // ❌ Wrong
}
```

### 3. API Response Format

**Server Response Handler**:
```typescript
// /server/src/common/responses/success-responses.ts
return res.status(200).json({
  status: 'success',
  message: 'Patient created successfully',
  data: patient
})
```

**Correct Type**:
```typescript
interface SuccessResponse<T> {
  status: 'success'  // ✅ Added
  message: string
  data: T
}
```

### 4. Pagination Has TWO Formats

**Standard Format** (Patient, Visit, Staff):
```typescript
interface PaginatedResult<T> {
  docs: T[]
  total: number
  pages: number
  perPage: number
  currentPage: number
}
```

**Alternative Format** (Appointment ONLY):
```typescript
interface PaginatedResultAlt<T> {
  rows: T[]        // Different field name
  count: number    // Different field name
  pages: number
  currentPage: number
  pageLimit: number  // Different field name
}
```

### 5. Actual Server Enums

**Patient Status**:
```typescript
enum PatientStatus {
  INPATIENT = 'Inpatient',
  OUTPATIENT = 'Outpatient',
  DECEASED = 'Deceased',
}
```

**Appointment Status**:
```typescript
enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  NO_SHOW = 'No Show',  // Note the space
  RESCHEDULED = 'Rescheduled',
}
```

**Visit Category**:
```typescript
enum VisitCategory {
  IPD = 'Inpatient',
  OPD = 'Outpatient',
  EMERGENCY = 'Emergency',
  ANC = 'Antenatal',
  IMMUNIZATION = 'Immunization',
  MATERNITY = 'Maternity',
  DIALYSIS = 'Dialysis',
}
```

### 6. Authentication Returns Token String

**Server**:
```typescript
// Login returns token as string
res.json({
  status: 'success',
  message: 'Login successful',
  data: token  // String, not object
})
```

**Correct Type**:
```typescript
type LoginResponse = string  // ✅ Correct
// interface LoginResponse { token: string }  // ❌ Wrong
```

### 7. Staff = Employee

In EHMRS, employees are represented as `Staff` in the database:

```typescript
// Table is 'Staffs', model is 'Staff'
interface Staff {
  firstname: string
  lastname?: string
  email: string
  department: string
  role: string
  username: string
  // ... etc
}
```

---

## Impact on Vue 3 Migration

### Before (v1.0.0) - Would Have Failed

```typescript
// ❌ This would fail at runtime
const patient = response.data.data as Patient
console.log(patient.firstName)  // undefined - field is 'firstname'
console.log(patient.id)  // Type mismatch - server returns number
```

### After (v2.0.0) - Will Work

```typescript
// ✅ This will work
const patient = response.data.data as Patient
console.log(patient.firstname)  // Works
console.log(patient.id)  // number - correct
```

---

## Validation Checklist

### ✅ Type Definitions Validated Against

- [x] Patient model fields (40+ fields)
- [x] Appointment model fields (20+ fields)
- [x] Visit model fields (20+ fields)
- [x] Staff model fields (25+ fields)
- [x] API response format
- [x] Error response format
- [x] Pagination formats (both standard and alternative)
- [x] Enum values
- [x] Foreign key relationships
- [x] Date/time formats

### ✅ Documentation Updated

- [x] API_CONVENTIONS.md reflects actual server formats
- [x] Type examples match server code
- [x] Known inconsistencies documented
- [x] Helper functions provided for pagination

---

## Lessons Learned

### 1. Never Assume - Always Verify

**Mistake**: Assumed common naming conventions (camelCase, string IDs)

**Correction**: Analyzed actual server models

**Rule**: **Always validate types against actual server code, never assume**

### 2. Server is the Source of Truth

**Mistake**: Created types based on what "should be"

**Correction**: Types now match what "actually is"

**Rule**: **Server models define the types, not client preferences**

### 3. Document Inconsistencies

**Discovery**: Appointment pagination is different

**Action**: Documented both formats, created helper functions

**Rule**: **Document server inconsistencies, don't try to "fix" them in types**

---

## Files Changed Summary

### Type Files (8 files)

| File | v1.0.0 | v2.0.0 | Changes |
|------|--------|--------|---------|
| `types/index.ts` | 1.0.0 | 2.0.0 | Updated version |
| `types/common.ts` | 1.0.0 | 2.0.0 | snake_case, number IDs |
| `types/api.ts` | 1.0.0 | 2.0.0 | Actual response formats |
| `types/auth.ts` | 1.0.0 | 2.0.0 | Token string type |
| `types/patient.ts` | 1.0.0 | 2.0.0 | All fields match server |
| `types/appointment.ts` | 1.0.0 | 2.0.0 | snake_case, enums |
| `types/visit.ts` | 1.0.0 | 2.0.0 | snake_case, enums |
| `types/employee.ts` | 1.0.0 | 2.0.0 | Staff model alignment |

### Documentation Files (2 files)

| File | v1.0.0 | v2.0.0 | Changes |
|------|--------|--------|---------|
| `docs/API_CONVENTIONS.md` | 1.0.0 | 2.0.0 | Actual server formats |
| `docs/CHANGELOG.md` | 1.0.0 | 2.0.0 | Redo documented |

---

## Next Steps

### For @code-executor

When implementing the Vue 3 client:

1. **Import types from `types/` folder**:
   ```typescript
   import type { Patient, SuccessResponse, PaginatedResult } from '@/types'
   ```

2. **Use snake_case for API data**:
   ```typescript
   const patientName = patient.firstname  // ✅
   const patientName = patient.firstName  // ❌
   ```

3. **Handle pagination correctly**:
   ```typescript
   // Patient list
   const result = response.data.data as PaginatedResult<Patient>
   const patients = result.docs
   
   // Appointment list
   const result = response.data.data as PaginatedResultAlt<Appointment>
   const appointments = result.rows
   ```

4. **Use helper functions**:
   ```typescript
   import { getItems, extractPaginationInfo } from '@/types/api'
   
   const items = getItems(result)
   const pagination = extractPaginationInfo(result)
   ```

### For @skeptical-verifier

Verify during implementation:

1. All API responses are typed correctly
2. No type mismatches between client and server
3. Pagination handling works for both formats
4. Enums are used correctly
5. Field names match server (snake_case)

---

## Approval

**Redo Completed By**: @contract-architect  
**Date**: March 6, 2026  
**Version**: 2.0.0

**Approvals Required**:
- [x] @contract-architect (Type contracts)
- [ ] @software-architect (Architecture alignment)
- [ ] @code-executor (Implementation feasibility)
- [ ] @skeptical-verifier (Type safety review)

---

**Status**: ✅ Phase 0 Types Now Validated Against Server Code
