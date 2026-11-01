# Issue 94 — Kit 2/3: data display and lab form coverage

Issue: #94 · Parent: #33 · ADR-0010 · Branch: `94-kit-data-display` from `svsh_branch` (`5314803f`)
Status: **task 8 removed by the owner; tasks 1-7, 9 and 10 done**

**Owner correction (2026-11-01):** the system gets a new UI/UX design, so legacy forms are not a layout reference. The owner chose to keep the general components and remove the lab form pages. Lab entry is designed first and built afterwards.

## Findings that shape the work

1. **Legacy tables are simple.** No `.vue` file under `client/src/view` uses `rowspan`, and 98
   `colspan` uses are the same `colspan="9"` cell, matching the 98 "no records" cells found. A
   column-driven native table fits. FBC's two-row header is the exception, handled by the
   result grid.
2. **Sorting and selection are rare.** Sort state appears in 2 files, select-all in 4 (2 of them
   in shared utilities). `TableSkeleton` draws a checkbox on every table, but that is decoration.
3. **Spike selection must change.** It selects by clicking a row, which a keyboard cannot do,
   and puts `aria-selected` on a plain table row, which ARIA does not support outside grids.
   The kit uses a checkbox column instead.
4. **The spike has no error state.** A failed request would look like "No records found". On a
   clinical screen, "the request failed" and "there are no records" must look different.
5. **Legacy pagination has defects to leave behind.** `<a href="#">` with `disabled` still fires
   clicks, so Previous on page 1 can request page 0. "Displaying 10 of 57" shows the page size
   even on a shorter last page. Page size is local state and can drift from the parent.
6. **Badge colors are missing.** Legacy uses `info` (37 uses, e.g. Cleared, Returned; purple
   `#8950FC`), `dark` and `secondary`. Tokens only have primary, success, warning and danger.
7. **The grid helper already suits these forms.** `onGridKeydown` only acts on `input`, so arrow
   keys still move the caret inside comment textareas. Widal needs two columns, O and H.
8. **Legacy form defects, found while reading the rows:**
   - **Widal comments:** `shouldCommentRow` tests `section === 'ValidationSection' && section ===
     'ApprovalSection'`, which is never true. Comments can't be entered unless a saved one
     exists. UrineSwab's equivalent uses `!==`, so this looks like a typo. See decision A.
   - **Semen stray row:** the antibiotics list has an `isHeader` entry that the row component
     ignores. It renders a second "Antibiotic Sensitivity" row with an input bound to
     `semenAnalysis[undefined]`, so typing there adds an `undefined` key to the result. See
     decision B.
   - **Semen comments in review:** Comments sits inside the antibiotics group, so a saved comment
     is hidden in validation and approval when no antibiotic has a value. See decision B.
   - **Semen empty heading:** "Method of Production" also checks three time fields that belong to
     another group, so in review the heading can show with no rows beneath it. Kept as is, and
     passed to #51-#53 as a note, because it hides no data.
   - **UrineSwab header:** the specimen cell has `colspan="7"` in a 2-column table. Corrected to
     2, like the FBC overflow in #93.

## Components

| Piece | Purpose | Main API |
| --- | --- | --- |
| `KitTable` | Native table for list screens | `label`, `columns`, `rows`, `rowKey`, `groupKey`, `sort`, `loading`, `error`, `dense`, `maxHeight`, `selectable`, `v-model:selected`; `cell-<id>` and `empty` slots |
| `KitPagination` | Paging on reka-ui Pagination, page size on reka-ui Select | `page`, `pageSize`, `total`, `shownCount`; emits `update:page`, `update:pageSize` |
| `useServerTable` | Page, size, sort, rows, total, loading, error; built on `useLatest` | `load` function taking `{ page, pageSize, sort }` |
| `KitBadge` | Status labels | `severity`, `variant` (`subtle`, `solid`) |
| `KitSkeleton` | Loading placeholders | `variant` (`lines`, `table`, `form`), `rows`, `columns` |
| `KitResultGrid` | Lab entry: table, caption, grid keyboard, density | `label`; `head` and default slots |

No new runtime dependency. TanStack stays out.

## Tasks

Complexity: S under 30 min, M under 2 h.

- [x] **1. Badge tokens (M).** Apply decision C in `DESIGN.md`: `info.*`, and neutral pairs for
      `dark` and `secondary`. Wire the group through the pipeline if it does not already accept
      it, declare each pair, regenerate.
      *Accept:* a failing color stops the pipeline (negative control); `npm run check` and tool
      tests pass.
- [x] **2. Badge (S).** All legacy severities, subtle and solid, always with visible text.
      *Accept:* each rendered pair measures at least 4.5:1 in Chromium; axe clean.
- [x] **3. Skeleton (S).** `lines` (legacy `DefaultSkeleton`), `table`, `form`; hidden from
      assistive tech; animation stops under reduced motion.
      *Accept:* table and form variants occupy the same row height as the real content;
      reduced-motion test passes.
- [x] **4. Table (M).** Port the spike without TanStack. Add error state and checkbox selection,
      replace the fixed height with `maxHeight`, and fix the sticky header's border, which
      `border-collapse` loses while scrolling.
      *Accept:* spike T1, T3-T6 pass on rendered rows; the error state is distinct from empty;
      selection and select-all work by keyboard; axe clean in every state.
- [x] **5. Pagination (M).** First, Previous, up to 6 page numbers, Next, Last; sizes 10, 20, 30,
      50, 100; "Displaying N of T records" using the real row count.
      *Accept:* disabled ends can't emit; keyboard tests pass; 28px controls; axe clean.
- [x] **6. `useServerTable` (S).** Sort or size changes return to page 1. If the last page empties,
      load the new last page. A failure keeps the previous rows and sets `error`.
      *Accept:* T2 passes with `aria-sort` asserted; stale response test fails when the guard is
      removed; failure then retry recovers.
- [x] **7. Result grid (S).** Extract `KitResultGrid` and move the #93 FBC harness onto it.
      *Accept:* existing L1-L6 pass unchanged; focus outline visible, asserted by computed style.
- [x] **8. Lab form coverage.** Removed by owner decision; the legacy-shaped test pages and spec were deleted.
- [x] **9. Docs (S).** README: props and events, plus legacy `<table>`, `<pagination>`, status
      `label-*` and `*-skeleton` mappings.
      *Accept:* every new component and each legacy mapping is covered.
- [x] **10. Verify and PR (S).** `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e` three
      times, token `--check`, negative controls, screenshots reviewed.
      *Accept:* all pass; results recorded in the PR against `svsh_branch`. #94 closed by hand after
      merge, since `Closes` doesn't fire on this base.

## Decisions for the owner

- **A. Widal comments. Recommended: fix.** Show the row during entry, as UrineSwab does, so
  results can carry comments. The harness and #51-#53 would both record this as a deviation.
- **B. Semen stray row and hidden comments. Recommended: fix both.** Remove the stray row so no
  `undefined` key can be saved, and show saved comments in review regardless of antibiotics. If
  old results already hold an `undefined` value, it stays in the data but is no longer displayed.
- **C. Badge colors. Recommended: add a purple `info` group and map both `dark` and `secondary`
  to a neutral gray.** Cleared and Returned stay visibly distinct from `primary`, as today.

## Out of scope

Dialog, Tabs and other overlays (#95). Page archetypes and manual screen reader testing (#41).
Laboratory store, API and views, including the 500ms debounce (#51-#53). Row virtualization and
client-side sorting: no sampled legacy screen needs them.

## Review

### Summary

Added `KitTable`, `KitPagination`, `KitBadge`, `KitSkeleton`, `KitResultGrid` and `useServerTable`, new `info` and `neutral` color tokens with a purple ramp, and `hideLabel` and `indeterminate` on `KitCheckbox`.

### Deviations

- **Lab forms removed** by the owner, as above. `KitResultGrid` and the merged FBC test page remain as keyboard tests only; the FBC page's layout is not a design reference.
- **Page size uses a native `<select>`, not reka-ui Select.** reka-ui hides the rest of the page with `aria-hidden` while open, which axe reports as serious (`aria-hidden-focus`), and the kit rules forbid patching it.
- **Pagination details still come from legacy:** up to 6 page numbers and sizes 10-100. They are props or easily changed, and the new design can revisit them.

### Carried to #51-#53 as behaviour decisions the owner approved

- Widal comments can be entered during result entry.
- Semen's stray input that saved under an `undefined` key is removed; old values stay stored but are not displayed.
- Saved Semen comments show in validation and approval regardless of antibiotics.

### Testing evidence

See the PR for final results. Negative controls that failed as intended: stale guard removed, selected row color, last-page recovery, reduced motion, grid navigation. The sticky border control first passed wrongly, so the test now also asserts `border-collapse: separate`.

### Limitations

Screen readers are not tested (#41). The sticky border is asserted through CSS and reviewed in a screenshot, not measured while scrolling.
