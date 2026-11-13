<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import KitBadge, { type KitBadgeSeverity } from '../../components/kit/KitBadge.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import KitPageHeader from '../../components/kit/KitPageHeader.vue';
import KitPagination from '../../components/kit/KitPagination.vue';
import KitProgress from '../../components/kit/KitProgress.vue';
import KitSkeleton from '../../components/kit/KitSkeleton.vue';
import KitTable, { type KitColumn } from '../../components/kit/KitTable.vue';
import KitTabs from '../../components/kit/KitTabs.vue';
import { useMediaQuery } from '../../components/kit/useMediaQuery';
import { useServerTable } from '../../components/kit/useServerTable';
import {
  filterPrescriptions,
  loadPrescriptions,
  prescriptions,
  statusOf,
  type Prescription,
  type PrescriptionStatus,
} from './designData';

const emit = defineEmits<{ open: [id: number, order: number[]] }>();

const day = ref('Today');
const days = [
  { value: 'Today', label: 'Today', lazy: true },
  { value: 'Backlog', label: 'Backlog', lazy: true },
];
const search = ref('');
const status = ref<string | null>(null);
const source = ref<string | null>(null);
const atLeastMd = useMediaQuery('(min-width: 768px)');

const filters = () => ({
  day: day.value,
  search: search.value,
  status: status.value,
  source: source.value,
});
const table = useServerTable<Prescription>(
  ({ page, pageSize }) => loadPrescriptions({ page, pageSize, ...filters() }),
  { pageSize: 50 }
);
table.reload();
watch([day, search, status, source], () => table.setPage(1));

const counts = computed(() => {
  const statuses = prescriptions.filter((item) => item.day === day.value).map(statusOf);
  return [
    { label: 'Prescriptions', value: statuses.length },
    { label: 'Pending', value: statuses.filter((value) => value === 'Pending').length },
    { label: 'Partly dispensed', value: statuses.filter((value) => value === 'Partial').length },
    { label: 'Dispensed', value: statuses.filter((value) => value === 'Complete').length },
  ];
});

const badge: Record<PrescriptionStatus, { label: string; severity: KitBadgeSeverity }> = {
  Pending: { label: 'Pending', severity: 'warning' },
  Partial: { label: 'Partly dispensed', severity: 'info' },
  Complete: { label: 'Dispensed', severity: 'success' },
};
const count = (item: Prescription, kind: 'drug' | 'item') =>
  item.drugs.filter((line) => line.kind === kind).length;
const percent = (item: Prescription) => {
  const prescribed = item.drugs.reduce((sum, line) => sum + line.quantityPrescribed, 0);
  const dispensed = item.drugs.reduce((sum, line) => sum + line.quantityDispensed, 0);
  return prescribed ? Math.round((dispensed / prescribed) * 100) : 0;
};
const sourceLabel = (value: string) => (value === 'Theater' ? 'Theatre' : value);

function open(item: Prescription): void {
  emit(
    'open',
    item.id,
    filterPrescriptions(filters()).map((entry) => entry.id)
  );
}

const columns: KitColumn[] = [
  { id: 'patient', header: 'Patient', compact: true },
  { id: 'hospitalNumber', header: 'Hospital no.', mono: true },
  { id: 'payer', header: 'Paid by' },
  { id: 'lines', header: 'Drugs and items' },
  { id: 'progress', header: 'Dispensed' },
  { id: 'source', header: 'Source', hideBelow: 'xl' },
  { id: 'status', header: 'Status' },
  { id: 'prescribedAt', header: 'Time', mono: true },
];
const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Partial', label: 'Partly dispensed' },
  { value: 'Complete', label: 'Dispensed' },
];
const sourceOptions = ['Consultation', 'Antenatal', 'Theater', 'Immunization'].map((value) => ({
  value,
  label: sourceLabel(value),
}));
const tile = 'flex flex-col gap-1 bg-surface px-4 py-3';
</script>

<template>
  <div class="flex flex-col gap-4">
    <KitPageHeader title="Prescriptions" description="Pharmacy dispensing" />

    <dl
      class="grid grid-cols-2 gap-px overflow-hidden rounded border border-line-subtle bg-line-subtle md:grid-cols-4"
    >
      <div v-for="item in counts" :key="item.label" :class="tile">
        <dt class="text-xs font-medium text-ink-secondary">{{ item.label }}</dt>
        <dd class="font-mono text-xl font-semibold">{{ item.value }}</dd>
      </div>
    </dl>

    <KitTabs v-model="day" :tabs="days" label="Which prescriptions">
      <template v-for="tabDay in days" :key="tabDay.value" #[`panel-${tabDay.value}`]>
        <div class="flex flex-col gap-4 pt-4">
          <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-0 flex-1 basis-[220px]">
              <KitInput
                v-model="search"
                label="Find a prescription"
                type="search"
                placeholder="Patient name or hospital number"
              />
            </div>
            <KitNativeSelect
              v-model="status"
              label="Status"
              placeholder="All"
              :options="statusOptions"
              class="w-[170px]"
            />
            <KitNativeSelect
              v-model="source"
              label="Source"
              placeholder="All"
              :options="sourceOptions"
              class="w-[170px]"
            />
          </div>

          <p class="text-ink-secondary" aria-live="polite">
            <span class="font-mono">{{ table.total.value }}</span>
            {{ table.total.value === 1 ? 'prescription' : 'prescriptions' }}
          </p>

          <template v-if="!atLeastMd">
            <KitSkeleton
              v-if="table.loading.value && !table.rows.value.length"
              variant="lines"
              :rows="6"
            />
            <p v-else-if="!table.rows.value.length" class="py-6 text-center text-ink-secondary">
              No prescriptions match.
            </p>
            <ul v-else aria-label="Prescriptions" class="flex flex-col border-t border-line-subtle">
              <li
                v-for="item in table.rows.value"
                :key="item.id"
                class="border-b border-line-subtle"
              >
                <button
                  type="button"
                  class="flex w-full flex-col gap-2 px-1 py-3 text-left hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  @click="open(item)"
                >
                  <span class="flex items-start justify-between gap-2">
                    <span class="font-semibold">{{ item.patient }}</span>
                    <KitBadge :severity="badge[statusOf(item)].severity">{{
                      badge[statusOf(item)].label
                    }}</KitBadge>
                  </span>
                  <span class="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-secondary">
                    <span class="font-mono text-xs">{{ item.hospitalNumber }}</span>
                    <KitBadge variant="dot" :severity="item.insurance ? 'info' : 'neutral'">{{
                      item.insurance?.name ?? 'Cash'
                    }}</KitBadge>
                    <span>{{ sourceLabel(item.source) }}</span>
                    <span class="font-mono text-xs">{{ item.prescribedAt }}</span>
                  </span>
                  <span class="flex items-center gap-3">
                    <KitProgress
                      class="flex-1"
                      :label="`${item.patient}: dispensed`"
                      :value="percent(item)"
                      :max="100"
                      :value-text="`${percent(item)}% dispensed`"
                      :severity="statusOf(item) === 'Complete' ? 'success' : 'primary'"
                    />
                    <span class="shrink-0 text-ink-secondary">
                      <span class="font-mono text-ink">{{ percent(item) }}%</span> dispensed
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </template>
          <KitTable
            v-else
            label="Prescriptions"
            :columns="columns"
            :rows="table.rows.value"
            row-key="id"
            :loading="table.loading.value"
            :error="table.error.value"
            empty-text="No prescriptions match."
            @retry="table.reload"
          >
            <template #cell-patient="{ row }">
              <button
                type="button"
                class="min-h-xs rounded-xs text-left font-semibold hover:text-primary hover:underline touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                @click="open(row)"
              >
                {{ row.patient }}
              </button>
            </template>
            <template #cell-payer="{ row }">
              <KitBadge variant="dot" :severity="row.insurance ? 'info' : 'neutral'">{{
                row.insurance?.name ?? 'Cash'
              }}</KitBadge>
            </template>
            <template #cell-lines="{ row }">
              <span class="whitespace-nowrap">
                <span class="font-mono">{{ count(row, 'drug') }}</span>
                {{ count(row, 'drug') === 1 ? 'drug' : 'drugs'
                }}<template v-if="count(row, 'item')"
                  >, <span class="font-mono">{{ count(row, 'item') }}</span>
                  {{ count(row, 'item') === 1 ? 'item' : 'items' }}</template
                >
              </span>
            </template>
            <template #cell-progress="{ row }">
              <span class="flex min-w-[120px] items-center gap-2">
                <KitProgress
                  class="flex-1"
                  :label="`${row.patient}: dispensed`"
                  :value="percent(row)"
                  :max="100"
                  :value-text="`${percent(row)}% dispensed`"
                  :severity="statusOf(row) === 'Complete' ? 'success' : 'primary'"
                />
                <span class="font-mono text-xs text-ink-secondary">{{ percent(row) }}%</span>
              </span>
            </template>
            <template #cell-source="{ row }">{{ sourceLabel(row.source) }}</template>
            <template #cell-status="{ row }">
              <KitBadge :severity="badge[statusOf(row)].severity">{{
                badge[statusOf(row)].label
              }}</KitBadge>
            </template>
          </KitTable>

          <KitPagination
            label="Prescription pages"
            :page="table.page.value"
            :page-size="table.pageSize.value"
            :total="table.total.value"
            :shown-count="table.rows.value.length"
            @update:page="table.setPage"
            @update:page-size="table.setPageSize"
          />
        </div>
      </template>
    </KitTabs>
  </div>
</template>
