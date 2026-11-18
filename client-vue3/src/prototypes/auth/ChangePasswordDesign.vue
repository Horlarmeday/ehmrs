<script setup lang="ts">
import { onMounted } from 'vue';
import EntryForm from '../../components/archetypes/EntryForm.vue';
import { useEntryForm } from '../../components/archetypes/useEntryForm';
import KitInput from '../../components/kit/KitInput.vue';
import { notifyError, notifySuccess } from '../../common/notify';

const props = defineProps<{ state: 'default' | 'errors' | 'server-error' }>();

const form = useEntryForm({ discardTitle: 'Discard the new password?' });
const blur = { validateOn: 'blur' as const };
const current = form.field('current_password', {
  label: 'Current password',
  rules: 'required',
  initial: '',
  ...blur,
});
const next = form.field('new_password', {
  label: 'New password',
  rules: 'required|confirmed:@confirm_password',
  initial: props.state === 'errors' ? 'NewPass1' : '',
  ...blur,
});
const confirm = form.field('confirm_password', {
  label: 'Verify password',
  rules: 'required',
  initial: props.state === 'errors' ? 'NewPass2' : '',
  ...blur,
});

const onSubmit = form.submit(
  () =>
    new Promise<void>((resolve) => {
      window.setTimeout(() => {
        notifySuccess({ data: { message: 'Password changed!' } });
        current.value.value = '';
        next.value.value = '';
        confirm.value.value = '';
        resolve();
      }, 700);
    })
);

onMounted(() => {
  if (props.state === 'errors') onSubmit();
  if (props.state === 'server-error') {
    notifyError({ response: { data: { message: 'Old password not correct' } } });
  }
});
</script>

<template>
  <EntryForm
    title="Change password"
    description="You stay signed in after changing it."
    :errors="form.errors.value"
    :saving="form.saving.value"
    :bind-summary="form.bindSummary"
    submit-label="Change password"
    @submit="onSubmit"
    @cancel="() => form.confirmDiscard()"
  >
    <div class="flex max-w-[420px] flex-col gap-4">
      <div data-field="current_password">
        <KitInput
          v-model="current.value.value"
          label="Current password"
          type="password"
          autocomplete="current-password"
          :error="current.errorMessage.value"
          @blur="current.handleBlur"
        />
      </div>
      <div data-field="new_password">
        <KitInput
          v-model="next.value.value"
          label="New password"
          type="password"
          autocomplete="new-password"
          :error="next.errorMessage.value"
          @blur="next.handleBlur"
        />
      </div>
      <div data-field="confirm_password">
        <KitInput
          v-model="confirm.value.value"
          label="Verify password"
          type="password"
          autocomplete="new-password"
          :error="confirm.errorMessage.value"
          @blur="confirm.handleBlur"
        />
      </div>
    </div>
  </EntryForm>
</template>
