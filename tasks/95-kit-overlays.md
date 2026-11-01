# Issue 95 — Kit 3/3: overlays and layout

Issue: #95 · Parent: #33 · ADR-0010 · Branch: `95-kit-overlays` from `svsh_branch` (`7eeb8744`)
Status: **all tasks done; PR open**

## Findings that shape the work

1. **Legacy modals are opened from state.** They use `v-model` with `hide-footer`, and I found no `$bvModal` calls. `KitDialog` therefore centres on `v-model:open`, with no trigger slot. The button that opens it lives in the parent, so focus return has to be tested against that button.
2. **Most sized modals are large.** Of the 21 with a set size, 15 are `xl`, 4 `lg` and 2 `sm`. Long content must scroll inside the dialog with the title and actions staying visible.
3. **Closing by clicking outside can lose typed work.** Many legacy modals hold validated forms, and a quick search found only 2 that opt out of closing this way. See decision A.
4. **Confirmations are promise-shaped.** 29 of the 36 files that call `Swal.fire` ask for confirmation in the form `Swal.fire({...}).then(result => ...)`. A promise API lets the frozen scripts translate almost line for line. It also avoids the bug found in the `PatientSearch` prototype, where clearing pending state on close lost the action.
5. **One-way Swal messages already have a home.** `common/notify.ts` and `AppToaster` exist, so those calls are not part of this issue.
6. **Tabs mix lazy and non-lazy.** Legacy has both `<b-tab lazy>` and plain `<b-tab>`. reka-ui removes hidden panels by default, which would wipe typed values when a user switches tabs. The kit keeps panels mounted unless `lazy` is set. The same applies to the accordion. Tabs also appear nested.
7. **Tooltips are almost all hover-only directives.** There are about 140 `v-b-tooltip` uses, many on icon buttons. A tooltip doesn't give a button an accessible name, so the docs must require `aria-label` on icon-only buttons.
8. **Many legacy "dropdowns" aren't menus.** The `b-dropdown-text` uses (64) outnumber `b-dropdown-item` lines (7). The one I sampled is a Metronic header panel, which belongs to the app shell, and the rest get checked in task 6. `split` appears once, and a button beside a dropdown replaces it.
9. **Issue text is out of date.** #95 still says `sm` is 28px with 12px text. Direction A has 38px and 14px.

## Components

| Piece | Built on | Main API |
| --- | --- | --- |
| `KitDialog` | reka Dialog | `v-model:open`, `title`, `description`, `size` (`sm` 400, `md` 520, `lg` 800, `xl` 1120, capped by the viewport), `closeOnBackdrop`, `closeOnEscape`; default and `footer` slots; emits `opened`, `closed` |
| `useConfirm` + `KitConfirmHost` | reka AlertDialog | `confirm({ title, text, confirmLabel, cancelLabel, severity })` returns `Promise<boolean>`; one host mounted at app level |
| `KitTabs` | reka Tabs | `v-model`, `tabs` (`value`, `label`, `disabled`, `lazy`), `label`; `panel-<value>` slots |
| `KitAccordion` | reka Accordion | `v-model`, `items` (`value`, `title`, `disabled`, `lazy`), `multiple`, `headingLevel`; `item-<value>` slots |
| `KitTooltip` | reka Tooltip | `text`, `side`; default slot holds one focusable element |
| `KitDropdown` | reka DropdownMenu | `label`, `severity`, `size`, `items` (`value`, `label`, `disabled`, `danger`, `separatorBefore`); `trigger` slot; emits `select` |

Styling comes from existing tokens: `radius.lg` and `shadow.lg` for dialogs, `shadow.md` for menus. The `z-40` and `z-50` layers already used by `KitSelect` and `KitDatePicker` stay, and I only add a token if testing shows one is missing.

## Tasks

- [x] **1. Dialog (M).** Build `KitDialog` and its harness view.
  - AC: focus stays trapped, Escape closes, focus returns to the opening button, long content scrolls with title and actions visible, the two close props work, and axe is clean when open and closed.
- [x] **2. Confirm (M).** Build `useConfirm` and `KitConfirmHost`, and replace the direct AlertDialog in `PatientSearch.vue`.
  - AC: focus starts on Cancel, Escape and Cancel resolve `false`, Confirm resolves `true`, a second call waits for the first, and removing the host resolves any open call `false`. Focus moves somewhere sensible if the opening button was removed by the action. `patient-desk.spec.ts` still passes.
- [x] **3. Tabs (M).** Build `KitTabs`.
  - AC: Arrow, Home and End keys move between tabs and skip disabled ones, a parent can change the tab, a typed value survives switching on a non-lazy tab, a lazy panel isn't rendered until opened, nested tabs don't react to each other's keys, and many tabs scroll instead of wrapping off screen.
- [x] **4. Accordion (S).** Build `KitAccordion`.
  - AC: Enter, Space and arrow keys work, single and multiple modes work, parent control works, panel state is kept unless `lazy`, and the animation respects reduced motion.
- [x] **5. Tooltip (S).** Build `KitTooltip`.
  - AC: appears on hover and on keyboard focus, Escape dismisses it, the pointer can move onto it, and it is linked to its trigger by `aria-describedby`.
- [x] **6. Dropdown (M).** Build `KitDropdown`.
  - AC: Enter, Space and arrow keys and type-ahead work, disabled items are skipped and can't be selected, Escape returns focus to the trigger, and axe is clean when open.
- [x] **7. Layering (M).** Add one test view that combines the overlays. Screens depend on these combinations, so each gets a real test.
  - AC: a Select and a DatePicker open above a Dialog and can be used. Escape closes only the top layer, including a Tooltip inside a Dialog. A Confirm opens above a Dialog. A Dropdown item opens a Dialog, leaving the page clickable and focus correct after closing. The page doesn't shift when scrolling locks. Axe is clean in each state, as reka's `aria-hidden` handling tripped axe with Select earlier.
- [x] **8. Design check (S).** Screenshot every component in a real browser and send them to you before the PR.
- [x] **9. Docs (S).** Add props, events and a legacy mapping to the kit README, and note overlays in `DESIGN.md` if anything changes.
  - AC: `b-modal`, `Swal.fire`, `b-tabs`, `b-collapse`, `v-b-tooltip` and `b-dropdown` are each mapped, with the `aria-label` rule stated.
- [x] **10. GitHub issues (M).** Make GitHub the source of truth.
  - #95: correct the control size.
  - #33: remove "PrimeVue 4" from the title and reference Direction A.
  - #41 and #42: reference Direction A, and #42's check becomes behaviour and data.
  - #45–#67: change "smoke vs legacy" to behaviour and data, not layout. #45 and #51 also link the approved prototypes.
  - `tasks/ui-ux-redesign.md` becomes a record only.
- [x] **11. Verify and PR (S).** Run `npm run lint`, `npm run build`, `npm test` and `npm run test:e2e`, with the e2e suite repeated three times, and record the results in the PR.

## Owner decision

**A. Clicking outside a dialog.** Legacy closes, which can lose typed work. The owner chose to keep it open: Escape and the X button still close it, and `closeOnBackdrop` turns closing on where a dialog has nothing to lose. This is a deliberate behaviour change from legacy.

## Out of scope

- Moving legacy screens onto these components, which happens in each domain issue.
- One-way Swal messages (finding 5).
- Split buttons and the Metronic header panels (finding 8).

## Review

**Summary.** Added `KitDialog`, `useConfirm` with `KitConfirmHost`, `KitTabs`, `KitAccordion`, `KitTooltip` and `KitDropdown`, with a harness view, 30 browser tests and a unit test file. `PatientSearch` now uses `useConfirm`.

**Deviations and technical decisions**

- `KitDropdown` is non-modal. reka-ui's modal menu failed the axe `aria-hidden-focus` check.
- `KitDropdown` sends `select` after the menu closes and focus is back on its button, so a dialog opened from a menu returns focus correctly.
- `KitDialog` handles outside clicks on its overlay. Closing through reka-ui's outside-click event did not work in testing.
- `KitTooltip` reopens after keyboard focus scrolls its element into view, because reka-ui closes tooltips on scroll. Repeat runs exposed this.
- Closed accordion rows were 12px too tall because hidden content kept its padding. The padding moved to an inner element, with a test.
- `KitSelect` used an off-token blue highlight, now `primary-subtle`.
- Task 6 did not review the remaining `b-dropdown-text` uses individually. Header panels are left for the app shell work, and each domain issue maps its own dropdowns.

**Testing.** `npm run lint` clean, `npm run build` passes, `npm test` 42/42, `npm run test:e2e` 126/126, and 378/378 over three repeats. Overlay tests also fail on any console error or warning.

**Impact.** No production screen uses these components yet. The `KitSelect` highlight colour is the only change to an existing kit component.

**Limits.** No manual screen reader pass, which #41 covers. `KitConfirmHost` isn't mounted in `App.vue` yet, and the first real screen that needs it should add it.
