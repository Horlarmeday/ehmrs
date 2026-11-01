<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from 'reka-ui';
import KitButton from './KitButton.vue';
import { restoreFocus } from './focusReturn';
import { activeConfirm, answerConfirm, cancelAllConfirms } from './useConfirm';

function onOpenChange(open: boolean) {
  if (!open) answerConfirm(false);
}

function onCloseAutoFocus(event: Event, returnTo: HTMLElement | null) {
  event.preventDefault();
  restoreFocus(returnTo);
}

onBeforeUnmount(cancelAllConfirms);
</script>

<template>
  <AlertDialogRoot
    v-for="request in activeConfirm ? [activeConfirm] : []"
    :key="request.id"
    :open="true"
    @update:open="onOpenChange"
  >
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-40 bg-ink/40" />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-4 text-sm text-ink shadow-lg"
        @close-auto-focus="onCloseAutoFocus($event, request.returnTo)"
      >
        <AlertDialogTitle class="text-lg font-semibold">{{ request.title }}</AlertDialogTitle>
        <AlertDialogDescription class="mt-1 text-ink-secondary">{{
          request.text
        }}</AlertDialogDescription>
        <div class="mt-4 flex justify-end gap-2">
          <AlertDialogCancel as-child>
            <KitButton severity="secondary">{{ request.cancelLabel ?? 'Cancel' }}</KitButton>
          </AlertDialogCancel>
          <KitButton :severity="request.severity ?? 'primary'" @click="answerConfirm(true)">{{
            request.confirmLabel ?? 'Confirm'
          }}</KitButton>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
