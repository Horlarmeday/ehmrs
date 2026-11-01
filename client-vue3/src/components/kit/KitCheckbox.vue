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
        class="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-xs border bg-surface transition-colors before:absolute before:-inset-[4px] enabled:hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-surface-alt data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-on data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-on"
        :class="error ? 'border-danger' : 'border-ink-disabled'"
      >
        <CheckboxIndicator aria-hidden="true" class="flex">
          <svg
            viewBox="0 0 16 16"
            class="h-[14px] w-[14px]"
            fill="none"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path v-if="indeterminate" d="M3.5 8h9" />
            <path v-else d="M3.5 8.5l3 3 6-7" />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      <label :for="id" class="cursor-pointer" :class="hideLabel ? 'sr-only' : ''">{{
        label
      }}</label>
    </div>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
