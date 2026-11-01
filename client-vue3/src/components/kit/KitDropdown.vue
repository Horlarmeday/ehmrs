<script setup lang="ts">
import { nextTick, ref } from 'vue';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui';
import KitButton from './KitButton.vue';

export interface KitDropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
}

withDefaults(
  defineProps<{
    label?: string;
    items: KitDropdownItem[];
    severity?: 'primary' | 'secondary' | 'accent';
    size?: 'xs' | 'sm' | 'lg';
  }>(),
  { label: undefined, severity: 'secondary', size: 'sm' }
);

const emit = defineEmits<{ select: [value: string] }>();

let selected: string | null = null;

function onItemSelect(value: string) {
  selected = value;
}

const trigger = ref<InstanceType<typeof DropdownMenuTrigger> | null>(null);

function onCloseAutoFocus(event: Event) {
  const value = selected;
  selected = null;
  if (value === null) return;
  event.preventDefault();
  trigger.value?.$el.focus();
  nextTick(() => emit('select', value));
}
</script>

<template>
  <DropdownMenuRoot :modal="false">
    <DropdownMenuTrigger ref="trigger" as-child>
      <slot name="trigger">
        <KitButton :severity="severity" :size="size">
          {{ label }}
          <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </KitButton>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="start"
        :side-offset="4"
        :collision-padding="8"
        class="z-50 min-w-40 rounded-md border border-line-subtle bg-surface p-1 text-sm text-ink shadow-md"
        @close-auto-focus="onCloseAutoFocus"
      >
        <template v-for="item in items" :key="item.value">
          <DropdownMenuSeparator v-if="item.separatorBefore" class="my-1 h-px bg-line-subtle" />
          <DropdownMenuItem
            :disabled="item.disabled"
            class="flex min-h-sm cursor-pointer items-center rounded-sm px-2 outline-none data-[highlighted]:bg-surface-alt data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-muted"
            :class="{ 'text-danger': item.danger && !item.disabled }"
            @select="onItemSelect(item.value)"
          >
            {{ item.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
