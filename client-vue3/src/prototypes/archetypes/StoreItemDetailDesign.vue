<script setup lang="ts">
import { computed } from 'vue';
import DetailPage from '../../components/archetypes/DetailPage.vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitDescriptionList from '../../components/kit/KitDescriptionList.vue';
import KitDropdown from '../../components/kit/KitDropdown.vue';
import StoreItemHistory from './StoreItemHistory.vue';
import { money, type StockItem } from './designData';

const props = defineProps<{ item: StockItem }>();
const emit = defineEmits<{ back: [] }>();

const tabs = [
  { value: 'detail', label: 'Item detail' },
  { value: 'history', label: 'History', lazy: true },
  { value: 'logs', label: 'Logs', lazy: true },
];

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

const more = [
  { value: 'reorder', label: 'Reorder' },
  { value: 'return', label: 'Return to vendor' },
  { value: 'deactivate', label: 'Deactivate', danger: true, separatorBefore: true },
];
</script>

<template>
  <DetailPage
    :title="item.name"
    :tabs="tabs"
    tabs-label="Store item sections"
    back-label="Store items"
    @back="emit('back')"
  >
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
    <template #panel-detail><KitDescriptionList :items="details" /></template>
    <template #panel-history><StoreItemHistory :item="item" /></template>
    <template #panel-logs>
      <p class="pt-2 text-center text-ink-secondary">No logs for this item yet.</p>
    </template>
  </DetailPage>
</template>
