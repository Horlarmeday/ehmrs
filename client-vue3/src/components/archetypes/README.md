# Page archetypes (ADR-0009)

Every screen in the new client is built from one of these patterns inside the app shell (`components/shell/AppShell.vue`, wired in `view/layout/Layout.vue`). Pick the archetype from what the user does on the screen, not from how the legacy page looked.

| Archetype                    | Use when                                                                       | Examples                                                       |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `ListPage`                   | People find records in a long, paged list and act on one or many               | Store items, staff, transactions, a pharmacy or lab queue      |
| `EntryForm` + `useEntryForm` | People create or change one record                                             | Register a patient, add a store item, add a ward (in a dialog) |
| `DetailPage`                 | People read one record whose information falls into sections                   | A store item, a patient chart, a prescription                  |
| `WorklistPage`               | People work through a **short** list (a few items) one at a time, side by side | The tests in one lab sample                                    |

A long queue is never a `WorklistPage`: use a `ListPage` that opens a `DetailPage`, with `KitRecordPager` for Previous and Next (owner decision, the dispense queue). Dashboards, reports with export and settings are later archetypes (#103, #104, #105).

## The rule that matters: frozen logic stays in the view

The archetypes are presentation. Everything that is business logic stays in the view's script, translated from legacy (ADR-0002, ADR-0007): which store action loads data, which guards run, which rules apply, what happens after a save. An archetype only receives functions and values from the view and calls them; it never invents a request, a rule or a guard.

## Settings and state in the URL

`useRouteParam(key, field)` (`useRouteState.ts`) keeps a value in the URL so refresh, Back and shared links restore it. Use a field type that matches the value: `intField`, `textField`, `choiceField`, `numberChoiceField`. A value that doesn't parse, or isn't one of the choices, falls back to the default and never reaches your loader. Defaults are left out of the URL, and changes made together become one history entry.

`ListPage` keeps `page`, `size`, `sort` and `order`; `DetailPage` keeps `tab`; `WorklistPage` keeps `item`. Use different keys for your own filters.

## ListPage

```vue
<ListPage
  title="Store items"
  label="Store items"
  :columns="columns"
  row-key="id"
  :load="load"
  :query="query"
  :guard="guard"
  :active-filters="activeFilters"
  selectable
  @clear-filters="clearFilters"
>
  <template #actions>…</template>
  <template #search>…</template>
  <template #filters>…</template>
  <template #bulk="{ selected }">…</template>
  <template #cell-name="{ row }">…</template>
  <template #card="{ row }">…</template>
</ListPage>
```

- `load(request)` is the view's frozen loader. It receives the view's `query` plus `page`, `pageSize` and `sort`, and must return `{ rows, total }`. Translate the legacy store action call into this function; don't change its payload.
- `query` holds the view's filter values. Keep each one in the URL with `useRouteParam`. Any change returns to page 1 with a single request.
- `guard(query)` returns `true` or a sentence. Use it where legacy refuses to search, for example an empty patient search; the sentence is shown instead of loading.
- Filters sit inline from 1024px and in a side panel below that; the `card` slot is used below 768px (owner decision: cards in portrait). Without a `card` slot the table is used everywhere.
- The summary says "Loading…" during every load, so a count never mixes old results with new filters.

## EntryForm and useEntryForm

```ts
const form = useEntryForm({ discardTitle: 'Discard this item?' });
const quantity = form.field('quantity', {
  label: 'Quantity',
  rules: 'required',
  initial: '',
  validateOn: 'blur',
});
const onSubmit = form.submit((values) => store.addItem(values));
```

```vue
<EntryForm
  title="Add store item"
  :errors="form.errors.value"
  :saving="form.saving.value"
  :bind-summary="form.bindSummary"
  @submit="onSubmit"
  @cancel="cancel"
>
  <KitFormSection title="Quantity and price">
    <div data-field="quantity">
      <KitInput v-model="quantity.value.value" label="Quantity *" inputmode="numeric" numeric
        :error="quantity.errorMessage.value" @blur="quantity.handleBlur" />
    </div>
  </KitFormSection>
</EntryForm>
```

- **Rules:** copy the legacy `v-validate` string exactly into `rules`, and record it in the view's rule transcription table. The archetype adds nothing and drops nothing. Messages are the legacy vee-validate 2 wording (`validation/setup.ts`).
- **Field name in messages:** vee-validate 2 used the input's `name`, or `data-vv-as` when set. The first argument of `field()` is that name; pass `as` only where legacy had `data-vv-as`. Translate `confirmed:target` as `confirmed:@target`.
- **Timing:** where legacy had `data-vv-validate-on="blur"`, pass `validateOn: 'blur'` and bind `@blur="field.handleBlur"`.
- **Check legacy, not the asterisks:** a legacy label may show `*` without a rule (for example dosage form on the add store item page). Only `v-validate` counts.
- Wrap each field in an element with `data-field` set to its name, so the error summary can move focus to it.
- `submit(handler)` runs only when valid, ignores a second press while saving, and clears unsaved changes only after the handler succeeds. Errors from the handler still reach the HTTP layer's toasts.
- Unsaved changes ask before leaving the route, before cancel (`form.confirmDiscard()`), before a dialog closes (pass `:before-close="form.confirmDiscard"` to `KitDialog`) and on reload.
- Use `in-dialog` to host the same form in a `KitDialog`.

## DetailPage

```vue
<DetailPage
  :title="item.name"
  :tabs="tabs"
  tabs-label="Store item sections"
  back-label="Store items"
  :position="position"
  :total="total"
  noun="prescription"
  @back="back"
  @previous="previous"
  @next="next"
>
  <template #meta>…</template>
  <template #actions>…</template>
  <template #panel-detail>…</template>
  <template #panel-history><ItemHistory :item="item" /></template>
</DetailPage>
```

- Mark a tab `lazy` when its section has its own request. Put that section in its own component that loads on mount; it then loads the first time the tab opens.
- Mark a tab `hidden` when the role may not see it. Hiding is not security: the route guard and the server still decide.

## WorklistPage

```vue
<WorklistPage
  label="Tests in this sample"
  :items="tests"
  item-key="id"
  :item-label="(test) => test.name"
  back-label="All tests"
>
  <template #item="{ item }">…</template>
  <template #detail="{ item }">…</template>
</WorklistPage>
```

Side by side from 1024px, with the first item chosen. Below that, the list first, then the chosen item full width with "All tests" to go back. Locked items stay in the list and explain themselves in the detail with visible text.

## Touch screens

Touch-only Android tablets are used for ward rounds and vitals. Every archetype works at 640px portrait and 1024px landscape, and every tap target is at least 44px on touch (`e2e/targets.spec.ts`). Never put anything a user needs only in a tooltip or a `title`.

## Tests to write for a new screen

- A contract test that the view passes exactly the legacy request to `load` or `submit`, and that its rules string matches the legacy one.
- A browser test of its main path on desktop and both tablet sizes, with axe in each state. Add the screen to `e2e/targets.spec.ts`.
