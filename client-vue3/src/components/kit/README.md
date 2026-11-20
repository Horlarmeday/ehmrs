# Component kit (ADR-0010)

Views use these components instead of building their own. If one is missing, add it here with keyboard and axe tests. Colors come only from the `DESIGN.md` tokens.

Run the browser tests locally with `npm run test:e2e`. Test pages live in `__harness__/` at `kit-harness.html`, which is not part of the production build.

Every form control takes `label`, `error` and `disabled`, and works with `v-model`. Pass a vee-validate field's `value` and `errorMessage` (ADR-0007).

| Component         | Use for                                                  | Other props                                                                                                                                                                   | `v-model`                                               |
| ----------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `KitButton`       | Actions                                                  | `severity` (`primary` for the one main action in a view, `secondary`, `accent` for row actions, `success`, `danger`, `warning`), `size` (`xs`, `sm`, `lg`), `type`, `loading` | None                                                    |
| `KitInput`        | Single-line text. Replaces `form-control` inputs         | `hideLabel`, `numeric` for mono tabular values; other attributes reach the `<input>`                                                                                          | `string`                                                |
| `KitTextarea`     | Multi-line text                                          | `hideLabel`, `rows`; other attributes reach the `<textarea>`                                                                                                                  | `string`                                                |
| `KitCheckbox`     | One on/off choice                                        | None                                                                                                                                                                          | `boolean`                                               |
| `KitRadioGroup`   | One choice from a few visible options                    | `options` as `{ value, label }[]`                                                                                                                                             | `string`                                                |
| `KitSelect`       | Async search. Replaces `v-select`                        | `search`, `multiple`, `clearable`, `initialOptions`, `placeholder`, `hideLabel`                                                                                               | The option's value, an array when `multiple`, or `null` |
| `KitDatePicker`   | Dates. Replaces `datepicker` and `b-form-datepicker`     | `min`, `max` as `YYYY-MM-DD`                                                                                                                                                  | `YYYY-MM-DD` or `null`                                  |
| `KitFileUpload`   | File selection                                           | `accept`, `multiple`                                                                                                                                                          | `File[]`                                                |
| `KitNativeSelect` | A short fixed list of options. Replaces plain `<select>` | `options` as `{ value, label, disabled }[]`, `placeholder` (an empty option that sets `null`), `hideLabel`                                                                    | `string` or `null`                                      |

`KitButton` emits normal `click` events. `sm` (38px) is the default, `xs` (30px) is for actions inside rows, and `lg` (44px) is for a main action on an isolated page. A `type="submit"` button doesn't take focus on mouse down, so the field being edited keeps focus until the click: otherwise its blur validation can remove an error message, move the button and lose the click.

## Mapping from `v-select`

- `:reduce` is not needed. `v-model` already holds the option's `value`.
- `@search` becomes the `search` prop, which returns options as `{ value, label }[]`. The kit handles debouncing and ignores out-of-date responses.
- When editing a saved value, pass its option in `initialOptions` so its label shows before any search.

## Data display

| Component            | Use for                                          | Props                                                                                                                                                                                                                                                                                                                                                                                            | Events and slots                                                                                  |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `KitTable`           | Lists of records in a native `<table>`           | `label`, `columns` (`id`, `header`, `numeric` for amounts, `mono` for identifiers, `compact` for cells holding controls, `sortable`), `rows`, `rowKey`, `groupKey`, `sort`, `loading`, `error`, `dense`, `maxHeight`, `selectable`, `rowLabel`, `emptyText`, `skeletonRows`, `minWidth`. Columns also take `sticky` (pinned while the table scrolls sideways) and `hideBelow` (`md`, `lg`, `xl`) | `v-model:selected`, `update:sort`, `retry`; `cell-<id>` slot with `row` and `value`; `empty` slot |
| `KitCardList`        | The same records as cards, for portrait tablets  | `label`, `rows`, `rowKey`, `loading`, `error`, `selectable`, `rowLabel`, `emptyText`                                                                                                                                                                                                                                                                                                             | `v-model:selected`, `retry`; default slot with `row`; `empty` slot                                |
| `KitStatGrid`        | A row of counts or amounts                       | `items` (`label`, `value`, `detail`, `mono`, default mono), `wideAt` (`md` or `lg`)                                                                                                                                                                                                                                                                                                              | None                                                                                              |
| `KitProgress`        | How much of something is done                    | `label`, `value`, `max`, `severity`, `valueText` (read out instead of "3 of 6")                                                                                                                                                                                                                                                                                                                  | None                                                                                              |
| `KitDescriptionList` | Label and value pairs for one record             | `items` (`label`, `value`, `mono`), `empty` (shown for a missing value, default "Not recorded")                                                                                                                                                                                                                                                                                                  | None                                                                                              |
| `KitPagination`      | Paging for a server-side list                    | `page`, `pageSize`, `total`, `shownCount`, `label`, `pageSizes`, `maxButtons`                                                                                                                                                                                                                                                                                                                    | `update:page`, `update:pageSize`                                                                  |
| `KitBadge`           | Status labels, always with visible text          | `severity` (`primary`, `success`, `warning`, `danger`, `info`, `neutral`), `variant` (`subtle`, `solid`, `dot`)                                                                                                                                                                                                                                                                                  | Default slot                                                                                      |
| `KitSkeleton`        | Loading placeholders, hidden from assistive tech | `variant` (`lines`, `table`, `form`), `rows`, `columns`, `dense`                                                                                                                                                                                                                                                                                                                                 | None                                                                                              |
| `KitResultGrid`      | A table of inputs with grid keyboard movement    | `label`                                                                                                                                                                                                                                                                                                                                                                                          | `head` and default slots                                                                          |

`useServerTable(load, options)` holds `page`, `pageSize`, `sort`, `rows`, `total`, `loading` and `error`, and provides `reload`, `setPage`, `setPageSize` and `setSort`. Changing size or sort returns to page 1, a failed request keeps the current rows, and a page that no longer exists moves to the new last page. Call `reload()` once to load the first page.

## Mapping from legacy components

These map behaviour only. Legacy screens are not a reference for layout or format.

- `<table>` with a "no records" `colspan` row: `KitTable`, which has its own empty state.
- `<pagination>`: `total-pages` is calculated from `total` and `pageSize`. `current-page` becomes `page`, `per-page` becomes `pageSize`, `@pagechanged` becomes `update:page`, and `@changepagecount` becomes `update:pageSize`.
- `label-light-*` and `label-*`: `KitBadge` with `variant` `subtle` or `solid`. `dark` and `secondary` become `neutral`.
- `DefaultSkeleton`, `TableSkeleton` and `b-skeleton`: `KitSkeleton`.

## Overlays and layout

| Component        | Use for                                  | Props                                                                                                                   | Events and slots                                                            |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `KitDialog`      | Focused work above the page              | `title`, `description`, `size` (`sm` 400, `md` 520, `lg` 800, `xl` 1120), `closeOnBackdrop` (off), `closeOnEscape` (on) | `v-model:open`, `opened`, `closed`; default and `footer` slots              |
| `KitConfirmHost` | Shows `useConfirm` questions             | None. Mount one at app level                                                                                            | None                                                                        |
| `KitTabs`        | Switching between sections of one record | `label`, `tabs` (`value`, `label`, `disabled`, `lazy`)                                                                  | `v-model`; `panel-<value>` slots                                            |
| `KitAccordion`   | Sections that open and close in place    | `items` (`value`, `title`, `disabled`, `lazy`), `multiple`, `headingLevel`                                              | `v-model`, a string or a string array when `multiple`; `item-<value>` slots |
| `KitTooltip`     | A short hint on one focusable element    | `text`, `side`                                                                                                          | Default slot holds the element                                              |
| `KitDropdown`    | A short menu of actions                  | `label`, `items` (`value`, `label`, `disabled`, `danger`, `separatorBefore`), `severity`, `size`                        | `select` with the item's value, sent after the menu closes; `trigger` slot  |

`const { confirm } = useConfirm()`, then `await confirm({ title, text, confirmLabel, cancelLabel, severity })` returns `true` or `false`. Focus starts on Cancel. A question asked while another is open waits its turn.

`KitDialog` opens from state, so the opening button stays in the parent. It focuses the first control and returns focus to whatever had it before opening. If that element has gone, focus moves to `main`.

Panels and accordion sections stay mounted when hidden, so typed values survive. Set `lazy` to render a panel only while it is open, which also discards its state when it closes.

A tooltip doesn't name its element. Icon-only buttons need their own `aria-label`.

### Mapping from legacy overlays

These map behaviour only.

- `<b-modal v-model hide-footer title size>`: `KitDialog` with `v-model:open`, `title`, `size`. `@show` becomes `opened`, `@hidden` becomes `closed`, `no-close-on-esc` becomes `:close-on-escape="false"`.
- `no-close-on-backdrop` is now the default. Add `close-on-backdrop` only where a dialog has nothing to lose. This differs from legacy on purpose, to protect typed work.
- `Swal.fire({ showCancelButton: true, ... }).then((result) => { if (result.value) ... })`: `confirm({ ... }).then((confirmed) => { if (confirmed) ... })`. `confirmButtonText` becomes `confirmLabel`, and a `btn-danger` confirm button becomes `severity: 'danger'`.
- `Swal.fire` without a cancel button: `common/notify.ts`, not this kit.
- `<b-tabs><b-tab title lazy active>`: `KitTabs`. `title` becomes `label`, and `active` becomes the initial `v-model` value.
- `<b-collapse accordion="group">` with `v-b-toggle`: `KitAccordion`. A standalone `b-collapse` is one item with `multiple`.
- `v-b-tooltip.hover="'text'"` and `title`: wrap the element in `KitTooltip`.
- `<b-dropdown text><b-dropdown-item @click>`: `KitDropdown` with `items` and `@select`. `split` becomes a `KitButton` beside a `KitDropdown`.

## Page structure

| Component         | Use for                                                    | Props                                                 | Events and slots                                                                                    |
| ----------------- | ---------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `KitPageHeader`   | The page title, one line under it, and its actions         | `title`, `description`                                | `before`, `meta` and `actions` slots                                                                |
| `KitBackLink`     | Going back to the list a page came from                    | `label`                                               | `click`                                                                                             |
| `KitRecordPager`  | Previous and Next through the list a record came from      | `position`, `total`, `noun` ("prescription"), `label` | `previous`, `next`                                                                                  |
| `KitFormSection`  | A titled group of fields on a grid that narrows on tablets | `title`, `description`                                | Default slot                                                                                        |
| `KitActionBar`    | Save and Cancel kept on screen while a form scrolls        | None                                                  | Default slot                                                                                        |
| `KitErrorSummary` | The list of fields to fix after a failed save              | `errors` (`field`, `label`)                           | `focus()` method. Wrap each field in an element with `data-field` so its entry can move focus to it |
| `KitDrawer`       | Navigation or filters that slide in from the side          | `title`, `side` (`left`, `right`)                     | `v-model:open`; default slot                                                                        |

Call `focus()` on `KitErrorSummary` after a failed save so screen reader users hear what to fix. Each field still shows its own message.

## Touch screens

Touch-only Android tablets are used for ward rounds and vitals. The `touch:` variant (`pointer: coarse`) grows every tap target to 44px using the `touch` size token (`min-h-touch`, `min-w-touch`). Small icon buttons keep their look and get a 44px `::before` hit area instead. Desktop sizes don't change. `e2e/targets.spec.ts` measures every control's real hit area: at least 24px on desktop and 44px on touch. Any new kit component must pass it.

- Never put information a user needs only in a tooltip or a `title`. Touch screens can't hover, and reka-ui links a tooltip's text to its button only while it is open, so on a tablet nobody can reach it, screen readers included. Show reasons, such as why a button is disabled, as visible text.
- On touch, `KitDatePicker` opens its calendar centred in a `KitDialog` instead of under the field, because a 44px calendar doesn't fit beside a field on a landscape tablet. Typing the date still works. `KitCalendar` is that standalone calendar, and `useCoarsePointer()` tells a component whether it is on a touch screen.
- Table rows that hold controls are at least 44px on touch, so dense rows only stay 32px on desktop.

## Helpers

- `useGridNavigation.ts`: on a container, `@keydown="onGridKeydown"` moves between inputs with the same `data-grid-col` using ArrowUp, ArrowDown and Enter.
- `useLatest.ts`: runs a request and discards any response that a newer request has replaced.
- `useMediaQuery(query)` and `useCoarsePointer()`: a reactive flag for a media query, such as a width or a touch screen.

## On reka-ui upgrades

`KitTooltip` reopens after focus scrolls its element into view, because reka-ui closes tooltips on scroll. `KitDropdown` uses a non-modal menu, because reka-ui's modal menu trips the axe `aria-hidden-focus` check. `KitSelect` overrides `aria-controls` and `aria-activedescendant` while closed, because reka-ui leaves them pointing at removed elements. Rerun `npm run test:e2e` after any upgrade.
