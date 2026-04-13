# Architectural & Design Decisions Log

**Purpose**: Track all significant architectural and design decisions for the EHMRS Vue 3 migration

---

## Decision Log Format

Each decision entry should include:
- **Date**: When the decision was made
- **Decision**: What was decided
- **Context**: Why this decision was needed
- **Alternatives Considered**: Other options evaluated
- **Rationale**: Why this option was chosen
- **Proposed By**: Agent who proposed
- **Approved By**: Agent who approved
- **Impact**: What this affects

---

## Decisions

### [YYYY-MM-DD] Decision: [Short Title]

**Context**: [Why was this decision needed?]

**Decision**: [What was decided?]

**Alternatives Considered**:
1. [Alternative 1] - [Why rejected]
2. [Alternative 2] - [Why rejected]

**Rationale**: [Why this decision was made]

**Proposed By**: @[agent]
**Approved By**: @[agent]
**Impact**: [What does this affect?]

---

## Pending Decisions

| ID | Topic | Proposed By | Date | Status |
|----|-------|-------------|------|--------|
| - | - | - | - | - |

---

## Approved Decisions Summary

| ID | Date | Decision | Area | Approved By |
|----|------|----------|------|-------------|
| DEC-001 | 2026-03-06 | Vue 3 + Vite as build system | Architecture | @software-architect |
| DEC-002 | 2026-03-06 | Pinia for state management | Architecture | @software-architect |
| DEC-003 | 2026-03-06 | TypeScript strict mode | Architecture | @software-architect |
| DEC-004 | 2026-03-06 | Composition API with `<script setup>` | Architecture | @software-architect |
| DEC-005 | 2026-03-06 | Module-by-module migration approach | Architecture | @software-architect |
| DEC-006 | 2026-03-06 | WCAG 2.1 AA accessibility compliance | Design | @ui-ux-designer |
| DEC-007 | 2026-03-06 | Implementation Lock (Phase 0 gate) | Process | @skeptical-verifier |
| DEC-008 | 2026-03-06 | Types must match server models exactly | Architecture | @software-architect |
| DEC-009 | 2026-03-06 | snake_case for all API types | Architecture | @software-architect |
| DEC-010 | 2026-03-06 | Number IDs (not string) | Architecture | @software-architect |
| DEC-011 | 2026-03-06 | Username for login (not email) | Architecture | @software-architect |
| DEC-012 | 2026-03-06 | Dynamic dashboard routing | Architecture | @software-architect |
| DEC-013 | 2026-03-06 | Iterative model analysis | Process | @software-architect |

---

## Detailed Decisions

### DEC-008: Types Must Match Server Models Exactly

**Context**: Initial type definitions (v1.0.0) were based on assumptions and common patterns, not actual server code. This would have caused type mismatches and runtime errors.

**Decision**: All TypeScript types in `types/` folder MUST be validated against actual server models from `/server/src/database/models/` before approval.

**Alternatives Considered**:
1. Keep v1.0.0 types - Rejected: Would cause runtime failures
2. Use adapter layer - Rejected: Adds unnecessary complexity
3. Validate against server - Accepted: Ensures type safety

**Rationale**: Type safety is only valuable if types accurately represent the data. Assumptions lead to bugs.

**Proposed By**: @contract-architect  
**Approved By**: @software-architect  
**Impact**: All type definitions redone as v2.0.0

---

### DEC-009: snake_case for All API Types

**Context**: Server uses snake_case for database columns (firstname, date_of_birth). Client convention is camelCase (firstName, dateOfBirth).

**Decision**: TypeScript types MUST use snake_case to match server exactly. No transformation layer.

**Alternatives Considered**:
1. camelCase in types with transformation - Rejected: Adds runtime overhead
2. snake_case in types - Accepted: Direct mapping, no transformation needed
3. Mix of both - Rejected: Confusing and error-prone

**Rationale**: Direct mapping eliminates transformation bugs and runtime overhead. Developers can adapt.

**Proposed By**: @contract-architect  
**Approved By**: @software-architect  
**Impact**: All field names in types use snake_case

---

### DEC-010: Number IDs (Not String)

**Context**: Server uses INTEGER AUTO_INCREMENT for primary keys. Initial types used string IDs.

**Decision**: All ID fields MUST be `number` type to match server INTEGER columns.

**Alternatives Considered**:
1. Keep string IDs - Rejected: Type mismatch with server
2. Use number IDs - Accepted: Matches server exactly
3. Use union type - Rejected: Unnecessary complexity

**Rationale**: Type accuracy prevents runtime errors and API integration issues.

**Proposed By**: @contract-architect  
**Approved By**: @software-architect  
**Impact**: All ID fields changed from `string` to `number`

---

### DEC-011: Username for Login (Not Email)

**Context**: Initial specs assumed email/password login. Actual client uses username/password.

**Decision**: LoginRequest MUST use `username` field to match actual implementation.

**Alternatives Considered**:
1. Use email - Rejected: Server expects username
2. Support both - Rejected: Unnecessary complexity
3. Use username - Accepted: Matches server validation

**Rationale**: Must match server authentication endpoint exactly.

**Proposed By**: @ui-ux-designer  
**Approved By**: @software-architect  
**Impact**: Login page and auth types updated

---

### DEC-012: Dynamic Dashboard Routing

**Context**: Initial specs assumed single `/api/dashboard` endpoint. Actual implementation has 65+ role-based dashboards.

**Decision**: Implement dynamic dashboard routing based on JWT token department/role.

**Alternatives Considered**:
1. Single dashboard - Rejected: Doesn't match business needs
2. Role-based routing - Accepted: Matches current implementation
3. Create new dashboard system - Rejected: Too much change

**Rationale**: Preserve existing functionality while modernizing UI.

**Proposed By**: @ui-ux-designer  
**Approved By**: @software-architect  
**Impact**: 65+ dashboard components to implement

---

### DEC-013: Iterative Model Analysis

**Context**: EHMRS has 30+ modules with 50+ models. Analyzing all upfront would delay Phase 0 indefinitely.

**Decision**: Use iterative analysis - analyze 5 core models in Phase 0, then analyze each module JUST-IN-TIME (1 week before implementation).

**Alternatives Considered**:
1. Analyze all 50+ models upfront - Rejected: Would delay implementation by months
2. Analyze as we go - Rejected: Would cause implementation delays
3. Iterative (5 core + just-in-time) - Accepted: Balanced approach

**Rationale**:
- Phase 0: 5 core models enable immediate implementation
- Phase 1-5: Types already available, no delays
- Phase 6+: Analysis happens 1 week before needed

**Proposed By**: @contract-architect
**Approved By**: @software-architect
**Impact**:
- Phase 0 completed with 5 models
- Implementation can start immediately
- Analysis continues in parallel with implementation

---

### DEC-014: shadcn-vue as Component Library

**Context**: Phase 1 completed with stub components (AppButton, AppInput, etc.). Phase 2 (Patient Module) requires production-ready tables, forms, modals, selects, date pickers, tabs, badges, pagination, and more. Building accessible, WCAG 2.1 AA compliant versions from scratch would take weeks.

**Decision**: Adopt shadcn-vue (Vega style) as the component library, built on Reka UI (headless primitives). Install VeeValidate + Zod for form validation. Install vue-sonner for toast notifications.

**Alternatives Considered**:
1. Continue building stub components - Rejected: Would take weeks, accessibility concerns
2. Naive UI - Rejected: Less flexible, opinionated styling
3. shadcn-vue - Accepted: Tailwind-native, accessible, copy-paste model (full ownership)
4. Radix Vue directly - Rejected: Would need to build styling layer ourselves

**Rationale**:
- shadcn-vue components are WCAG 2.1 AA compliant out of the box
- Uses Tailwind CSS (already our CSS framework)
- Copy-paste model means components live in our codebase (no black-box dependency)
- Vega style provides clean, neutral defaults that match our clinical design system
- Reka UI provides accessible headless primitives
- VeeValidate + Zod gives us type-safe form validation
- Significantly accelerates Phase 2+ development

**Proposed By**: @code-executor
**Approved By**: @code-executor (infrastructure decision)
**Impact**:
- 21 shadcn-vue components installed in `src/components/ui/`
- CSS variables mapped to EHMRS design tokens in `main.scss`
- VeeValidate + Zod for all form validation going forward
- Legacy stub components (AppButton, AppInput, etc.) will be deprecated
- Build size increased by ~22KB CSS (still ~60KB gzipped total)

---

### DEC-015: VeeValidate + Zod as Mandatory Form Validation Standard

**Context**: The LoginPage initially used manual `errors` ref + `watch` handlers for validation. This pattern is fragile — errors don't auto-clear on valid input, and every form would need to duplicate the same boilerplate. All patient module forms already use VeeValidate + Zod, but the Login page did not.

**Decision**: ALL forms in the project MUST use VeeValidate + Zod for validation. Manual `errors` refs, `watch`-based error clearing, and custom validation functions are prohibited. The pattern is documented as the "STANDARD FORM PATTERN" in `CLIENT_DESIGN_SYSTEM.md`.

**Alternatives Considered**:
1. Manual `errors` ref + `watch` — Rejected: fragile, doesn't auto-clear errors, inconsistent across forms
2. Vuelidate — Rejected: less TypeScript integration than Zod, we already have VeeValidate installed
3. VeeValidate + Zod — Accepted: already used in all patient forms, auto-clears errors, full type inference

**Rationale**:
- Consistency: one pattern across the entire codebase
- DX: Zod schemas provide full TypeScript inference — `values` are typed, not `unknown`
- UX: errors auto-clear on valid input, real-time feedback
- Accessibility: `Field` component handles ARIA attributes automatically
- All patient pages already use this pattern — no migration needed

**Proposed By**: @code-executor
**Approved By**: @ui-ux-designer (design system), @code-executor (implementation)
**Impact**:
- `CLIENT_DESIGN_SYSTEM.md` updated with comprehensive form pattern documentation
- LoginPage refactored from manual validation to VeeValidate + Zod
- All existing forms already compliant (CreatePatientPage, CreateEmergencyPage, EditPatientPage)
- Future forms must follow this standard

---

## Decision Categories

### Architecture Decisions
- Technology stack
- Project structure
- Module boundaries
- Dependencies

### Design Decisions
- UI patterns
- Component library
- Color system
- Accessibility standards

### Process Decisions
- Workflow rules
- Approval chains
- Documentation requirements
- Testing standards

### API Contract Decisions
- Type definitions
- Response formats
- Error handling
- Versioning

---

## How to Propose a Decision

1. **Create a proposal** in the relevant document section
2. **List alternatives** with pros/cons
3. **Tag responsible agent** for review
4. **Wait for approval** before implementation
5. **Update this log** with the outcome

---

**Maintained By**: All Agents (per Amendment Protocol)  
**Last Updated**: 2026-03-06
