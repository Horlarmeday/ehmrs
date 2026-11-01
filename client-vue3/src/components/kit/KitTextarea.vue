<script setup lang="ts">
import { useId } from 'vue';

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    label: string;
    hideLabel?: boolean;
    error?: string;
    disabled?: boolean;
    rows?: number;
  }>(),
  { hideLabel: false, error: undefined, disabled: false, rows: 2 }
);

const model = defineModel<string>({ default: '' });
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <label :for="id" :class="hideLabel ? 'sr-only' : 'font-medium text-ink-secondary'">{{
      label
    }}</label>
    <textarea
      v-bind="$attrs"
      :id="id"
      v-model="model"
      :rows="rows"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="w-full rounded-sm border bg-surface px-2 py-1 text-sm text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt disabled:text-ink-secondary"
      :class="error ? 'border-danger' : 'border-line'"
    />
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
