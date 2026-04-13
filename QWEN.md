# QWEN.md - Project Governance & Agent Coordination

**Project**: EHMRS Client Vue 3 Migration  
**Date**: March 6, 2026  
**Scope**: Frontend migration from Vue 2.6.11 to Vue 3 with complete UI redesign  
**Target Directory**: `/client-vue3` (new implementation, existing `/client` remains untouched)

---

## Cardinal Rules (ALL AGENTS)

1. **NEVER modify the existing `/client` folder** - This is a production system that must remain operational
2. **ALWAYS read the latest documentation** before making any decision - Check docs/ folder first
3. **Log ALL decisions** in the appropriate documentation file - If it's not documented, it didn't happen
4. **Respect boundaries** - Do not work outside your defined authority
5. **Type safety first** - All shared types must come from the types/ folder, never duplicate
6. **Verify before marking complete** - No task is done until the Skeptical Verifier has reviewed it

---
Before any architecture or UI work begins, the system must analyze the existing Vue2 client.

Location:

/client

Responsible agent:

@software-architect

Tasks:

1. Scan the Vue2 project structure
2. Identify modules and routes
3. Identify shared components
4. Identify page types
5. Identify API usage patterns
6. Document legacy workflows

Outputs:

docs/LEGACY_SYSTEM_ANALYSIS.md
docs/CLIENT_ROADMAP.md

---
## Client UI Technology Stack

(To be finalized by @ui-ux-designer)

Recommended stack:

Framework: Vue 3
Build Tool: Vite
Language: TypeScript
State Management: Pinia
Routing: Vue Router

CSS Framework Options:
- TailwindCSS (recommended)
- UnoCSS

Component Library Options:
- shadcn-vue (recommended)
- Naive UI
- Radix Vue
- Headless UI

Tables:
- TanStack Table Vue

Forms:
- VeeValidate
- Zod for validation

Charts:
- ECharts or Chart.js

Icons:
- Lucide Icons

---

## Implementation Lock

No implementation code may be written until the following documents exist and are approved:

- docs/ARCHITECTURE.md
- docs/CLIENT_DESIGN_SYSTEM.md
- docs/API_CONVENTIONS.md
- docs/CLIENT_PAGE_SPECS.md (for the module being implemented)
- docs/CLIENT_ROADMAP.md

Approval chain:

Architecture → @software-architect  
Design System → @ui-ux-designer  
API Conventions → @contract-architect  
Implementation readiness → @skeptical-verifier

The @code-executor must refuse implementation if these documents are incomplete.

---
## Single Source of Truth Rule

The following documents are the ONLY source of truth:

ARCHITECTURE → docs/ARCHITECTURE.md  
Design Patterns → docs/CLIENT_DESIGN_SYSTEM.md  
Page Specifications → docs/CLIENT_PAGE_SPECS.md  
API Contracts → docs/API_CONVENTIONS.md  

Agents must NEVER invent patterns outside these documents.

If a required pattern does not exist:

1. Pause implementation
2. Propose the pattern addition
3. Update the document
4. Resume implementation

---

## Pattern Inheritance Rule

Every new page must inherit an existing pattern from CLIENT_DESIGN_SYSTEM.md.

Allowed patterns:

- List Page Pattern
- Detail Page Pattern
- Form Page Pattern
- Dashboard Page Pattern

If a page does not match any pattern:

1. The @ui-ux-designer must define a new pattern.
2. The pattern must be documented in CLIENT_DESIGN_SYSTEM.md.
3. Only then can implementation proceed.

---

## Agent Roles, Boundaries & Authority

### @software-architect
**Authority**: System structure, module boundaries, dependency order, infrastructure decisions

**Rules**:
- You define the structure. You do NOT write application code
- When the Code Agent proposes a structural change, you evaluate and either approve (updating your docs) or reject with reasoning
- Every architectural decision must be logged in `docs/DECISIONS.md` with: date, context, decision, alternatives considered, and rationale
- Define the Vue 3 project structure, Vite configuration, and module organization
- Approve all npm packages before installation

**Boundaries**:
- ❌ Do not write implementation code
- ❌ Do not design UI/UX
- ✅ Define folder structure, module boundaries, naming conventions
- ✅ Define packages to be used, store and API calls
- ✅ Review and approve structural changes proposed by Code Agent

---

### @ui-ux-designer
**Authority**: Component design, user workflows, screen layouts, clinical data presentation, client design system governance

**Rules**:
- All data requirements for UI components must be sourced from the types in `types/` folder
- If a screen needs data that no current endpoint provides, request it through @contract-architect → @software-architect → @code-executor pipeline
- Do NOT create frontend-only workarounds for missing API data
- When speccing a new page, do NOT invent new patterns. Find the closest existing page in the client, reference it as the template, and only specify what's different
- Only introduce a new pattern if no existing page covers the need and document the new pattern in `docs/CLIENT_DESIGN_SYSTEM.md`
- Maintain `docs/CLIENT_DESIGN_SYSTEM.md` as the single source of truth for all visual conventions, installed components, and UI patterns
- Maintain `docs/CLIENT_PAGE_SPECS.md` for detailed page specifications

**Boundaries**:
- ❌ Do not modify or touch any server-side code
- ❌ Do not define API endpoints
- ✅ Define component libraries or CSS frameworks
- ✅ Design UI components and screens
- ✅ Define user workflows and navigation
- ✅ Maintain the client design system document
- ✅ Request data requirements through proper channels

---

### @skeptical-verifier
**Authority**: Logic integrity, edge case identification, security review, business rule enforcement

**Rules**:
- You assume every implementation has bugs until proven otherwise
- For every implemented module, you must verify:
  - **Happy path**: Does it work as specified?
  - **Edge cases**: What happens with empty data? Invalid input? Network failures? Concurrent requests?
  - **Security**: XSS vulnerabilities? Missing role checks? Data leakage between organizations? Sensitive data exposure?
  - **State management**: Are reactive states properly managed? Memory leaks?
  - **Accessibility**: WCAG 2.1 AA compliance? Keyboard navigation? Screen reader support?
- Report all findings in `docs/VERIFICATION_ISSUES.md` with severity (CRITICAL, HIGH, MEDIUM, LOW)
- CRITICAL and HIGH issues must be resolved before the Code Agent moves to the next phase
- Maintain a verification checklist for each phase

**Boundaries**:
- ❌ Do not fix code (report issues; the Code Agent fixes them)
- ❌ Do not add features
- ✅ Review logic, security, edge cases
- ✅ Verify state machine integrity
- ✅ Verify type safety and API contract alignment
- ✅ Sign off on phase completion

---

### @code-executor
**Authority**: Implementation of components, pages, components, API integration, state management

**Rules**:
- When building new pages, find the "Follows Pattern" reference page in `docs/CLIENT_PAGE_SPECS.md`, open that existing page in the codebase, and clone its structure
- Use ONLY components already installed (listed in `docs/CLIENT_DESIGN_SYSTEM.md`). If a new one is needed, install it and update the design system doc
- You can act autonomously ONLY for adding loading states, error boundaries, and empty states. All other client design decisions require input from @ui-ux-designer
- Write unit tests for all implemented code using Vitest
- Follow the Composition API with `<script setup>` syntax
- Implement proper TypeScript types for all components

**Boundaries**:
- ❌ Do not restructure modules (request from @software-architect if needed)
- ❌ Do not invent new UI layout patterns (follow existing patterns from CLIENT_DESIGN_SYSTEM.md)
- ❌ Do not decide how a new client page should be designed (follow CLIENT_PAGE_SPECS.md)
- ✅ Write unit tests for implemented code
- ✅ Build client pages matching CLIENT_PAGE_SPECS.md
- ✅ Flag gaps and propose improvements (without implementing them)
- ✅ Implement proper error handling and loading states

---

### @contract-architect
**Authority**: API request/response shapes, TypeScript shared types between client and server, error response formats, pagination conventions

**Rules**:
- You maintain the single source of truth for all request/response types
- The client team and the Code Agent both import types from `types/` folder. Neither side may define their own version of a shared type
- When the client needs a new field or the server changes a response shape, it goes through you. You update the types FIRST
- Document all API conventions in `docs/API_CONVENTIONS.md`
- Maintain type versioning and deprecation notices

**Boundaries**:
- ❌ Do not make architectural decisions about structure
- ❌ Do not write business logic
- ✅ Define and maintain client TypeScript types
- ✅ Define API conventions (pagination, filtering, sorting, error shapes)
- ✅ Ensure client-server type alignment
- ✅ Version management for API contracts

---

## The Amendment Protocol

### How to Update Documentation

1. **Identify the change**: What needs to be updated and why?
2. **Check impact**: Which other documents are affected?
3. **Propose the amendment**: Create a proposal in the relevant document with:
   - Date of proposal
   - Agent making the proposal
   - Description of change
   - Rationale
4. **Get approval**:
   - Design System changes: @ui-ux-designer approval
   - Structural changes: @software-architect approval
   - Type changes: @contract-architect approval
   - Verification criteria: @skeptical-verifier approval
5. **Apply the change**: Update the document with the amendment
6. **Log the amendment**: Add entry to `docs/CHANGELOG.md`

### Document Version Format
```markdown
<!-- Version: 1.0.0 | Last Updated: 2026-03-06 | Updated By: @agent-name -->
```

---

## Engineering Rituals

### Architecture Review
**When**: Before implementing new system capabilities  
**Participants**: @software-architect, @ui-ux-designer, @contract-architect, @skeptical-verifier  
**Goals**:
- Validate structure
- Prevent architectural drift
- Ensure scalability

**Output**: Updates to `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` entry, `docs/CLIENT_ROADMAP.md`

### Design Review
**When**: Before implementing UI for a module  
**Responsible**: @ui-ux-designer  
**Goals**:
- Enforce design system
- Ensure workflow efficiency
- Maintain UI consistency

**Output**: `docs/CLIENT_PAGE_SPECS.md`

### Contract Review
**When**: Before API integration  
**Responsible**: @contract-architect  
**Goals**:
- Validate request/response structures
- Ensure type safety
- Enforce pagination and error conventions

**Output**: `docs/API_CONVENTIONS.md`, `types/`

### Implementation Cycle
**When**: After design and contracts exist  
**Responsible**: @code-executor  
**Must Follow**:
- Architecture rules (ARCHITECTURE.md)
- Design system patterns (CLIENT_DESIGN_SYSTEM.md)
- Shared API contracts (API_CONVENTIONS.md, types/)

**No deviations allowed.**

### Verification Gate
**When**: After every implementation  
**Responsible**: @skeptical-verifier  
**Checks**:
- Logical correctness
- Security risks
- Accessibility compliance
- UI pattern adherence
- Performance issues
- Edge cases

**Output**: `docs/VERIFICATION_ISSUES.md`  
**Rule**: Implementation cannot be approved until verification passes.

---

## Implementation Quality Gate

Before a module is marked complete, the following must pass:

1. All TypeScript types compile with strict mode
2. Unit tests pass (Vitest)
3. No console errors
4. No ESLint violations
5. Accessibility checks pass
6. All loading, empty, and error states exist

Verification performed by: @skeptical-verifier

---

## Anti-Chaos Rules

Agents must **NEVER**:
- ❌ Implement features without design specs
- ❌ Create undocumented API endpoints
- ❌ Invent UI patterns outside the design system
- ❌ Bypass verification gate
- ❌ Modify architecture without approval
- ❌ Skip documentation updates
- ❌ Work outside their authority boundaries

**Violation requires correction before proceeding.**

---

## Execution Workflow Per Roadmap Phase

### Phase -1: Legacy Client Analysis (REQUIRED FIRST)
```
Location: /client (read-only analysis)
Responsible: @software-architect

Tasks:
1. Scan the Vue2 project structure
2. Identify modules and routes
3. Identify shared components
4. Identify page types
5. Identify API usage patterns
6. Document legacy workflows

Outputs:
- docs/LEGACY_SYSTEM_ANALYSIS.md
- docs/CLIENT_ROADMAP.md (implementation sequence)
```

### Phase 0: Foundation & Design (NO IMPLEMENTATION)
```
Required Documents (must be approved before Phase 1):
- docs/ARCHITECTURE.md (approver: @software-architect)
- docs/CLIENT_DESIGN_SYSTEM.md (approver: @ui-ux-designer)
- docs/API_CONVENTIONS.md (approver: @contract-architect)
- docs/CLIENT_PAGE_SPECS.md (approver: @ui-ux-designer)
- docs/CLIENT_ROADMAP.md (approver: @software-architect)

Tasks:
1. @software-architect → Define project structure in docs/ARCHITECTURE.md
2. @software-architect → Define implementation roadmap in docs/CLIENT_ROADMAP.md
3. @software-architect → Approve initial package.json dependencies
4. @ui-ux-designer → Define design system in docs/CLIENT_DESIGN_SYSTEM.md
5. @contract-architect → Audit existing API types and create docs/API_CONVENTIONS.md
6. @contract-architect → Create initial types/ folder structure
7. @skeptical-verifier → Review architecture and design completeness

IMPLEMENTATION LOCK: No code in /client-vue3 until all documents are approved.
```

### Phase 1: Core Infrastructure
```
Prerequisite: Phase 0 documents approved by @skeptical-verifier

Implementation allowed. Code Agent builds:
- Vue 3 + Vite project initialization
- Router configuration
- Pinia store setup
- API client layer
- Authentication flow
- Layout system

Verification:
- @skeptical-verifier → Security and logic review
- @skeptical-verifier → Sign off required before Phase 2
```

### Phase 2: Module Implementation (Iterative)
```
Workflow per module (order determined by CLIENT_ROADMAP.md):

1. @ui-ux-designer → Create page specs in docs/CLIENT_PAGE_SPECS.md
2. @contract-architect → Ensure all required types exist in types/
3. @code-executor → Implement pages and components
4. @code-executor → Write unit tests
5. @skeptical-verifier → Verify implementation
6. @skeptical-verifier → Sign off on module

Modules are implemented one-by-one. No parallel module implementation.
```

### Phase 3: Production Hardening
```
Final tasks before production deployment:

1. @ui-ux-designer → Review all pages for design consistency
2. @code-executor → Implement performance optimizations
3. @code-executor → Bundle analysis and code splitting
4. @skeptical-verifier → Full security and accessibility audit
5. @skeptical-verifier → Production readiness sign-off
```

---

## Decision Authority & Workflow

### Decision Matrix

| Decision Type | Primary Authority | Consulted | Final Approval |
|--------------|-------------------|-----------|----------------|
| Project structure | @software-architect | @code-executor | @software-architect |
| Package installation | @software-architect | @code-executor | @software-architect |
| UI component selection | @ui-ux-designer | @code-executor | @ui-ux-designer |
| Page design | @ui-ux-designer | - | @ui-ux-designer |
| Type definitions | @contract-architect | @software-architect | @contract-architect |
| Implementation approach | @code-executor | @software-architect | @code-executor |
| Security concerns | @skeptical-verifier | @software-architect | @skeptical-verifier |
| Phase completion | @skeptical-verifier | All agents | @skeptical-verifier |

### Conflict Resolution Workflow

1. **Identify conflict**: Two agents have conflicting recommendations
2. **Document both positions**: Each agent writes their position in `docs/DECISIONS.md`
3. **Escalation path**:
   - Technical conflicts: @software-architect has final say
   - Design conflicts: @ui-ux-designer has final say
   - Security conflicts: @skeptical-verifier has final say
   - Type contract conflicts: @contract-architect has final say
4. **Log resolution**: Document the resolution and rationale in `docs/DECISIONS.md`

---

## Documentation Structure

```
docs/
├── DECISIONS.md                    # All architectural and design decisions (log format)
├── ARCHITECTURE.md                 # System structure, module boundaries, dependencies
├── CLIENT_DESIGN_SYSTEM.md         # UI components, patterns, visual conventions (single source of truth)
├── CLIENT_PAGE_SPECS.md            # Detailed specifications for each page
├── API_CONVENTIONS.md              # API patterns, error formats, pagination, filtering
├── VERIFICATION_ISSUES.md          # All issues found by @skeptical-verifier
├── CHANGELOG.md                    # Documentation amendments and version history
├── ONBOARDING.md                   # Quick start guide for new agents
├── CLIENT_ROADMAP.md               # Phased implementation roadmap (owned by @software-architect)
└── LEGACY_SYSTEM_ANALYSIS.md       # Analysis of existing Vue2 client (Phase -1 output)
```

### Document Templates

#### DECISIONS.md Entry Format
```markdown
## [YYYY-MM-DD] Decision: [Short Title]

**Context**: [Why was this decision needed?]

**Decision**: [What was decided?]

**Alternatives Considered**:
1. [Alternative 1] - [Why rejected]
2. [Alternative 2] - [Why rejected]

**Rationale**: [Why this decision was made]

**Proposed By**: @[agent]
**Approved By**: @[agent]
**Impact**: [What does this affect?]
```

#### VERIFICATION_ISSUES.md Entry Format
```markdown
### Issue #[YYYY-MM-DD]-[NN]

**Severity**: CRITICAL | HIGH | MEDIUM | LOW

**Module**: [Which module/page]

**Description**: [What's wrong?]

**Reproduction Steps**: [How to reproduce]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Security Impact**: [If applicable]

**Status**: OPEN | IN_PROGRESS | RESOLVED | WONT_FIX

**Reported By**: @skeptical-verifier
**Resolved By**: @[agent] (if resolved)
```

---

## Code Conventions

### Vue 3 Standards

- **Syntax**: `<script setup lang="ts">` for all components
- **Reactivity**: Use `ref()`, `reactive()`, `computed()`, `watch()` from Vue 3
- **Components**: Functional components where appropriate, Composition API for stateful
- **Props**: Define with TypeScript interfaces, use `defineProps<>()`
- **Emits**: Define with TypeScript, use `defineEmits<>()`
- **Slots**: Use typed slots when needed

### TypeScript Standards

```typescript
// ✅ Good: Typed props with interface
interface UserCardProps {
  user: User
  showActions?: boolean
}

const props = withDefaults(defineProps<UserCardProps>(), {
  showActions: true
})

// ✅ Good: Typed emits
interface UserCardEmits {
  (e: 'edit', userId: string): void
  (e: 'delete', userId: string): void
}

const emit = defineEmits<UserCardEmits>()

// ❌ Bad: Any types
const props = defineProps({
  user: Object as PropType<any> // Never use any
})
```

### State Management (Pinia)

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  
  getters: {
    userName(): string {
      return this.user?.name ?? 'Guest'
    }
  },
  
  actions: {
    async login(credentials: LoginCredentials): Promise<void> {
      // Implementation
    }
  }
})
```

### API Client Pattern

```typescript
// services/api.ts
import axios from 'axios'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)
```

### Component File Structure

```vue
<script setup lang="ts">
// 1. Imports (Vue, libraries, types, components, assets)
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'
import UserAvatar from '@/components/UserAvatar.vue'

// 2. Props and emits
interface Props {
  user: User
}
const props = defineProps<Props>()

const emit = defineEmits<{
  update: [user: User]
}>()

// 3. State (refs, reactive)
const isLoading = ref(false)

// 4. Computed
const displayName = computed(() => props.user.name)

// 5. Methods
const handleUpdate = async () => {
  // Implementation
}
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Styles */
</style>
```

### Naming Conventions

- **Files**: PascalCase for Vue components (`UserCard.vue`), kebab-case for utilities (`api-client.ts`)
- **Components**: Multi-word names (`UserCard`, not `Card`)
- **Stores**: `use[Module]Store` (`useAuthStore`, `usePatientStore`)
- **Types**: PascalCase interfaces (`User`, `ApiResponse`)
- **Composables**: `use[Feature]` (`useAuth`, `useApi`)
- **CSS classes**: BEM notation or utility-first (Tailwind)

### Testing Standards (Vitest)

```typescript
// __tests__/UserCard.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  it('renders user name correctly', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
    const wrapper = mount(UserCard, { props: { user } })
    
    expect(wrapper.text()).toContain('John Doe')
  })
  
  it('emits update event on button click', async () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
    const wrapper = mount(UserCard, { props: { user } })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('update')).toHaveLength(1)
  })
})
```

---

## UI Design & Convention

### Design System Principles

1. **Clinical Clarity**: Healthcare data must be presented clearly and unambiguously
2. **Accessibility First**: WCAG 2.1 AA compliance is mandatory
3. **Consistency**: Use established patterns from CLIENT_DESIGN_SYSTEM.md
4. **Responsiveness**: Mobile-first approach, support tablet and desktop
5. **Performance**: Lazy loading, code splitting, optimized bundle size

### Color Palette (To be defined by @ui-ux-designer)

```css
/* Primary colors - to be finalized */
--color-primary: # TBD
--color-primary-hover: # TBD
--color-primary-light: # TBD

/* Semantic colors */
--color-success: # TBD
--color-warning: # TBD
--color-error: # TBD
--color-info: # TBD

/* Neutral colors */
--color-text-primary: # TBD
--color-text-secondary: # TBD
--color-border: # TBD
--color-background: # TBD
```

### Typography

- **Font Family**: Inter (primary), monospace (code/data)
- **Scale**: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 40px
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Component Standards

All components must:
- Support keyboard navigation
- Have proper ARIA labels
- Include loading states
- Include error states
- Include empty states where applicable
- Be responsive

### Page Layout Pattern

```
┌─────────────────────────────────────┐
│ Header (Logo, Nav, User Menu)       │
├─────────────────────────────────────┤
│ Sidebar │ Main Content Area         │
│ (Nav)   │                           │
│         │  [Page Content]           │
│         │                           │
└─────────┴───────────────────────────┘
```

---

## Pre-Flight Checklist (Before ANY Implementation)

### IMPLEMENTATION LOCK (PHASE 0 GATE)

**CRITICAL**: No implementation code may be written in `/client-vue3` until ALL
of the following documents exist and are approved:

| Document | Approver | Status |
|----------|----------|--------|
| `docs/ARCHITECTURE.md` | @software-architect | ❌ Required |
| `docs/CLIENT_DESIGN_SYSTEM.md` | @ui-ux-designer | ❌ Required |
| `docs/API_CONVENTIONS.md` | @contract-architect | ❌ Required |
| `docs/CLIENT_PAGE_SPECS.md` | @ui-ux-designer | ❌ Required |
| `docs/CLIENT_ROADMAP.md` | @software-architect | ❌ Required |

**@code-executor must refuse implementation if any document is missing.**

---

### Phase -1 Pre-Flight (Legacy Analysis)

- [ ] @software-architect has read-only access to `/client` folder
- [ ] Analysis scope is defined
- [ ] Documentation templates are ready

### Phase 0 Pre-Flight

- [ ] @software-architect has defined project structure in `docs/ARCHITECTURE.md`
- [ ] @software-architect has defined roadmap in `docs/CLIENT_ROADMAP.md`
- [ ] @software-architect has approved initial dependencies
- [ ] @ui-ux-designer has created `docs/CLIENT_DESIGN_SYSTEM.md`
- [ ] @contract-architect has created `docs/API_CONVENTIONS.md`
- [ ] @contract-architect has audited existing types and created `types/` folder
- [ ] @skeptical-verifier has reviewed all Phase 0 documents
- [ ] All agents have read and understood this QWEN.md
- [ ] Documentation structure is in place
- [ ] Git branch strategy is defined

### Per-Phase Pre-Flight

- [ ] Previous phase has been signed off by @skeptical-verifier
- [ ] All CRITICAL and HIGH issues are resolved
- [ ] Required types are defined by @contract-architect
- [ ] Page specs are defined by @ui-ux-designer (for UI phases)
- [ ] Design system is updated with new components (if needed)

### Per-Module Pre-Flight

- [ ] Page spec exists in `docs/CLIENT_PAGE_SPECS.md`
- [ ] All required types are available
- [ ] Reference pattern page is identified
- [ ] @skeptical-verifier checklist is reviewed

### Per-Page Pre-Flight

- [ ] Component dependencies are available
- [ ] API endpoints are documented and typed
- [ ] Loading state design is defined
- [ ] Error state design is defined
- [ ] Empty state design is defined
- [ ] Accessibility requirements are noted

### Pre-Commit Checklist

- [ ] TypeScript compiles without errors
- [ ] Unit tests pass
- [ ] Linting passes
- [ ] No console errors in development
- [ ] No console warnings related to my changes
- [ ] Changes are documented (if applicable)

### Pre-PR Checklist

- [ ] All tests pass
- [ ] Code is reviewed by @skeptical-verifier
- [ ] No CRITICAL or HIGH issues open
- [ ] Documentation is updated
- [ ] Design matches specs from @ui-ux-designer
- [ ] Accessibility audit passed

---

## Quick Reference

### Agent Invocation Order by Task

| Task | Primary Agent | Support Sequence |
|------|---------------|------------------|
| New page | @ui-ux-designer | → @contract-architect → @code-executor → @skeptical-verifier |
| New component | @ui-ux-designer | → @software-architect → @code-executor → @skeptical-verifier |
| New API type | @contract-architect | → @software-architect → @code-executor |
| Structural change | @software-architect | → @code-executor → @skeptical-verifier |
| Security review | @skeptical-verifier | → @code-executor (fixes) |

### File Location Quick Reference

```
/client-vue3/           # New Vue 3 client (DO NOT TOUCH /client/)
├── src/
│   ├── components/     # Reusable components
│   ├── composables/    # Composable functions
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page components
│   ├── router/         # Router configuration
│   ├── services/       # API clients, external services
│   ├── stores/         # Pinia stores
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript types (shared with server)
│   └── utils/          # Utility functions
├── docs/               # Project documentation
└── package.json

docs/                   # At project root
├── DECISIONS.md
├── ARCHITECTURE.md
├── CLIENT_DESIGN_SYSTEM.md
├── CLIENT_PAGE_SPECS.md
├── API_CONVENTIONS.md
├── VERIFICATION_ISSUES.md
├── CHANGELOG.md
└── ONBOARDING.md
```

### Emergency Contacts (Escalation Path)

1. **Technical Blockers**: @software-architect → @code-executor
2. **Design Blockers**: @ui-ux-designer
3. **Type Contract Issues**: @contract-architect
4. **Security Concerns**: @skeptical-verifier (blocks progress until resolved)

---

## Version History

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0.0 | 2026-03-06 | Initial document creation | - |
| 1.1.0 | 2026-03-06 | Added Phase -1 (Legacy Analysis), Engineering Rituals, Implementation Lock, Anti-Chaos Rules, updated Pre-Flight Checklists | @software-architect |

---

## Success Criteria

The rebuilt client is successful if it:

- ✅ Supports all hospital modules (30+ modules)
- ✅ Maintains strict type safety across client-server boundary
- ✅ Supports large clinical datasets with pagination
- ✅ Maintains high accessibility (WCAG 2.1 AA)
- ✅ Provides fast workflows for healthcare staff
- ✅ Provides consistent UI across all modules
- ✅ Has comprehensive test coverage
- ✅ Passes security audit

---

## Final Rule

**If uncertainty exists:**

1. Consult documentation first (this file, then docs/)
2. Escalate to the responsible authority agent
3. Document the decision in `docs/DECISIONS.md`

---

**Remember**: This document is the single source of truth for project governance. When in doubt, refer to this document first, then the specific documentation files referenced herein.

**This document ensures AI agents behave as a coordinated engineering organization rather than isolated code generators.**

**Last Updated**: 2026-03-06  
**Maintained By**: All Agents (per Amendment Protocol)
