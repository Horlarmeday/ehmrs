<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitCheckbox from '../../components/kit/KitCheckbox.vue';
import KitConfirmHost from '../../components/kit/KitConfirmHost.vue';
import KitDrawer from '../../components/kit/KitDrawer.vue';
import KitDropdown from '../../components/kit/KitDropdown.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import KitPageHeader from '../../components/kit/KitPageHeader.vue';
import KitPagination from '../../components/kit/KitPagination.vue';
import KitSkeleton from '../../components/kit/KitSkeleton.vue';
import KitTable, { type KitColumn } from '../../components/kit/KitTable.vue';
import { useConfirm } from '../../components/kit/useConfirm';
import { useMediaQuery } from '../../components/kit/useMediaQuery';
import { useServerTable } from '../../components/kit/useServerTable';
import {
  dosageForms,
  drugForms,
  drugTypes,
  loadStock,
  money,
  vendors,
  type StockItem,
} from './designData';

export type TableMode = 'scroll' | 'columns' | 'cards';

const props = defineProps<{ tableMode: TableMode }>();
const emit = defineEmits<{ open: [item: StockItem]; add: [] }>();

const search = ref('');
const applied = ref('');
const filters = reactive<{
  drugType: string | null;
  drugForm: string | null;
  dosageForm: string | null;
  vendor: string | null;
}>({ drugType: null, drugForm: null, dosageForm: null, vendor: null });
const selected = ref<unknown[]>([]);
const filtersOpen = ref(false);
const wide = useMediaQuery('(min-width: 1024px)');
const atLeastMd = useMediaQuery('(min-width: 768px)');
const { confirm } = useConfirm();

const table = useServerTable<StockItem>(({ page, pageSize, sort }) =>
  loadStock({ page, pageSize, sort, search: applied.value, ...filters })
);
table.reload();
watch([applied, () => ({ ...filters })], () => table.setPage(1), { deep: true });

const activeFilters = computed(() => Object.values(filters).filter(Boolean).length);
const options = (values: string[]) => values.map((value) => ({ value, label: value }));

function runSearch(): void {
  applied.value = search.value.trim();
}

function clearFilters(): void {
  filters.drugType = null;
  filters.drugForm = null;
  filters.dosageForm = null;
  filters.vendor = null;
}

async function onBulk(action: string): Promise<void> {
  if (action !== 'deactivate') return;
  await confirm({
    title: `Deactivate ${selected.value.length} items?`,
    text: 'Deactivated items can no longer be dispensed or requested.',
    confirmLabel: 'Deactivate',
    severity: 'danger',
  });
}

const more = [
  { value: 'bulk', label: 'Add bulk items' },
  { value: 'reset', label: 'Reset store quantity', danger: true, separatorBefore: true },
];
const bulkActions = [
  { value: 'reorder', label: 'Reorder' },
  { value: 'export', label: 'Export' },
  { value: 'update', label: 'Update items' },
  { value: 'deactivate', label: 'Deactivate', danger: true, separatorBefore: true },
];

const columns = computed<KitColumn[]>(() => {
  const hide = props.tableMode === 'columns';
  return [
    { id: 'name', header: 'Name', sortable: true, sticky: props.tableMode === 'scroll' },
    { id: 'quantityRemaining', header: 'Qty remaining', numeric: true, sortable: true },
    { id: 'dosageForm', header: 'Dosage form', hideBelow: hide ? 'md' : undefined },
    { id: 'strength', header: 'Strength', hideBelow: hide ? 'md' : undefined },
    { id: 'costPrice', header: 'Cost price', numeric: true, hideBelow: hide ? 'xl' : undefined },
    { id: 'sellingPrice', header: 'Selling price', numeric: true },
    { id: 'expiry', header: 'Expiry', mono: true, sortable: true },
    { id: 'dateAdded', header: 'Date added', mono: true, hideBelow: hide ? 'xl' : undefined },
  ];
});
const showCards = computed(() => props.tableMode === 'cards' && !atLeastMd.value);

function isSelected(item: StockItem): boolean {
  return selected.value.includes(item.id);
}
function toggle(item: StockItem, value: boolean): void {
  selected.value = value
    ? [...selected.value, item.id]
    : selected.value.filter((id) => id !== item.id);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <KitPageHeader title="Store items" description="Pharmacy store">
      <template #actions>
        <KitDropdown label="More" :items="more" severity="secondary" />
        <KitButton @click="emit('add')">Add item</KitButton>
      </template>
    </KitPageHeader>

    <form class="flex flex-wrap items-end gap-3" role="search" @submit.prevent="runSearch">
      <div class="min-w-0 flex-1 basis-[240px]">
        <KitInput
          v-model="search"
          label="Search items"
          type="search"
          enterkeyhint="search"
          placeholder="Name or product code"
        />
      </div>
      <template v-if="wide">
        <KitNativeSelect
          v-model="filters.drugType"
          label="Drug type"
          placeholder="All"
          :options="options(drugTypes)"
          class="w-[150px]"
        />
        <KitNativeSelect
          v-model="filters.drugForm"
          label="Drug form"
          placeholder="All"
          :options="options(drugForms)"
          class="w-[150px]"
        />
        <KitNativeSelect
          v-model="filters.dosageForm"
          label="Dosage form"
          placeholder="All"
          :options="options(dosageForms)"
          class="w-[150px]"
        />
        <KitNativeSelect
          v-model="filters.vendor"
          label="Vendor"
          placeholder="All"
          :options="options(vendors)"
          class="w-[180px]"
        />
      </template>
      <KitButton v-else severity="secondary" @click="filtersOpen = true">
        Filters<span v-if="activeFilters" class="font-mono">({{ activeFilters }})</span>
      </KitButton>
      <KitButton type="submit" severity="secondary">Search</KitButton>
    </form>

    <div class="flex min-h-sm flex-wrap items-center justify-between gap-2 touch:min-h-touch">
      <p class="text-ink-secondary" aria-live="polite" data-testid="result-summary">
        <span class="font-mono">{{ table.total.value }}</span>
        {{ table.total.value === 1 ? 'item' : 'items'
        }}<template v-if="applied"> matching “{{ applied }}”</template
        ><template v-if="activeFilters"
          >, {{ activeFilters }} {{ activeFilters === 1 ? 'filter' : 'filters' }} on</template
        >
      </p>
      <KitButton
        v-if="activeFilters || applied"
        size="xs"
        severity="accent"
        @click="
          clearFilters();
          search = '';
          applied = '';
        "
      >
        Clear search and filters
      </KitButton>
    </div>

    <div
      v-if="selected.length"
      role="region"
      aria-label="Selected items"
      class="flex flex-wrap items-center gap-2 rounded-sm bg-primary-subtle px-3 py-2 text-primary-subtle-text"
    >
      <strong class="mr-auto"
        ><span class="font-mono">{{ selected.length }}</span> selected</strong
      >
      <KitButton size="xs" severity="secondary">Dispense</KitButton>
      <KitDropdown
        label="More actions"
        :items="bulkActions"
        severity="secondary"
        size="xs"
        @select="onBulk"
      />
      <KitButton size="xs" severity="secondary" @click="selected = []">Clear selection</KitButton>
    </div>

    <template v-if="showCards">
      <KitSkeleton
        v-if="table.loading.value && !table.rows.value.length"
        variant="lines"
        :rows="6"
      />
      <div
        v-else-if="table.error.value"
        role="alert"
        class="flex items-center justify-between gap-2 rounded-sm bg-danger-subtle px-3 py-2 text-danger-subtle-text"
      >
        <span>{{ table.error.value }}</span>
        <KitButton size="xs" severity="danger" @click="table.reload">Retry</KitButton>
      </div>
      <p v-else-if="!table.rows.value.length" class="py-6 text-center text-ink-secondary">
        No items match. Try fewer filters.
      </p>
      <ul v-else aria-label="Store items" class="flex flex-col border-t border-line-subtle">
        <li
          v-for="item in table.rows.value"
          :key="item.id"
          class="flex items-start gap-3 border-b border-line-subtle py-3"
          :class="isSelected(item) ? 'bg-teal-100' : ''"
        >
          <KitCheckbox
            :model-value="isSelected(item)"
            :label="`Select ${item.name}`"
            hide-label
            class="pl-1"
            @update:model-value="toggle(item, $event)"
          />
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="flex items-center justify-between gap-2">
              <button
                type="button"
                class="min-h-touch text-left font-semibold hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                @click="emit('open', item)"
              >
                {{ item.name }}
              </button>
              <KitBadge v-if="item.quantityRemaining === 0" severity="danger"
                >Out of stock</KitBadge
              >
            </div>
            <dl class="grid grid-cols-3 gap-x-3 text-ink-secondary">
              <div>
                <dt class="text-xs">Remaining</dt>
                <dd class="font-mono text-ink">{{ item.quantityRemaining }}</dd>
              </div>
              <div>
                <dt class="text-xs">Selling price</dt>
                <dd class="font-mono text-ink">{{ money(item.sellingPrice) }}</dd>
              </div>
              <div>
                <dt class="text-xs">Expiry</dt>
                <dd class="font-mono text-ink">{{ item.expiry }}</dd>
              </div>
            </dl>
          </div>
        </li>
      </ul>
    </template>
    <KitTable
      v-else
      v-model:selected="selected"
      label="Store items"
      :columns="columns"
      :rows="table.rows.value"
      row-key="id"
      :sort="table.sort.value"
      :loading="table.loading.value"
      :error="table.error.value"
      :min-width="tableMode === 'scroll' ? '920px' : undefined"
      selectable
      :row-label="(row) => `Select ${row.name}`"
      empty-text="No items match. Try fewer filters."
      @update:sort="table.setSort"
      @retry="table.reload"
    >
      <template #cell-name="{ row }">
        <span class="flex items-center gap-2">
          <button
            type="button"
            class="min-h-xs rounded-xs text-left font-semibold hover:text-primary hover:underline touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            @click="emit('open', row)"
          >
            {{ row.name }}
          </button>
          <KitBadge v-if="row.status === 'inactive'" variant="dot">Inactive</KitBadge>
        </span>
      </template>
      <template #cell-quantityRemaining="{ row }">
        <KitBadge v-if="row.quantityRemaining === 0" severity="danger">Out of stock</KitBadge>
        <template v-else>{{ row.quantityRemaining }}</template>
      </template>
      <template #cell-costPrice="{ row }">{{ money(row.costPrice) }}</template>
      <template #cell-sellingPrice="{ row }">{{ money(row.sellingPrice) }}</template>
    </KitTable>

    <KitPagination
      label="Store items pages"
      :page="table.page.value"
      :page-size="table.pageSize.value"
      :total="table.total.value"
      :shown-count="table.rows.value.length"
      @update:page="table.setPage"
      @update:page-size="table.setPageSize"
    />

    <KitDrawer v-model:open="filtersOpen" title="Filters" side="right">
      <div class="flex flex-col gap-4 px-2">
        <KitNativeSelect
          v-model="filters.drugType"
          label="Drug type"
          placeholder="All"
          :options="options(drugTypes)"
        />
        <KitNativeSelect
          v-model="filters.drugForm"
          label="Drug form"
          placeholder="All"
          :options="options(drugForms)"
        />
        <KitNativeSelect
          v-model="filters.dosageForm"
          label="Dosage form"
          placeholder="All"
          :options="options(dosageForms)"
        />
        <KitNativeSelect
          v-model="filters.vendor"
          label="Vendor"
          placeholder="All"
          :options="options(vendors)"
        />
        <div class="flex gap-2">
          <KitButton severity="secondary" @click="clearFilters">Clear filters</KitButton>
          <KitButton @click="filtersOpen = false">Show results</KitButton>
        </div>
      </div>
    </KitDrawer>
    <KitConfirmHost />
  </div>
</template>
