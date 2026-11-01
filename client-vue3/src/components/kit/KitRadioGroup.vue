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
      class="flex flex-wrap gap-2"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="relative inline-flex min-h-sm items-center gap-2 rounded-sm border bg-surface pl-3 transition-colors has-[:disabled]:bg-surface-alt has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary-subtle has-[:enabled]:hover:border-primary"
        :class="error ? 'border-danger' : 'border-line'"
      >
        <RadioGroupItem
          :id="`${id}-${option.value}`"
          :value="option.value"
          class="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-ink-disabled bg-surface transition-colors before:absolute before:-inset-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-surface-alt data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        >
          <RadioGroupIndicator class="h-[7px] w-[7px] rounded-full bg-primary-on" />
        </RadioGroupItem>
        <label
          :for="`${id}-${option.value}`"
          class="flex min-h-sm cursor-pointer items-center pr-3 font-medium"
          >{{ option.label }}</label
        >
      </div>
    </RadioGroupRoot>
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
