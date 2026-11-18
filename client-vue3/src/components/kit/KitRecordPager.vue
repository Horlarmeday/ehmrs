<script setup lang="ts">
withDefaults(defineProps<{ position: number; total: number; noun?: string; label?: string }>(), {
  noun: 'record',
  label: 'Records',
});
defineEmits<{ previous: []; next: [] }>();

const button =
  'inline-flex min-h-xs items-center gap-1 rounded-sm px-2 text-ink-secondary hover:bg-surface-alt hover:text-ink disabled:pointer-events-none disabled:text-ink-disabled touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
</script>

<template>
  <nav :aria-label="label" class="flex items-center gap-1">
    <button
      type="button"
      :class="button"
      :disabled="position <= 1"
      :aria-label="`Previous ${noun}`"
      @click="$emit('previous')"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4" fill="none">
        <path
          d="M10 3.5L5.5 8l4.5 4.5"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span aria-hidden="true">Previous</span>
    </button>
    <span class="px-1 text-ink-secondary" aria-live="polite" data-testid="record-position">
      <span class="font-mono text-ink">{{ position }}</span> of
      <span class="font-mono text-ink">{{ total }}</span>
    </span>
    <button
      type="button"
      :class="button"
      :disabled="position >= total"
      :aria-label="`Next ${noun}`"
      @click="$emit('next')"
    >
      <span aria-hidden="true">Next</span>
      <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4" fill="none">
        <path
          d="M6 3.5L10.5 8 6 12.5"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </nav>
</template>
