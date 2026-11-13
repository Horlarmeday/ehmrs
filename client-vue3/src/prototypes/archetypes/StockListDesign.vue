<script setup lang="ts">
import { computed, ref } from 'vue';
import ListPage, { type ListQuery } from '../../components/archetypes/ListPage.vue';
import { choiceField, textField, useRouteParam } from '../../components/archetypes/useRouteState';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitDropdown from '../../components/kit/KitDropdown.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import type { KitColumn } from '../../components/kit/KitTable.vue';
import { useConfirm } from '../../components/kit/useConfirm';
import {
  dosageForms,
  drugForms,
  drugTypes,
  loadStock,
  money,
  vendors,
  type StockItem,
} from './designData';

const emit = defineEmits<{ open: [item: StockItem]; add: [] }>();

const search = useRouteParam('search', textField({ maxLength: 60 }));
const drugType = useRouteParam('type', choiceField(drugTypes));
const drugForm = useRouteParam('form', choiceField(drugForms));
const dosageForm = useRouteParam('dosage', choiceField(dosageForms));
const vendor = useRouteParam('vendor', choiceField(vendors));
const draft = ref(search.value);
const selected = ref<unknown[]>([]);
const { confirm } = useConfirm();

const query = computed(() => ({
  search: search.value,
  drugType: drugType.value,
  drugForm: drugForm.value,
  dosageForm: dosageForm.value,
  vendor: vendor.value,
}));
const activeFilters = computed(
  () => [drugType, drugForm, dosageForm, vendor].filter((item) => item.value).length
);

const load = (request: ListQuery) =>
  loadStock({
    page: request.page,
    pageSize: request.pageSize,
    sort: request.sort,
    ...query.value,
  });

function runSearch(): void {
  search.value = draft.value.trim();
}

function clearFilters(): void {
  drugType.value = null;
  drugForm.value = null;
  dosageForm.value = null;
  vendor.value = null;
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

const options = (values: string[]) => values.map((value) => ({ value, label: value }));
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
const columns: KitColumn[] = [
  { id: 'name', header: 'Name', sortable: true },
  { id: 'quantityRemaining', header: 'Qty remaining', numeric: true, sortable: true },
  { id: 'dosageForm', header: 'Dosage form', hideBelow: 'lg' },
  { id: 'strength', header: 'Strength', hideBelow: 'lg' },
  { id: 'costPrice', header: 'Cost price', numeric: true, hideBelow: 'xl' },
  { id: 'sellingPrice', header: 'Selling price', numeric: true },
  { id: 'expiry', header: 'Expiry', mono: true, sortable: true },
  { id: 'dateAdded', header: 'Date added', mono: true, hideBelow: 'xl' },
];
</script>

<template>
  <ListPage
    v-model:selected="selected"
    title="Store items"
    description="Pharmacy store"
    label="Store items"
    :columns="columns"
    row-key="id"
    :load="load"
    :query="query"
    :active-filters="activeFilters"
    selectable
    :row-label="(row) => `Select ${row.name}`"
    empty-text="No items match. Try fewer filters."
    @clear-filters="clearFilters"
  >
    <template #actions>
      <KitDropdown label="More" :items="more" severity="secondary" />
      <KitButton @click="emit('add')">Add item</KitButton>
    </template>
    <template #search>
      <form
        role="search"
        class="flex min-w-0 flex-1 basis-[240px] items-end gap-2"
        @submit.prevent="runSearch"
      >
        <div class="min-w-0 flex-1">
          <KitInput
            v-model="draft"
            label="Search items"
            type="search"
            enterkeyhint="search"
            placeholder="Name or product code"
          />
        </div>
        <KitButton type="submit" severity="secondary">Search</KitButton>
      </form>
    </template>
    <template #filters>
      <KitNativeSelect
        v-model="drugType"
        label="Drug type"
        placeholder="All"
        :options="options(drugTypes)"
        class="lg:w-[150px]"
      />
      <KitNativeSelect
        v-model="drugForm"
        label="Drug form"
        placeholder="All"
        :options="options(drugForms)"
        class="lg:w-[150px]"
      />
      <KitNativeSelect
        v-model="dosageForm"
        label="Dosage form"
        placeholder="All"
        :options="options(dosageForms)"
        class="lg:w-[150px]"
      />
      <KitNativeSelect
        v-model="vendor"
        label="Vendor"
        placeholder="All"
        :options="options(vendors)"
        class="lg:w-[180px]"
      />
    </template>
    <template #bulk>
      <KitButton size="xs" severity="secondary">Dispense</KitButton>
      <KitDropdown
        label="More actions"
        :items="bulkActions"
        severity="secondary"
        size="xs"
        @select="onBulk"
      />
    </template>
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
    <template #card="{ row }">
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="min-h-xs text-left font-semibold hover:text-primary touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          @click="emit('open', row)"
        >
          {{ row.name }}
        </button>
        <KitBadge v-if="row.quantityRemaining === 0" severity="danger">Out of stock</KitBadge>
      </div>
      <dl class="grid grid-cols-3 gap-x-3 text-ink-secondary">
        <div>
          <dt class="text-xs">Remaining</dt>
          <dd class="font-mono text-ink">{{ row.quantityRemaining }}</dd>
        </div>
        <div>
          <dt class="text-xs">Selling price</dt>
          <dd class="font-mono text-ink">{{ money(row.sellingPrice) }}</dd>
        </div>
        <div>
          <dt class="text-xs">Expiry</dt>
          <dd class="font-mono text-ink">{{ row.expiry }}</dd>
        </div>
      </dl>
    </template>
  </ListPage>
</template>
