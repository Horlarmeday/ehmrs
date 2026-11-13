<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
    <div class="min-w-0">
      <slot name="before" />
      <h1 class="text-xl font-semibold tracking-tight">{{ title }}</h1>
      <p v-if="description || $slots.meta" class="mt-1 text-ink-secondary">
        <slot name="meta">{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
