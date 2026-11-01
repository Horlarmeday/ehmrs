<script setup lang="ts">
import { useId } from 'vue';
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';

withDefaults(defineProps<{ label: string; error?: string; disabled?: boolean }>(), {
  error: undefined,
  disabled: false,
});

const model = defineModel<boolean>({ default: false });
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <div class="inline-flex min-h-xs items-center gap-2">
      <CheckboxRoot
        :id="id"
        v-model="model"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border bg-surface before:absolute before:-inset-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-on"
        :class="error ? 'border-danger' : 'border-line'"
      >
        <CheckboxIndicator aria-hidden="true" class="text-xs leading-none">✓</CheckboxIndicator>
      </CheckboxRoot>
      <label :for="id">{{ label }}</label>
    </div>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
