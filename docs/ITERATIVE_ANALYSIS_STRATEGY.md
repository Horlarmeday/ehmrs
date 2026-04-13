# Iterative Model Analysis Strategy

**Version**: 1.0.0  
**Created**: March 6, 2026  
**Owner**: @contract-architect  
**Status**: ✅ APPROVED

---

## The Challenge

EHMRS has **30+ modules** with **50+ database models**. Analyzing ALL models upfront would:
- Delay Phase 0 indefinitely
- Create analysis paralysis
- Waste effort on models that might change

However, implementing without proper types would:
- Cause rework and refactoring
- Break type safety
- Slow down development

## The Solution: Phased Analysis & Implementation

We use a **hybrid approach**:

### Phase 0: Foundation Types (NOW) ✅
**Analyze and define types for CORE infrastructure only**

### Phase 1-N: Module-by-Module (ITERATIVE)
**Analyze each module BEFORE implementing it**

---

## Phase 0: Foundation Types (COMPLETED ✅)

### Models Analyzed (5 models)
These are the **absolute minimum** needed to start implementation:

| Model | Purpose | Priority | Status |
|-------|---------|----------|--------|
| **Staff** | Authentication, users | P0 | ✅ Analyzed |
| **Patient** | Core hospital data | P0 | ✅ Analyzed |
| **Appointment** | Scheduling | P0 | ✅ Analyzed |
| **Visit** | Patient encounters | P0 | ✅ Analyzed |
| **Encounter** | Medical records | P1 | ✅ Analyzed |

### Types Created (v2.0.0)
- ✅ `types/auth.ts` - Login, token management
- ✅ `types/common.ts` - Base types, Gender enum
- ✅ `types/api.ts` - Response formats, pagination
- ✅ `types/patient.ts` - Patient model (40+ fields)
- ✅ `types/appointment.ts` - Appointment model (20+ fields)
- ✅ `types/visit.ts` - Visit model (20+ fields)
- ✅ `types/employee.ts` - Staff model (25+ fields)

### Why These 5 Models?
1. **Staff** - Required for login/authentication (Phase 1)
2. **Patient** - Required for Patient module (Phase 2)
3. **Appointment** - Required for Appointments module (Phase 3)
4. **Visit** - Required for Visits module (Phase 4)
5. **Encounter** - Required for medical records

---

## Phase 1: Core Infrastructure (NEXT)

### Implementation Focus
- Authentication flow
- Layout system
- Router setup
- Dashboard routing

### Types Needed
Already available from Phase 0 ✅

### No Additional Analysis Needed

---

## Phase 2: Patient Module (After Phase 1)

### Implementation Focus
- Patient CRUD operations
- Patient search
- Patient profile
- Insurance management

### Types Needed
Already available from Phase 0 ✅ (`types/patient.ts`)

### No Additional Analysis Needed

---

## Phase 3: Appointments Module (After Phase 2)

### Implementation Focus
- Appointment booking
- Appointment calendar
- Check-in queue
- Doctor schedule

### Types Needed
Already available from Phase 0 ✅ (`types/appointment.ts`)

### No Additional Analysis Needed

---

## Phase 4: Visits Module (After Phase 3)

### Implementation Focus
- Visit creation
- Visit management
- Queue management
- Triage

### Types Needed
Already available from Phase 0 ✅ (`types/visit.ts`)

### No Additional Analysis Needed

---

## Phase 5: Employee Module (After Phase 4)

### Implementation Focus
- Employee CRUD
- Employee search
- Employee profile

### Types Needed
Already available from Phase 0 ✅ (`types/employee.ts`)

### No Additional Analysis Needed

---

## Phase 6: Clinical Modules - Part 1 (NEW ANALYSIS REQUIRED)

### Modules to Implement
1. **Consultation** - Doctor consultations
2. **Pharmacy** - Medication dispensing
3. **Laboratory** - Lab tests
4. **Radiology** - Medical imaging

### Analysis Required (BEFORE Phase 6 starts)

**Models to Analyze**:
| Model | Location | Priority |
|-------|----------|----------|
| `Consultation` | `/server/src/modules/Consultation/` | P1 |
| `Diagnosis` | `/server/src/modules/Diagnosis/` | P1 |
| `Prescription` | `/server/src/modules/Pharmacy/` | P1 |
| `Drug` | `/server/src/modules/Pharmacy/` | P1 |
| `LabTest` | `/server/src/modules/Laboratory/` | P1 |
| `LabOrder` | `/server/src/modules/Orders/Laboratory/` | P1 |
| `RadiologyExam` | `/server/src/modules/Radiology/` | P1 |
| `RadiologyOrder` | `/server/src/modules/Orders/Radiology/` | P1 |
| `InvestigationImage` | `/server/src/modules/Radiology/` | P1 |

**Types to Create**:
- `types/consultation.ts`
- `types/diagnosis.ts`
- `types/pharmacy.ts`
- `types/laboratory.ts`
- `types/radiology.ts`
- `types/orders.ts`

**Timeline**: 3-5 days BEFORE Phase 6 implementation starts

**Responsible**: @contract-architect

---

## Phase 7: Clinical Modules - Part 2 (NEW ANALYSIS REQUIRED)

### Modules to Implement
1. **Admission** - Inpatient admission
2. **Emergency** - Emergency department
3. **Triage** - Patient triage
4. **Nursing** - Nursing care

### Analysis Required (BEFORE Phase 7 starts)

**Models to Analyze**:
| Model | Location | Priority |
|-------|----------|----------|
| `Admission` | `/server/src/modules/Admission/` | P1 |
| `Bed` | `/server/src/modules/AdminSettings/` | P2 |
| `Ward` | `/server/src/modules/AdminSettings/` | P2 |
| `Emergency` | `/server/src/modules/Emergency/` | P1 |
| `Triage` | `/server/src/modules/Triage/` | P1 |
| `NursingNote` | `/server/src/modules/Consultation/` | P1 |

**Types to Create**:
- `types/admission.ts`
- `types/emergency.ts`
- `types/triage.ts`
- `types/nursing.ts`

**Timeline**: 3-5 days BEFORE Phase 7 implementation starts

**Responsible**: @contract-architect

---

## Phase 8: Administrative Modules (NEW ANALYSIS REQUIRED)

### Modules to Implement
1. **Accounting** - Financial management
2. **Inventory** - Stock management
3. **General Store** - General supplies
4. **Procurement** - Purchase orders

### Analysis Required (BEFORE Phase 8 starts)

**Models to Analyze**:
| Model | Location | Priority |
|-------|----------|----------|
| `Account` | `/server/src/modules/Account/` | P1 |
| `AccountingEntry` | `/server/src/modules/Accounting/` | P1 |
| `Payment` | `/server/src/modules/Accounting/` | P1 |
| `InventoryItem` | `/server/src/modules/Inventory/` | P1 |
| `StockMovement` | `/server/src/modules/Inventory/` | P1 |
| `Store` | `/server/src/modules/Store/` | P1 |
| `ProcurementRequest` | `/server/src/modules/Procurement/` | P1 |
| `PurchaseOrder` | `/server/src/modules/Procurement/` | P1 |

**Types to Create**:
- `types/accounting.ts`
- `types/inventory.ts`
- `types/store.ts`
- `types/procurement.ts`

**Timeline**: 5-7 days BEFORE Phase 8 implementation starts

**Responsible**: @contract-architect

---

## Phase 9-N: Remaining Modules (JUST-IN-TIME ANALYSIS)

### Modules Queue
- Insurance/NHIS
- Medical Records
- Programs (Antenatal, Immunization)
- Dialysis
- Surgery
- Maternity
- Admin Settings
- Reports
- And 15+ more...

### Analysis Strategy
**For each module**:
1. **1 week before implementation**: @contract-architect analyzes server models
2. **Create types**: Define TypeScript interfaces
3. **Update API_CONVENTIONS.md**: Document any new patterns
4. **Update CLIENT_PAGE_SPECS.md**: Document page specifications
5. **@skeptical-verifier reviews**: Validate type safety
6. **Implementation starts**: @code-executor builds pages

---

## Analysis Workflow (Per Module)

### Step 1: Model Discovery (1-2 days)
```bash
# Find all model files
find server/src/database/models -name "*.ts"
# Find all controllers
find server/src/modules -name "*controller.ts"
```

### Step 2: Model Analysis (1-2 days)
For each model:
1. Read model file (`*.ts`)
2. Extract fields, types, relationships
3. Note enums and validation rules
4. Identify required vs optional fields

### Step 3: Controller Analysis (1 day)
For each controller:
1. List all endpoints
2. Document request/response formats
3. Note pagination format (standard vs alternative)
4. Identify query parameters

### Step 4: Client Analysis (1 day)
For each Vuex store module:
1. Read actions (`*Actions.js`)
2. Note expected response structure
3. Identify transformations
4. Document state structure

### Step 5: Type Creation (1-2 days)
Create TypeScript types:
```typescript
// types/[module].ts
export interface [Model] extends BaseEntity {
  // snake_case fields
  // Actual server types
  // Enums from server
}

export interface [Model]Filters {
  // Query parameters
}

export interface [Model]Request {
  // Create/update request
}
```

### Step 6: Documentation Update (0.5 days)
Update:
- `docs/API_CONVENTIONS.md` - New endpoints
- `docs/CLIENT_PAGE_SPECS.md` - Page specifications
- `types/index.ts` - Export new types

### Step 7: Review & Approval (0.5 days)
- @skeptical-verifier: Type safety review
- @software-architect: Architecture alignment
- @code-executor: Implementation feasibility

**Total Time**: 5-7 days per module (before implementation)

---

## Benefits of This Approach

### ✅ Advantages

1. **No Upfront Delay**
   - Phase 0 completed with 5 models
   - Implementation can start immediately
   - Analysis happens just-in-time

2. **Focused Analysis**
   - Only analyze what's needed next
   - No wasted effort on unused models
   - Types stay relevant

3. **Learning Curve**
   - Each analysis improves the process
   - Patterns emerge naturally
   - Type quality improves over time

4. **Flexibility**
   - Can adjust priorities easily
   - Modules can be reordered
   - No massive rework

5. **Parallel Work**
   - @contract-architect analyzes next module
   - @code-executor implements current module
   - @ui-ux-designer designs next pages

### ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Analysis bottleneck | Start analysis 1 week before implementation |
| Type inconsistencies | Use templates from Phase 0 types |
| Missing relationships | Document cross-module dependencies |
| Server changes | Version types, document breaking changes |

---

## Current Status (March 6, 2026)

### ✅ Completed (Ready for Implementation)

| Phase | Types Status | Can Implement? |
|-------|--------------|----------------|
| Phase 1: Core Infrastructure | ✅ Complete | YES |
| Phase 2: Patient Module | ✅ Complete | YES |
| Phase 3: Appointments | ✅ Complete | YES |
| Phase 4: Visits | ✅ Complete | YES |
| Phase 5: Employee | ✅ Complete | YES |

### ⏳ Pending (Analysis Needed Before Implementation)

| Phase | Types Status | Analysis Due |
|-------|--------------|--------------|
| Phase 6: Clinical Part 1 | ❌ Not started | Before Phase 6 |
| Phase 7: Clinical Part 2 | ❌ Not started | Before Phase 7 |
| Phase 8: Administrative | ❌ Not started | Before Phase 8 |
| Phase 9+: Remaining | ❌ Not started | Before each phase |

---

## Implementation Timeline

### Now - Phase 0 Complete
- ✅ 5 core models analyzed
- ✅ 8 type files created (v2.0.0)
- ✅ Documentation validated

### Phase 1-5 (Weeks 1-8)
- ✅ Types already available
- 🚀 **Start implementation immediately**
- No analysis delays

### Phase 6 (Week 9)
- **Week 8**: @contract-architect analyzes Clinical Part 1 models
- **Week 9**: Types available, implementation starts

### Phase 7 (Week 13)
- **Week 12**: @contract-architect analyzes Clinical Part 2 models
- **Week 13**: Types available, implementation starts

### Phase 8 (Week 17)
- **Week 16**: @contract-architect analyzes Administrative models
- **Week 17**: Types available, implementation starts

---

## Summary

### Question
> Are we only starting with the 5 models analyzed first, then after implementing the pages for those, we will analyze other models?

### Answer
**YES - Exactly!**

1. **Phase 0**: Analyzed 5 core models ✅ (COMPLETE)
2. **Phase 1-5**: Implement with existing types ✅ (READY)
3. **Phase 6+**: Analyze module **BEFORE** implementing it ⏳ (JUST-IN-TIME)

### Workflow
```
Phase 0 (NOW) → 5 models analyzed ✅
    ↓
Phase 1-5 → Implement with existing types
    ↓
Before Phase 6 → Analyze 8-10 clinical models
    ↓
Phase 6 → Implement clinical modules
    ↓
Before Phase 7 → Analyze 5-6 admission models
    ↓
Phase 7 → Implement admission modules
    ↓
... and so on
```

### Benefit
- **No delay** waiting for all 50+ models to be analyzed
- **Type safety** maintained for each module
- **Flexibility** to adjust priorities
- **Focus** on what's needed next

---

**Approved By**: @software-architect, @contract-architect  
**Date**: March 6, 2026  
**Next Action**: Start Phase 1 implementation (types are ready!)
