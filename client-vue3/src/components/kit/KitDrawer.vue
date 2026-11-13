<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';

withDefaults(defineProps<{ title: string; side?: 'left' | 'right' }>(), { side: 'left' });

const open = defineModel<boolean>('open', { default: false });
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-ink/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-y-0 z-50 flex w-[min(320px,calc(100vw-56px))] flex-col bg-surface-alt text-sm text-ink shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none"
        :class="
          side === 'left'
            ? 'left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            : 'right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
        "
        :aria-describedby="undefined"
      >
        <div class="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <DialogTitle class="text-md font-semibold">{{ title }}</DialogTitle>
          <DialogClose
            aria-label="Close"
            class="inline-flex min-h-xs min-w-[30px] items-center justify-center rounded-sm text-ink-secondary hover:bg-surface touch:min-h-touch touch:min-w-touch focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
            </svg>
          </DialogClose>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
