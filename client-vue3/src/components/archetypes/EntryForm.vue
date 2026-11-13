<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import KitActionBar from '../kit/KitActionBar.vue';
import KitButton from '../kit/KitButton.vue';
import KitErrorSummary, { type KitFieldError } from '../kit/KitErrorSummary.vue';
import KitPageHeader from '../kit/KitPageHeader.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    errors: KitFieldError[];
    saving?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    inDialog?: boolean;
    bindSummary?: (focus: () => void) => void;
  }>(),
  {
    description: undefined,
    saving: false,
    submitLabel: 'Save',
    cancelLabel: 'Cancel',
    inDialog: false,
    bindSummary: undefined,
  }
);

const emit = defineEmits<{ submit: [event: Event]; cancel: [] }>();
const summary = useTemplateRef<InstanceType<typeof KitErrorSummary>>('summary');

onMounted(() => props.bindSummary?.(() => summary.value?.focus()));
</script>

<template>
  <form
    novalidate
    class="flex flex-col gap-5"
    :class="inDialog ? '' : 'max-w-[1040px]'"
    :aria-label="title"
    :aria-busy="saving ? 'true' : 'false'"
    @submit.prevent="emit('submit', $event)"
  >
    <KitPageHeader v-if="!inDialog" :title="title" :description="description">
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </KitPageHeader>
    <p v-else-if="description" class="text-ink-secondary">{{ description }}</p>

    <KitErrorSummary ref="summary" :errors="errors" />
    <slot name="notices" />
    <slot />

    <KitActionBar v-if="!inDialog">
      <KitButton severity="secondary" :disabled="saving" @click="emit('cancel')">{{
        cancelLabel
      }}</KitButton>
      <KitButton type="submit" :loading="saving">{{ submitLabel }}</KitButton>
    </KitActionBar>
    <div v-else class="flex justify-end gap-2 border-t border-line-subtle pt-3">
      <KitButton severity="secondary" :disabled="saving" @click="emit('cancel')">{{
        cancelLabel
      }}</KitButton>
      <KitButton type="submit" :loading="saving">{{ submitLabel }}</KitButton>
    </div>
  </form>
</template>
