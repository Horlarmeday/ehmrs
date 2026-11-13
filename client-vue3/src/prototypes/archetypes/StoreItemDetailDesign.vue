<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import KitBackLink from '../../components/kit/KitBackLink.vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitDescriptionList from '../../components/kit/KitDescriptionList.vue';
import KitDropdown from '../../components/kit/KitDropdown.vue';
import KitPageHeader from '../../components/kit/KitPageHeader.vue';
import KitTable, { type KitColumn } from '../../components/kit/KitTable.vue';
import KitTabs from '../../components/kit/KitTabs.vue';
import { designControls, historyFor, money, type HistoryEntry, type StockItem } from './designData';

const props = defineProps<{ item: StockItem }>();
const emit = defineEmits<{ back: [] }>();

const tab = ref('detail');
const tabs = [
  { value: 'detail', label: 'Item detail' },
  { value: 'history', label: 'History', lazy: true },
  { value: 'logs', label: 'Logs', lazy: true },
];
const history = ref<HistoryEntry[]>([]);
const historyLoading = ref(false);
const historyError = ref<string | undefined>();

async function loadHistory(): Promise<void> {
  historyLoading.value = true;
  historyError.value = undefined;
  await new Promise((resolve) => setTimeout(resolve, designControls.delay * 2));
  historyLoading.value = false;
  if (designControls.failNext) {
    designControls.failNext = false;
    historyError.value = 'The history could not be loaded. Check the connection and try again.';
    return;
  }
  history.value = historyFor(props.item);
}

watch(
  tab,
  (now) => {
    if (now === 'history' && !history.value.length) loadHistory();
  },
  { immediate: true }
);

const details = computed(() => [
  { label: 'Item name', value: props.item.name },
  { label: 'Dosage form', value: props.item.dosageForm },
  { label: 'Strength', value: props.item.strength },
  { label: 'Product code', value: props.item.productCode, mono: true },
  { label: 'Batch', value: props.item.batch, mono: true },
  { label: 'Voucher', value: props.item.voucher, mono: true },
  { label: 'Purchase unit cost', value: money(props.item.costPrice), mono: true },
  { label: 'Selling price', value: money(props.item.sellingPrice), mono: true },
  { label: 'Quantity received', value: props.item.quantityReceived, mono: true },
  { label: 'Quantity remaining', value: props.item.quantityRemaining, mono: true },
  { label: 'Shelf', value: props.item.shelf },
  { label: 'Date received', value: props.item.dateReceived, mono: true },
  { label: 'Brand', value: props.item.brand },
  { label: 'Vendor', value: props.item.vendor },
]);

const historyColumns: KitColumn[] = [
  { id: 'history', header: 'History' },
  { id: 'quantity', header: 'Quantity', numeric: true },
  { id: 'quantityRemaining', header: 'Qty remaining', numeric: true, hideBelow: 'md' },
  { id: 'inventory', header: 'Inventory', hideBelow: 'lg' },
  { id: 'price', header: 'Price', numeric: true, hideBelow: 'xl' },
  { id: 'status', header: 'Status' },
  { id: 'actionBy', header: 'Action by', hideBelow: 'lg' },
  { id: 'date', header: 'Date', mono: true },
];
const more = [
  { value: 'reorder', label: 'Reorder' },
  { value: 'return', label: 'Return to vendor' },
  { value: 'deactivate', label: 'Deactivate', danger: true, separatorBefore: true },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <KitPageHeader :title="item.name">
      <template #before>
        <KitBackLink label="Store items" class="mb-1" @click="emit('back')" />
      </template>
      <template #meta>
        <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="font-mono text-xs">{{ item.productCode }}</span>
          <span>{{ item.dosageForm }}, {{ item.strength }}</span>
          <span
            ><span class="font-mono">{{ item.quantityRemaining }}</span> remaining</span
          >
          <KitBadge v-if="item.quantityRemaining === 0" severity="danger">Out of stock</KitBadge>
          <KitBadge variant="dot" :severity="item.status === 'active' ? 'success' : 'danger'">{{
            item.status === 'active' ? 'Active' : 'Inactive'
          }}</KitBadge>
        </span>
      </template>
      <template #actions>
        <KitDropdown label="More" :items="more" severity="secondary" />
        <KitButton>Update item</KitButton>
      </template>
    </KitPageHeader>

    <KitTabs v-model="tab" :tabs="tabs" label="Store item sections">
      <template #panel-detail>
        <div class="pt-4"><KitDescriptionList :items="details" /></div>
      </template>
      <template #panel-history>
        <div class="pt-4">
          <KitTable
            label="Item history"
            :columns="historyColumns"
            :rows="history"
            row-key="id"
            :loading="historyLoading"
            :error="historyError"
            empty-text="No history yet."
            @retry="loadHistory"
          >
            <template #cell-price="{ row }">{{ money(row.price) }}</template>
            <template #cell-status="{ row }">
              <KitBadge :severity="row.status === 'Returned' ? 'info' : 'success'">{{
                row.status
              }}</KitBadge>
            </template>
          </KitTable>
        </div>
      </template>
      <template #panel-logs>
        <p class="pt-6 text-center text-ink-secondary">No logs for this item yet.</p>
      </template>
    </KitTabs>
  </div>
</template>
