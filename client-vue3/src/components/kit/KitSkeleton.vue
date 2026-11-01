<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'lines' | 'table' | 'form';
    rows?: number;
    columns?: number;
    dense?: boolean;
  }>(),
  { variant: 'lines', rows: 3, columns: 4, dense: false }
);

const lineWidths = ['w-[85%]', 'w-[55%]', 'w-[70%]'];
const bar = 'animate-pulse rounded-sm bg-line-subtle motion-reduce:animate-none';
</script>

<template>
  <div aria-hidden="true" data-testid="skeleton">
    <div v-if="variant === 'lines'" class="flex flex-col gap-2">
      <div
        v-for="index in rows"
        :key="index"
        class="h-3"
        :class="[bar, lineWidths[(index - 1) % lineWidths.length]]"
      />
    </div>
    <template v-else-if="variant === 'table'">
      <div
        v-for="row in rows"
        :key="row"
        class="flex items-center gap-4 border-b border-line-subtle px-3"
        :class="dense ? 'h-row-dense' : 'h-row'"
        data-testid="skeleton-row"
      >
        <div v-for="column in columns" :key="column" class="h-3 flex-1" :class="bar" />
      </div>
    </template>
    <div v-else class="flex flex-col gap-3">
      <div v-for="row in rows" :key="row" class="flex flex-col gap-1">
        <div class="h-3 w-24" :class="bar" />
        <div class="min-h-sm w-full" :class="bar" data-testid="skeleton-control" />
      </div>
    </div>
  </div>
</template>
