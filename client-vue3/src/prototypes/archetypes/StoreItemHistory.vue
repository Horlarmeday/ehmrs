<script setup lang="ts">
import { onMounted, ref } from 'vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitTable, { type KitColumn } from '../../components/kit/KitTable.vue';
import { designControls, historyFor, money, type HistoryEntry, type StockItem } from './designData';

const props = defineProps<{ item: StockItem }>();

const history = ref<HistoryEntry[]>([]);
const loading = ref(false);
const error = ref<string | undefined>();

async function load(): Promise<void> {
  loading.value = true;
  error.value = undefined;
  await new Promise((resolve) => setTimeout(resolve, designControls.delay * 2));
  loading.value = false;
  if (designControls.failNext) {
    designControls.failNext = false;
    error.value = 'The history could not be loaded. Check the connection and try again.';
    return;
  }
  history.value = historyFor(props.item);
}
onMounted(load);

const columns: KitColumn[] = [
  { id: 'history', header: 'History' },
  { id: 'quantity', header: 'Quantity', numeric: true },
  { id: 'quantityRemaining', header: 'Qty remaining', numeric: true, hideBelow: 'md' },
  { id: 'inventory', header: 'Inventory', hideBelow: 'lg' },
  { id: 'price', header: 'Price', numeric: true, hideBelow: 'xl' },
  { id: 'status', header: 'Status' },
  { id: 'actionBy', header: 'Action by', hideBelow: 'lg' },
  { id: 'date', header: 'Date', mono: true },
];
</script>

<template>
  <KitTable
    label="Item history"
    :columns="columns"
    :rows="history"
    row-key="id"
    :loading="loading"
    :error="error"
    empty-text="No history yet."
    @retry="load"
  >
    <template #cell-price="{ row }">{{ money(row.price) }}</template>
    <template #cell-status="{ row }">
      <KitBadge :severity="row.status === 'Returned' ? 'info' : 'success'">{{
        row.status
      }}</KitBadge>
    </template>
  </KitTable>
</template>
