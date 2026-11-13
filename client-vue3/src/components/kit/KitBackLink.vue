<script setup lang="ts">
defineProps<{ label: string }>();
defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    class="-ml-2 inline-flex min-h-xs items-center gap-1 self-start rounded-sm px-2 text-ink-secondary hover:bg-surface-alt hover:text-ink touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    @click="$emit('click')"
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
    {{ label }}
  </button>
</template>
