<script setup lang="ts">
import { ref } from 'vue';
import KitCheckbox from '../KitCheckbox.vue';
import KitDatePicker from '../KitDatePicker.vue';
import KitFileUpload from '../KitFileUpload.vue';
import KitRadioGroup from '../KitRadioGroup.vue';
import KitSelect from '../KitSelect.vue';
import { searchDrugs } from './harnessApi';

const drug = ref<number | number[] | null>(null);
const drugs = ref<number | number[] | null>([]);
const existing = ref<number | number[] | null>(201);
const date = ref<string | null>(null);
const urgent = ref(false);
const sex = ref<string | undefined>();
const files = ref<File[]>([]);
const sexes = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
</script>

<template>
  <div class="flex w-96 flex-col gap-3">
    <KitSelect v-model="drug" label="Drug" placeholder="Search drugs" :search="searchDrugs" />
    <KitSelect
      v-model="drugs"
      label="Drugs"
      multiple
      placeholder="Search drugs"
      :search="searchDrugs"
    />
    <KitSelect
      v-model="existing"
      label="Existing"
      :initial-options="[{ value: 201, label: 'Amoxicillin 250mg' }]"
      :search="searchDrugs"
    />
    <KitDatePicker v-model="date" label="Sample date" min="2026-01-10" max="2026-12-20" />
    <KitCheckbox v-model="urgent" label="Urgent" />
    <KitCheckbox label="Locked option" disabled />
    <KitRadioGroup v-model="sex" label="Sex" :options="sexes" />
    <KitFileUpload v-model="files" label="Logo" accept="image/*" />
    <output data-testid="drug">{{ JSON.stringify(drug) }}</output>
    <output data-testid="drugs">{{ JSON.stringify(drugs) }}</output>
    <output data-testid="existing">{{ JSON.stringify(existing) }}</output>
    <output data-testid="date">{{ date ?? 'null' }}</output>
    <output data-testid="urgent">{{ urgent }}</output>
    <output data-testid="sex">{{ sex ?? 'none' }}</output>
    <output data-testid="files">{{ files.map((file) => file.name).join(',') }}</output>
  </div>
</template>
