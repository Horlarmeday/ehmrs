<script setup lang="ts">
import { useId } from 'vue';

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    label: string;
    hideLabel?: boolean;
    error?: string;
    disabled?: boolean;
    numeric?: boolean;
  }>(),
  { hideLabel: false, error: undefined, disabled: false, numeric: false }
);

const model = defineModel<string>({ default: '' });
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <label :for="id" :class="hideLabel ? 'sr-only' : 'font-medium text-ink-secondary'">{{
      label
    }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="min-h-sm w-full rounded-sm border bg-surface px-2 py-0 text-sm text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt disabled:text-ink-secondary"
      :class="[
        error ? 'border-danger' : 'border-line',
        numeric ? 'text-right font-mono tabular-nums' : '',
      ]"
    />
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
