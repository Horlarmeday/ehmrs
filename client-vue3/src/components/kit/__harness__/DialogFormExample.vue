<script setup lang="ts">
import { ref } from 'vue';
import EntryForm from '../../archetypes/EntryForm.vue';
import { useEntryForm } from '../../archetypes/useEntryForm';
import KitButton from '../KitButton.vue';
import KitDialog from '../KitDialog.vue';
import KitFormSection from '../KitFormSection.vue';
import KitInput from '../KitInput.vue';

const open = ref(false);
const saves = ref(0);
const form = useEntryForm();
const ward = form.field('ward_name', {
  label: 'Ward name',
  as: 'name',
  rules: 'required',
  initial: '',
});
const beds = form.field('beds', { label: 'Beds', rules: 'required|min_value:1', initial: '' });
const onSubmit = form.submit(async () => {
  saves.value += 1;
  open.value = false;
});

async function cancel(): Promise<void> {
  if (await form.confirmDiscard()) open.value = false;
}
</script>

<template>
  <section aria-label="Dialog form" class="flex items-center gap-3">
    <KitButton severity="secondary" data-testid="open-dialog-form" @click="open = true"
      >Add ward</KitButton
    >
    <output data-testid="dialog-saves">{{ saves }}</output>
    <KitDialog v-model:open="open" title="Add ward" size="md" :before-close="form.confirmDiscard">
      <EntryForm
        title="Add ward"
        in-dialog
        :errors="form.errors.value"
        :saving="form.saving.value"
        submit-label="Save ward"
        :bind-summary="form.bindSummary"
        @submit="onSubmit"
        @cancel="cancel"
      >
        <KitFormSection title="Ward">
          <div data-field="ward_name">
            <KitInput
              v-model="ward.value.value"
              label="Ward name"
              :error="ward.errorMessage.value"
            />
          </div>
          <div data-field="beds">
            <KitInput
              v-model="beds.value.value"
              label="Beds"
              inputmode="numeric"
              numeric
              :error="beds.errorMessage.value"
            />
          </div>
        </KitFormSection>
      </EntryForm>
    </KitDialog>
  </section>
</template>
