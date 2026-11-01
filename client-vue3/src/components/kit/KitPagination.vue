<script setup lang="ts">
import { computed } from 'vue';
import {
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui';

const props = withDefaults(
  defineProps<{
    label?: string;
    page: number;
    pageSize: number;
    total: number;
    shownCount: number;
    pageSizes?: number[];
    maxButtons?: number;
  }>(),
  { label: 'Pagination', pageSizes: () => [10, 20, 30, 50, 100], maxButtons: 6 }
);

const emit = defineEmits<{ 'update:page': [page: number]; 'update:pageSize': [size: number] }>();

const lastPage = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const visiblePages = computed(() => {
  const count = Math.min(props.maxButtons, lastPage.value);
  const centered = props.page - Math.floor(props.maxButtons / 2);
  const start = Math.max(1, Math.min(centered, lastPage.value - count + 1));
  return Array.from({ length: count }, (_, index) => start + index);
});
const sizeModel = computed({
  get: () => String(props.pageSize),
  set: (value: string) => emit('update:pageSize', Number(value)),
});

const button =
  'inline-flex min-h-sm min-w-[38px] items-center justify-center rounded-sm px-1 text-ink-secondary hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:text-ink-disabled disabled:hover:bg-transparent data-[selected]:bg-primary-subtle data-[selected]:font-semibold data-[selected]:text-primary-subtle-text';
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
    <PaginationRoot
      :page="page"
      :total="total"
      :items-per-page="pageSize"
      :aria-label="label"
      @update:page="emit('update:page', $event)"
    >
      <PaginationList class="flex items-center gap-1">
        <PaginationFirst :class="button" aria-label="First page">«</PaginationFirst>
        <PaginationPrev :class="button" aria-label="Previous page">‹</PaginationPrev>
        <PaginationListItem
          v-for="item in visiblePages"
          :key="item"
          :value="item"
          :class="button"
          :aria-label="`Page ${item}`"
          :aria-current="item === page ? 'page' : undefined"
          >{{ item }}</PaginationListItem
        >
        <PaginationNext :class="button" aria-label="Next page">›</PaginationNext>
        <PaginationLast :class="button" aria-label="Last page">»</PaginationLast>
      </PaginationList>
    </PaginationRoot>
    <div class="flex items-center gap-2">
      <select
        v-model="sizeModel"
        aria-label="Records per page"
        class="min-h-sm rounded-sm border border-line-subtle bg-surface px-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      >
        <option v-for="size in pageSizes" :key="size" :value="String(size)">{{ size }}</option>
      </select>
      <span class="text-ink-secondary" data-testid="pagination-summary"
        >Displaying {{ shownCount }} of {{ total }} records</span
      >
    </div>
  </div>
</template>
