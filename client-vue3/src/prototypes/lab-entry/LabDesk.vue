<script setup lang="ts">
import { computed, ref } from 'vue';
import KitBadge, { type KitBadgeSeverity } from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitCheckbox from '../../components/kit/KitCheckbox.vue';
import KitInput from '../../components/kit/KitInput.vue';
import KitRadioGroup from '../../components/kit/KitRadioGroup.vue';
import KitResultGrid from '../../components/kit/KitResultGrid.vue';
import KitSelect from '../../components/kit/KitSelect.vue';
import KitTextarea from '../../components/kit/KitTextarea.vue';
import { resultCell as cell, resultHead as head } from '../../components/kit/resultGridClasses';
import {
  fbcFields,
  hasResult,
  initialTests,
  isLocked,
  patient,
  rangeFlag,
  testers,
  widalFields,
  type LabTest,
} from './labData';

type Stage = 'Enter results' | 'Validate' | 'Approve';
const stages: Stage[] = ['Enter results', 'Validate', 'Approve'];
const stage = ref<Stage>('Enter results');
const tests = ref<LabTest[]>(initialTests());
const selectedId = ref(1);
const tester = ref<string | null>(null);
const notes = ref('');
const error = ref('');
const saved = ref('');

const selected = computed(() => tests.value.find((test) => test.id === selectedId.value));
const reviewable = computed(() =>
  tests.value.filter((test) => hasResult(test) && test.status !== 'Approved')
);
const approvable = computed(() => tests.value.filter((test) => test.status === 'Accepted'));
const decisions = [
  { value: 'Accepted', label: 'Accept' },
  { value: 'Rejected', label: 'Reject' },
];

function select(id: number): void {
  selectedId.value = id;
}

function chooseStage(next: Stage): void {
  stage.value = next;
  error.value = '';
  saved.value = '';
}

function statusOf(test: LabTest): { label: string; severity: KitBadgeSeverity } {
  if (test.status === 'Approved') return { label: 'Approved', severity: 'success' };
  if (test.payment === 'Pending') return { label: 'Payment pending', severity: 'warning' };
  if (test.status === 'Rejected') return { label: 'Rejected', severity: 'danger' };
  if (test.status === 'Accepted') return { label: 'Accepted', severity: 'info' };
  return hasResult(test)
    ? { label: 'Entered', severity: 'primary' }
    : { label: 'To do', severity: 'neutral' };
}

function saveResults(): void {
  saved.value = '';
  const entered = tests.value.filter((test) => hasResult(test) && !isLocked(test));
  if (!entered.length) {
    error.value = 'Input at least one result';
    return;
  }
  if (!tester.value) {
    error.value = 'Choose the tester before saving';
    return;
  }
  error.value = '';
  saved.value = `Saved ${entered.length} ${entered.length === 1 ? 'result' : 'results'}.`;
}

function validate(): void {
  saved.value = '';
  const decided = reviewable.value.filter((test) => test.status !== 'Pending');
  if (!decided.length) {
    error.value = 'Validate at least one result';
    return;
  }
  error.value = '';
  saved.value = `Validated ${decided.length} ${decided.length === 1 ? 'result' : 'results'}.`;
}

function approve(): void {
  saved.value = '';
  if (!approvable.value.length) {
    error.value = 'Approve at least one result';
    return;
  }
  const count = approvable.value.length;
  for (const test of approvable.value) test.status = 'Approved';
  error.value = '';
  saved.value = `Approved ${count} ${count === 1 ? 'result' : 'results'}.`;
}

const searchTesters = async (term: string) =>
  testers.filter((item) => item.label.toLowerCase().includes(term.toLowerCase()));

function summary(test: LabTest): string {
  return Object.entries(test.values)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      const label =
        fbcFields.find((field) => field.model === key)?.label ?? (key === 'result' ? '' : key);
      return label ? `${label} ${value}` : value;
    })
    .join(', ');
}

function setDecision(test: LabTest, value: string | undefined): void {
  if (value === 'Accepted' || value === 'Rejected') test.status = value;
}
</script>

<template>
  <div class="grid min-h-screen grid-cols-[208px_minmax(0,1fr)] bg-surface-page text-sm text-ink">
    <nav aria-label="Main" class="flex flex-col gap-1 bg-surface-alt px-[10px] py-4">
      <strong class="px-[10px] pb-4 pt-1 text-md">eHMRS</strong>
      <span class="flex min-h-xs items-center px-[10px] font-medium text-ink-secondary">Home</span>
      <span
        aria-current="page"
        class="flex min-h-xs items-center rounded-sm bg-surface px-[10px] font-medium shadow-sm"
        >Laboratory</span
      >
      <span class="flex min-h-xs items-center px-[10px] font-medium text-ink-secondary"
        >Reports</span
      >
    </nav>
    <main class="flex min-w-0 flex-col gap-4 px-[30px] py-[22px]">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">{{ patient.name }}</h1>
          <p class="flex flex-wrap gap-3 text-ink-secondary">
            <span class="font-mono text-xs leading-[21px]">{{ patient.hospitalNumber }}</span>
            <span>{{ patient.gender }}, {{ patient.age }}</span>
            <span>{{ patient.insurance }}</span>
          </p>
        </div>
        <div role="group" aria-label="Stage" class="flex gap-1 rounded-sm bg-surface-alt p-1">
          <button
            v-for="item in stages"
            :key="item"
            type="button"
            :aria-pressed="stage === item"
            class="min-h-xs rounded-xs px-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            :class="stage === item ? 'bg-surface shadow-sm' : 'text-ink-secondary'"
            @click="chooseStage(item)"
          >
            {{ item }}
          </button>
        </div>
      </header>

      <div v-if="stage === 'Enter results'" class="grid grid-cols-[260px_minmax(0,1fr)] gap-8">
        <ul aria-label="Tests in this sample" class="flex flex-col gap-1">
          <li v-for="test in tests" :key="test.id">
            <button
              type="button"
              :aria-current="test.id === selectedId ? 'true' : undefined"
              class="flex w-full flex-col gap-1 rounded-sm px-3 py-2 text-left hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              :class="test.id === selectedId ? 'bg-primary-subtle' : ''"
              @click="select(test.id)"
            >
              <span class="flex items-center justify-between gap-2 font-semibold">
                {{ test.name }}
                <KitBadge v-if="test.urgent" severity="danger">Urgent</KitBadge>
              </span>
              <KitBadge variant="dot" :severity="statusOf(test).severity">{{
                statusOf(test).label
              }}</KitBadge>
            </button>
          </li>
        </ul>

        <section
          v-if="selected"
          :aria-label="selected.name"
          class="flex min-w-0 flex-col gap-4"
        >
          <div>
            <h2 class="text-lg font-semibold">{{ selected.name }}</h2>
            <p class="flex gap-3 text-ink-secondary">
              <span class="font-mono text-xs leading-[21px]">{{ selected.labNumber }}</span>
              <span>{{ selected.sample }}</span>
              <span>Payment: {{ selected.payment }}</span>
            </p>
          </div>
          <p
            v-if="selected.payment === 'Pending'"
            role="status"
            class="rounded-sm bg-warning-subtle px-3 py-2 text-warning-subtle-text"
          >
            Payment is pending, so results can't be entered for this test yet.
          </p>
          <p
            v-else-if="selected.status === 'Approved'"
            role="status"
            class="rounded-sm bg-success-subtle px-3 py-2 text-success-subtle-text"
          >
            This result is approved and can no longer be changed.
          </p>
          <p
            v-else-if="selected.status === 'Rejected'"
            role="status"
            class="rounded-sm bg-danger-subtle px-3 py-2 text-danger-subtle-text"
          >
            This result was rejected: {{ selected.comments }}. Correct it and save again.
          </p>

          <KitResultGrid v-if="selected.form === 'fbc'" label="Full blood count results">
            <template #head>
              <tr>
                <th scope="col" :class="head">Test</th>
                <th scope="col" class="w-40" :class="head">Result</th>
                <th scope="col" class="w-16" :class="head"><span class="sr-only">Flag</span></th>
                <th scope="col" :class="head">Range for this patient</th>
                <th scope="col" :class="head">Unit</th>
              </tr>
            </template>
            <tr v-for="row in fbcFields" :key="row.model" class="h-row" data-testid="result-row">
              <th scope="row" :class="cell" class="text-left font-medium">{{ row.label }}</th>
              <td :class="cell">
                <KitInput
                  v-model="selected.values[row.model]"
                  :label="row.label"
                  hide-label
                  numeric
                  :disabled="isLocked(selected)"
                  data-grid-col="result"
                />
              </td>
              <td :class="cell" data-testid="flag">
                <KitBadge
                  v-if="
                    rangeFlag(
                      selected.values[row.model] ?? '',
                      row.adultRangeFemale ?? row.adultRangeMale
                    )
                  "
                  severity="danger"
                  >{{
                    rangeFlag(
                      selected.values[row.model] ?? '',
                      row.adultRangeFemale ?? row.adultRangeMale
                    )
                  }}</KitBadge
                >
              </td>
              <td :class="cell" class="font-mono text-xs text-ink-secondary">
                {{ row.adultRangeFemale ?? row.adultRangeMale }}
              </td>
              <td :class="cell" class="text-ink-secondary">{{ row.unit }}</td>
            </tr>
          </KitResultGrid>

          <KitResultGrid v-else-if="selected.form === 'widal'" label="Widal reaction results">
            <template #head>
              <tr>
                <th scope="col" :class="head">Test</th>
                <th scope="col" :class="head">O</th>
                <th scope="col" :class="head">H</th>
              </tr>
            </template>
            <tr v-for="row in widalFields" :key="row.o" class="h-row" data-testid="result-row">
              <th scope="row" :class="cell" class="text-left font-medium">{{ row.label }}</th>
              <td :class="cell">
                <KitInput
                  v-model="selected.values[row.o]"
                  :label="`${row.label} O`"
                  hide-label
                  data-grid-col="o"
                  :disabled="isLocked(selected)"
                />
              </td>
              <td :class="cell">
                <KitInput
                  v-model="selected.values[row.h]"
                  :label="`${row.label} H`"
                  hide-label
                  data-grid-col="h"
                  :disabled="isLocked(selected)"
                />
              </td>
            </tr>
          </KitResultGrid>

          <KitTextarea
            v-else
            v-model="selected.values.result"
            label="Result"
            :rows="5"
            :disabled="isLocked(selected)"
          />

          <div
            v-if="!isLocked(selected)"
            class="flex flex-col gap-2 border-t border-line-subtle pt-4"
          >
            <KitCheckbox v-model="selected.referred" label="Refer this test to another institute" />
            <div v-if="selected.referred" class="grid grid-cols-2 gap-4">
              <KitInput v-model="selected.referralReason" label="Referral reason" />
              <KitInput v-model="selected.institute" label="Institute referred" />
            </div>
          </div>
        </section>

        <div
          class="sticky bottom-0 col-span-2 flex items-end justify-end gap-3 border-t border-line-subtle bg-surface-page py-3"
        >
          <p v-if="error" role="alert" class="mr-auto self-center text-danger-subtle-text">
            {{ error }}
          </p>
          <p v-else-if="saved" role="status" class="mr-auto self-center text-success-subtle-text">
            {{ saved }}
          </p>
          <div class="w-64">
            <KitSelect v-model="tester" label="Tester" :search="searchTesters" />
          </div>
          <KitButton @click="saveResults">Save results</KitButton>
        </div>
      </div>

      <section
        v-else-if="stage === 'Validate'"
        aria-label="Validate results"
        class="flex max-w-[960px] flex-col gap-4"
      >
        <p v-if="!reviewable.length" class="text-ink-secondary">
          No results are waiting for validation.
        </p>
        <article
          v-for="test in reviewable"
          :key="test.id"
          class="flex flex-col gap-3 border-b border-line-subtle pb-4"
          data-testid="review-item"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h2 class="font-semibold">{{ test.name }}</h2>
              <p class="break-words text-ink-secondary">{{ summary(test) }}</p>
            </div>
            <KitRadioGroup
              :model-value="test.status === 'Pending' ? undefined : test.status"
              :label="`Decision for ${test.name}`"
              :options="decisions"
              @update:model-value="setDecision(test, $event)"
            />
          </div>
          <div class="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
            <KitCheckbox v-model="test.abnormal" :label="`${test.name} is abnormal`" />
            <KitInput v-model="test.comments" :label="`Comment on ${test.name}`" />
          </div>
        </article>
        <KitTextarea v-model="notes" label="Result notes" :rows="2" />
        <div class="flex items-center justify-end gap-3">
          <p v-if="error" role="alert" class="mr-auto text-danger-subtle-text">{{ error }}</p>
          <p v-else-if="saved" role="status" class="mr-auto text-success-subtle-text">
            {{ saved }}
          </p>
          <KitButton @click="validate">Save validation</KitButton>
        </div>
      </section>

      <section v-else aria-label="Approve results" class="flex max-w-[960px] flex-col gap-4">
        <p v-if="!approvable.length" class="text-ink-secondary">
          No accepted results are waiting for approval.
        </p>
        <article
          v-for="test in approvable"
          :key="test.id"
          class="flex flex-col gap-1 border-b border-line-subtle pb-3"
          data-testid="approve-item"
        >
          <h2 class="flex items-center gap-2 font-semibold">
            {{ test.name }}
            <KitBadge v-if="test.abnormal" severity="danger">Abnormal</KitBadge>
          </h2>
          <p class="break-words text-ink-secondary">{{ summary(test) }}</p>
          <p v-if="test.comments" class="text-ink-secondary">Comment: {{ test.comments }}</p>
        </article>
        <div class="flex items-center justify-end gap-3">
          <p v-if="error" role="alert" class="mr-auto text-danger-subtle-text">{{ error }}</p>
          <p v-else-if="saved" role="status" class="mr-auto text-success-subtle-text">
            {{ saved }}
          </p>
          <KitButton @click="approve">Approve accepted results</KitButton>
        </div>
      </section>
    </main>
  </div>
</template>
