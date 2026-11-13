<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import KitBackLink from '../../components/kit/KitBackLink.vue';
import KitBadge, { type KitBadgeSeverity } from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitDialog from '../../components/kit/KitDialog.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import KitPageHeader from '../../components/kit/KitPageHeader.vue';
import KitProgress from '../../components/kit/KitProgress.vue';
import KitRecordPager from '../../components/kit/KitRecordPager.vue';
import KitStatGrid from '../../components/kit/KitStatGrid.vue';
import KitTabs from '../../components/kit/KitTabs.vue';
import { money, type PaymentStatus, type PrescribedDrug, type Prescription } from './designData';

const props = defineProps<{ prescription: Prescription; position: number; total: number }>();
const emit = defineEmits<{ back: []; previous: []; next: [] }>();

const section = ref('drugs');
const lineSearch = ref('');
const lineStatus = ref<string | null>(null);
const historyOpen = ref(false);
const canReturn = true;

const paymentBadge: Record<PaymentStatus, { label: string; severity: KitBadgeSeverity }> = {
  Paid: { label: 'Paid', severity: 'success' },
  Pending: { label: 'Awaiting payment', severity: 'warning' },
  Failed: { label: 'Payment failed', severity: 'danger' },
  Permitted: { label: 'Payment deferred', severity: 'info' },
  Cleared: { label: 'Payment cleared', severity: 'success' },
};

const remaining = (line: PrescribedDrug) => line.quantityPrescribed - line.quantityDispensed;
const returnable = (line: PrescribedDrug) => line.quantityDispensed - line.quantityReturned;
function lineStatusOf(line: PrescribedDrug): {
  label: string;
  severity: KitBadgeSeverity;
  key: string;
} {
  if (line.quantityDispensed === 0)
    return { label: 'Pending', severity: 'warning', key: 'Pending' };
  return remaining(line) > 0
    ? { label: 'Partly dispensed', severity: 'info', key: 'Partial' }
    : { label: 'Dispensed', severity: 'success', key: 'Dispensed' };
}
function lockReason(line: PrescribedDrug): string | null {
  if (remaining(line) <= 0) return null;
  if (line.payment === 'Pending') return 'Awaiting payment. Dispensing opens once it is paid.';
  return null;
}
const unitWord = (line: PrescribedDrug, count: number) =>
  `${line.dosageForm.toLowerCase()}${count === 1 ? '' : 's'}`;

const drugs = computed(() => props.prescription.drugs.filter((line) => line.kind === 'drug'));
const items = computed(() => props.prescription.drugs.filter((line) => line.kind === 'item'));
const sections = computed(() => [
  { value: 'drugs', label: `Drugs (${drugs.value.length})` },
  ...(items.value.length
    ? [{ value: 'items', label: `Additional items (${items.value.length})` }]
    : []),
]);
function linesFor(kind: string): PrescribedDrug[] {
  const term = lineSearch.value.trim().toLowerCase();
  return (kind === 'drugs' ? drugs.value : items.value).filter(
    (line) =>
      (!term || line.drugName.toLowerCase().includes(term)) &&
      (!lineStatus.value || lineStatusOf(line).key === lineStatus.value)
  );
}

const totals = computed(() => {
  const patient = props.prescription.drugs.reduce((sum, line) => sum + line.patientShare, 0);
  const payer = props.prescription.drugs.reduce((sum, line) => sum + line.payerShare, 0);
  return { total: patient + payer, patient, payer };
});
const moneyStats = computed(() => [
  {
    label: 'Paid by',
    value: props.prescription.insurance?.name ?? 'Cash',
    detail: props.prescription.insurance
      ? (props.prescription.insurance.hmo ?? 'Insurance')
      : 'Full payment required',
    mono: false,
  },
  { label: 'Total', value: money(totals.value.total) },
  { label: 'Patient pays', value: money(totals.value.patient) },
  { label: 'Payer covers', value: money(totals.value.payer) },
]);
const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

const dispensing = ref<number | null>(null);
const returning = ref<number | null>(null);
const quantity = ref('');
const reason = ref('');
const formError = ref('');
const notice = ref('');

function closeForms(): void {
  dispensing.value = null;
  returning.value = null;
  formError.value = '';
}
watch(
  () => props.prescription.id,
  () => {
    section.value = 'drugs';
    lineSearch.value = '';
    lineStatus.value = null;
    notice.value = '';
    closeForms();
  }
);
function startDispense(line: PrescribedDrug): void {
  closeForms();
  dispensing.value = line.id;
  quantity.value = String(remaining(line));
  notice.value = '';
}
function startReturn(line: PrescribedDrug): void {
  closeForms();
  returning.value = line.id;
  quantity.value = String(returnable(line));
  reason.value = '';
  notice.value = '';
}
function confirmDispense(line: PrescribedDrug): void {
  const amount = Number(quantity.value);
  if (!Number.isInteger(amount) || amount < 1 || amount > remaining(line)) {
    formError.value = `Enter a whole number from 1 to ${remaining(line)}.`;
    return;
  }
  line.quantityDispensed += amount;
  line.dispenser = 'Pharm. Amina Yusuf';
  line.dateDispensed = '13 Nov 2026, now';
  notice.value = `Dispensed ${amount} ${unitWord(line, amount)} of ${line.drugName}. This is a design screen, so nothing was sent.`;
  closeForms();
}
function confirmReturn(line: PrescribedDrug): void {
  const amount = Number(quantity.value);
  if (!Number.isInteger(amount) || amount < 1 || amount > returnable(line)) {
    formError.value = `Enter a whole number from 1 to ${returnable(line)}.`;
    return;
  }
  if (!reason.value.trim()) {
    formError.value = 'Give a reason for the return.';
    return;
  }
  line.quantityReturned += amount;
  line.quantityDispensed -= amount;
  notice.value = `Returned ${amount} ${unitWord(line, amount)} of ${line.drugName}. This is a design screen, so nothing was sent.`;
  closeForms();
}

const lineStatusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Partial', label: 'Partly dispensed' },
  { value: 'Dispensed', label: 'Dispensed' },
];
const pastPrescriptions = [
  {
    date: '02 Oct 2026',
    drugs: 'Amoxicillin, Paracetamol',
    by: 'Dr. Ibrahim Musa',
    status: 'Dispensed',
  },
  { date: '14 Aug 2026', drugs: 'Omeprazole', by: 'Dr. Ngozi Eze', status: 'Dispensed' },
];
const fact = 'flex min-w-0 flex-col gap-[2px]';
const factLabel = 'text-xs text-ink-secondary';
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <KitBackLink label="Prescriptions" @click="emit('back')" />
      <KitRecordPager
        :position="position"
        :total="total"
        noun="prescription"
        label="Prescription queue"
        @previous="emit('previous')"
        @next="emit('next')"
      />
    </div>

    <KitPageHeader :title="prescription.patient">
      <template #before>
        <span
          aria-hidden="true"
          class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle font-semibold text-primary-subtle-text"
          >{{ initials(prescription.patient) }}</span
        >
      </template>
      <template #meta>
        <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="font-mono text-xs">{{ prescription.hospitalNumber }}</span>
          <span>{{ prescription.age }} years, {{ prescription.gender }}</span>
          <span class="font-mono text-xs">{{ prescription.phone }}</span>
          <span
            >Prescribed {{ prescription.prescribedOn }}, {{ prescription.prescribedAt }} by
            {{ prescription.drugs[0]?.prescribedBy }}</span
          >
        </span>
      </template>
      <template #actions>
        <KitButton severity="secondary" @click="historyOpen = true">Past prescriptions</KitButton>
      </template>
    </KitPageHeader>

    <KitStatGrid :items="moneyStats" wide-at="lg" />

    <p
      v-if="notice"
      role="status"
      class="rounded-sm bg-success-subtle px-3 py-2 text-success-subtle-text"
    >
      {{ notice }}
    </p>

    <KitTabs v-model="section" :tabs="sections" label="Prescription lines">
      <template v-for="part in sections" :key="part.value" #[`panel-${part.value}`]>
        <div class="flex flex-col gap-3 pt-4">
          <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-0 flex-1 basis-[200px]">
              <KitInput
                v-model="lineSearch"
                :label="part.value === 'drugs' ? 'Search drugs' : 'Search items'"
                type="search"
              />
            </div>
            <KitNativeSelect
              v-model="lineStatus"
              label="Status"
              placeholder="All"
              :options="lineStatusOptions"
              class="w-[170px]"
            />
          </div>

          <ul class="flex flex-col border-t border-line-subtle">
            <li
              v-for="line in linesFor(part.value)"
              :key="line.id"
              class="flex flex-col gap-3 border-b border-line-subtle py-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <h2 class="font-semibold">{{ line.drugName }}</h2>
                  <p class="text-ink-secondary">{{ line.dosageForm }}, {{ line.strength }}</p>
                </div>
                <span class="flex flex-wrap items-center gap-2">
                  <KitBadge :severity="lineStatusOf(line).severity">{{
                    lineStatusOf(line).label
                  }}</KitBadge>
                  <KitBadge variant="dot" :severity="paymentBadge[line.payment].severity">{{
                    paymentBadge[line.payment].label
                  }}</KitBadge>
                </span>
              </div>

              <div class="flex items-center gap-3">
                <KitProgress
                  class="flex-1"
                  :label="`${line.drugName} dispensed`"
                  :value="line.quantityDispensed"
                  :max="line.quantityPrescribed"
                  :severity="remaining(line) <= 0 ? 'success' : 'primary'"
                />
                <span class="shrink-0 text-ink-secondary">
                  <span class="font-mono text-ink">{{ line.quantityDispensed }}</span> of
                  <span class="font-mono text-ink">{{ line.quantityPrescribed }}</span> dispensed
                </span>
              </div>

              <dl class="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                <div :class="fact">
                  <dt :class="factLabel">Remaining</dt>
                  <dd class="font-mono">
                    {{ remaining(line) }} {{ unitWord(line, remaining(line)) }}
                  </dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Frequency</dt>
                  <dd>{{ line.frequency }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Duration</dt>
                  <dd>{{ line.duration }} {{ line.durationUnit }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Route</dt>
                  <dd>{{ line.route }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Drug type</dt>
                  <dd>{{ line.drugType }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Unit price</dt>
                  <dd class="font-mono">{{ money(line.unitPrice) }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Patient pays</dt>
                  <dd class="font-mono">{{ money(line.patientShare) }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Payer covers</dt>
                  <dd class="font-mono">{{ money(line.payerShare) }}</dd>
                </div>
                <div :class="fact">
                  <dt :class="factLabel">Prescribed by</dt>
                  <dd>{{ line.prescribedBy }}</dd>
                </div>
                <div v-if="line.dispenser" :class="fact">
                  <dt :class="factLabel">Dispensed by</dt>
                  <dd>{{ line.dispenser }}, {{ line.dateDispensed }}</dd>
                </div>
              </dl>

              <form
                v-if="dispensing === line.id"
                novalidate
                class="flex flex-wrap items-end gap-3 rounded-sm bg-surface-alt px-3 py-3"
                :aria-label="`Dispense ${line.drugName}`"
                @submit.prevent="confirmDispense(line)"
              >
                <div class="w-[180px]">
                  <KitInput
                    v-model="quantity"
                    :label="`Quantity (${unitWord(line, 2)})`"
                    inputmode="numeric"
                    numeric
                    :error="formError || undefined"
                  />
                </div>
                <p class="pb-2 text-ink-secondary">
                  Up to <span class="font-mono">{{ remaining(line) }}</span>
                </p>
                <span class="ml-auto flex gap-2">
                  <KitButton severity="secondary" @click="closeForms">Cancel</KitButton>
                  <KitButton type="submit">Confirm dispense</KitButton>
                </span>
              </form>

              <form
                v-else-if="returning === line.id"
                novalidate
                class="flex flex-wrap items-end gap-3 rounded-sm bg-surface-alt px-3 py-3"
                :aria-label="`Return ${line.drugName}`"
                @submit.prevent="confirmReturn(line)"
              >
                <div class="w-[150px]">
                  <KitInput
                    v-model="quantity"
                    :label="`Quantity (${unitWord(line, 2)})`"
                    inputmode="numeric"
                    numeric
                  />
                </div>
                <div class="min-w-0 flex-1 basis-[220px]">
                  <KitInput v-model="reason" label="Reason for return" />
                </div>
                <span class="flex gap-2">
                  <KitButton severity="secondary" @click="closeForms">Cancel</KitButton>
                  <KitButton type="submit" severity="danger">Confirm return</KitButton>
                </span>
                <p v-if="formError" role="alert" class="basis-full text-danger-subtle-text">
                  {{ formError }}
                </p>
              </form>

              <div v-else class="flex flex-wrap items-center gap-2">
                <p v-if="lockReason(line)" class="mr-auto text-ink-secondary">
                  {{ lockReason(line) }}
                </p>
                <p v-else-if="remaining(line) <= 0" class="mr-auto text-ink-secondary">
                  Fully dispensed.
                </p>
                <span v-else class="mr-auto" />
                <KitButton
                  v-if="canReturn && returnable(line) > 0"
                  severity="secondary"
                  size="xs"
                  :aria-label="`Return ${line.drugName}`"
                  @click="startReturn(line)"
                  >Return unused</KitButton
                >
                <KitButton
                  v-if="remaining(line) > 0"
                  severity="accent"
                  size="xs"
                  :disabled="Boolean(lockReason(line))"
                  :aria-label="`Dispense ${line.drugName}`"
                  @click="startDispense(line)"
                  >Dispense</KitButton
                >
              </div>
            </li>
          </ul>
          <p v-if="!linesFor(part.value).length" class="py-4 text-center text-ink-secondary">
            Nothing matches.
          </p>
        </div>
      </template>
    </KitTabs>

    <KitDialog
      v-model:open="historyOpen"
      :title="`Past prescriptions: ${prescription.patient}`"
      size="md"
      close-on-backdrop
    >
      <ul class="flex flex-col">
        <li
          v-for="past in pastPrescriptions"
          :key="past.date"
          class="flex flex-col gap-1 border-b border-line-subtle py-3"
        >
          <span class="flex justify-between gap-2"
            ><strong>{{ past.drugs }}</strong
            ><KitBadge severity="success">{{ past.status }}</KitBadge></span
          >
          <span class="text-ink-secondary">{{ past.date }} by {{ past.by }}</span>
        </li>
      </ul>
    </KitDialog>
  </div>
</template>
