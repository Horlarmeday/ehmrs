<script setup lang="ts">
import { computed, useId } from 'vue';

export interface KitNativeOption {
  value: string;
  label: string;
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label: string;
    options: KitNativeOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    hideLabel?: boolean;
  }>(),
  { placeholder: undefined, error: undefined, disabled: false, hideLabel: false }
);

const model = defineModel<string | null>({ default: null });
const id = useId();

const selected = computed({
  get: () => model.value ?? '',
  set: (value: string) => {
    model.value = value === '' ? null : value;
  },
});
const showPlaceholder = computed(() => props.placeholder !== undefined);
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <label :for="id" :class="hideLabel ? 'sr-only' : 'font-medium text-ink-secondary'">{{
      label
    }}</label>
    <div class="relative">
      <select
        v-bind="$attrs"
        :id="id"
        v-model="selected"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="min-h-sm w-full appearance-none rounded-sm border bg-surface py-0 pl-3 pr-9 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt disabled:text-ink-secondary touch:min-h-touch"
        :class="[error ? 'border-danger' : 'border-line', selected === '' ? 'text-ink-muted' : '']"
      >
        <option v-if="showPlaceholder" value="">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          class="text-ink"
        >
          {{ option.label }}
        </option>
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
        fill="none"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </div>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
