# Component kit (ADR-0010)

Views use these components instead of building their own. If one is missing, add it here with keyboard and axe tests. Colors come only from the `DESIGN.md` tokens.

Run the browser tests locally with `npm run test:e2e`. Test pages live in `__harness__/` at `kit-harness.html`, which is not part of the production build.

Every form control takes `label`, `error` and `disabled`, and works with `v-model`. Pass a vee-validate field's `value` and `errorMessage` (ADR-0007).

| Component       | Use for                                              | Other props                                                                                          | `v-model`                                               |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `KitButton`     | Actions                                              | `severity` (`primary`, `success`, `danger`, `warning`), `size` (`xs`, `sm`, `lg`), `type`, `loading` | None                                                    |
| `KitInput`      | Single-line text. Replaces `form-control` inputs     | `hideLabel`, `numeric` for mono tabular values; other attributes reach the `<input>`                 | `string`                                                |
| `KitTextarea`   | Multi-line text                                      | `hideLabel`, `rows`; other attributes reach the `<textarea>`                                         | `string`                                                |
| `KitCheckbox`   | One on/off choice                                    | None                                                                                                 | `boolean`                                               |
| `KitRadioGroup` | One choice from a few visible options                | `options` as `{ value, label }[]`                                                                    | `string`                                                |
| `KitSelect`     | Async search. Replaces `v-select`                    | `search`, `multiple`, `clearable`, `initialOptions`, `placeholder`, `hideLabel`                      | The option's value, an array when `multiple`, or `null` |
| `KitDatePicker` | Dates. Replaces `datepicker` and `b-form-datepicker` | `min`, `max` as `YYYY-MM-DD`                                                                         | `YYYY-MM-DD` or `null`                                  |
| `KitFileUpload` | File selection                                       | `accept`, `multiple`                                                                                 | `File[]`                                                |

`KitButton` emits normal `click` events. Only `sm` (28px) belongs on data screens; `lg` is for a primary action on an isolated page.

## Mapping from `v-select`

- `:reduce` is not needed. `v-model` already holds the option's `value`.
- `@search` becomes the `search` prop, which returns options as `{ value, label }[]`. The kit handles debouncing and ignores out-of-date responses.
- When editing a saved value, pass its option in `initialOptions` so its label shows before any search.

## Helpers

- `useGridNavigation.ts`: on a container, `@keydown="onGridKeydown"` moves between inputs with the same `data-grid-col` using ArrowUp, ArrowDown and Enter.
- `useLatest.ts`: runs a request and discards any response that a newer request has replaced.

## On reka-ui upgrades

`KitSelect` overrides `aria-controls` and `aria-activedescendant` while closed, because reka-ui leaves them pointing at removed elements. Rerun `npm run test:e2e` after any upgrade.
