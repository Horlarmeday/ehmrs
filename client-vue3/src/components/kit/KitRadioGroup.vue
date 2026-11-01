<script setup lang="ts">
import { useId } from 'vue';
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui';

export interface KitRadioOption {
  value: string;
  label: string;
}

withDefaults(
  defineProps<{ label: string; options: KitRadioOption[]; error?: string; disabled?: boolean }>(),
  { error: undefined, disabled: false }
);

const model = defineModel<string | undefined>();
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <span :id="`${id}-label`" class="font-medium text-ink-secondary">{{ label }}</span>
    <RadioGroupRoot
      v-model="model"
      :disabled="disabled"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="flex flex-wrap gap-3"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="inline-flex min-h-xs items-center gap-2"
      >
        <RadioGroupItem
          :id="`${id}-${option.value}`"
          :value="option.value"
          class="relative flex h-4 w-4 items-center justify-center rounded-full border bg-surface before:absolute before:-inset-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt data-[state=checked]:border-primary"
          :class="error ? 'border-danger' : 'border-line'"
        >
          <RadioGroupIndicator class="h-2 w-2 rounded-full bg-primary" />
        </RadioGroupItem>
        <label :for="`${id}-${option.value}`">{{ option.label }}</label>
      </div>
    </RadioGroupRoot>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
