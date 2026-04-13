# ARCHITECTURE.md - Vue 3 Client Architecture

**Version**: 2.0.0  
**Created**: March 6, 2026  
**Owner**: @software-architect  
**Status**: ✅ APPROVED - March 6, 2026

---

## System Overview

This document defines the architecture for the EHMRS Vue 3 client application located in `/client-vue3`.

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Vue 3 | 3.4+ | Core framework |
| Build Tool | Vite | 5.x | Fast builds and HMR |
| Language | TypeScript | 5.x | Type safety |
| Router | Vue Router | 4.x | Navigation |
| State | Pinia | 2.x | State management |
| HTTP | Axios | 1.x | API communication |
| UI Framework | TBD | - | Component library |
| Testing | Vitest | 1.x | Unit testing |

---

## Project Structure

```
client-vue3/
├── public/                     # Static assets
│   └── favicon.ico
├── src/
│   ├── assets/                 # SCSS, images, fonts
│   │   ├── styles/
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   └── main.scss
│   │   └── images/
│   ├── components/             # Reusable components
│   │   ├── common/             # Generic components
│   │   │   ├── AppButton.vue
│   │   │   ├── AppInput.vue
│   │   │   ├── AppModal.vue
│   │   │   ├── AppTable.vue
│   │   │   └── AppLoading.vue
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Layout components
│   │   └── feedback/           # Notifications, alerts
│   ├── composables/            # Composable functions
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── usePagination.ts
│   │   └── useLoading.ts
│   ├── layouts/                # Page layouts
│   │   ├── MainLayout.vue
│   │   ├── AuthLayout.vue
│   │   └── PrintLayout.vue
│   ├── pages/                  # Page components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── patient/
│   │   ├── appointments/
│   │   └── ...
│   ├── router/                 # Router configuration
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── guards.ts
│   ├── services/               # API clients, external services
│   │   ├── api.ts              # Axios instance
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   └── ...
│   ├── stores/                 # Pinia stores
│   │   ├── auth.store.ts
│   │   ├── patient.store.ts
│   │   └── ...
│   ├── types/                  # TypeScript types (SHARED)
│   │   ├── api.ts              # API response types
│   │   ├── auth.ts             # Auth types
│   │   ├── patient.ts          # Patient types
│   │   └── index.ts            # Type exports
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── App.vue                 # Root component
│   └── main.ts                 # Application entry
├── tests/                      # Test files
│   ├── unit/
│   └── e2e/
├── .env                        # Environment variables
├── .env.production             # Production env
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
├── eslint.config.js            # ESLint config
└── vitest.config.ts            # Vitest config
```

---

## Module Boundaries

### Core Module
**Location**: `src/core/` (shared infrastructure)

**Responsibilities**:
- Application initialization
- Router setup
- Store setup
- API client configuration
- Global error handling

**Dependencies**: None (foundation layer)

---

### Authentication Module
**Location**: `src/pages/auth/`, `src/stores/auth.store.ts`, `src/services/auth.service.ts`

**Responsibilities**:
- User login/logout (username/password)
- Token management (JWT)
- Route guards
- Session handling

**Dependencies**: Core

---

### Patient Module
**Location**: `src/pages/patient/`, `src/stores/patient.store.ts`, `src/services/patient.service.ts`

**Responsibilities**:
- Patient CRUD operations
- Patient search
- Patient profile management
- Insurance management

**Dependencies**: Core, Authentication

---

### Appointments Module
**Location**: `src/pages/appointments/`, `src/stores/appointment.store.ts`

**Responsibilities**:
- Appointment scheduling
- Calendar management
- Provider schedules
- Check-in queue

**Dependencies**: Core, Authentication, Patient

---

## Dependency Rules

### Import Rules

1. **Lower layers can be imported by upper layers**
   - Pages can import: stores, services, components, composables, types
   - Stores can import: services, types, composables
   - Services can import: types, utils
   - Components can import: other components, composables, types

2. **No circular dependencies**
   - Use dependency injection if needed
   - Extract shared logic to composables

3. **Types are always importable**
   - `types/` folder can be imported anywhere
   - Types define the contract between layers

### Import Path Conventions

```typescript
// ✅ Good: Use path aliases
import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/types/auth'
import AppButton from '@/components/common/AppButton.vue'

// ✅ Good: Relative imports within same module
import { PatientCard } from './PatientCard.vue'

// ❌ Bad: Deep relative imports
import { something } from '../../../stores/something'
```

---

## State Management Architecture

### Pinia Store Pattern

```typescript
// stores/patient.store.ts
import { defineStore } from 'pinia'
import type { Patient, PatientFilters, PaginatedResult } from '@/types'
import { patientService } from '@/services'

interface PatientState {
  patients: Patient[]
  currentPatient: Patient | null
  filters: PatientFilters
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  isLoading: boolean
  error: string | null
}

export const usePatientStore = defineStore('patient', {
  state: (): PatientState => ({
    patients: [],
    currentPatient: null,
    filters: {},
    pagination: { page: 1, pageSize: 20, total: 0 },
    isLoading: false,
    error: null,
  }),

  getters: {
    hasPatients(): boolean {
      return this.patients.length > 0
    },
    totalPages(): number {
      return Math.ceil(this.pagination.total / this.pagination.pageSize)
    },
  },

  actions: {
    async fetchPatients(): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        const response = await patientService.getList(this.filters, this.pagination)
        // Note: response.data uses snake_case fields (firstname, lastname, etc.)
        this.patients = response.data.docs
        this.pagination.total = response.data.total
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch patients'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createPatient(data: Partial<Patient>): Promise<Patient> {
      const patient = await patientService.create(data)
      this.patients.push(patient)
      return patient
    },
  },
})
```

### Store Organization

**Core Stores** (always loaded):
- `auth.store.ts` - Authentication state
- `config.store.ts` - Application configuration

**Feature Stores** (lazy loaded):
- `patient.store.ts`
- `appointment.store.ts`
- `visit.store.ts`
- etc.

---

## API Integration Architecture

### Axios Instance

```typescript
// services/api.ts
import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { notifyError } from '@/utils/notifications'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    notifyError(error)
    return Promise.reject(error)
  }
)
```

### Service Layer Pattern

```typescript
// services/patient.service.ts
import { apiClient } from './api'
import type { Patient, PatientFilters, PaginatedResult } from '@/types'

export const patientService = {
  async getList(
    filters: PatientFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<PaginatedResult<Patient>> {
    const { data } = await apiClient.get('/api/patients/get', {
      params: { ...filters, ...pagination },
    })
    return data // data.data (snake_case fields)
  },

  async getById(id: number): Promise<Patient> {
    const { data } = await apiClient.get(`/api/patients/get/${id}`)
    return data // data (snake_case fields)
  },

  async create(patient: Partial<Patient>): Promise<Patient> {
    const { data } = await apiClient.post('/api/patients/create', patient)
    return data // data (snake_case fields)
  },

  async update(id: number, patient: Partial<Patient>): Promise<Patient> {
    const { data } = await apiClient.put(`/api/patients/update/${id}`, patient)
    return data // data (snake_case fields)
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/patients/${id}`)
  },
}
```

---

## Router Architecture

### Route Configuration

```typescript
// router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'auth-login',
        component: () => import('@/pages/auth/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    requiresAuth: true,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        // Note: Dashboard dynamically renders 65+ role-based components
      },
      {
        path: 'patient',
        name: 'patient',
        component: () => import('@/pages/patient/PatientHome.vue'),
        children: [
          {
            path: 'find-patient',
            name: 'patient-find',
            component: () => import('@/pages/patient/FindPatientPage.vue'),
          },
        ],
      },
    ],
  },
]
```

### Route Guards

```typescript
// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'auth-login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    next({ name: 'unauthorized' })
    return
  }

  next()
}
```

---

## Component Architecture

### Component Categories

#### 1. Base Components
**Location**: `src/components/common/`
**Purpose**: Generic, reusable UI elements
**Examples**: Button, Input, Modal, Table

#### 2. Form Components
**Location**: `src/components/forms/`
**Purpose**: Form-specific components
**Examples**: FormField, FormLabel, FormError

#### 3. Layout Components
**Location**: `src/components/layout/`
**Purpose**: Layout structure
**Examples**: Header, Sidebar, Footer, Breadcrumb

#### 4. Feature Components
**Location**: `src/components/[feature]/`
**Purpose**: Feature-specific reusable components
**Examples**: PatientCard, AppointmentRow

### Component Pattern

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Patient } from '@/types'

interface Props {
  patient: Patient
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

interface Emits {
  (e: 'edit', id: number): void  // Note: id is number (not string)
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()

// Note: Access snake_case fields from server
const displayName = computed(() => `${props.patient.firstname} ${props.patient.lastname}`)
</script>

<template>
  <div class="patient-card">
    <h3>{{ displayName }}</h3>
    <slot />
    <template v-if="showActions">
      <button @click="emit('edit', patient.id)">Edit</button>
      <button @click="emit('delete', patient.id)">Delete</button>
    </template>
  </div>
</template>

<style scoped lang="scss">
.patient-card {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
</style>
```

---

## Type Architecture

### Type Organization

```
types/ (at project root - SHARED between client and server)
├── api.ts              # API response/request types
├── auth.ts             # Authentication types
├── patient.ts          # Patient types
├── appointment.ts      # Appointment types
├── visit.ts            # Visit types
├── employee.ts         # Staff/Employee types
├── common.ts           # Common/shared types
└── index.ts            # Barrel exports
```

### Type Pattern

**IMPORTANT**: All types use snake_case to match server models

```typescript
// types/patient.ts
export interface Patient extends BaseEntity {
  id: number  // Server uses INTEGER AUTO_INCREMENT
  firstname: string  // snake_case
  lastname: string   // snake_case
  middlename?: string
  date_of_birth: Date  // snake_case
  gender: Gender  // Enum from server
  phone: string
  // ... 40+ fields all snake_case
}

export interface PatientFilters {
  search?: string
  gender?: Gender
  patient_status?: PatientStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// types/api.ts
export interface PaginatedResult<T> {
  docs: T[]          // Standard format (Patient, Visit, Staff)
  total: number
  pages: number
  perPage: number
  currentPage: number
}

export interface PaginatedResultAlt<T> {
  rows: T[]          // Alternative format (Appointment only)
  count: number
  pages: number
  currentPage: number
  pageLimit: number
}
```

---

## Error Handling Strategy

### Global Error Handler

```typescript
// utils/error-handler.ts
import { notifyError } from './notifications'
import type { AxiosError } from 'axios'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    const { status, data } = error.response as { status: number; data: any }
    notifyError(data?.message || 'An error occurred')
    throw new AppError(data?.message || 'An error occurred', data?.code || 'UNKNOWN', status)
  }

  if (error.request) {
    notifyError('Network error. Please check your connection.')
    throw new AppError('Network error', 'NETWORK_ERROR')
  }

  notifyError(error.message)
  throw new AppError(error.message, 'UNKNOWN_ERROR')
}
```

---

## Build Configuration

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
          ui: ['@ui-library'], // Split UI library
        },
      },
    },
  },
})
```

---

## Testing Strategy

### Unit Testing (Vitest)

```typescript
// tests/unit/stores/patient.store.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePatientStore } from '@/stores/patient.store'
import { patientService } from '@/services/patient.service'

vi.mock('@/services/patient.service')

describe('Patient Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches patients successfully', async () => {
    const store = usePatientStore()
    const mockPatients = [{ id: 1, firstname: 'John', lastname: 'Doe' }]

    vi.mocked(patientService.getList).mockResolvedValue({
      docs: mockPatients,
      total: 1,
      pages: 1,
      perPage: 20,
      currentPage: 1,
    })

    await store.fetchPatients()

    expect(store.patients).toEqual(mockPatients)
    expect(store.isLoading).toBe(false)
  })
})
```

### Component Testing

```typescript
// tests/unit/components/PatientCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PatientCard from '@/components/patient/PatientCard.vue'

describe('PatientCard', () => {
  it('renders patient name', () => {
    const patient = { id: 1, firstname: 'John', lastname: 'Doe' }
    const wrapper = mount(PatientCard, { props: { patient } })

    expect(wrapper.text()).toContain('John Doe')
  })

  it('emits edit event', async () => {
    const patient = { id: 1, firstname: 'John', lastname: 'Doe' }
    const wrapper = mount(PatientCard, { props: { patient, showActions: true } })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('edit')?.[0]?.[0]).toBe(1)  // id is number
  })
})
```

---

## Security Considerations

### XSS Prevention
- Vue 3 auto-escapes by default
- Use `v-text` instead of `v-html` when possible
- Sanitize HTML with DOMPurify if `v-html` is required

### CSRF Protection
- Token-based authentication (JWT)
- Tokens stored in localStorage (with refresh rotation)
- Authorization header on all requests

### Input Validation
- Validate all user inputs
- Use Zod or Yup for schema validation
- Server-side validation is primary, client-side is UX

---

## Performance Optimization

### Code Splitting
- Route-based code splitting (automatic with Vite)
- Lazy load heavy components
- Dynamic imports for large modules

### Lazy Loading

```typescript
// routes.ts
{
  path: '/patient',
  component: () => import('@/pages/patient/PatientHome.vue'),
  children: [
    {
      path: 'profile/:id',
      component: () => import('@/pages/patient/PatientProfilePage.vue'),
    },
  ],
}
```

### Caching Strategy
- Pinia store persistence for session data
- Axios cache for GET requests (with invalidation)
- Service worker for static assets (PWA optional)

---

## Accessibility Standards

### Requirements
- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast ratios (4.5:1 minimum)

### Implementation
```vue
<template>
  <button
    @click="handleClick"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    role="button"
  >
    <slot />
  </button>
</template>
```

---

## Environment Variables

```env
# .env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=EHMRS
VITE_APP_VERSION=1.0.0

# .env.production
VITE_API_BASE_URL=https://api.ehmrs.com
VITE_APP_ENV=production
```

---

## Approval

**Architect**: @software-architect  
**Date**: March 6, 2026  
**Status**: ✅ APPROVED

**Approvals**:
- [x] @software-architect (Architecture) - March 6, 2026
- [ ] @ui-ux-designer (Design System alignment)
- [ ] @contract-architect (Type contracts)
- [ ] @skeptical-verifier (Security review)

---

## Key Architectural Decisions

| Decision | ID | Description |
|----------|-----|-------------|
| DEC-001 | Architecture | Vue 3 + Vite as build system |
| DEC-002 | Architecture | Pinia for state management |
| DEC-003 | Architecture | TypeScript strict mode |
| DEC-004 | Architecture | Composition API with `<script setup>` |
| DEC-008 | Types | Types must match server models exactly |
| DEC-009 | Types | snake_case for all API types |
| DEC-010 | Types | Number IDs (not string) |
| DEC-013 | Process | Iterative model analysis |

---

**Next Step**: Implement according to this architecture (Phase 1 ready to start)
