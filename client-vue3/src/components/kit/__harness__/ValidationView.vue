<script setup lang="ts">
import { ref } from 'vue';
import { defineRule, useField, useForm } from 'vee-validate';
import { required } from '@vee-validate/rules';
import KitButton from '../KitButton.vue';
import KitCheckbox from '../KitCheckbox.vue';
import KitDatePicker from '../KitDatePicker.vue';
import KitFileUpload from '../KitFileUpload.vue';
import KitInput from '../KitInput.vue';
import KitRadioGroup from '../KitRadioGroup.vue';
import KitSelect from '../KitSelect.vue';
import KitTextarea from '../KitTextarea.vue';
import { searchDrugs } from './harnessApi';

defineRule('required', (value: unknown) => required(value) || 'This field is required');
defineRule('accepted', (value: unknown) => value === true || 'Must be accepted');

const { handleSubmit } = useForm();
const submitted = ref(0);
const onSubmit = handleSubmit(() => {
  submitted.value += 1;
});

const message = { label: 'This field' };
const name = useField<string>('name', 'required', { ...message, initialValue: '' });
const notes = useField<string>('notes', 'required', { ...message, initialValue: '' });
const consent = useField<boolean>('consent', 'accepted', { initialValue: false });
const sex = useField<string | undefined>('sex', 'required', message);
const drug = useField<number | number[] | null>('drug', 'required', {
  ...message,
  initialValue: null,
});
const date = useField<string | null>('date', 'required', { ...message, initialValue: null });
const files = useField<File[]>('files', 'required', { ...message, initialValue: [] });
const sexes = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
</script>

<template>
  <form class="flex w-96 flex-col gap-3" novalidate @submit="onSubmit">
    <KitInput v-model="name.value.value" label="Name" :error="name.errorMessage.value" />
    <KitTextarea v-model="notes.value.value" label="Notes" :error="notes.errorMessage.value" />
    <KitCheckbox
      v-model="consent.value.value"
      label="Consent"
      :error="consent.errorMessage.value"
    />
    <KitRadioGroup
      v-model="sex.value.value"
      label="Sex"
      :options="sexes"
      :error="sex.errorMessage.value"
    />
    <KitSelect
      v-model="drug.value.value"
      label="Drug"
      :search="searchDrugs"
      :error="drug.errorMessage.value"
    />
    <KitDatePicker
      v-model="date.value.value"
      label="Sample date"
      :error="date.errorMessage.value"
    />
    <KitFileUpload
      v-model="files.value.value"
      label="Attachment"
      :error="files.errorMessage.value"
    />
    <KitButton type="submit">Submit</KitButton>
    <output data-testid="submitted">{{ submitted }}</output>
  </form>
</template>
