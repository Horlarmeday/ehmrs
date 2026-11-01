<script setup lang="ts">
import { computed, useId } from 'vue';
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';

const props = withDefaults(
  defineProps<{
    label: string;
    hideLabel?: boolean;
    indeterminate?: boolean;
    error?: string;
    disabled?: boolean;
  }>(),
  { hideLabel: false, indeterminate: false, error: undefined, disabled: false }
);

const model = defineModel<boolean>({ default: false });
const state = computed<boolean | 'indeterminate'>({
  get: () => (props.indeterminate ? 'indeterminate' : model.value),
  set: (value) => {
    model.value = value === true;
  },
});
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <div class="inline-flex min-h-xs items-center gap-2">
      <CheckboxRoot
        :id="id"
        v-model="state"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border bg-surface before:absolute before:-inset-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-on data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-on"
        :class="error ? 'border-danger' : 'border-line'"
      >
        <CheckboxIndicator aria-hidden="true" class="text-xs leading-none">{{
          indeterminate ? '–' : '✓'
        }}</CheckboxIndicator>
      </CheckboxRoot>
      <label :for="id" :class="hideLabel ? 'sr-only' : ''">{{ label }}</label>
    </div>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
