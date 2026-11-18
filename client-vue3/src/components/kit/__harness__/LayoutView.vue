<script setup lang="ts">
import { ref } from 'vue';
import DialogFormExample from './DialogFormExample.vue';
import KitActionBar from '../KitActionBar.vue';
import KitConfirmHost from '../KitConfirmHost.vue';
import KitBackLink from '../KitBackLink.vue';
import KitButton from '../KitButton.vue';
import KitCardList from '../KitCardList.vue';
import KitDescriptionList from '../KitDescriptionList.vue';
import KitDrawer from '../KitDrawer.vue';
import KitErrorSummary from '../KitErrorSummary.vue';
import KitFormSection from '../KitFormSection.vue';
import KitInput from '../KitInput.vue';
import KitNativeSelect from '../KitNativeSelect.vue';
import KitPageHeader from '../KitPageHeader.vue';
import KitProgress from '../KitProgress.vue';
import KitRecordPager from '../KitRecordPager.vue';
import KitStatGrid from '../KitStatGrid.vue';

const unit = ref<string | null>(null);
const locked = ref<string | null>('Box');
const units = ['Pack', 'Box', 'Bottle'].map((value) => ({ value, label: value }));
const drawerOpen = ref(false);
const backs = ref(0);
const position = ref(1);
const cardsState = ref<'rows' | 'empty' | 'error' | 'loading'>('rows');
const retries = ref(0);
const selected = ref<unknown[]>([]);
const cards = [
  { id: 1, name: 'Amoxicillin 500mg' },
  { id: 2, name: 'Paracetamol 500mg' },
  { id: 3, name: 'Ceftriaxone 1g' },
];
const name = ref('');
const dose = ref('');
const submitted = ref(false);
const summary = ref<InstanceType<typeof KitErrorSummary> | null>(null);
const errors = ref<{ field: string; label: string }[]>([]);

function submit(): void {
  submitted.value = true;
  errors.value = [
    ...(name.value ? [] : [{ field: 'name', label: 'Patient name' }]),
    ...(dose.value ? [] : [{ field: 'dose', label: 'Dose' }]),
  ];
  if (errors.value.length) summary.value?.focus();
}
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-8 pb-10">
    <KitPageHeader title="Store items" description="Pharmacy store">
      <template #before><KitBackLink label="Back to list" @click="backs++" /></template>
      <template #actions><KitButton>Add item</KitButton></template>
    </KitPageHeader>
    <output data-testid="backs">{{ backs }}</output>

    <section aria-label="Native select" class="flex w-72 flex-col gap-3">
      <KitNativeSelect v-model="unit" label="Unit" placeholder="Choose" :options="units" />
      <KitNativeSelect v-model="locked" label="Locked unit" :options="units" disabled />
      <KitNativeSelect
        label="Route"
        placeholder="Choose"
        :options="units"
        error="The route field is required."
        :model-value="null"
      />
      <output data-testid="unit">{{ unit ?? 'null' }}</output>
    </section>

    <section aria-label="Drawer">
      <KitButton severity="secondary" data-testid="open-drawer" @click="drawerOpen = true"
        >Open drawer</KitButton
      >
      <KitDrawer v-model:open="drawerOpen" title="Filters" side="right">
        <div class="flex flex-col gap-3 px-2">
          <KitInput label="Drawer search" />
          <KitButton @click="drawerOpen = false">Show results</KitButton>
        </div>
      </KitDrawer>
    </section>

    <DialogFormExample />

    <section aria-label="Pager">
      <KitRecordPager
        :position="position"
        :total="3"
        noun="prescription"
        label="Prescription queue"
        @previous="position--"
        @next="position++"
      />
    </section>

    <section aria-label="Stats and progress" class="flex flex-col gap-3">
      <KitStatGrid
        :items="[
          { label: 'Prescriptions', value: 62 },
          { label: 'Paid by', value: 'NHIS', detail: 'Hygeia HMO', mono: false },
        ]"
      />
      <KitProgress label="Amoxicillin dispensed" :value="3" :max="6" />
      <KitProgress label="Queue dispensed" :value="40" :max="100" value-text="40% dispensed" />
      <KitDescriptionList
        :items="[
          { label: 'Batch', value: 'B23011', mono: true },
          { label: 'Brand', value: '' },
        ]"
      />
    </section>

    <section aria-label="Card list" class="flex flex-col gap-2">
      <div class="flex gap-2">
        <KitButton
          v-for="state in ['rows', 'empty', 'error', 'loading'] as const"
          :key="state"
          size="xs"
          severity="secondary"
          @click="cardsState = state"
          >Show {{ state }}</KitButton
        >
      </div>
      <KitCardList
        v-model:selected="selected"
        label="Store items"
        :rows="cardsState === 'rows' ? cards : []"
        row-key="id"
        :loading="cardsState === 'loading'"
        :error="cardsState === 'error' ? 'Could not load the items.' : undefined"
        selectable
        :row-label="(row) => `Select ${row.name}`"
        empty-text="No items match."
        @retry="retries++"
      >
        <template #default="{ row }"
          ><strong>{{ row.name }}</strong></template
        >
      </KitCardList>
      <output data-testid="selected">{{ JSON.stringify(selected) }}</output>
      <output data-testid="retries">{{ retries }}</output>
    </section>

    <form novalidate aria-label="Summary form" class="flex flex-col gap-4" @submit.prevent="submit">
      <KitErrorSummary ref="summary" :errors="submitted ? errors : []" />
      <KitFormSection title="Patient" description="Who the item is for.">
        <div data-field="name"><KitInput v-model="name" label="Patient name" /></div>
        <div data-field="dose"><KitInput v-model="dose" label="Dose" /></div>
      </KitFormSection>
      <div class="h-[900px]" aria-hidden="true" />
      <KitActionBar>
        <KitButton type="submit">Save</KitButton>
      </KitActionBar>
    </form>
    <KitConfirmHost />
  </div>
</template>
