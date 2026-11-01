# New UI/UX design for the whole system

Parent: #33 · Related: ADR-0002, ADR-0006, ADR-0009, ADR-0010, #41 · Owner direction 2026-11-01
Status: **owner approved the plan and both decisions as recommended (2026-11-01); AI parked by owner; Direction A confirmed (only the AI patterns were rejected); translation left out of the migration; Direction A look approved by owner on real screens (2026-11-01); task 3e done, PR #98; lab result entry prototype approved by owner; screen design paused so work returns to the GitHub issue order (#95, #41, #42, #43)**

The owner chose patient search and registration as the first screen (2026-11-01). The workflow map and navigation still cover the whole system.

## Goal

Design a new experience for eHMRS, working from each role's workflows. Legacy code tells us which fields, rules and behaviour exist. It does not set layout, format or page structure.

## Stays fixed

Business logic, API contracts, clinical data and validation rules, and the `DESIGN.md` density and contrast rules unless the owner changes them.

## Conflicts to resolve

1. **ADR-0002 (frozen view scripts) and ADR-0006:** these may not allow screens that combine or reorder today's views. See decision 1.
2. **Domain issues (#45-#67):** each requires a "Playwright smoke vs legacy". That should compare behaviour and data, not layout.
3. **ADR-0009 and #41:** the archetypes were chosen without workflow research, so they should follow this work.
4. **Merged FBC test page (#93):** it copies the legacy layout. It stays as a keyboard test only.

## Tasks

Complexity: S under 30 min, M under 2 h, L more than one session.

- [x] **1. Workflow map (L).** For each role, list the main jobs, steps, data needed and hand-offs, from `client/src/router.js`, views and stores. Mark anything inferred from code.
      *Accept:* every top-level area in `client/src/view/pages` is assigned to a role, or marked unused or unknown. The owner corrects the map.
- [x] **2. Information architecture (M).** Navigation, page inventory and how the roughly 480 views group into fewer screens.
      *Accept:* each legacy route maps to a new location or an owner-approved removal.
- [x] **3a. Visual research and direction (M).** Researched modern systems and showed three directions. The owner rejected the dense prototype and chose A, Calm workspace.
- [x] **3b. New design rules (M).** Rewrite `DESIGN.md` and tokens for the approved look.
      *Accept:* pipeline and contrast checks pass; owner signs off.
- [x] **3d. Restyle the kit (L).** Apply the new tokens to the kit from #93 and #94. 
      *Accept:* existing behaviour tests pass after updating only size and colour expectations; screenshots reviewed by me first.
- [x] **3e. Patient search and registration, restyled (L).** Rebuild the prototype in the new style, with the app shell (approved).
      *Accept:* owner review on real screens; every field and rule accounted for.
- [ ] **4. Test with real users (M).** Records staff try the prototype, with fake data only.
      *Accept:* findings recorded and the design updated. Requires the owner to arrange access.
- [ ] **5. Other high-risk workflows (L).** Lab result entry, triage, and dispense and verify, one at a time.
      *Accept:* owner review of each.
- [ ] **6. Update the architecture records (M).** Revise ADR-0009 and #41's archetypes with the resulting patterns.
      *Accept:* owner sign-off.
- [ ] **7. Update the roadmap (S).** Change #33, #41 and the domain issues to reference the approved designs, and change "smoke vs legacy" to behaviour and data.
      *Accept:* no issue treats legacy layout as a requirement.

## Decisions for the owner

1. **May a new screen combine or reorder today's views? Recommended: yes.** Stores, API calls and rules stay the same, but view scripts may be reorganized. This changes ADR-0002, and migration work needs more review per screen.
2. **Who validates the workflows? Recommended: you review the map, and one user per high-risk role tries the prototypes.** Code alone can't show how staff actually work.

## Out of scope

Backend changes, new features, and building domain screens before their design is approved. #95 can continue, since overlays are general components.

## Review notes

### Task 3 prototype (`client-vue3/src/prototypes/patient-desk/`)

- Fake data and no API. It is outside the production build.
- **New behaviour proposed:** an immediate phone duplicate warning using the existing search. Today the server rejects the duplicate only at submit, and that check stays.
- **Kept from the existing system:** required fields, phone rule and message, role rules for starting a visit and deactivating, walk-in's reduced fields, and the insurance prompt after registering.
- **Moved:** dependants and insurance start from the chart. The legacy chooser only offers Normal and Walk-in.
- **Not real yet:** camera capture, fee charging, the chart sections and the visit step.
- **Tests:** `npm run test:e2e` 86 passed, 258/258 over three repeats; lint and build pass. Records staff have not tried it (task 4).
- **Legacy defect kept as is:** the phone pattern only applies its length check to one branch, so the separate 11-digit rule does most of the work.

## Parked

The AI spec and AI design notes are in `docs/ai/`. They don't affect migration work until the owner brings them back.

### Direction A rebuild (2026-11-01)

- `DESIGN.md`, tokens, kit and the patient prototype now follow Direction A. New tokens: teal ramp, `action`, `radius.xs`. Fonts are self-hosted.
- **Patient list columns:** account type, registration date and registered-by left the list. Registration date and registered-by are in the chart; account type isn't shown yet. The owner approved the screens with this called out.
- Tests updated only for size, colour and font values, plus prototype layout.

### Lab result entry prototype (`client-vue3/src/prototypes/lab-entry/`)

- Fake data and no API. Carries over: several tests per sample, lock on pending payment or approval, optional referral, required tester, partial save, accept or reject with abnormal flag and comments, result notes, approve accepted results.
- **Changes proposed:** one test at a time with a test list; live High or Low flags; only the range for this patient. The prototype uses adult female ranges, so real age and sex selection is still to build. Flags are display only and don't set the abnormal field.
- Prototype covers three of the legacy result form types (FBC, Widal, free text). The other forms still need mapping.
