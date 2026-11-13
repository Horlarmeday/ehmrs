<script setup lang="ts">
export type ShellIconName =
  'home' | 'pill' | 'box' | 'chart' | 'menu' | 'search' | 'user' | 'users';

defineProps<{ name: ShellIconName }>();

const paths: Record<ShellIconName, string[]> = {
  home: ['M3 9.5L10 4l7 5.5V16a1 1 0 01-1 1h-3.5v-4.5h-5V17H4a1 1 0 01-1-1V9.5z'],
  pill: [
    'M7.5 3.5a4 4 0 015.66 0l3.34 3.34a4 4 0 01-5.66 5.66L7.5 9.16a4 4 0 010-5.66z',
    'M9.2 10.8l3.6-3.6',
    'M8.5 12.5l-3 3a2.8 2.8 0 01-4-4l3-3',
  ],
  box: ['M3 6.5L10 3l7 3.5v7L10 17l-7-3.5v-7z', 'M3 6.5L10 10l7-3.5', 'M10 10v7'],
  chart: ['M4 16V9', 'M10 16V4', 'M16 16v-5', 'M2.5 16.5h15'],
  menu: ['M3 5.5h14', 'M3 10h14', 'M3 14.5h14'],
  search: ['M9 15a6 6 0 100-12 6 6 0 000 12z', 'M13.5 13.5L17 17'],
  user: ['M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z', 'M3.5 17a6.5 6.5 0 0113 0'],
  users: [
    'M7.5 9.5a3 3 0 100-6 3 3 0 000 6z',
    'M2 16.5a5.5 5.5 0 0111 0',
    'M13 4a3 3 0 010 5.5',
    'M15 11.5a5.5 5.5 0 013 5',
  ],
};
</script>

<template>
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    class="h-[18px] w-[18px] shrink-0"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path v-for="path in paths[name]" :key="path" :d="path" />
  </svg>
</template>
