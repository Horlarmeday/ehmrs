# Client Vue 3 Migration Roadmap

**Created**: March 6, 2026  
**Created By**: @software-architect  
**Project**: EHMRS Vue 3 Client Migration  
**Target**: `/client-vue3`

---

## Overview

This roadmap defines the **phased implementation approach** for migrating the EHMRS client from Vue 2.6.11 to Vue 3 with a complete UI redesign.

### Guiding Principles

1. **Foundation First**: Infrastructure before features
2. **Core Before Specialized**: Essential modules before niche ones
3. **Verify Each Phase**: No phase complete without @skeptical-verifier sign-off
4. **API Compatibility**: Leverage existing APIs, no backend changes
5. **Design System**: Consistent UI patterns across all modules

---

## Phase -1: Legacy Analysis ✅

**Status**: COMPLETED  
**Date**: March 6, 2026  
**Output**: `docs/LEGACY_SYSTEM_ANALYSIS.md`

### Completed Tasks
- ✅ Scanned Vue 2 project structure
- ✅ Identified 30+ business modules
- ✅ Mapped 200+ routes
- ✅ Cataloged 35+ Vuex store modules
- ✅ Documented API integration patterns
- ✅ Assessed migration complexity per module

---

## Phase 0: Architecture & Design (GATE PHASE)

**Status**: PENDING  
**Duration**: 1-2 weeks  
**Implementation Lock**: ACTIVE - No code in `/client-vue3` yet

### Required Deliverables

| Document | Owner | Status |
|----------|-------|--------|
| `docs/ARCHITECTURE.md` | @software-architect | ⏳ Pending |
| `docs/CLIENT_DESIGN_SYSTEM.md` | @ui-ux-designer | ⏳ Pending |
| `docs/API_CONVENTIONS.md` | @contract-architect | ⏳ Pending |
| `docs/CLIENT_PAGE_SPECS.md` | @ui-ux-designer | ⏳ Pending |
| `types/` folder | @contract-architect | ⏳ Pending |

### Approval Required From
- @software-architect (Architecture)
- @ui-ux-designer (Design System)
- @contract-architect (API Contracts)
- @skeptical-verifier (Review completeness)

**⚠️ IMPLEMENTATION LOCK**: Phase 1 cannot start until all documents are approved.

---

## Phase 1: Core Infrastructure

**Duration**: 1-2 weeks  
**Priority**: CRITICAL  
**Dependencies**: Phase 0 approval

### Deliverables

#### 1.1 Project Setup
- [ ] Initialize Vue 3 + Vite project
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint + Prettier
- [ ] Configure Vitest for testing
- [ ] Set up Husky for git hooks

#### 1.2 Core Dependencies
- [ ] Vue 3.4+
- [ ] Vue Router 4
- [ ] Pinia (state management)
- [ ] Axios (HTTP client)
- [ ] UI Framework (TBD by @ui-ux-designer)
- [ ] Icon library
- [ ] Date handling (dayjs)
- [ ] Chart library

#### 1.3 Architecture Implementation
- [ ] Folder structure per ARCHITECTURE.md
- [ ] Router configuration
- [ ] Pinia store setup
- [ ] API client layer with interceptors
- [ ] Error handling utilities
- [ ] Loading state utilities

#### 1.4 Authentication Flow
- [ ] Login page
- [ ] Register page (if applicable)
- [ ] Auth store (Pinia)
- [ ] Auth guards
- [ ] Token management
- [ ] Logout flow

#### 1.5 Layout System
- [ ] Main layout component
- [ ] Header component
- [ ] Sidebar navigation
- [ ] Footer component
- [ ] Breadcrumb component

### Success Criteria
- ✅ User can log in and see dashboard
- ✅ Token is persisted and refreshed
- ✅ Protected routes redirect to login
- ✅ Layout renders correctly on all screen sizes
- ✅ All TypeScript types compile without errors
- ✅ Unit tests pass (>80% coverage for core)

### Verification
- [ ] Security audit by @skeptical-verifier
- [ ] Accessibility check (WCAG 2.1 AA)
- [ ] Performance baseline established

---

## Phase 2: Patient Management Module

**Duration**: 2-3 weeks  
**Priority**: CRITICAL  
**Dependencies**: Phase 1 sign-off

### Why Patient First?
Patient management is the **foundation** of the entire hospital system. All other modules (appointments, visits, laboratory, pharmacy) reference patient records.

### Pages to Implement

#### 2.1 Patient Operations
| Page | Pattern | Complexity | Notes |
|------|---------|------------|-------|
| Patient Home | Dashboard | Low | Entry point with quick actions |
| Choose Patient Type | Wizard Step | Low | Decision page |
| Create Patient Account | Form | Medium | Core registration |
| Create Emergency Account | Form | Medium | Expedited registration |
| Find Patient | List + Search | Medium | Search with filters |
| Patient Profile | Detail | High | Comprehensive view |
| Edit Patient | Form | Medium | Update demographics |
| Patient Insurance | Form | Medium | Insurance details |
| Dependants | List + Form | Medium | Family members |

#### 2.2 Special Features
- [ ] Patient search with fuzzy matching
- [ ] Patient photo upload
- [ ] Insurance validation
- [ ] Duplicate detection
- [ ] Emergency registration workflow

### Store Modules
- `usePatientStore` - Patient CRUD operations
- `usePatientSearchStore` - Search state
- `useInsuranceStore` - Insurance data

### API Endpoints Used
- `GET /api/patients` - List with pagination
- `GET /api/patients/:id` - Single patient
- `POST /api/patients` - Create
- `PUT /api/patients/:id` - Update
- `GET /api/patients/search` - Search
- `GET /api/insurance/*` - Insurance data

### Success Criteria
- ✅ All patient pages functional
- ✅ Search returns results in < 500ms
- ✅ Form validation works correctly
- ✅ Patient can be created, viewed, edited
- ✅ Insurance can be added/updated

---

## Phase 3: Appointments Module

**Duration**: 1-2 weeks  
**Priority**: HIGH  
**Dependencies**: Phase 2 sign-off, Patient module

### Pages to Implement

| Page | Pattern | Complexity | Notes |
|------|---------|------------|-------|
| Appointments Home | Dashboard | Low | Overview |
| Appointment List | List | Medium | With filters |
| Book Appointment | Form | High | Patient selection required |
| Appointment Calendar | Calendar | High | Visual schedule |
| Doctor Schedule | Calendar | Medium | Provider availability |
| Check-in Queue | List | Medium | Waiting patients |
| Appointment Details | Detail | Low | Modal view |

### Key Features
- [ ] Calendar integration
- [ ] Drag-and-drop rescheduling
- [ ] SMS/Email reminders (if API supports)
- [ ] Recurring appointments
- [ ] Provider availability checking

### Store Modules
- `useAppointmentStore` - Appointment CRUD
- `useScheduleStore` - Provider schedules

---

## Phase 4: Visits/Encounters Module

**Duration**: 2-3 weeks  
**Priority**: HIGH  
**Dependencies**: Patient, Appointments

### Pages to Implement

#### 4.1 Visit Management
| Page | Pattern | Complexity |
|------|---------|------------|
| All Visits | List | High |
| New Visit | Form | High |
| Edit Visit | Form | Medium |
| Visit Queue | List | Medium |
| Inpatients | List | Medium |

#### 4.2 Specialized Visits
- Ante-natal visits
- Immunization visits
- Dialysis visits
- NHIS visits

#### 4.3 Nurse Operations
- Triage/Vitals
- OPD treatments
- Awaiting vitals queue

### Store Modules
- `useVisitStore` - Visit CRUD
- `useQueueStore` - Queue management
- `useTriageStore` - Triage data

---

## Phase 5: Employee Management

**Duration**: 1 week  
**Priority**: MEDIUM  
**Dependencies**: Phase 1 sign-off

### Pages to Implement

| Page | Pattern | Complexity |
|------|---------|------------|
| Choose Employee Type | Wizard | Low |
| Create Employee | Form | Medium |
| Find Employee | List + Search | Medium |
| Employee Profile | Detail | Medium |

---

## Phase 6: Clinical Modules - Part 1

**Duration**: 3-4 weeks  
**Priority**: HIGH  
**Dependencies**: Patient, Visits

### Modules

#### 6.1 Consultation
- Doctor consultation records
- Diagnosis entry
- Treatment plans
- Referral management

#### 6.2 Nursing
- Nursing assessments
- Care plans
- Treatment administration
- Vitals monitoring

#### 6.3 Pharmacy
- Medication dispensing
- Prescription verification
- Stock checking
- Drug interaction alerts

#### 6.4 Laboratory
- Test ordering
- Sample collection
- Result entry
- Result verification

---

## Phase 7: Clinical Modules - Part 2

**Duration**: 3-4 weeks  
**Priority**: HIGH  

### Modules

#### 7.1 Radiology
- Imaging requests
- DICOM viewer integration
- Report generation
- Image archive

#### 7.2 Admission (IPD)
- Inpatient admission
- Ward management
- Bed management
- Discharge processing

#### 7.3 Emergency
- Emergency registration
- Triage in emergency
- Emergency treatment
- Transfer to IPD

---

## Phase 8: Administrative Modules

**Duration**: 4-5 weeks  
**Priority**: MEDIUM  

### Modules

#### 8.1 Accounting (Very High Complexity)
- Journal entries
- Cost centers
- Financial reports
- Billing integration

#### 8.2 Inventory/General Store
- Stock management
- Stock cards
- Transfers
- Adjustments

#### 8.3 Procurement
- Purchase requests
- Purchase orders
- Goods receipt
- Vendor management

#### 8.4 Insurance/NHIS
- Insurance verification
- Claims processing
- NHIS reporting
- Patient insurance management

---

## Phase 9: Settings & Configuration

**Duration**: 1-2 weeks  
**Priority**: MEDIUM  

### Modules

- Department management
- Unit management
- Ward management
- Bed configuration
- Service definitions
- System defaults
- User preferences

---

## Phase 10: Medical Records & Reports

**Duration**: 2-3 weeks  
**Priority**: MEDIUM  

### Features

- Medical records dashboard
- Report builder
- Saved reports
- Report scheduling
- Export functionality (PDF, Excel)
- Death certificate tracking
- Mortality reports

---

## Phase 11: Specialized Programs

**Duration**: 2 weeks  
**Priority**: LOW  

### Modules

- Antenatal care program
- Immunization program
- Chronic disease management
- Health education

---

## Phase 12: Specialized Clinical

**Duration**: 3-4 weeks  
**Priority**: LOW  

### Modules

- Surgery management
- Dialysis management
- Maternity ward
- ICU/CCU management

---

## Phase 13: Production Hardening

**Duration**: 2 weeks  
**Priority**: CRITICAL  

### Tasks

#### 13.1 Performance Optimization
- [ ] Bundle size analysis
- [ ] Code splitting implementation
- [ ] Lazy loading optimization
- [ ] Image optimization
- [ ] API call optimization

#### 13.2 Security Audit
- [ ] XSS vulnerability scan
- [ ] CSRF protection verification
- [ ] Authentication flow review
- [ ] Authorization checks
- [ ] Data validation review

#### 13.3 Accessibility Audit
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Focus management

#### 13.4 Documentation
- [ ] User documentation
- [ ] Admin documentation
- [ ] Developer documentation
- [ ] API documentation update

#### 13.5 Testing
- [ ] End-to-end tests
- [ ] Integration tests
- [ ] Performance tests
- [ ] Accessibility tests

---

## Phase 14: Deployment Preparation

**Duration**: 1 week  
**Priority**: CRITICAL  

### Tasks

- [ ] Production build configuration
- [ ] Environment configuration
- [ ] CI/CD pipeline setup
- [ ] Monitoring setup
- [ ] Error tracking setup
- [ ] Backup procedures
- [ ] Rollback procedures

### Final Verification
- [ ] All modules implemented
- [ ] All tests passing
- [ ] Security audit passed
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## Module Dependency Graph

```
Phase 1: Infrastructure
    ↓
Phase 2: Patient (foundation)
    ↓
Phase 3: Appointments ───┐
    ↓                    │
Phase 4: Visits ←────────┘
    ↓
Phase 5: Employee
    ↓
Phase 6-7: Clinical Modules (require Patient + Visits)
    ↓
Phase 8: Administrative (some require Clinical data)
    ↓
Phase 9-12: Specialized Modules
    ↓
Phase 13-14: Hardening & Deployment
```

---

## Risk Assessment

### High Risk Modules
| Module | Risk | Mitigation |
|--------|------|------------|
| Accounting | Very High | Extended timeline, thorough testing |
| Radiology (DICOM) | High | Early testing with real images |
| Surgery | High | Complex workflows, stakeholder input |
| Dialysis | High | Specialized medical requirements |

### Medium Risk
| Module | Risk | Mitigation |
|--------|------|------------|
| Patient | Medium | Core module, extensive testing |
| Visits | Medium | Many sub-workflows |
| Inventory | Medium | Complex stock calculations |

### Low Risk
- Employee Management
- Settings
- Appointments (basic)
- Dashboard

---

## Success Metrics

### Per-Phase Metrics
- All planned pages implemented
- Unit test coverage > 80%
- No CRITICAL or HIGH issues open
- @skeptical-verifier sign-off obtained

### Overall Project Metrics
- All 30+ modules migrated
- Zero data loss from legacy system
- Performance equal or better than Vue 2
- Accessibility WCAG 2.1 AA compliant
- Security audit passed
- User acceptance testing passed

---

## Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase -1 | 1 week | Week 1 |
| Phase 0 | 1-2 weeks | Week 2-3 |
| Phase 1 | 1-2 weeks | Week 4-5 |
| Phase 2 | 2-3 weeks | Week 7-8 |
| Phase 3 | 1-2 weeks | Week 9-10 |
| Phase 4 | 2-3 weeks | Week 11-13 |
| Phase 5 | 1 week | Week 14 |
| Phase 6 | 3-4 weeks | Week 17-18 |
| Phase 7 | 3-4 weeks | Week 20-22 |
| Phase 8 | 4-5 weeks | Week 26-27 |
| Phase 9 | 1-2 weeks | Week 28-29 |
| Phase 10 | 2-3 weeks | Week 30-32 |
| Phase 11 | 2 weeks | Week 33-34 |
| Phase 12 | 3-4 weeks | Week 36-38 |
| Phase 13 | 2 weeks | Week 39-40 |
| Phase 14 | 1 week | Week 41 |

**Total Estimated Duration**: 41 weeks (~10 months)

**Note**: Timeline can be compressed with parallel development streams for independent modules.

---

## Next Steps

1. **Complete Phase 0** - All documentation must be approved
2. **Begin Phase 1** - Core infrastructure implementation
3. **Iterate through modules** - Following this roadmap order
4. **Verify each phase** - @skeptical-verifier sign-off required

---

**Document Owner**: @software-architect  
**Last Updated**: March 6, 2026  
**Next Review**: After Phase 0 completion
