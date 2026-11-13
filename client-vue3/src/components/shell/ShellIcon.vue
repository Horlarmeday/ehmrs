<script setup lang="ts">
export type ShellIconName =
  | 'home'
  | 'pill'
  | 'box'
  | 'chart'
  | 'menu'
  | 'search'
  | 'user'
  | 'users'
  | 'list'
  | 'bed'
  | 'calendar'
  | 'flask'
  | 'scan'
  | 'shield'
  | 'wallet'
  | 'clipboard'
  | 'settings';

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
  list: ['M7 5.5h10', 'M7 10h10', 'M7 14.5h10', 'M3.5 5.5h.01', 'M3.5 10h.01', 'M3.5 14.5h.01'],
  bed: [
    'M2.5 15.5V5',
    'M2.5 11.5h15v4',
    'M17.5 11.5V9a2 2 0 00-2-2H9v4.5',
    'M5.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  ],
  calendar: [
    'M4 4.5h12a1 1 0 011 1V16a1 1 0 01-1 1H4a1 1 0 01-1-1V5.5a1 1 0 011-1z',
    'M3 8.5h14',
    'M7 2.5v3',
    'M13 2.5v3',
  ],
  flask: [
    'M8 2.5h4',
    'M8.5 2.5v5L4 15.5a1.2 1.2 0 001 1.8h10a1.2 1.2 0 001-1.8l-4.5-8v-5',
    'M6 12.5h8',
  ],
  scan: [
    'M3 7V4.5A1.5 1.5 0 014.5 3H7',
    'M13 3h2.5A1.5 1.5 0 0117 4.5V7',
    'M17 13v2.5a1.5 1.5 0 01-1.5 1.5H13',
    'M7 17H4.5A1.5 1.5 0 013 15.5V13',
    'M6 10h8',
  ],
  shield: ['M10 2.5l6 2.5v4.5c0 4-2.6 6.6-6 8-3.4-1.4-6-4-6-8V5l6-2.5z', 'M7.5 10l1.8 1.8L12.8 8'],
  wallet: [
    'M3.5 5.5h12a1 1 0 011 1v9a1 1 0 01-1 1h-12a1 1 0 01-1-1v-10a1 1 0 011-1z',
    'M2.5 6.5l10-3.5v2.5',
    'M13 11h1.5',
  ],
  clipboard: [
    'M7 3.5h6v2H7z',
    'M13 4.5h1.5a1 1 0 011 1V16a1 1 0 01-1 1h-9a1 1 0 01-1-1V5.5a1 1 0 011-1H7',
    'M7.5 10h5',
    'M7.5 13h3.5',
  ],
  settings: [
    'M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    'M10 2.5v2',
    'M10 15.5v2',
    'M2.5 10h2',
    'M15.5 10h2',
    'M4.7 4.7l1.4 1.4',
    'M13.9 13.9l1.4 1.4',
    'M4.7 15.3l1.4-1.4',
    'M13.9 6.1l1.4-1.4',
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
