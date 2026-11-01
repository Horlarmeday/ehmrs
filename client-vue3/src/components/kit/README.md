# Component kit (ADR-0010)

Views use these components instead of building their own. If one is missing, add it here with keyboard and axe tests. Colors come only from the `DESIGN.md` tokens.

Run the browser tests locally with `npm run test:e2e`. Test pages live in `__harness__/` at `kit-harness.html`, which is not part of the production build.

Every form control takes `label`, `error` and `disabled`, and works with `v-model`. Pass a vee-validate field's `value` and `errorMessage` (ADR-0007).

| Component       | Use for                                              | Other props                                                                                                                                                                   | `v-model`                                               |
| --------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `KitButton`     | Actions                                              | `severity` (`primary` for the one main action in a view, `secondary`, `accent` for row actions, `success`, `danger`, `warning`), `size` (`xs`, `sm`, `lg`), `type`, `loading` | None                                                    |
| `KitInput`      | Single-line text. Replaces `form-control` inputs     | `hideLabel`, `numeric` for mono tabular values; other attributes reach the `<input>`                                                                                          | `string`                                                |
| `KitTextarea`   | Multi-line text                                      | `hideLabel`, `rows`; other attributes reach the `<textarea>`                                                                                                                  | `string`                                                |
| `KitCheckbox`   | One on/off choice                                    | None                                                                                                                                                                          | `boolean`                                               |
| `KitRadioGroup` | One choice from a few visible options                | `options` as `{ value, label }[]`                                                                                                                                             | `string`                                                |
| `KitSelect`     | Async search. Replaces `v-select`                    | `search`, `multiple`, `clearable`, `initialOptions`, `placeholder`, `hideLabel`                                                                                               | The option's value, an array when `multiple`, or `null` |
| `KitDatePicker` | Dates. Replaces `datepicker` and `b-form-datepicker` | `min`, `max` as `YYYY-MM-DD`                                                                                                                                                  | `YYYY-MM-DD` or `null`                                  |
| `KitFileUpload` | File selection                                       | `accept`, `multiple`                                                                                                                                                          | `File[]`                                                |

`KitButton` emits normal `click` events. `sm` (38px) is the default, `xs` (30px) is for actions inside rows, and `lg` (44px) is for a main action on an isolated page.

## Mapping from `v-select`

- `:reduce` is not needed. `v-model` already holds the option's `value`.
- `@search` becomes the `search` prop, which returns options as `{ value, label }[]`. The kit handles debouncing and ignores out-of-date responses.
- When editing a saved value, pass its option in `initialOptions` so its label shows before any search.

## Data display

| Component       | Use for                                          | Props                                                                                                                                                                                                                                                                       | Events and slots                                                                                  |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `KitTable`      | Lists of records in a native `<table>`           | `label`, `columns` (`id`, `header`, `numeric` for amounts, `mono` for identifiers, `compact` for cells holding controls, `sortable`), `rows`, `rowKey`, `groupKey`, `sort`, `loading`, `error`, `dense`, `maxHeight`, `selectable`, `rowLabel`, `emptyText`, `skeletonRows` | `v-model:selected`, `update:sort`, `retry`; `cell-<id>` slot with `row` and `value`; `empty` slot |
| `KitPagination` | Paging for a server-side list                    | `page`, `pageSize`, `total`, `shownCount`, `label`, `pageSizes`, `maxButtons`                                                                                                                                                                                               | `update:page`, `update:pageSize`                                                                  |
| `KitBadge`      | Status labels, always with visible text          | `severity` (`primary`, `success`, `warning`, `danger`, `info`, `neutral`), `variant` (`subtle`, `solid`, `dot`)                                                                                                                                                             | Default slot                                                                                      |
| `KitSkeleton`   | Loading placeholders, hidden from assistive tech | `variant` (`lines`, `table`, `form`), `rows`, `columns`, `dense`                                                                                                                                                                                                            | None                                                                                              |
| `KitResultGrid` | A table of inputs with grid keyboard movement    | `label`                                                                                                                                                                                                                                                                     | `head` and default slots                                                                          |

`useServerTable(load, options)` holds `page`, `pageSize`, `sort`, `rows`, `total`, `loading` and `error`, and provides `reload`, `setPage`, `setPageSize` and `setSort`. Changing size or sort returns to page 1, a failed request keeps the current rows, and a page that no longer exists moves to the new last page. Call `reload()` once to load the first page.

## Mapping from legacy components

These map behaviour only. Legacy screens are not a reference for layout or format.

- `<table>` with a "no records" `colspan` row: `KitTable`, which has its own empty state.
- `<pagination>`: `total-pages` is calculated from `total` and `pageSize`. `current-page` becomes `page`, `per-page` becomes `pageSize`, `@pagechanged` becomes `update:page`, and `@changepagecount` becomes `update:pageSize`.
- `label-light-*` and `label-*`: `KitBadge` with `variant` `subtle` or `solid`. `dark` and `secondary` become `neutral`.
- `DefaultSkeleton`, `TableSkeleton` and `b-skeleton`: `KitSkeleton`.

## Helpers

- `useGridNavigation.ts`: on a container, `@keydown="onGridKeydown"` moves between inputs with the same `data-grid-col` using ArrowUp, ArrowDown and Enter.
- `useLatest.ts`: runs a request and discards any response that a newer request has replaced.

## On reka-ui upgrades

`KitSelect` overrides `aria-controls` and `aria-activedescendant` while closed, because reka-ui leaves them pointing at removed elements. Rerun `npm run test:e2e` after any upgrade.
