<script setup lang="ts" generic="TItem extends Record<string, unknown>">
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import KitBackLink from '../kit/KitBackLink.vue';
import { useMediaQuery } from '../kit/useMediaQuery';
import { useRouteParam } from './useRouteState';

const props = withDefaults(
  defineProps<{
    label: string;
    items: TItem[];
    itemKey: keyof TItem;
    itemLabel: (item: TItem) => string;
    backLabel?: string;
    listWidth?: string;
    emptyText?: string;
  }>(),
  { backLabel: 'All items', listWidth: '260px', emptyText: 'Nothing here.' }
);

const keyOf = (item: TItem): string => String(item[props.itemKey]);
const keys = computed(() => props.items.map(keyOf));
const wide = useMediaQuery('(min-width: 1024px)');
const selectedParam = useRouteParam<string | null>('item', {
  fallback: null,
  parse: (raw) => (keys.value.includes(raw) ? raw : undefined),
  serialize: (value) => value,
});
const list = useTemplateRef<HTMLElement>('list');
const pane = useTemplateRef<HTMLElement>('pane');

const selected = computed(
  () => props.items.find((item) => keyOf(item) === selectedParam.value) ?? null
);

watch(
  [wide, keys],
  () => {
    if (wide.value && !selected.value && keys.value[0]) selectedParam.value = keys.value[0];
  },
  { immediate: true }
);

async function choose(item: TItem): Promise<void> {
  selectedParam.value = keyOf(item);
  if (wide.value) return;
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  pane.value?.focus();
}

async function back(): Promise<void> {
  const key = selectedParam.value;
  selectedParam.value = null;
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
  const buttons = [...(list.value?.querySelectorAll<HTMLElement>('[data-key]') ?? [])];
  buttons.find((button) => button.dataset.key === key)?.focus();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const buttons = [...(list.value?.querySelectorAll<HTMLElement>('[data-key]') ?? [])];
  const index = buttons.findIndex((button) => button === document.activeElement);
  if (index < 0) return;
  event.preventDefault();
  const next = buttons[index + (event.key === 'ArrowDown' ? 1 : -1)];
  next?.focus();
}
</script>

<template>
  <div
    class="grid min-h-0 gap-6"
    :style="wide ? { gridTemplateColumns: `${listWidth} minmax(0, 1fr)` } : undefined"
  >
    <ul
      v-if="wide || !selected"
      ref="list"
      :aria-label="label"
      class="flex flex-col gap-1"
      @keydown="onKeydown"
    >
      <li v-for="item in items" :key="keyOf(item)">
        <button
          type="button"
          :data-key="keyOf(item)"
          :aria-current="selected && keyOf(selected) === keyOf(item) ? 'true' : undefined"
          class="flex min-h-sm w-full flex-col gap-1 rounded-sm px-3 py-2 text-left hover:bg-surface-alt touch:min-h-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          :class="selected && keyOf(selected) === keyOf(item) ? 'bg-primary-subtle' : ''"
          @click="choose(item)"
        >
          <slot name="item" :item="item">{{ itemLabel(item) }}</slot>
        </button>
      </li>
      <li v-if="!items.length" class="px-3 py-4 text-ink-secondary">{{ emptyText }}</li>
    </ul>

    <section
      v-if="selected"
      ref="pane"
      tabindex="-1"
      :aria-label="itemLabel(selected)"
      class="flex min-w-0 flex-col gap-4 focus:outline-none"
    >
      <KitBackLink v-if="!wide" :label="backLabel" @click="back" />
      <slot name="detail" :item="selected" />
    </section>
  </div>
</template>
