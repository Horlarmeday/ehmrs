<script setup lang="ts">
import { nextTick, useId, useTemplateRef } from 'vue';

export interface KitFieldError {
  field: string;
  label: string;
}

defineProps<{ errors: KitFieldError[] }>();

const root = useTemplateRef<HTMLElement>('root');
const titleId = useId();

const focusable =
  'input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function goTo(field: string): void {
  const form = root.value?.closest('form') ?? document;
  const wrapper = form.querySelector(`[data-field="${CSS.escape(field)}"]`);
  const target = wrapper?.matches(focusable) ? wrapper : wrapper?.querySelector(focusable);
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ block: 'center' });
  target.focus();
}

async function focus(): Promise<void> {
  await nextTick();
  root.value?.focus();
}

defineExpose({ focus });
</script>

<template>
  <div
    v-if="errors.length"
    ref="root"
    tabindex="-1"
    role="alert"
    :aria-labelledby="titleId"
    class="flex flex-col gap-2 rounded-sm border border-danger bg-danger-subtle px-4 py-3 text-danger-subtle-text focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-danger"
  >
    <h2 :id="titleId" class="font-semibold">
      Fix {{ errors.length }} {{ errors.length === 1 ? 'field' : 'fields' }} before saving. Each one
      says what is wrong.
    </h2>
    <ul class="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
      <li v-for="error in errors" :key="error.field">
        <button
          type="button"
          class="min-h-xs text-left underline underline-offset-2 hover:no-underline touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger"
          @click="goTo(error.field)"
        >
          {{ error.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
