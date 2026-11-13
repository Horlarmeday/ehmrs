# Issue 41 — Archetype kit v1: list, entry form, detail with tabs, worklist

Issue: #41 · Parent: #33 · ADR-0009, ADR-0010, ADR-0002 (amended), ADR-0007 · Branch: `41-archetype-kit` from `svsh_branch`
Status: **plan approved by owner (2026-11-13); Phases 0 to 2 done, all designs approved; Phase 3 (kit additions) in progress**

Blocked by #93, #94 and #95, which are all closed (PRs #96, #97, #100). #42 (auth) and every domain issue (#45–#67) are blocked by this one.

## Sources read

- Issue #41 (no comments), PRD #33, #42, #43, #45, #95.
- `docs/adr/0002`, `0006`, `0007`, `0009`, `0010`.
- `client-vue3/DESIGN.md` (Direction A, Calm workspace), `client-vue3/DESIGN-BRIEF.md`.
- `tasks/ui-ux-redesign.md`, `docs/design/workflow-map.md`, `docs/design/information-architecture.md`.
- `tasks/94-kit-data-display.md`, `tasks/95-kit-overlays.md`, `client-vue3/src/components/kit/README.md`.
- Prototypes: `src/prototypes/patient-desk/*` and `src/prototypes/lab-entry/*` (both owner-approved).
- Kit harness, e2e specs, router, `App.vue`, `Layout.vue`, and a survey of the legacy client for wizards, lazy loading, tabs and pagination.

## Owner decisions (2026-11-13)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Archetype set | Four: list with filters, entry form, detail with tabs, **worklist with detail pane** |
| 2 | App shell | Built in #41 |
| 3 | Wizard | Dropped from v1 |
| 4 | "Lazy loading" | Sections and tabs load when opened, and loading skeletons. No infinite scroll |
| 5 | Manual pass | On the approved lab entry prototype (not the legacy-layout harness copy). I write the script, the owner runs VoiceOver |
| 6 | Validation messages | Legacy vee-validate 2 wording, exactly |
| 7 | URL state | Filters, page and open tab kept in the URL (new behaviour) |
| 8 | Plain select | Native `<select>` styled to the tokens |
| 9 | Unsaved changes | Warn before discarding typed data (new behaviour) |
| 10 | Tests | Vitest for binding contracts, Playwright for keyboard and axe; no coverage percentage |
| 11 | Example data | Staff and stock: stock items or staff list, create store item or staff form, staff profile detail, lab or dispense worklist |
| 12 | `DESIGN-BRIEF.md` | Delete |
| 13 | Smallest screen | **Android tablet**, touch only, portrait and landscape, used for ward rounds and vitals |
| 14 | Follow-up variants | GitHub issues now |
| 15 | Design review | Working harness screens with screenshots |
| 16 | Touch sizing | Controls and row actions grow to 44px on coarse pointers through new tokens; desktop stays 38px |
| 17 | Tablet scope | All four archetypes get full tablet layouts |

## Findings that shape the work

1. **The issue text predates the redesign.** `tasks/ui-ux-redesign.md` conflict 3 says the archetypes should follow the workflow research; its task 6 (revise ADR-0009 and #41) is done here.
2. **The approved prototypes already show the patterns:** `PatientSearch.vue` (list with filters), `PatientRegister.vue` (sectioned entry form with dependent rules), `LabDesk.vue` (worklist with detail pane).
3. **No multi-step forms and no infinite scroll exist in legacy.** 79 views use server-side `<pagination>`.
4. **No production app shell exists.** `Layout.vue` is a stub; the approved shell lives only inside `PatientDesk.vue`. `KitConfirmHost` isn't mounted in `App.vue`.
5. **The kit has no plain select** for the 166 legacy `<select>` uses.
6. **Validation is inconsistent across the harness, the prototype and ADR-0007.** One pattern is needed, with legacy v2 messages (decision 6).
7. **`DESIGN-BRIEF.md` is stale** (Blueprint, blue, 28px).
8. **Tablets change the foundation.** Until now the kit assumed desktop Chrome with a keyboard. The new facts:
   - Touch only, so hover-only information fails. `KitTooltip` appears on hover and focus, which touch doesn't reliably give. Nothing an archetype needs may live only in a tooltip, including the "disabled because…" reasons in the patient prototype, which use `title`.
   - 38px controls and 30px row buttons are below finger size; decision 16 adds coarse-pointer tokens. That changes `DESIGN.md`, so it goes through the pipeline and the owner's review.
   - Portrait at about 768px wide: the 208px sidebar, the 3-column form grid, a wide table and a side-by-side worklist pane can't all fit. Each archetype needs a defined narrow layout.
   - Android Chrome is Chromium, so Playwright stays Chromium-only, adding tablet viewports with `hasTouch` and `isMobile`.
   - The on-screen keyboard covers half the screen when typing. Forms must keep the focused field and the error summary visible, and the action bar must not hide fields.
   - `inputmode` matters for numeric entry (vitals, quantities), so the correct keypad opens.
   - The `/` search shortcut does nothing on touch; search needs a visible button or field on tablets.
   - Wide tables in portrait need a decision during design: horizontal scroll inside the table, hidden low-priority columns, or rows that stack as cards.

## Archetypes

| Archetype | From | Real screens that use it (from the IA) |
| --- | --- | --- |
| **A. List with filters** | `PatientSearch.vue` | Patients search, stock items, vendors, staff, transactions, lab and radiology setup lists, NHIS visits, admitted patients |
| **B. Entry form** (page or dialog) | `PatientRegister.vue` | Registration, create staff, store item, defaults, vendors, enrolment, vitals entry |
| **C. Detail with tabs** | IA patient chart | Patient chart (#46), staff profile, prescription detail, antenatal profile, store item |
| **D. Worklist with detail pane** | `LabDesk.vue` | Home, lab worklist, dispense, vitals, treatments, radiology worklist, ward rounds |

### A. List with filters

- **Regions:** page header (title, one solid main action), filter bar, result summary (live region), `KitTable`, `KitPagination`, empty state, error state with retry, skeleton while loading.
- **Kit:** `KitTable`, `KitPagination`, `useServerTable`, `KitInput`, `KitDatePicker`, `KitSelect`, new native select, `KitBadge`, `KitButton`, `KitDropdown`, `useConfirm`, `KitSkeleton`.
- **Contract:** filters reach only the view's frozen `load` function; a filter change returns to page 1; empty and failed look different; a disabled action shows its reason as visible text, not a tooltip; empty-search refusal comes from a guard the view passes in; filters and page live in the URL query and are restored on load, refresh and back.
- **Tablet:** the filter bar collapses behind a "Filters" button with a count of active filters; the table's narrow behaviour is settled in design (finding 8).

### B. Entry form

- **Regions:** page header, optional mode switch, titled sections with a responsive field grid (3 columns on desktop, fewer at tablet widths), inline notices, action bar with one solid submit and a quiet cancel, error summary.
- **Kit:** all form controls, the native select, and new `FormSection`, `FieldGrid`, `ActionBar`, `ErrorSummary`.
- **Contract:** the view passes fields and a rules object; each field is bound with exactly that rule; submit runs the frozen handler only when validation passes; submit is disabled while saving; messages use the legacy v2 wording; leaving the page or closing the dialog with changed values asks for confirmation through `useConfirm`, plus the browser's `beforeunload` prompt for reloads and tab closes.
- **Hosts:** full page, and the same body inside `KitDialog`.

### C. Detail with tabs

- **Regions:** record banner (identity, mono identifiers, status badges, one main action, secondary actions in `KitDropdown`), `KitTabs`, per-panel skeleton, empty and error states.
- **Contract:** `lazy` panels don't request until opened; the open tab is in the URL; a role-hidden tab isn't rendered (and the docs say hiding isn't security).
- **Tablet:** the banner compresses to name, identifiers and status; tabs scroll sideways (already supported) and must be easy to tap.

### D. Worklist with detail pane

- **Regions:** optional stage switch, item list with status badges and counts, detail pane, bulk action bar.
- **Contract:** keyboard and touch selection; the selected item and stage are in the URL; locked items (payment pending, approved) are visibly read-only; bulk action guards come from the view.
- **Tablet:** landscape shows list and pane side by side if they fit; portrait shows the list, then the item full-width with a clear way back to the list.

## App shell

- Sidebar navigation from role data; at tablet widths it becomes a drawer opened by a menu button.
- Top search (name, phone or hospital number) with the `/` shortcut on keyboards and a visible search control on touch.
- Skip link, `main` landmark, page title per route, focus to the heading on route change.
- `AppToaster` and `KitConfirmHost` mounted once in `App.vue`.
- Promoted from `PatientDesk.vue`; the prototype moves onto the shell.

## Code layout (names settle in task 4)

```
client-vue3/src/view/layout/            Layout.vue becomes the shell; sidebar, top bar, nav data
client-vue3/src/components/archetypes/
  ListPage.vue  EntryForm.vue  DetailPage.vue  WorklistPage.vue
  useEntryForm.ts                         fields + rules object to vee-validate, unsaved changes
  useRouteState.ts                        filters, page, tab and selection in the URL query
  README.md
client-vue3/src/components/kit/
  KitNativeSelect.vue, KitPageHeader.vue, KitEmptyState.vue, KitDescriptionList.vue,
  KitRecordBanner.vue, KitFormSection.vue, KitActionBar.vue, KitErrorSummary.vue, KitDrawer.vue
client-vue3/src/validation/
  setup.ts                                @vee-validate/rules registered globally, legacy v2 messages
```

## Tasks

Complexity: S under 30 min, M under 2 h, L more than one session.

### Phase 0: records

- [x] **1. Records (M).** Revise ADR-0009's archetype list (four archetypes, no wizard, tablet support). Rewrite #41's issue text to match these decisions. Delete `client-vue3/DESIGN-BRIEF.md` and remove references to it. Update `tasks/ui-ux-redesign.md` task 6.
  - AC: owner signs off the ADR change; no doc or issue describes the old set, the wizard or Blueprint sizes.
- [x] **2. Follow-up issues (S).** Create GitHub issues for dashboard, report with export, and settings, linked to #33, each stating what it needs from the kit.
  - AC: three issues exist and are listed in #41 and #33.
  - Done: #103 dashboard, #104 report with export, #105 settings; linked by comment on #41 and #33. #41's title and text rewritten to these decisions (original saved before editing). ADR-0009 amended, `DESIGN.md` archetype list updated, `DESIGN-BRIEF.md` deleted (only historical task records still mention it), redesign task 6 marked done.

### Phase 1: foundations for touch and tablets

- [x] **3. Touch tokens (M).** Add coarse-pointer sizes to `DESIGN.md` (control and row action heights to 44px), wire a `pointer: coarse` variant through the token pipeline and Tailwind, and apply it to every kit control.
  - AC: pipeline and its tests pass with `--check`; on a touch viewport every interactive kit target measures at least 44px; desktop sizes unchanged and existing e2e tests still pass; owner reviews the `DESIGN.md` change.
  - Done: `control.height.touch` (44px) in `DESIGN.md`, emitted as `minHeight.touch` and `minWidth.touch`; the emitter refuses any value below 44px (tested). `touch:` variant is `(pointer: coarse)` in `tailwind.config.js`. Applied to Button, Input, FileUpload, Checkbox, RadioGroup, Select (field, clear and chip buttons through a 44px `::before` hit area, options), DatePicker (field, calendar button, month arrows, day cells), Tabs, Pagination, Dropdown items, Dialog close, Table sort headers. New `e2e/touch-targets.spec.ts` (later renamed `targets.spec.ts` and extended to the 24px desktop rule) measures the real hit area (element, `::before`, `label[for]`) of every enabled control on all seven harness views plus open select, calendar, menu and dialog: red first, now green on both tablet projects. `DESIGN.md` non-negotiable 1 now states the touch rule. Owner approved the `DESIGN.md` change (2026-11-13).
- [x] **4. Tablet test setup (S).** Add Playwright projects for an Android tablet in portrait (about 800×1280) and landscape (about 1280×800), with `hasTouch` and `isMobile`, Chromium only (owner doesn't know the model).
  - AC: the existing kit suite runs on all projects, and its failures are listed and fixed or assigned to a task here.
  - Done. **Deviation:** used Playwright's Galaxy Tab S9 presets (640×1024 portrait, 1024×640 landscape) instead of 800×1280, because current Samsung tablets report narrower CSS widths; a layout that works at 640px also works at 800px. Projects: `desktop`, `tablet-portrait`, `tablet-landscape`.
  - Found: `kit-harness.html` had no viewport meta, so tablets rendered it 980px wide; added (production `index.html` already had it).
  - Baseline on tablets: 9 failures. Dialog `xl` width correctly capped by the screen (test now expects the cap). Density tests now expect 44px on touch (`controlHeight`, `expectRowHeight` helpers); rows holding controls measure 44–46px on touch, so dense 32px rows only stay 32px on desktop. Tooltip hover test is desktop-only (touch tooltip test in task 5). Desktop-only by design: the legacy-layout FBC page (`lab-entry.spec.ts`). Assigned: `patient-desk.spec.ts` to task 10, `lab-desk.spec.ts` to task 16 (in portrait the lab test list covers the referral checkbox).
  - Calendar: with 44px days it is 384px tall and fits neither above nor below a field on a 640px-tall screen; it went 57px off the top. Interim fix: 8px collision padding and a height cap with scrolling inside, with tests that it stays on screen and every day stays reachable. Proper touch design needs an owner decision (see "Questions still open").
  - Results: lint clean, `npm test` 43/43, build passes, `npm run test:e2e` 336 passed and 81 skipped by design, 1008/1008 over three repeats. One existing radio keyboard test failed once under parallel load and passed 15/15 alone (flaky, pre-existing).
- [x] **5. Touch audit of the kit (M).** Check every kit component by tap: `KitSelect`, `KitDatePicker`, `KitDropdown`, `KitTabs`, `KitAccordion`, `KitDialog`, `KitPagination`, `KitTooltip`. Make no information depend on hover; document that `KitTooltip` is a supplement only.
  - AC: each component works by tap in the tablet projects; findings and fixes recorded here.
  - Done. `e2e/touch.spec.ts` taps through Select (open, filter, pick, clear), Checkbox and Radio by label, Tabs (disabled skipped), Accordion, Dropdown, Dialog (close button; stays open on a backdrop tap), Tooltip, Pagination, sorting and row selection.
  - **Date picker (owner decision):** on touch the calendar opens centred in a `KitDialog` (new `KitCalendar` on reka Calendar, new `useCoarsePointer`), with focus on the selected or current day and focus returned to the calendar button; desktop keeps the anchored dropdown with 8px collision padding. Tests: centred, picks a date, returns focus, axe clean, stays on screen, every day reachable.
  - **Tooltip finding:** reka-ui links tooltip text to its button only while open, and touch never opens it, so tooltip text is unreachable on tablets, screen readers included. The kit itself has no hover-only information; the README now says a tooltip may only ever be extra. The patient prototype's disabled reason (`title`) and navigation note move to tasks 10 and 13 as visible text.
  - Results: lint clean, `npm test` 43/43, build passes, e2e 1074/1074 over three repeats (276 skipped by design).

### Phase 2: design on real screens

- [x] **6. Shell and archetype designs (L).** Build the shell and each archetype in the kit harness with staff and stock fake data, in every state (empty, loading, error, validation error, disabled with reason, long content) at desktop, tablet landscape and tablet portrait. Send screenshots to the owner.
  - AC: owner approves each; `DESIGN.md` review gates 1–5 pass; any new token is proposed in prose first; the three narrow-table options shown side by side in portrait and the owner's choice recorded here.
  - **Built, waiting for owner review.** Harness: `kit-harness.html?view=archetypes&screen=list|form|detail|worklist`, with `table=scroll|columns|cards` and `state=empty|error`. Code in `src/prototypes/archetypes/` (fake data, outside the build) and `src/components/shell/`.
  - Exemplars use legacy fields: store items list (search, drug type, drug form, dosage form, vendor filters, bulk actions), add store item form, store item detail (Item detail, History, Logs tabs; legacy `EmployeeProfile.vue` is empty, so no staff profile exists to use), dispense queue (Today and Backlog, prescribed, dispensed and remaining, dispense quantity prefilled with what remains, locked with a visible reason when payment is pending).
  - Shell: sidebar from 1280px wide; below that (both tablet orientations) a top bar with a menu button opening a drawer. Search field always visible; the `/` hint shows only with a mouse.
  - Kit pieces added early because the designs need them (tests come in tasks 8 and 9): `KitNativeSelect`, `KitDrawer`, `KitPageHeader`, `KitErrorSummary`, `KitDescriptionList`, `useMediaQuery`. `KitTable` gained `sticky`, `hideBelow` and `minWidth`; numeric, mono and header cells no longer wrap. `KitBadge` keeps the sans font inside number cells.
  - **Found and fixed:** the `KitDialog` close button was 16px wide on desktop (`min-w-xs` doesn't exist in Tailwind), breaking the 24px rule. `e2e/targets.spec.ts` now also checks 24px on desktop.
  - Error summary lists field names (two columns from 640px); each field shows its own message.
  - **Owner review (2026-11-13):** wide tables in portrait use **cards**; landscape tablets keep the **menu drawer**; shell, list, form and detail **approved**. The dispense worklist was rejected as too basic: redesign it from the current pharmacy dispense screens.
  - **Owner feedback 2 (2026-11-13):** a side-by-side queue doesn't scale to 50 prescriptions a page. Decided: dispensing is a full-width paged queue (List archetype) plus a full-width prescription page (Detail archetype) with Previous / Next through the filtered queue and Back returning to the same page and filters. The worklist-with-pane archetype stays, documented for short lists only (for example tests in one lab sample).
  - **Dispense flow v3, approved by owner (2026-11-13).** All design screens are now approved. `DispenseQueueDesign.vue` (50 a page, table on desktop and landscape, cards in portrait, progress as percentage of quantity dispensed) and `DispensePrescriptionDesign.vue`; the split `DispenseWorklistDesign.vue` is deleted. `KitProgress` gained `valueText`. Axe clean on every design screen at all three sizes. Screenshots: `~/Desktop/ehmrs-archetype-review-3/`.
  - Superseded: the split-pane worklist redesign below.
  - **Worklist redesign (2026-11-13), superseded.** Rebuilt from the current `pharmacy/PrescriptionDetailUpdate.vue` and `prescriptions/PrescriptionsTable.vue`, without their emoji and boxed cards: count tiles; queue search plus status and source filters; queue rows with insurance or cash, drug and item counts, source, time and a progress bar; patient header (initials, hospital number, age, sex, phone, past prescriptions); money strip (paid by, total, patient pays, payer covers); Drugs and Additional items tabs with search and status filter; per line: dispense and payment status, progress, remaining, frequency, duration, route, unit price, patient and payer share, drug type, prescriber, dispenser; inline dispense form (prefilled with what remains, 1 to remaining) and return form (quantity and required reason, Head of Department and Super Admin only in the real screen). New `KitProgress`. Shell top bar made opaque. List defaults to cards in portrait.
- [x] **7. Gap list (S).** From the approved designs, list missing kit pieces with their reka-ui primitive or native element.
  - AC: every region maps to an existing or listed component.
  - Already built during design (tests due in tasks 8 and 9): `KitNativeSelect`, `KitDrawer` (reka Dialog), `KitPageHeader`, `KitErrorSummary`, `KitDescriptionList`, `KitProgress` (native `progress`), `useMediaQuery`, `KitTable` `sticky`/`hideBelow`/`minWidth`, `AppShell` and `ShellIcon`.
  - Still to add, all on native elements: `KitCardList` (portrait cards with selection, loading, error and empty states), `KitStatGrid` (count tiles and money strip), `KitRecordPager` (Previous, position, Next), `KitBackLink`, `KitFormSection` (heading plus responsive field grid), `KitActionBar` (sticky form actions).
  - Not kit components: the initials avatar (a decorative span) and the inline dispense and return forms (pharmacy-specific, built in the pharmacy issue).

### Phase 3: kit additions

- [x] **8. Native select (M).** `KitNativeSelect`.
  - AC: `v-model`, `label`, `error`, `disabled`, placeholder option, vee-validate binding, token styling, 44px on touch, axe clean, works inside `KitDialog`.
  - Done: `e2e/layout.spec.ts` (model, placeholder to `null`, error tied by `aria-describedby` and `aria-invalid`, disabled, focus ring) and `e2e/validation.spec.ts` (vee-validate `required` blocks submit until chosen). Keyboard and the open list are the browser's own. Used inside `KitDrawer` on the list design; a dialog case is left to the first real screen that needs one.
- [x] **9. Layout pieces (L).** Page header, empty state, description list, record banner, form section, action bar, error summary, drawer, and anything from task 7.
  - AC: keyboard and tap tests for interactive parts; axe clean; the error summary takes focus on a failed submit and each entry moves to its field; README updated.
  - Done: `KitCardList`, `KitStatGrid`, `KitRecordPager`, `KitBackLink`, `KitFormSection`, `KitActionBar` added; harness page `kit-harness.html?view=layout` and `e2e/layout.spec.ts` cover them plus `KitDrawer` (focus trap, Escape, focus return, tap close), `KitProgress`, `KitDescriptionList` and `KitErrorSummary`, on desktop and both tablet sizes; the page is also in the size check. The design screens now use these components. README has a "Page structure" section. Results: lint clean, build passes, `npm test` 43/43, e2e 1230/1230 over three repeats.

### Phase 4: shell and archetypes

- [ ] **10. App shell (L).** Per the shell section.
  - AC: skip link and landmarks; `/` ignored while typing; focus to the heading on route change; drawer on tablet traps focus and closes on Escape and on navigation; prototypes run on the shell and their specs pass.
- [ ] **11. Route state (M).** `useRouteState`.
  - AC: filters, page, tab and selection survive refresh and back; invalid or tampered query values fall back to defaults instead of breaking the page or reaching `load` unchecked; changing state replaces rather than floods history.
- [ ] **12. Validation setup (M).** Register `@vee-validate/rules` globally with the legacy vee-validate 2 English messages, transcribed from the v2 locale the legacy client loads.
  - AC: a table in this file lists every rule used in legacy with its v2 message and the new output, and they match; custom legacy messages pass through unchanged.
- [ ] **13. List with filters (L).** `ListPage.vue`.
  - AC: the A contract; filter drawer on tablet; skeleton while loading.
- [ ] **14. Entry form (L).** `EntryForm.vue` and `useEntryForm.ts`, page and dialog hosts.
  - AC: the B contract; unsaved changes prompt on route leave, dialog close and reload, and not after a successful save; focused field and error summary stay visible with the on-screen keyboard; numeric fields set `inputmode`.
- [ ] **15. Detail with tabs (L).** `DetailPage.vue`.
  - AC: the C contract.
- [ ] **16. Worklist with detail pane (L).** `WorklistPage.vue`.
  - AC: the D contract, including the portrait list-then-item flow with a way back that keeps the list position.

### Phase 5: tests

- [ ] **17. Binding-contract tests (L).** Vitest and `@vue/test-utils`.
  - Form: each rule in a rules object fires with its legacy message and no other rule does; a field without a rule never blocks submit; the handler receives exactly the bound values; dependent rules switch with their condition; unsaved changes detection.
  - List: `load` receives exactly the view's `{ page, pageSize, sort, ...filters }`; filter change resets to page 1; out-of-date responses dropped; URL round trip.
  - Detail: a lazy panel's loader isn't called before its tab opens; tab follows the URL.
  - Worklist: selection follows the URL; locked items reject edits.
  - AC: green; tests check inputs and outputs, not markup.
- [ ] **18. Harness e2e (L).** Playwright per archetype and the shell on desktop and both tablet projects: keyboard paths on desktop, tap paths on tablet, axe in each state.
  - AC: green three times in a row; no console errors or warnings.

### Phase 6: manual accessibility pass

- [ ] **19. Script (S).** Step-by-step VoiceOver and keyboard script for the shell, the four archetypes and the lab entry prototype, including radio selection with real arrow-key presses, plus a findings table.
- [ ] **20. Owner runs the pass (M).** In Chrome on macOS with VoiceOver.
  - AC: findings in the PR; each fixed or deferred with the owner's agreement.

### Phase 7: documentation

- [ ] **21. Archetype docs (M).** `components/archetypes/README.md`: when to use which, props and slots, the binding contract, tablet behaviour, and a worked example of a legacy view's frozen script driving an archetype.
- [ ] **22. Route-to-archetype map (M).** Add an archetype column to the route table in `information-architecture.md`.
  - AC: every route has an archetype, "bespoke" or "removed".

### Phase 8: verify and PR

- [ ] **23. Verify (S).** `npm run lint`, `npm run build` (no harness or prototype code in `dist`), `npm test`, `npm run test:e2e` three times across all projects, token pipeline `--check`.
- [ ] **24. Screenshots and PR (S).** Screenshots of every archetype and state at the three sizes to the owner before the PR; PR into `svsh_branch` with results and VoiceOver findings.

## Questions still open

- **Date picker on touch:** decided 2026-11-13, the calendar opens centred over a dimmed page on touch screens (like Android's date dialog); desktop keeps the anchored dropdown. Task 5.

## Follow-up decisions (2026-11-13)

- **Narrow tables in portrait:** owner wants to see the options first. Task 6 builds sideways scroll with a pinned first column, hidden low-priority columns, and stacked cards in the harness, and the owner picks from screenshots.
- **Tablet model:** not known. Tests use the Galaxy Tab S9 presets, 640×1024 portrait and 1024×640 landscape (task 4, see deviation). Revisit if the hospital names a model, especially a 7–8 inch one.

## Out of scope

- Real API wiring, store ports and route views; domains wire archetypes in #42 and #45 onward.
- The patient chart's sections (#46) and the other high-risk screens.
- Dashboard, report with export and settings (their own issues, task 2).
- Wizards, infinite scroll, AI patterns, dark mode, RTL.

## Review

To be written when the work is done.
