<script setup lang="ts">
import { useRouter } from 'vue-router';
import EntryForm from '../../../../components/archetypes/EntryForm.vue';
import { useEntryForm } from '../../../../components/archetypes/useEntryForm';
import KitInput from '../../../../components/kit/KitInput.vue';
import { useSettingsStore } from '../../../../stores/settings';

const settingsStore = useSettingsStore();
const router = useRouter();

const form = useEntryForm({ discardTitle: 'Discard the new password?' });
const blur = { validateOn: 'blur' as const };
const oldPassword = form.field('current_password', {
  label: 'Current password',
  rules: 'required',
  initial: '',
  ...blur,
});
const newPassword = form.field('new_password', {
  label: 'New password',
  rules: 'required|confirmed:@confirm_password',
  initial: '',
  ...blur,
});
const confirmPassword = form.field('confirm_password', {
  label: 'Verify password',
  rules: 'required',
  initial: '',
  ...blur,
});

function initValues(): void {
  form.reset({ current_password: '', confirm_password: '', new_password: '' });
}

const submit = form.submit(() => {
  const obj = {
    oldPassword: oldPassword.value.value,
    newPassword: newPassword.value.value,
    confirmPassword: confirmPassword.value.value,
  };
  return settingsStore.changePassword(obj).then(() => initValues());
});

async function changePassword(event?: Event): Promise<void> {
  await submit(event).catch(() => undefined);
}

async function cancel(): Promise<void> {
  if (await form.confirmDiscard()) router.back();
}
</script>

<template>
  <EntryForm
    title="Change password"
    description="You stay signed in after changing it."
    :errors="form.errors.value"
    :saving="form.saving.value"
    :bind-summary="form.bindSummary"
    submit-label="Change password"
    @submit="changePassword"
    @cancel="cancel"
  >
    <div class="flex max-w-[420px] flex-col gap-4">
      <div data-field="current_password">
        <KitInput
          v-model="oldPassword.value.value"
          label="Current password"
          name="current_password"
          type="password"
          autocomplete="current-password"
          :error="oldPassword.errorMessage.value"
          @blur="oldPassword.handleBlur"
        />
      </div>
      <div data-field="new_password">
        <KitInput
          v-model="newPassword.value.value"
          label="New password"
          name="new_password"
          type="password"
          autocomplete="new-password"
          :error="newPassword.errorMessage.value"
          @blur="newPassword.handleBlur"
        />
      </div>
      <div data-field="confirm_password">
        <KitInput
          v-model="confirmPassword.value.value"
          label="Verify password"
          name="confirm_password"
          type="password"
          autocomplete="new-password"
          :error="confirmPassword.errorMessage.value"
          @blur="confirmPassword.handleBlur"
        />
      </div>
    </div>
  </EntryForm>
</template>
