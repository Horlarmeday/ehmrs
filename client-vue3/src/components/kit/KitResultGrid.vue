<script setup lang="ts">
import { onGridKeydown } from './useGridNavigation';

defineProps<{ label: string }>();
</script>

<template>
  <div class="rounded-sm border border-line bg-surface" @keydown="onGridKeydown">
    <table class="w-full border-collapse">
      <caption class="sr-only">
        {{
          label
        }}
      </caption>
      <thead>
        <slot name="head" />
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>
