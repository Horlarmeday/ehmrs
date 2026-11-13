<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import { computed, ref, useSlots, watch } from 'vue';
import KitButton from '../kit/KitButton.vue';
import KitCardList from '../kit/KitCardList.vue';
import KitDrawer from '../kit/KitDrawer.vue';
import KitPageHeader from '../kit/KitPageHeader.vue';
import KitPagination from '../kit/KitPagination.vue';
import KitTable, { type KitColumn, type KitSort } from '../kit/KitTable.vue';
import { useMediaQuery } from '../kit/useMediaQuery';
import { useServerTable } from '../kit/useServerTable';
import { choiceField, intField, numberChoiceField, useRouteParam } from './useRouteState';

export interface ListQuery {
  page: number;
  pageSize: number;
  sort: KitSort | null;
}

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    label: string;
    columns: KitColumn[];
    rowKey: keyof TRow;
    load: (query: ListQuery & Record<string, unknown>) => Promise<{ rows: TRow[]; total: number }>;
    query?: Record<string, unknown>;
    guard?: (query: Record<string, unknown>) => true | string;
    activeFilters?: number;
    pageSizes?: number[];
    defaultPageSize?: number;
    selectable?: boolean;
    rowLabel?: (row: TRow) => string;
    emptyText?: string;
    dense?: boolean;
    errorMessage?: string;
  }>(),
  {
    description: undefined,
    query: () => ({}),
    guard: undefined,
    activeFilters: 0,
    pageSizes: () => [10, 20, 30, 50, 100],
    defaultPageSize: 10,
    selectable: false,
    rowLabel: undefined,
    emptyText: 'No records found',
    dense: false,
    errorMessage: 'The list could not be loaded. Check the connection and try again.',
  }
);

const emit = defineEmits<{ 'clear-filters': [] }>();
const selected = defineModel<unknown[]>('selected', { default: () => [] });
const slots = useSlots();

const sortableIds = computed(() =>
  props.columns.filter((column) => column.sortable).map((column) => column.id)
);
const pageParam = useRouteParam('page', intField({ fallback: 1, min: 1, max: 100000 }));
const sizeParam = useRouteParam('size', numberChoiceField(props.pageSizes, props.defaultPageSize));
const sortParam = useRouteParam('sort', choiceField(sortableIds.value));
const orderParam = useRouteParam('order', choiceField(['asc', 'desc'] as const));

const refusal = computed(() => {
  const result = props.guard?.(props.query);
  return typeof result === 'string' ? result : null;
});

const table = useServerTable<TRow>(
  ({ page, pageSize, sort }) => props.load({ ...props.query, page, pageSize, sort }),
  {
    pageSize: sizeParam.value,
    sort: sortParam.value ? { id: sortParam.value, desc: orderParam.value === 'desc' } : null,
    errorMessage: props.errorMessage,
  }
);
table.page.value = pageParam.value;

function run(): void {
  if (refusal.value) {
    table.rows.value = [];
    table.total.value = 0;
    return;
  }
  table.reload();
}
run();

watch(
  () => props.query,
  () => {
    selected.value = [];
    if (table.page.value === 1) run();
    else setPage(1);
  },
  { deep: true }
);

function setPage(page: number): void {
  pageParam.value = page;
  if (refusal.value) return;
  table.setPage(page);
}
function setPageSize(size: number): void {
  sizeParam.value = size;
  pageParam.value = 1;
  table.setPageSize(size);
}
function setSort(sort: KitSort | null): void {
  sortParam.value = sort ? sort.id : null;
  orderParam.value = sort?.desc ? 'desc' : null;
  pageParam.value = 1;
  table.setSort(sort);
}
watch(
  () => table.page.value,
  (page) => {
    if (page !== pageParam.value) pageParam.value = page;
  }
);

const atLeastMd = useMediaQuery('(min-width: 768px)');
const wide = useMediaQuery('(min-width: 1024px)');
const filtersOpen = ref(false);
const hasFilters = computed(() => Boolean(slots.filters));
const cellSlots = computed(() => Object.keys(slots).filter((name) => name.startsWith('cell-')));

defineExpose({ reload: run, rows: table.rows, total: table.total });
</script>

<template>
  <div class="flex flex-col gap-4">
    <KitPageHeader :title="title" :description="description">
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </KitPageHeader>

    <slot name="above" />

    <div v-if="hasFilters || $slots.search" class="flex flex-wrap items-end gap-3">
      <slot name="search" />
      <slot v-if="wide" name="filters" />
      <KitButton
        v-else-if="hasFilters"
        severity="secondary"
        :aria-expanded="filtersOpen"
        @click="filtersOpen = true"
        >Filters<span v-if="activeFilters" class="font-mono">({{ activeFilters }})</span></KitButton
      >
    </div>

    <div class="flex min-h-sm flex-wrap items-center justify-between gap-2 touch:min-h-touch">
      <p class="text-ink-secondary" aria-live="polite" data-testid="list-summary">
        <template v-if="refusal">{{ refusal }}</template>
        <template v-else-if="table.loading.value">Loading…</template>
        <template v-else>
          <span class="font-mono">{{ table.total.value }}</span>
          {{ table.total.value === 1 ? 'record' : 'records' }}
          <template v-if="activeFilters">
            · <span class="font-mono">{{ activeFilters }}</span>
            {{ activeFilters === 1 ? 'filter' : 'filters' }} on</template
          >
        </template>
      </p>
      <KitButton v-if="activeFilters" size="xs" severity="accent" @click="emit('clear-filters')"
        >Clear filters</KitButton
      >
    </div>

    <div
      v-if="selected.length && $slots.bulk"
      role="region"
      :aria-label="`Selected ${label}`"
      class="flex flex-wrap items-center gap-2 rounded-sm bg-primary-subtle px-3 py-2 text-primary-subtle-text"
    >
      <strong class="mr-auto"
        ><span class="font-mono">{{ selected.length }}</span> selected</strong
      >
      <slot name="bulk" :selected="selected" />
      <KitButton size="xs" severity="secondary" @click="selected = []">Clear selection</KitButton>
    </div>

    <KitCardList
      v-if="!atLeastMd && $slots.card"
      v-model:selected="selected"
      :label="label"
      :rows="table.rows.value"
      :row-key="rowKey"
      :loading="table.loading.value"
      :error="table.error.value"
      :selectable="selectable"
      :row-label="rowLabel"
      :empty-text="emptyText"
      @retry="run"
    >
      <template #default="{ row }"><slot name="card" :row="row" /></template>
      <template v-if="$slots.empty" #empty><slot name="empty" /></template>
    </KitCardList>
    <KitTable
      v-else
      v-model:selected="selected"
      :label="label"
      :columns="columns"
      :rows="table.rows.value"
      :row-key="rowKey"
      :sort="table.sort.value"
      :loading="table.loading.value"
      :error="table.error.value"
      :dense="dense"
      :selectable="selectable"
      :row-label="rowLabel"
      :empty-text="emptyText"
      @update:sort="setSort"
      @retry="run"
    >
      <template v-for="name in cellSlots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope" />
      </template>
      <template v-if="$slots.empty" #empty><slot name="empty" /></template>
    </KitTable>

    <KitPagination
      v-if="!refusal"
      :label="`${label} pages`"
      :page="table.page.value"
      :page-size="table.pageSize.value"
      :total="table.total.value"
      :shown-count="table.rows.value.length"
      :page-sizes="pageSizes"
      @update:page="setPage"
      @update:page-size="setPageSize"
    />

    <KitDrawer v-if="hasFilters" v-model:open="filtersOpen" title="Filters" side="right">
      <div class="flex flex-col gap-4 px-2">
        <slot v-if="!wide" name="filters" />
        <div class="flex gap-2">
          <KitButton severity="secondary" @click="emit('clear-filters')">Clear filters</KitButton>
          <KitButton @click="filtersOpen = false">Show results</KitButton>
        </div>
      </div>
    </KitDrawer>
  </div>
</template>
