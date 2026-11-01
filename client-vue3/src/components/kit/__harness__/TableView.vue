<script setup lang="ts">
import { ref } from 'vue';
import KitBadge from '../KitBadge.vue';
import KitButton from '../KitButton.vue';
import KitPagination from '../KitPagination.vue';
import KitTable, { type KitColumn } from '../KitTable.vue';
import { useServerTable, type ServerTableQuery } from '../useServerTable';

interface Row extends Record<string, unknown> {
  id: number;
  name: string;
  amount: number;
  status: string;
}

const params = new URLSearchParams(window.location.search);
const dense = params.has('dense');

const columns: KitColumn[] = [
  { id: 'name', header: 'Name', sortable: true },
  { id: 'amount', header: 'Amount', numeric: true, sortable: true },
  { id: 'status', header: 'Status' },
];

let dataset: Row[] = Array.from({ length: 57 }, (_, index) => ({
  id: index + 1,
  name: `Item ${String(index + 1).padStart(2, '0')}`,
  amount: (index * 37) % 100,
  status: index % 2 ? 'Paid' : 'Cleared',
}));
const requests = ref<ServerTableQuery[]>([]);
const failNext = ref(false);
const holdFirst = ref(params.has('hold'));

function compare(a: unknown, b: unknown): number {
  return typeof a === 'number' && typeof b === 'number'
    ? a - b
    : String(a).localeCompare(String(b));
}

function fetchRows(query: ServerTableQuery): Promise<{ rows: Row[]; total: number }> {
  requests.value = [...requests.value, query];
  const delay = query.page === 2 ? 300 : 20;
  const hold = holdFirst.value;
  return new Promise((resolve, reject) => {
    const settle = () => {
      if (failNext.value) {
        failNext.value = false;
        reject(new Error('failed'));
        return;
      }
      const { id, desc } = query.sort ?? { id: 'id', desc: false };
      const direction = desc ? -1 : 1;
      const sorted = [...dataset].sort((a, b) => direction * compare(a[id], b[id]));
      const start = (query.page - 1) * query.pageSize;
      resolve({ rows: sorted.slice(start, start + query.pageSize), total: dataset.length });
    };
    if (hold) window.addEventListener('harness-release', settle, { once: true });
    else setTimeout(settle, delay);
  });
}

const table = useServerTable(fetchRows, { errorMessage: 'Could not load records.' });
table.reload();

const selected = ref<unknown[]>([]);

function clearData(): void {
  dataset = [];
  table.reload();
}

function shrinkData(): void {
  dataset = dataset.slice(0, 21);
  table.reload();
}

function failNextRequest(): void {
  failNext.value = true;
  table.reload();
}

function release(): void {
  holdFirst.value = false;
  window.dispatchEvent(new Event('harness-release'));
}

const groupRows = [
  { id: 'g1', group: 'Morning', name: '', amount: '', status: '' },
  { id: 'r1', group: '', name: 'Alpha', amount: 12.5, status: 'Paid' },
  { id: 'r2', group: '', name: 'Beta', amount: 7, status: 'Paid' },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <KitButton @click="failNextRequest">Fail next</KitButton>
      <KitButton @click="clearData">Empty data</KitButton>
      <KitButton @click="shrinkData">Shrink data</KitButton>
      <KitButton @click="release">Release</KitButton>
    </div>
    <div class="flex flex-col gap-2">
      <KitTable
        v-model:selected="selected"
        label="Records"
        :columns="columns"
        :rows="table.rows.value"
        row-key="id"
        :sort="table.sort.value"
        :loading="table.loading.value"
        :error="table.error.value"
        :dense="dense"
        max-height="180px"
        selectable
        :row-label="(row) => `Select ${row.name}`"
        @update:sort="table.setSort"
        @retry="table.reload"
      >
        <template #cell-status="{ row }">
          <KitBadge :severity="row.status === 'Paid' ? 'success' : 'info'">{{
            row.status
          }}</KitBadge>
        </template>
      </KitTable>
      <KitPagination
        label="Records pagination"
        :page="table.page.value"
        :page-size="table.pageSize.value"
        :total="table.total.value"
        :shown-count="table.rows.value.length"
        @update:page="table.setPage"
        @update:page-size="table.setPageSize"
      />
    </div>
    <KitTable
      label="Grouped records"
      :columns="columns.map(({ id, header, numeric }) => ({ id, header, numeric }))"
      :rows="groupRows"
      row-key="id"
      group-key="group"
    />
    <output data-testid="requests" class="sr-only">{{ JSON.stringify(requests) }}</output>
    <output data-testid="selected" class="sr-only">{{ JSON.stringify(selected) }}</output>
  </div>
</template>
