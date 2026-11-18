<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import KitButton from '../kit/KitButton.vue';
import KitDrawer from '../kit/KitDrawer.vue';
import KitDropdown from '../kit/KitDropdown.vue';
import { useCoarsePointer } from '../kit/useCoarsePointer';
import ShellIcon, { type ShellIconName } from './ShellIcon.vue';

export interface ShellNavItem {
  value: string;
  label: string;
  icon: ShellIconName;
}

const props = withDefaults(
  defineProps<{
    navigation: ShellNavItem[];
    current: string;
    userName: string;
    autofocusSearch?: boolean;
  }>(),
  { autofocusSearch: false }
);

const emit = defineEmits<{
  navigate: [value: string];
  search: [term: string];
  account: [action: string];
}>();

const drawerOpen = ref(false);
const term = ref('');
const coarse = useCoarsePointer();
const searchBox = useTemplateRef<HTMLInputElement>('search-box');

const accountItems = [
  { value: 'change-password', label: 'Change password' },
  { value: 'sign-out', label: 'Sign out', separatorBefore: true },
];

function go(value: string): void {
  drawerOpen.value = false;
  emit('navigate', value);
}

function submit(): void {
  emit('search', term.value.trim());
}

function onShortcut(event: KeyboardEvent): void {
  const target = event.target;
  const typing =
    target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    searchBox.value?.focus();
  }
}

function focusMain(): void {
  nextTick(() => document.getElementById('main')?.focus());
}

onMounted(() => {
  window.addEventListener('keydown', onShortcut);
  if (props.autofocusSearch && !coarse.value) nextTick(() => searchBox.value?.focus());
});
onBeforeUnmount(() => window.removeEventListener('keydown', onShortcut));

const itemClass = (value: string) => [
  'flex min-h-xs w-full items-center gap-3 rounded-sm px-[10px] text-left font-medium touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
  value === props.current
    ? 'bg-surface text-ink shadow-sm'
    : 'text-ink-secondary hover:bg-surface hover:text-ink',
];
</script>

<template>
  <div
    class="min-h-screen bg-surface-page text-sm text-ink xl:grid xl:grid-cols-[208px_minmax(0,1fr)]"
  >
    <a
      href="#main"
      class="sr-only z-50 rounded-sm bg-surface px-3 py-2 font-semibold shadow-md focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:inline-flex focus:min-h-sm focus:items-center touch:focus:min-h-touch"
      @click.prevent="focusMain"
      >Skip to content</a
    >
    <nav
      aria-label="Main"
      class="hidden flex-col gap-1 bg-surface-alt px-[10px] py-4 xl:sticky xl:top-0 xl:flex xl:h-screen"
    >
      <strong class="px-[10px] pb-4 pt-1 text-md">eHMRS</strong>
      <ul class="flex flex-col gap-1">
        <li v-for="item in navigation" :key="item.value">
          <button
            type="button"
            :class="itemClass(item.value)"
            :aria-current="item.value === current ? 'page' : undefined"
            @click="go(item.value)"
          >
            <ShellIcon :name="item.icon" />
            {{ item.label }}
          </button>
        </li>
      </ul>
    </nav>

    <div class="flex min-w-0 flex-col">
      <header
        class="sticky top-0 z-30 flex items-center gap-2 border-b border-line-subtle bg-surface-page px-4 py-2 xl:px-[30px]"
      >
        <button
          type="button"
          class="inline-flex min-h-sm min-w-[38px] items-center justify-center rounded-sm text-ink-secondary hover:bg-surface-alt touch:min-h-touch touch:min-w-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary xl:hidden"
          aria-label="Open menu"
          :aria-expanded="drawerOpen"
          @click="drawerOpen = true"
        >
          <ShellIcon name="menu" />
        </button>
        <strong class="text-md xl:hidden">eHMRS</strong>
        <form
          role="search"
          class="ml-auto min-w-0 flex-1 xl:ml-0 xl:max-w-[420px]"
          @submit.prevent="submit"
        >
          <label
            for="global-search"
            class="flex min-h-sm cursor-text items-center gap-2 rounded-sm border border-line-subtle bg-surface pl-3 pr-2 focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary touch:min-h-touch"
          >
            <span class="sr-only">Find a patient by name, phone or hospital number</span>
            <ShellIcon name="search" class="text-ink-muted" />
            <input
              id="global-search"
              ref="search-box"
              v-model="term"
              type="search"
              enterkeyhint="search"
              placeholder="Name, phone or hospital number"
              class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:appearance-none"
            />
            <kbd
              v-if="!coarse"
              aria-hidden="true"
              class="rounded-xs border border-line px-[5px] font-mono text-xs text-ink-muted"
              >/</kbd
            >
          </label>
        </form>
        <KitDropdown
          :label="`Account: ${userName}`"
          :items="accountItems"
          severity="secondary"
          @select="emit('account', $event)"
        >
          <template #trigger>
            <KitButton severity="secondary" :aria-label="`Account: ${userName}`">
              <ShellIcon name="user" />
              <span aria-hidden="true" class="hidden max-w-[160px] truncate md:inline">{{
                userName
              }}</span>
            </KitButton>
          </template>
        </KitDropdown>
      </header>

      <main
        id="main"
        tabindex="-1"
        class="flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 focus:outline-none xl:px-[30px] xl:py-[22px]"
      >
        <slot />
      </main>
    </div>

    <KitDrawer v-model:open="drawerOpen" title="eHMRS">
      <nav aria-label="Main">
        <ul class="flex flex-col gap-1">
          <li v-for="item in navigation" :key="item.value">
            <button
              type="button"
              :class="itemClass(item.value)"
              :aria-current="item.value === current ? 'page' : undefined"
              @click="go(item.value)"
            >
              <ShellIcon :name="item.icon" />
              {{ item.label }}
            </button>
          </li>
        </ul>
      </nav>
    </KitDrawer>
  </div>
</template>
