# Client Page Specifications

**Version**: 2.0.0  
**Created**: March 6, 2026  
**Owner**: @ui-ux-designer  
**Status**: ✅ VALIDATED - Based on actual client pages and server endpoints

---

## Overview

This document contains detailed specifications for each page in the EHMRS Vue 3 client.

**All specifications are based on actual client pages and server endpoints**

**Pattern Reference**: All pages follow patterns from `CLIENT_DESIGN_SYSTEM.md`

---

# Phase 1: Core Pages

## Login Page

**Route**: `/auth/login`  
**Pattern**: Auth Form  
**Module**: Authentication  
**Priority**: P0  
**Status**: ✅ Validated

### Description
User authentication page with username/password login. Features split layout with brand section and form section.

### Actual Implementation Reference
**File**: `/client/src/view/pages/auth/Login-1.vue`

### User Roles
- All authenticated users (all roles)

### Data Requirements
| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| username | string | User input | Yes | Server field: `username` (NOT email) |
| password | string | User input | Yes | Minimum 6 characters |
| phone | string | User input | Yes (for forgot password) | Nigerian format |

### API Endpoints
- `POST /api/auth/login` - Authenticate with username/password
  - Request: `{ username: string, password: string }`
  - Response: `{ status: 'success', message: string, data: string }` (token string)
- `POST /api/auth/forgot-password` - Request password reset
  - Request: `{ phone: string }`
  - Response: `{ status: 'success', message: string, data: Staff }`

### Components Used
- Split layout (brand section + form section)
- Input fields with icons
- Password visibility toggle
- Forgot password modal
- VeeValidate for validation

### Actions
- **Primary**: Sign in with username/password
- **Secondary**: Forgot password (phone number based)

### Validation Rules
- Username: Required, minimum 3 characters
- Password: Required, minimum 6 characters
- Phone (forgot): Required, valid Nigerian format

### Authentication Flow
```
1. User enters username + password
2. POST /api/auth/login
3. Server returns token string (NOT object)
4. Store token in localStorage as 'user_token'
5. Set Authorization header: Bearer {token}
6. Redirect to /dashboard
```

### Edge Cases
- Invalid credentials → Show error notification
- Network error → Show retry option
- Account locked/inactive → Show appropriate message from server
- Session exists → Redirect to dashboard

### Follows Pattern
Auth Form Pattern (CLIENT_DESIGN_SYSTEM.md)

---

## Dashboard Router

**Route**: `/dashboard`  
**Pattern**: Dynamic Dashboard  
**Module**: Core  
**Priority**: P0  
**Status**: ✅ Validated

### Description
Dynamic dashboard that renders different dashboard components based on user role/department.

### Actual Implementation Reference
**File**: `/client/src/view/pages/home/Dashboard.vue`

### User Roles
All authenticated users (dashboard content varies by role)

### Dashboard Routing Logic

```typescript
// Token parsing
const token = localStorage.getItem('user_token')
const parsedToken = parseJwt(token)

// Dashboard selection based on department + role
switch (department) {
  case 'Administration':
    return SuperAdmin | Admin
  case 'Records':
    return MedicalRecords
  case 'Radiology':
    return Radiology
  case 'Pharmacy':
    return Pharmacy | HODPharmacy
  case 'Laboratory':
    return Laboratory | HODLaboratory
  case 'Nursing':
    return Nurse dashboards (OPD, Ward, Maternity, etc.)
  case 'Accounts':
    return FinanceOfficer | FinanceAdmin
  case 'Reception':
    return CustomerCare
  case 'Health Insurance':
    return HealthInsurance
  case 'Store':
    return StoreAdmin | GeneralStore | PharmacyStore
  case 'Medical Practitioners':
    return General Practitioner
  case 'Surgery Unit':
    return Specialist dashboards (ENT, Dental, etc.)
  case 'Medicine Unit':
    return Specialist dashboards (Cardiology, Oncology, etc.)
  case 'Pediatrics Unit':
    return Pediatric specialist dashboards
  case 'Obstetrics & Gynaecology':
    return Gynae/Obs dashboards
  default:
    return MedicalRecords
}
```

### Available Dashboards (65+ total)

#### Administration
- **Super Admin** - Full system access
- **Admin** - System administration

#### Medical Records
- **Medical Records** - Patient records management

#### Radiology
- **Radiology** - Imaging requests and reports
- **Radiology Admin** - Radiology department management

#### Pharmacy
- **Pharmacy** - Medication dispensing
- **Pharmacy Admin (HOD)** - Pharmacy department management
- **Pharmacy Store** - Pharmacy inventory

#### Laboratory
- **Laboratory** - Lab test management
- **Laboratory Admin (HOD)** - Lab department management

#### Nursing (15+ dashboards)
- **OPD (G-OPD)** - Outpatient department
- **Female Ward** - Female ward nursing
- **Male Ward** - Male ward nursing
- **Children Ward** - Pediatric nursing
- **Maternity** - Maternity ward
- **Antenatal (ANC)** - Antenatal care
- **Theater** - Operating theater
- **HOD** - Head of nursing
- **Emergency** - Accident & Emergency
- **VIP/Private** - VIP ward
- **Dialysis** - Dialysis unit
- **Nursing Assistant** - Assistant dashboard

#### Finance
- **Finance Officer** - Financial operations
- **Finance Admin** - Finance department management

#### Reception
- **Customer Care** - Patient reception and queries

#### Health Insurance
- **Health Insurance (NHIS)** - Insurance claims management

#### Store
- **Store Admin** - Store management
- **General Store** - General inventory
- **Lab Store** - Laboratory supplies

#### Medical Practitioners (30+ specialist dashboards)
- **General Practitioner** - Primary care
- **Cardiologist** - Heart specialist
- **Dermatologist** - Skin specialist
- **Endocrinologist** - Hormone specialist
- **Gastroenterologist** - Digestive specialist
- **Neurologist** - Brain/nervous system
- **Oncologist** - Cancer specialist
- **Ophthalmologist** - Eye specialist
- **Orthopaedist** - Bone specialist
- **Pediatrician** - Child specialist
- **Psychiatrist** - Mental health
- **Urologist** - Urinary specialist
- **ENT Specialist** - Ear, Nose, Throat
- **Dental Surgeon** - Dental care
- **Anesthesiologist** - Anesthesia
- **Radiologist** - Medical imaging
- **Plastic Surgeon** - Reconstructive surgery
- **And 15+ more specialists**

### Data Requirements
Dashboard-specific data loaded after role-based routing

### Components Used
- Dynamic component loader
- JWT token parser
- Role/department mapper

### Actions
- **Primary**: Render role-specific dashboard
- **Secondary**: Navigate to dashboard sections

### Edge Cases
- Invalid token → Redirect to login
- Unknown role → Default to Medical Records
- Missing department → Default to Medical Records
- Token expired → Redirect to login

### Follows Pattern
Dynamic Dashboard Pattern (NEW - to be documented)

---

# Phase 2: Patient Management

## Patient Home

**Route**: `/patient`  
**Pattern**: Module Container  
**Module**: Patient  
**Priority**: P0  
**Status**: ✅ Validated

### Description
Parent container for all patient management pages. Uses router-view to render child routes.

### Actual Implementation Reference
**File**: `/client/src/view/pages/patient/Patient.vue`

### User Roles
- All authenticated users

### Child Routes
- `/patient/patient-operations` - Patient operations menu
- `/patient/choose-patient-type` - Choose patient type (Patient/Dependant)
- `/patient/create-account` - Create new patient
- `/patient/create-emergency-account` - Emergency patient registration
- `/patient/find-patient` - Search/find patient
- `/patient/profile/:id` - Patient profile view
- `/patient/edit/:id` - Edit patient details
- `/patient/health-insurance/:id` - Patient insurance management
- `/patient/dependants/:id` - Dependant management
- `/patient/deceased-management` - Deceased patient management
- `/patient/death-statistics` - Death statistics
- `/patient/mortality-reports` - Mortality reports
- `/patient/death-certificate-tracking` - Death certificate tracking

### Components Used
- Router view with fade transition

### Actions
- **Primary**: Route to patient management sub-pages

### Follows Pattern
Module Container Pattern

---

## Find Patient (Patient Search)

**Route**: `/patient/find-patient`  
**Pattern**: List + Search  
**Module**: Patient  
**Priority**: P0  
**Status**: To be validated

### Description
Search and filter patients with advanced search capabilities.

### User Roles
- All authenticated users

### API Endpoints
- `GET /api/patients/get` - List patients with pagination
  - Query params: `currentPage`, `pageLimit`, `search`, `start`, `end`, `filter`, `patient_status`, `sortBy`
  - Response: `{ status: 'success', message: string, data: { docs: Patient[], total: number, pages: number, perPage: number, currentPage: number } }`
- `GET /api/patients/get/:id` - Get single patient

### Components Used
- Patient search component
- Patient list table
- Filters (status, date range, type)
- Pagination

### Filters
- Search: Name, hospital ID, phone
- Patient status: Inpatient/Outpatient/Deceased
- Account status: active/inactive/banned
- Patient type: Patient/Dependant
- Date range
- Insurance status

### Actions
- **Primary**: Search patients, View patient profile
- **Secondary**: Create patient, Export list

### Follows Pattern
List Page Pattern (CLIENT_DESIGN_SYSTEM.md)

---

## Create Patient Account

**Route**: `/patient/create-account`  
**Pattern**: Form (Multi-step)  
**Module**: Patient  
**Priority**: P0  
**Status**: To be validated

### Description
Register a new patient with comprehensive demographic information.

### User Roles
- Reception
- Medical Records
- Admin

### API Endpoints
- `POST /api/patients/create` - Create patient
  - Request: CreatePatientRequest (all snake_case fields)
  - Response: `{ status: 'success', message: string, data: Patient }`
- `POST /api/patients/create/emergency` - Emergency registration
- `POST /api/patients/create/dependant/:id` - Create dependant

### Data Requirements (snake_case to match server)
| Field | Type | Required | Server Field |
|-------|------|----------|--------------|
| First name | string | Yes | `firstname` |
| Last name | string | Yes | `lastname` |
| Middle name | string | No | `middlename` |
| Gender | Gender enum | Yes | `gender` |
| Date of birth | Date | Yes | `date_of_birth` |
| Phone | string | Yes | `phone` |
| Alt phone | string | No | `alt_phone` |
| Address | string | Yes | `address` (full address) |
| Country | string | No | `country` |
| State | string | No | `state` |
| LGA | string | No | `lga` |
| Email | string | No | `email` |
| Occupation | string | No | `occupation` |
| Marital status | string | No | `marital_status` |
| Religion | string | No | `religion` |
| Hospital ID | string | No | `hospital_id` |
| Next of kin name | string | No | `next_of_kin_name` |
| Next of kin address | string | No | `next_of_kin_address` |
| Next of kin phone | string | No | `next_of_kin_phone` |
| Next of kin relationship | string | No | `next_of_kin_relationship` |
| Has insurance | boolean | No | `has_insurance` |
| Patient type | PatientType enum | No | `patient_type` |

### Components Used
- Multi-step form wizard
- Form fields with validation
- Date picker
- Gender selector
- File upload (photo)

### Validation Rules
- First name, Last name: Required, 2-50 characters
- Date of birth: Required, must be in past
- Gender: Required
- Phone: Required, valid Nigerian format
- Email: Optional, valid format if provided

### Edge Cases
- Duplicate patient → Show potential matches
- Validation error → Show inline errors
- Network error → Allow retry

### Follows Pattern
Multi-step Form Pattern (CLIENT_DESIGN_SYSTEM.md)

---

## Patient Profile

**Route**: `/patient/profile/:id`  
**Pattern**: Detail  
**Module**: Patient  
**Priority**: P0  
**Status**: To be validated

### Description
Comprehensive view of patient information with tabs for related data.

### User Roles
- All authenticated users

### API Endpoints
- `GET /api/patients/get/:id` - Get patient details
- `GET /api/patients/profile/get/:id` - Get patient profile (with insurance)
- `GET /api/patients/:id/visits` - Get patient visits
- `GET /api/patients/:id/appointments` - Get patient appointments

### Data Requirements
| Field | Type | Source |
|-------|------|--------|
| Patient details | Patient | GET /api/patients/get/:id |
| Insurance info | PatientInsurance | GET /api/patients/profile/get/:id |
| Visit history | Visit[] | GET /api/patients/:id/visits |
| Appointments | Appointment[] | GET /api/patients/:id/appointments |
| Dependants | Patient[] | Relations |

### Components Used
- Patient summary card
- Tabs (Overview, Visits, Appointments, Insurance, Dependants)
- Data tables
- Action buttons (Edit, Create Visit, Create Appointment)

### Actions
- **Primary**: View patient information, Create visit
- **Secondary**: Edit patient, Create appointment, Print summary

### Follows Pattern
Detail Page Pattern (CLIENT_DESIGN_SYSTEM.md)

---

# Phase 3+: Module Pages (To Be Validated)

## Appointments Module

**Routes**:
- `/appointments/home` - Appointments dashboard
- `/appointments/list` - Appointment list
- `/appointments/check-in-queue` - Check-in queue
- `/appointments/book` - Book appointment
- `/appointments/calendar` - Appointment calendar
- `/appointments/doctor-schedule` - Doctor schedule
- `/appointments/:id` - Appointment details

**API Endpoints**:
- `POST /api/appointments/create` - Create appointment
- `GET /api/appointments/get` - List appointments (alternative pagination format)
- `GET /api/appointments/:id` - Get appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `PUT /api/appointments/:id/confirm` - Confirm appointment
- `POST /api/appointments/:id/check-in` - Check-in (returns appointment + visit)

**Note**: Appointment endpoint uses alternative pagination format (`rows`, `count`, `pageLimit`)

---

## Visits Module

**Routes**:
- `/visit/all` - All visits
- `/visit/new/:id` - Create new visit
- `/visit/update/:id` - Update visit
- `/visit/queue` - Patient queue
- `/visit/inpatients` - Inpatient list
- `/visit/ante-natal` - Antenatal visits
- `/visit/immunization` - Immunization visits
- `/visit/dialysis` - Dialysis visits

**API Endpoints**:
- `POST /api/visits/create` - Create visit
- `POST /api/visits/last-active` - Get or create active visit
- `GET /api/visits/active/get` - Get active visits
- `GET /api/visits/all/get` - Get all visits
- `GET /api/visits/category/get` - Get visits by category
- `GET /api/visits/:id` - Get visit
- `PUT /api/visits/update/:id` - Update visit
- `PUT /api/visits/end/:id` - End visit

---

## Employee (Staff) Module

**Routes**:
- `/employee/choose-type` - Choose employee type
- `/employee/create` - Create employee
- `/employee/find-employee` - Search employees
- `/employee/profile/:id` - Employee profile

**API Endpoints**:
- `POST /api/staffs/create` - Create staff
- `GET /api/staffs/get` - List staff
- `GET /api/staffs/:id` - Get staff
- `PUT /api/staffs` - Update staff
- `PUT /api/staffs/reset-password/:id` - Reset password

---

# Page Specification Template

```markdown
### [Page Name]

**Route**: `/path`  
**Pattern**: [List | Detail | Form | Dashboard | Wizard | Calendar | Container]  
**Module**: [Module Name]  
**Priority**: [P0 | P1 | P2 | P3]  
**Status**: [Draft | Validated | In Progress | Complete]

### Description
[Brief description of page purpose]

### Actual Implementation Reference
**File**: `/client/src/view/pages/[path]/[File].vue`

### User Roles
- [Role 1]
- [Role 2]

### Data Requirements
| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| Field name | type | API endpoint | Yes/No | snake_case field |

### API Endpoints
- `GET /api/endpoint` - Purpose
- `POST /api/endpoint` - Purpose

### Components Used
- Component 1
- Component 2

### Actions
- **Primary**: [Main action]
- **Secondary**: [Secondary actions]

### Validation Rules
- Rule 1
- Rule 2

### Edge Cases
- Empty state handling
- Error state handling
- Loading state handling

### Follows Pattern
[Reference to design system pattern]
```

---

## Approval

**UI/UX Designer**: @ui-ux-designer  
**Date**: March 6, 2026  
**Status**: ✅ VALIDATED - Phase 1 pages validated against actual client code

**Approvals Required**:
- [ ] @ui-ux-designer (Page specs validated)
- [ ] @contract-architect (API endpoints validated)
- [ ] @code-executor (Implementation feasibility)
- [ ] @skeptical-verifier (Accessibility review)

---

**Note**: This document is updated iteratively as each module is validated. Always check for the latest version before implementing a page.

**Key Changes in v2.0.0**:
- Login uses `username` (NOT email)
- Dashboard is dynamic based on role/department (65+ dashboards)
- All field names are snake_case to match server
- Patient module structure validated
- API endpoints matched with server controllers
