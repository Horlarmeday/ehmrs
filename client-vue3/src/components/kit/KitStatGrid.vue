<script setup lang="ts">
export interface KitStat {
  label: string;
  value: string | number;
  detail?: string;
  mono?: boolean;
}

withDefaults(defineProps<{ items: KitStat[]; wideAt?: 'md' | 'lg' }>(), { wideAt: 'md' });

const columns = {
  md: 'md:grid-cols-[repeat(var(--stat-count),minmax(0,1fr))]',
  lg: 'lg:grid-cols-[repeat(var(--stat-count),minmax(0,1fr))]',
};
</script>

<template>
  <dl
    class="grid grid-cols-2 gap-px overflow-hidden rounded border border-line-subtle bg-line-subtle"
    :class="columns[wideAt]"
    :style="{ '--stat-count': items.length }"
  >
    <div v-for="item in items" :key="item.label" class="flex flex-col gap-1 bg-surface px-4 py-3">
      <dt class="text-xs font-medium text-ink-secondary">{{ item.label }}</dt>
      <dd
        class="font-semibold"
        :class="item.mono === false ? 'text-md' : 'font-mono text-lg tabular-nums'"
      >
        {{ item.value }}
      </dd>
      <dd v-if="item.detail" class="text-xs text-ink-secondary">{{ item.detail }}</dd>
    </div>
  </dl>
</template>
