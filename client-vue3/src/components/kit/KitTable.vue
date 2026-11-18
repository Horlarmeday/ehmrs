<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import { computed } from 'vue';
import KitButton from './KitButton.vue';
import KitCheckbox from './KitCheckbox.vue';
import KitSkeleton from './KitSkeleton.vue';

export interface KitColumn {
  id: string;
  header: string;
  numeric?: boolean;
  mono?: boolean;
  compact?: boolean;
  sortable?: boolean;
  sticky?: boolean;
  hideBelow?: 'md' | 'lg' | 'xl';
}

export interface KitSort {
  id: string;
  desc: boolean;
}

const props = withDefaults(
  defineProps<{
    label: string;
    columns: KitColumn[];
    rows: TRow[];
    rowKey: keyof TRow;
    groupKey?: keyof TRow;
    sort?: KitSort | null;
    loading?: boolean;
    error?: string;
    dense?: boolean;
    maxHeight?: string;
    selectable?: boolean;
    rowLabel?: (row: TRow) => string;
    emptyText?: string;
    skeletonRows?: number;
    minWidth?: string;
  }>(),
  {
    groupKey: undefined,
    sort: null,
    loading: false,
    error: undefined,
    dense: false,
    maxHeight: undefined,
    selectable: false,
    rowLabel: undefined,
    emptyText: 'No records found',
    skeletonRows: 5,
    minWidth: undefined,
  }
);

const emit = defineEmits<{ 'update:sort': [sort: KitSort | null]; retry: [] }>();
const selected = defineModel<unknown[]>('selected', { default: () => [] });

const span = computed(() => props.columns.length + (props.selectable ? 1 : 0));
const rowHeight = computed(() => (props.dense ? 'h-row-dense' : 'h-row'));
const isGroup = (row: TRow): boolean => Boolean(props.groupKey && row[props.groupKey]);
const dataKeys = computed<unknown[]>(() =>
  props.rows.filter((row) => !isGroup(row)).map((row) => row[props.rowKey])
);
const selectedOnPage = computed(
  () => dataKeys.value.filter((key) => selected.value.includes(key)).length
);
const allSelected = computed(
  () => dataKeys.value.length > 0 && selectedOnPage.value === dataKeys.value.length
);

function ariaSort(id: string): 'ascending' | 'descending' | 'none' {
  if (props.sort?.id !== id) return 'none';
  return props.sort.desc ? 'descending' : 'ascending';
}

function toggleSort(id: string): void {
  if (props.sort?.id !== id) emit('update:sort', { id, desc: false });
  else if (!props.sort.desc) emit('update:sort', { id, desc: true });
  else emit('update:sort', null);
}

function isSelected(row: TRow): boolean {
  return selected.value.includes(row[props.rowKey]);
}

function setSelected(row: TRow, value: boolean): void {
  const key = row[props.rowKey];
  selected.value = value
    ? [...selected.value, key]
    : selected.value.filter((existing) => existing !== key);
}

function setAll(value: boolean): void {
  const others = selected.value.filter((key) => !dataKeys.value.includes(key));
  selected.value = value ? [...others, ...dataKeys.value] : others;
}

const labelFor = (row: TRow): string =>
  props.rowLabel ? props.rowLabel(row) : `Select ${String(row[props.rowKey])}`;
const hideClasses = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};
const hasSticky = computed(() => props.columns.some((column) => column.sticky));
const selectCell = computed(() =>
  hasSticky.value ? 'sticky left-0 z-[5] w-[56px] min-w-[56px] bg-inherit' : 'w-8'
);
function placement(column: KitColumn): string[] {
  return [
    column.hideBelow ? hideClasses[column.hideBelow] : '',
    column.sticky ? `sticky z-[5] bg-inherit ${props.selectable ? 'left-[56px]' : 'left-0'}` : '',
  ];
}
const headCell =
  'sticky top-0 z-10 whitespace-nowrap border-b border-line-subtle bg-surface-page px-3 py-[9px] text-xs font-medium text-ink-muted';
function cellClasses(column: KitColumn): string[] {
  return [
    column.compact ? 'border-b border-line-subtle px-3 py-0' : bodyCell.value,
    column.numeric ? 'whitespace-nowrap text-right font-mono tabular-nums' : '',
    column.mono ? 'whitespace-nowrap font-mono tabular-nums' : '',
    ...placement(column),
  ];
}

const bodyCell = computed(
  () => `border-b border-line-subtle ${props.dense ? 'px-2 py-[3px]' : 'px-3 py-1'}`
);
</script>

<template>
  <div class="relative bg-surface-page text-sm text-ink">
    <span
      role="status"
      class="absolute right-2 top-1 z-20 rounded-sm bg-surface-alt px-1 text-ink-secondary"
      >{{ loading ? 'Loading…' : '' }}</span
    >
    <div
      class="overflow-auto"
      :style="maxHeight ? { maxHeight } : undefined"
      tabindex="0"
      role="region"
      :aria-label="label"
    >
      <table
        class="w-full border-separate border-spacing-0"
        :style="minWidth ? { minWidth } : undefined"
        :aria-busy="loading ? 'true' : 'false'"
      >
        <caption class="sr-only">
          {{
            label
          }}
        </caption>
        <thead>
          <tr>
            <th v-if="selectable" scope="col" :class="[headCell, selectCell]">
              <KitCheckbox
                :model-value="allSelected"
                :indeterminate="selectedOnPage > 0 && !allSelected"
                :disabled="!dataKeys.length"
                label="Select all rows on this page"
                hide-label
                @update:model-value="setAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.id"
              scope="col"
              :aria-sort="column.sortable ? ariaSort(column.id) : undefined"
              :class="[
                headCell,
                column.numeric ? 'text-right' : 'text-left',
                ...placement(column),
                column.sticky ? 'z-20 bg-surface-page' : '',
              ]"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="min-h-xs rounded-xs font-medium touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                @click="toggleSort(column.id)"
              >
                {{ column.header }}
                <span aria-hidden="true">{{
                  ariaSort(column.id) === 'ascending'
                    ? '▲'
                    : ariaSort(column.id) === 'descending'
                      ? '▼'
                      : '↕'
                }}</span>
              </button>
              <template v-else>{{ column.header }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="error" data-testid="table-error">
            <td :colspan="span" class="border-b border-line-subtle bg-danger-subtle px-2 py-1">
              <div
                role="alert"
                class="flex items-center justify-between gap-2 text-danger-subtle-text"
              >
                <span>{{ error }}</span>
                <KitButton size="xs" severity="danger" @click="emit('retry')">Retry</KitButton>
              </div>
            </td>
          </tr>
          <tr v-if="loading && !rows.length && !error">
            <td :colspan="span" class="p-0">
              <KitSkeleton
                variant="table"
                :rows="skeletonRows"
                :columns="columns.length"
                :dense="dense"
              />
            </td>
          </tr>
          <tr v-else-if="!rows.length && !error" data-testid="table-empty">
            <td :colspan="span" class="px-2 py-2 text-center text-ink-secondary">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
          <template v-for="row in rows" :key="String(row[rowKey])">
            <tr v-if="isGroup(row)" :class="rowHeight">
              <th
                :colspan="span"
                scope="colgroup"
                class="border-b border-line-subtle px-3 text-left font-semibold"
              >
                {{ groupKey ? row[groupKey] : '' }}
              </th>
            </tr>
            <tr
              v-else
              :class="[
                rowHeight,
                isSelected(row) ? 'bg-teal-100' : 'bg-surface-page hover:bg-surface-alt',
              ]"
              data-testid="table-row"
            >
              <td
                v-if="selectable"
                class="border-b border-line-subtle px-3 py-0"
                :class="selectCell"
              >
                <KitCheckbox
                  :model-value="isSelected(row)"
                  :label="labelFor(row)"
                  hide-label
                  @update:model-value="setSelected(row, $event)"
                />
              </td>
              <td v-for="column in columns" :key="column.id" :class="cellClasses(column)">
                <slot :name="`cell-${column.id}`" :row="row" :value="row[column.id]">{{
                  row[column.id]
                }}</slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
