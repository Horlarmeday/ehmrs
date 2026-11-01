<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    label: string;
    accept?: string;
    multiple?: boolean;
    error?: string;
    disabled?: boolean;
  }>(),
  { accept: undefined, multiple: false, error: undefined, disabled: false }
);

const model = defineModel<File[]>({ default: () => [] });
const id = useId();

function onChange(event: Event): void {
  if (event.target instanceof HTMLInputElement) model.value = Array.from(event.target.files ?? []);
}
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-ink">
    <label :for="id" class="font-medium text-ink-secondary">{{ label }}</label>
    <input
      :id="id"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="min-h-sm w-full rounded-sm border bg-surface pr-2 text-sm text-ink file:mr-2 file:min-h-[26px] file:cursor-pointer file:border-0 file:bg-surface-alt file:px-2 file:text-sm file:font-medium file:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-surface-alt disabled:text-ink-secondary"
      :class="error ? 'border-danger' : 'border-line'"
      @change="onChange"
    />
    <span v-if="error" :id="`${id}-error`" class="text-danger-subtle-text">{{ error }}</span>
  </div>
</template>
