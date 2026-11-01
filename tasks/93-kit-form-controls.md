# Issue 93 — Kit 1/3: form controls and lab entry check

Issue: #93 · Parent: #33 · ADR-0010, ADR-0007 · Branch: `93-kit-form-controls` from `svsh_branch`
Status: **tasks 1-10 done; PR to `svsh_branch` open for owner merge**

## Approach

Build on a new branch from `svsh_branch` and copy only the useful spike files. The spike
branch is not used as a base: it predates ADR-0010, still contains PrimeVue, and is marked
as not for merging.

| From the spike | Action |
| --- | --- |
| `kit/KitSelect.vue`, `kit/KitDate.vue`, `kit/useLatest.ts` | Copy, then fix known issues |
| `kit/useGridNavigation.ts` | Copy: the lab check needs it, and #94 reuses it |
| `spike-e2e/`, `playwright.config.ts` | Adapt into the permanent e2e setup |
| `kit/KitDataTable.vue` | Leave for #94 |
| `SpikeApp.vue`, `mockApi.ts` | Replace with a test harness page |

## Findings that shape the work

1. **The lab forms need less of the kit than #93 assumed.** Among the forms sampled, none
   uses a select or date picker. FBC is a table of text inputs plus a comments textarea,
   with a two-row header, colspans and conditional rows. So the lab check tests Input,
   Textarea, grid navigation and density, and says nothing about Select or DatePicker.
2. **The check needs a table before #94 exists.** It uses a plain Tailwind table in the
   harness. It is not a kit component, and #94 still owns the Table.
3. **vee-validate is not installed** in `client-vue3`. #93 adds `vee-validate` and
   `@vee-validate/rules` (ADR-0007), plus `@internationalized/date` as a direct dependency.
4. **There are no lab fixtures.** Only `auth.json` exists. The check uses the FBC row
   definitions copied from `FBCForm.vue`, which contain no patient data. It needs no API.
5. **File upload is rare and simple.** The only usage found is the logo upload in
   `SystemSettings.vue`, so FileUpload stays a styled native `type="file"` input.

## Lab entry check: pass criteria

Fixed before building. Runs against a copy of FBC's real rows, in Chromium.

- L1 All 9 main rows, the differential rows and morphology rows render with the legacy
  labels, ranges and units, including the two-row header and colspans.
- L2 Result rows are 30px tall with 28px inputs at 12px text, and range columns stay readable
  at a 1280px wide viewport.
- L3 Keyboard only: enter all main rows using Enter and arrow keys, without the mouse, and
  every value reaches the model.
- L4 Tab reaches the comments textarea, and typed comments reach the model.
- L5 In `ValidationSection` and `ApprovalSection`, inputs are disabled and empty rows are
  hidden, matching `FBCFormRow.vue`.
- L6 axe reports 0 serious or critical violations in entry and approval states.

**Fail rule:** if L1, L3 or L5 cannot be met without patching reka-ui, stop and raise the
PrimeVue 4 fallback with the owner. Other gaps get a named fix in the PR.

This check does not migrate the laboratory domain, port its store, or call the API.

## Tasks

- [x] **1. Test setup (S).** Add `@playwright/test`, `axe-core`, `@axe-core/playwright`,
      `npm run test:e2e` and a harness page excluded from the production build.
      *Accept:* one smoke test passes locally; `vite build` output contains no harness.
- [x] **2. Button (S).** Primary, success, danger, warning; `sm` default, `xs`, `lg`;
      disabled and loading states.
      *Accept:* rendered foreground is at least 4.5:1 at rest, hover and active.
- [x] **3. Input and Textarea (S).** Label, error text, disabled, numeric style, `v-model`.
      *Accept:* 28px input, visible focus, error tied to the field with `aria-describedby`.
- [x] **4. Lab entry check (M).** Harness and tests for L1-L6, using tasks 2-3 and
      `useGridNavigation`. **Report the result to the owner before continuing.**
      *Accept:* L1-L6 pass, or the fail rule is raised.
- [x] **5. Checkbox, Radio, FileUpload (S).** reka-ui for Checkbox and Radio; native file input.
      *Accept:* keyboard and axe tests pass; hit area at least 24px.
- [x] **6. Select (M).** Port the spike and rename to the kit's conventions.
      *Accept:* spike S1-S6 pass; a test fails if `aria-controls` or `aria-activedescendant`
      goes stale on close.
- [x] **7. DatePicker (M).** Port the spike and fix popover placement.
      *Accept:* spike D1-D4 pass; the popover opens under its field, asserted by position.
- [x] **8. vee-validate binding (S).** Add the packages and prove every form control
      enforces a `rules` object.
      *Accept:* for each control, an invalid value blocks submit and shows the message.
- [x] **9. Usage docs (S).** `client-vue3/src/components/kit/README.md`: props, events, and
      when to use each component.
      *Accept:* every component is covered.
- [x] **10. Verify and PR (S).** `npm run lint`, `npm run build`, `npm test`,
      `npm run test:e2e` three times, and `--check` in the token pipeline.
      *Accept:* all pass; local results recorded in the PR, which targets `svsh_branch`.

## Decisions (recommended defaults, change if you disagree)

- **Location:** `client-vue3/src/components/kit/`, with short names such as `KitButton.vue`.
- **`test:e2e` stays out of `npm test`,** so the fast unit suite stays fast.
- **Chromium only** for now. Add another browser if the hospital's machines require one.

## Out of scope

Table, Pagination, Badge and Skeleton (#94). Dialog, Tabs and other overlays (#95). Page
archetypes (#41). Laboratory store or view migration (#51-#53).

## Review

### Lab entry check (task 4)

L1-L6 pass in Chromium using FBC rows extracted from `FBCForm.vue`. At that point `npm run test:e2e` had 20 tests, 60/60 across three repeats. Breaking grid navigation, read-only behaviour, row height, or the warning foreground each failed the matching test.

Deliberate differences from legacy, all template-level: morphology and comments cells use `colspan="5"` because legacy's 6 overflowed the 6-column table; the blank second-row header cells became `rowspan`, because empty header cells are an accessibility problem.

Not proven: the real store and API, the 500ms debounced `emitResult`, the other lab forms (Semen has the most lines), and screen readers.

### Summary

Added Button, Input, Textarea, Checkbox, RadioGroup, FileUpload, Select and DatePicker in `client-vue3/src/components/kit/`, with usage docs, a browser test setup, and a harness page outside the production build.

### Decisions and deviations

- **Extra Select behaviour beyond the plan,** found by comparing the spike with legacy `vue-select`: shows the label of a saved value (`initialOptions`), clears a single value with a keyboard-reachable button, and shows "Search failed" instead of "No results found".
- **Hit area fix:** checkbox and radio targets measured 22px because the pseudo-element sits inside the border. Both now measure 24px and are tested.
- **e2e type check:** `tsconfig.e2e.json` runs with no emit as part of `test:e2e`. Adding e2e to the composite config compiled stray `.js` files that broke lint and Playwright.
- **Validation messages:** `@vee-validate/rules` returns no message text. The harness supplies its own. Domain issues must transcribe legacy messages under ADR-0007.

### Testing evidence

- `npm run test:e2e`: 39 tests, 117/117 across three repeats in Chromium.
- `npm run lint`: 0 errors, 156 formatting warnings. `npm run build`: exit 0, no harness code in `dist`. `npm test`: 40/40. Token `--check`: OK.
- Negative controls, each failing its test: no grid navigation, not read-only, wrong row height, wrong warning foreground, no stale-response guard, no ARIA override, centered popover, range not enforced, error not shown.
- Screenshots reviewed for FBC entry, pickers with the calendar open, and validation errors.

### Limitations

- reka-ui selects a radio in a timer after arrow-key focus, and stops once the key is released. A zero-length synthetic key press can miss it, so the test holds the key for 50ms. Human presses were not tested separately.
- Screen readers, other lab forms, the real store and API remain untested.
- `min-h-sm` and `h-[26px]` values inside Select are fixed for the `sm` size; there is no `xs` or `lg` Select yet.
- Chromium only. No CI by owner decision, so all tests run locally.

### Impact

Additive: new kit directory, `e2e/`, and dependencies (`vee-validate`, `@vee-validate/rules`, `@internationalized/date`, and Playwright and axe for testing). No views use the kit yet.

### Follow-up

#94 and #95 are unblocked once this merges, and reuse `useGridNavigation`, `useLatest` and the harness.
