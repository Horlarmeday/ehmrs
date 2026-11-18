<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import KitButton from './KitButton.vue';
import KitCheckbox from './KitCheckbox.vue';
import KitSkeleton from './KitSkeleton.vue';

const props = withDefaults(
  defineProps<{
    label: string;
    rows: TRow[];
    rowKey: keyof TRow;
    loading?: boolean;
    error?: string;
    selectable?: boolean;
    rowLabel?: (row: TRow) => string;
    emptyText?: string;
  }>(),
  {
    loading: false,
    error: undefined,
    selectable: false,
    rowLabel: undefined,
    emptyText: 'No records found',
  }
);

const emit = defineEmits<{ retry: [] }>();
const selected = defineModel<unknown[]>('selected', { default: () => [] });

const keyOf = (row: TRow): unknown => row[props.rowKey];
const isSelected = (row: TRow): boolean => selected.value.includes(keyOf(row));
function setSelected(row: TRow, value: boolean): void {
  const key = keyOf(row);
  selected.value = value
    ? [...selected.value, key]
    : selected.value.filter((existing) => existing !== key);
}
const labelFor = (row: TRow): string =>
  props.rowLabel ? props.rowLabel(row) : `Select ${String(keyOf(row))}`;
</script>

<template>
  <div class="relative text-sm text-ink">
    <span role="status" class="sr-only">{{ loading ? 'Loading…' : '' }}</span>
    <div
      v-if="error"
      role="alert"
      data-testid="cards-error"
      class="flex items-center justify-between gap-2 rounded-sm bg-danger-subtle px-3 py-2 text-danger-subtle-text"
    >
      <span>{{ error }}</span>
      <KitButton size="xs" severity="danger" @click="emit('retry')">Retry</KitButton>
    </div>
    <KitSkeleton v-else-if="loading && !rows.length" variant="lines" :rows="6" />
    <p
      v-else-if="!rows.length"
      data-testid="cards-empty"
      class="py-6 text-center text-ink-secondary"
    >
      <slot name="empty">{{ emptyText }}</slot>
    </p>
    <ul
      v-if="rows.length"
      :aria-label="label"
      :aria-busy="loading ? 'true' : 'false'"
      class="flex flex-col border-t border-line-subtle"
    >
      <li
        v-for="row in rows"
        :key="String(keyOf(row))"
        data-testid="card"
        class="flex items-start gap-3 border-b border-line-subtle px-1 py-3"
        :class="isSelected(row) ? 'bg-teal-100' : ''"
      >
        <KitCheckbox
          v-if="selectable"
          :model-value="isSelected(row)"
          :label="labelFor(row)"
          hide-label
          class="pt-[2px]"
          @update:model-value="setSelected(row, $event)"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <slot :row="row" />
        </div>
      </li>
    </ul>
  </div>
</template>
