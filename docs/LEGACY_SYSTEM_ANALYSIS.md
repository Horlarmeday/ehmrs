# Legacy System Analysis - EHMRS Vue 2 Client

**Analysis Date**: March 6, 2026  
**Analyzed By**: @software-architect  
**System Version**: Vue 2.6.11  
**Status**: Read-only analysis for migration planning

---

## Executive Summary

The existing EHMRS client is a comprehensive healthcare management system built with **Vue 2.6.11** and **Bootstrap Vue**. The application follows a modular architecture with **30+ business modules** serving different hospital departments.

### Key Statistics

| Metric | Count |
|--------|-------|
| Total Routes | ~200+ |
| Business Modules | 30+ |
| Vuex Store Modules | 35+ |
| Page Components | 150+ |
| Shared Components | 20+ |
| Authentication | JWT Bearer Token |

### Architecture Overview

- **Framework**: Vue 2.6.11 with Options API
- **UI Library**: Bootstrap Vue + custom components
- **State Management**: Vuex 3.3.0 (modular structure)
- **Routing**: Vue Router 3.1.5 with nested routes
- **HTTP Client**: Axios 0.21.1 with interceptors
- **Build Tool**: Vue CLI 4.5.9 (Webpack-based)

---

## Module Inventory

### Core Modules (Priority 1)

| Module | Routes | Store Module | Complexity | Notes |
|--------|--------|--------------|------------|-------|
| **Authentication** | 2 (login, register) | `auth` | Medium | Gateway to all modules |
| **Dashboard** | 1 | Multiple | Low | Aggregates data from all modules |
| **Patient Management** | 15+ | `patient` | High | Core hospital system module |
| **Appointments** | 8 | `appointments` | Medium | Scheduling system |
| **Visits/Encounters** | 25+ | `visit` | High | Patient visit tracking |
| **Employee Management** | 4 | `employee` | Medium | HR module |

### Clinical Modules (Priority 2)

| Module | Routes | Store Module | Complexity | Notes |
|--------|--------|--------------|------------|-------|
| **Consultation** | 2 | `consultation` | High | Doctor consultation records |
| **Pharmacy** | TBD | `pharmacy` | High | Medication dispensing |
| **Laboratory** | TBD | `laboratory` | High | Lab test management |
| **Radiology** | TBD | `radiology` | Medium | Imaging services |
| **Admission (IPD)** | TBD | `admission` | Medium | Inpatient management |
| **Emergency** | TBD | `emergency` | High | Emergency department |
| **Triage** | TBD | `triage` | Medium | Patient triage |
| **Nursing** | 8+ | `nurse` | Medium | Nursing care records |

### Administrative Modules (Priority 3)

| Module | Routes | Store Module | Complexity | Notes |
|--------|--------|--------------|------------|-------|
| **Accounting** | TBD | `accounting` | Very High | Financial management |
| **General Store** | TBD | `generalStore` | High | Inventory management |
| **Procurement** | TBD | `procurement` | High | Purchase orders |
| **Inventory** | TBD | `inventory` | High | Stock management |
| **Insurance/NHIS** | 10+ | `insurance` | High | Health insurance claims |
| **Settings/Admin** | 10+ | `settings` | Medium | System configuration |
| **Medical Records** | 10+ | `reports` | Medium | Patient records & reports |
| **Programs** | 8+ | `antenatal`, `immunization` | Medium | Health programs |

### Specialized Modules (Priority 4)

| Module | Routes | Store Module | Complexity | Notes |
|--------|--------|--------------|------------|-------|
| **Surgery** | TBD | `surgery` | High | Surgical procedures |
| **Dialysis** | 6+ | `dialysis` | High | Dialysis treatment |
| **Maternity** | TBD | `maternity` | Medium | Maternity ward |
| **Immunization** | 4 | `immunization` | Medium | Vaccination program |
| **Antenatal** | 5 | `antenatal` | Medium | Prenatal care |
| **Orders** | TBD | `order` | Medium | Service orders |
| **Requests** | TBD | `request` | Medium | Service requests |
| **Statistics** | TBD | - | Low | Analytics |
| **Deceased Management** | 6 | - | Medium | Death certificate tracking |
| **Stock Audit** | TBD | `stockAudit` | Medium | Inventory auditing |

---

## Route Analysis

### Route Structure Pattern

The application uses a **main layout with nested child routes**:

```javascript
{
  path: '/patient',
  component: () => import('@/view/pages/patient/Patient.vue'),
  children: [
    { path: 'patient-operations', component: ... },
    { path: 'create-account', component: ... },
    { path: 'profile/:id', component: ... },
  ]
}
```

### Route Categories

#### 1. List Pages
Pattern: `/module/list` or `/module`
- Display tabular data with filters
- Examples: `appointments-list`, `find-patient`, `employee-list`

#### 2. Detail Pages
Pattern: `/module/:id` or `/module/profile/:id`
- Show single record details
- Examples: `patient-profile`, `employee-profile`, `appointment-details`

#### 3. Form Pages
Pattern: `/module/create`, `/module/edit/:id`
- Create/edit records
- Examples: `create-account`, `edit-patient`, `book-appointment`

#### 4. Dashboard Pages
Pattern: `/dashboard`, `/module/home`
- Aggregated views with charts
- Examples: `dashboard`, `appointments-home`

#### 5. Wizard/Multi-step Pages
Pattern: `/module/step-1`, `/module/step-2`
- Multi-step workflows
- Examples: `choose-patient-type`, `create-emergency-account`

#### 6. Special Pages
- Calendar views: `appointment-calendar`
- Queue management: `check-in-queue`, `queue`
- Reports: `medical-records-reports`
- Tracking: `death-certificate-tracking`

---

## Vuex Store Analysis

### Store Structure

```
src/core/services/store/
├── auth/                    # Authentication state
├── patient/                 # Patient management
├── appointments/            # Appointment scheduling
├── visit/                   # Visit/encounter tracking
├── employee/                # Employee management
├── accounting/              # Financial management
├── inventory/               # Stock management
├── laboratory/              # Lab services
├── pharmacy/                # Pharmacy operations
├── radiology/               # Radiology services
├── insurance/               # Insurance claims
├── settings/                # System settings
├── reports/                 # Report generation
├── config.module.js         # App configuration
└── index.js                 # Store assembly
```

### Store Module Pattern

Each module follows this structure:

```javascript
// module.js
const state = { ... }
const getters = { ... }
const mutations = { ... }
const actions = {
  async fetchData({ commit }, params) { ... },
  async createRecord({ commit }, data) { ... },
  async updateRecord({ commit }, { id, data }) { ... },
  async deleteRecord({ commit }, id) { ... }
}
export default { state, getters, mutations, actions }
```

### Common Store Patterns

1. **CRUD Operations**: Every module has create, read, update, delete actions
2. **Loading States**: `isLoading`, `isSubmitting` flags
3. **Pagination**: `pagination`, `totalCount`, `currentPage`
4. **Filters**: `filters`, `searchQuery`, `sortBy`
5. **Error Handling**: `error`, `errorMessage`

---

## Component Analysis

### Shared Components (`/client/src/components/`)

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `DatePicker.vue` | Date selection | Low |
| `GeneralStoreNormalizedTest.vue` | Store operations test | Medium |
| `account/` | Account-related components | Medium |
| `laboratory/` | Lab-specific components | High |
| `radiology/` | Radiology components | Medium |

### Core Components (`/client/src/core/components/`)

Common UI building blocks:
- Layout components (Header, Sidebar, Footer)
- Navigation components
- Notification components
- Loading indicators
- Modal components

### Page Components Pattern

Pages follow this structure:

```vue
<template>
  <div>
    <!-- Page header with actions -->
    <!-- Filters/search bar -->
    <!-- Main content (table, form, cards) -->
    <!-- Modals for details/actions -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() { return { ... } },
  computed: { ...mapState(['module']) },
  methods: { ...mapActions(['fetchData', 'createRecord']) },
  created() { this.fetchData() }
}
</script>
```

---

## API Integration Patterns

### Axios Configuration

**Base URL**: `/api`  
**Timeout**: 180000ms (3 minutes)  
**Auth**: Bearer token in `Authorization` header

### Request Interceptors

```javascript
- Add Authorization header from localStorage
- Start NProgress loading bar
- Set loading color
```

### Response Interceptors

```javascript
- 201/204: Show success notification
- 401: Dispatch logout action
- 404: Show not found notification
- Error: Show error notification
- Stop NProgress after 30s
```

### API Service Pattern

```javascript
// Typical API call in store action
async fetchPatients({ commit }, { page, filters }) {
  commit('SET_LOADING', true)
  try {
    const response = await axios.get('/api/patients', { params })
    commit('SET_PATIENTS', response.data)
  } catch (error) {
    commit('SET_ERROR', error)
  } finally {
    commit('SET_LOADING', false)
  }
}
```

---

## Authentication Flow

### Current Implementation

1. **Login**: POST credentials → receive JWT token
2. **Token Storage**: localStorage (`user_token`)
3. **Auth Header**: `Authorization: Bearer {token}`
4. **Logout**: Clear token, redirect to login
5. **Route Guards**: `requiresAuth: true` meta

### Role-Based Access

```javascript
meta: {
  requiresAuth: true,
  roles: ['Reception', 'Medical Records']
}
```

---

## UI/UX Patterns

### Current Design System

- **Framework**: Bootstrap Vue components
- **Icons**: Font Awesome 5, Material Design Icons
- **Charts**: Chart.js 3.9.1, ApexCharts
- **Tables**: Bootstrap tables with sorting/filtering
- **Forms**: VeeValidate for validation, Vuelidate
- **Notifications**: vue-notification
- **Modals**: Bootstrap Vue modals
- **Date Handling**: dayjs, vuejs-datepicker

### Common Page Patterns

#### List Page Pattern
```
┌─────────────────────────────────┐
│ Page Title + [Create Button]    │
├─────────────────────────────────┤
│ [Search] [Filters] [Export]     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Table with pagination       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Detail Page Pattern
```
┌─────────────────────────────────┐
│ [Back] Page Title [Actions]     │
├─────────────────────────────────┤
│ Tabs: [Overview] [History] [...]│
├─────────────────────────────────┤
│ Content Area                    │
│ - Patient Info Cards            │
│ - Timeline/History              │
│ - Related Records               │
└─────────────────────────────────┘
```

#### Form Page Pattern
```
┌─────────────────────────────────┐
│ [Back] Form Title [Submit]      │
├─────────────────────────────────┤
│ Section 1: Basic Information    │
│ - Field 1                       │
│ - Field 2                       │
├─────────────────────────────────┤
│ Section 2: Additional Details   │
│ - Field 3                       │
│ - Field 4                       │
└─────────────────────────────────┘
```

---

## Technical Debt & Migration Challenges

### High Complexity Areas

| Area | Issue | Migration Impact |
|------|-------|------------------|
| **Options API** | Vue 2 Options API | Convert to Composition API |
| **Vuex** | Vuex 3 patterns | Migrate to Pinia |
| **Bootstrap Vue** | Heavy dependency | Replace with new UI library |
| **Mixed Validation** | VeeValidate + Vuelidate | Standardize on one solution |
| **Direct DOM** | jQuery usage | Remove, use Vue 3 reactivity |
| **Image Loading** | Cornerstone.js | Keep, update to Vue 3 compatible |

### Special Considerations

1. **DICOM Viewer**: `cornerstone-*` packages for radiology
   - Requires careful migration
   - Test thoroughly after migration

2. **Rich Text Editor**: `@wangeditor/editor`
   - Ensure Vue 3 compatibility

3. **Internationalization**: `vue-i18n`
   - Migrate to vue-i18n v9+

4. **Drag & Drop**: `vuedraggable`
   - Update to Vue 3 version

5. **PDF Generation**: `jspdf` + `jspdf-autotable`
   - Direct migration possible

---

## Migration Complexity Assessment

### Low Complexity (Week 1-2)
- Dashboard
- Settings/Admin basic pages
- Statistics
- Simple list pages

### Medium Complexity (Week 3-6)
- Appointments
- Employee Management
- Visits (basic)
- Programs (Antenatal, Immunization)
- Medical Records
- Insurance (basic)

### High Complexity (Week 7-12)
- Patient Management (core workflows)
- Consultation
- Nursing
- Emergency
- Admission (IPD)
- Pharmacy
- Laboratory
- Inventory/Store

### Very High Complexity (Week 13-16)
- Accounting (financial rules)
- Surgery
- Dialysis
- Radiology (DICOM integration)
- Deceased Management (complex workflows)

---

## Recommendations

### Phase 1: Foundation
1. Implement authentication flow first
2. Create layout system
3. Build core components (tables, forms, modals)
4. Establish design system

### Phase 2: Core Modules
1. Patient Management (foundation for all)
2. Appointments
3. Visits/Encounters
4. Employee

### Phase 3: Clinical Modules
1. Consultation
2. Nursing
3. Pharmacy
4. Laboratory
5. Radiology

### Phase 4: Administrative
1. Accounting
2. Inventory/Store
3. Procurement
4. Insurance

### Phase 5: Specialized
1. Surgery
2. Dialysis
3. Maternity
4. Programs

---

## Conclusion

The legacy system is a **mature, feature-complete** hospital management system with well-organized modules. The migration to Vue 3 should follow a **module-by-module approach**, starting with foundational infrastructure and core modules.

**Key Success Factors**:
1. Maintain API compatibility (no backend changes needed)
2. Preserve business logic during migration
3. Implement comprehensive testing per module
4. Ensure data consistency across modules
5. Maintain or improve performance

**Estimated Timeline**: 16-20 weeks for full migration with proper testing and verification.

---

**Analysis Completed**: March 6, 2026  
**Next Step**: Create `docs/CLIENT_ROADMAP.md` with detailed implementation phases
