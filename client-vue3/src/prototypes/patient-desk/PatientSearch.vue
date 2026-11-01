<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitConfirmHost from '../../components/kit/KitConfirmHost.vue';
import KitDatePicker from '../../components/kit/KitDatePicker.vue';
import KitPagination from '../../components/kit/KitPagination.vue';
import KitTable, { type KitColumn } from '../../components/kit/KitTable.vue';
import { useConfirm } from '../../components/kit/useConfirm';
import { useServerTable } from '../../components/kit/useServerTable';
import { searchPatients, type FakePatient } from './fakeData';
import { deactivateRoles, startVisitRoles, type DemoRole } from './roles';

const props = defineProps<{ term: string; role: DemoRole }>();
const emit = defineEmits<{
  open: [patient: FakePatient];
  visit: [patient: FakePatient];
  register: [term: string];
}>();

const from = ref<string | null>(null);
const to = ref<string | null>(null);
const table = useServerTable<FakePatient>(({ page, pageSize }) =>
  searchPatients({ page, pageSize, term: props.term, from: from.value, to: to.value })
);
table.reload();
watch([() => props.term, from, to], () => table.setPage(1));

const canStartVisit = computed(() => startVisitRoles.includes(props.role));
const canDeactivate = computed(() => deactivateRoles.includes(props.role));
const { confirm } = useConfirm();

async function confirmDeactivate(patient: FakePatient): Promise<void> {
  const confirmed = await confirm({
    title: `Deactivate ${patient.name}?`,
    text: 'No new visits can start for this patient until the account is reactivated.',
    confirmLabel: 'Deactivate',
    severity: 'danger',
  });
  if (!confirmed) return;
  patient.status = 'inactive';
  table.reload();
}

const visitReason = (patient: FakePatient): string | undefined => {
  if (!canStartVisit.value) return 'Your role cannot start visits';
  return patient.status === 'active' ? undefined : 'This patient is inactive';
};

const columns: KitColumn[] = [
  { id: 'name', header: 'Name', compact: true },
  { id: 'hospitalNumber', header: 'Hospital no.', mono: true },
  { id: 'phone', header: 'Phone', mono: true },
  { id: 'age', header: 'Age' },
  { id: 'gender', header: 'Gender' },
  { id: 'insurance', header: 'Insurance' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: 'Actions', compact: true },
];
</script>

<template>
  <section aria-label="Patients" class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <p class="text-ink-secondary" data-testid="result-summary" aria-live="polite">
        <template v-if="term">{{ table.total.value }} found for “{{ term }}”</template>
        <template v-else>Latest registrations</template>
      </p>
      <div class="flex items-end gap-2">
        <KitDatePicker v-model="from" label="Registered from" />
        <KitDatePicker v-model="to" label="Registered to" />
      </div>
    </div>
    <KitTable
      label="Patients"
      :columns="columns"
      :rows="table.rows.value"
      row-key="id"
      :loading="table.loading.value"
      :error="table.error.value"
      @retry="table.reload"
    >
      <template #cell-name="{ row }">
        <button
          type="button"
          class="min-h-xs rounded-xs text-left font-semibold text-ink hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          @click="emit('open', row)"
        >
          {{ row.name }}
        </button>
      </template>
      <template #cell-insurance="{ row }">
        <span class="text-xs text-ink-secondary">{{ row.insurance }}</span>
      </template>
      <template #cell-status="{ row }">
        <KitBadge variant="dot" :severity="row.status === 'active' ? 'success' : 'danger'">{{
          row.status === 'active' ? 'Active' : 'Inactive'
        }}</KitBadge>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-1">
          <KitButton
            size="xs"
            severity="accent"
            :disabled="Boolean(visitReason(row))"
            :title="visitReason(row)"
            :aria-label="`Start visit for ${row.name}`"
            @click="emit('visit', row)"
            >Start visit</KitButton
          >
          <KitButton
            v-if="canDeactivate && row.status === 'active'"
            size="xs"
            severity="secondary"
            :aria-label="`Deactivate ${row.name}`"
            @click="confirmDeactivate(row)"
            >Deactivate</KitButton
          >
        </div>
      </template>
      <template #empty>
        <div class="flex flex-col items-center gap-2 py-3" data-testid="no-match">
          <p>No patient matches “{{ term }}”.</p>
          <KitButton @click="emit('register', term)"
            >Register “{{ term }}” as a new patient</KitButton
          >
        </div>
      </template>
    </KitTable>
    <KitPagination
      label="Patients pagination"
      :page="table.page.value"
      :page-size="table.pageSize.value"
      :total="table.total.value"
      :shown-count="table.rows.value.length"
      @update:page="table.setPage"
      @update:page-size="table.setPageSize"
    />
    <KitConfirmHost />
  </section>
</template>
