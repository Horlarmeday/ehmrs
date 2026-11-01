<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { currentFocus, restoreFocus } from './focusReturn';

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
  }>(),
  { description: undefined, size: 'md', closeOnBackdrop: false, closeOnEscape: true }
);

const emit = defineEmits<{ opened: []; closed: [] }>();
const open = defineModel<boolean>('open', { default: false });

const sizeClasses = {
  sm: 'max-w-[400px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1120px]',
};

const body = ref<HTMLElement | null>(null);
let returnTo: HTMLElement | null = null;

watch(
  open,
  (now, before) => {
    if (now) {
      returnTo = currentFocus();
      emit('opened');
    } else if (before) {
      emit('closed');
    }
  },
  { immediate: true, flush: 'sync' }
);

const focusable =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function onOpenAutoFocus(event: Event) {
  const first = body.value?.querySelector(focusable);
  const target = first instanceof HTMLElement ? first : body.value;
  if (!target) return;
  event.preventDefault();
  target.focus();
}

function onCloseAutoFocus(event: Event) {
  event.preventDefault();
  restoreFocus(returnTo);
}

function onOverlayClick() {
  if (props.closeOnBackdrop) open.value = false;
}

function onEscapeKeyDown(event: Event) {
  if (!props.closeOnEscape) event.preventDefault();
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-ink/40" @click="onOverlayClick" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-surface text-sm text-ink shadow-lg"
        :class="sizeClasses[size]"
        v-bind="description ? {} : { 'aria-describedby': undefined }"
        data-testid="dialog"
        @open-auto-focus="onOpenAutoFocus"
        @close-auto-focus="onCloseAutoFocus"
        @pointer-down-outside.prevent
        @focus-outside.prevent
        @escape-key-down="onEscapeKeyDown"
      >
        <header class="flex items-start justify-between gap-3 border-b border-line-subtle p-4">
          <div>
            <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-ink-secondary">{{
              description
            }}</DialogDescription>
          </div>
          <DialogClose
            aria-label="Close"
            class="inline-flex min-h-xs min-w-xs items-center justify-center rounded-sm text-ink-secondary hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </DialogClose>
        </header>
        <div
          ref="body"
          tabindex="0"
          data-testid="dialog-body"
          class="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          <slot />
        </div>
        <footer
          v-if="$slots.footer"
          class="flex justify-end gap-2 border-t border-line-subtle p-4"
        >
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
