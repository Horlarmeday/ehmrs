<script setup lang="ts">
export interface KitDescriptionItem {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}

withDefaults(defineProps<{ items: KitDescriptionItem[]; empty?: string }>(), {
  empty: 'Not recorded',
});
</script>

<template>
  <dl class="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
    <div v-for="item in items" :key="item.label" class="flex min-w-0 flex-col gap-1">
      <dt class="text-xs font-medium text-ink-secondary">{{ item.label }}</dt>
      <dd
        class="break-words"
        :class="[
          item.mono ? 'font-mono tabular-nums' : '',
          item.value === null || item.value === undefined || item.value === ''
            ? 'text-ink-muted'
            : 'text-ink',
        ]"
      >
        {{
          item.value === null || item.value === undefined || item.value === '' ? empty : item.value
        }}
      </dd>
    </div>
  </dl>
</template>
