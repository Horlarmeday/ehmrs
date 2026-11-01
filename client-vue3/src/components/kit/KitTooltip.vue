<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui';

withDefaults(defineProps<{ text: string; side?: 'top' | 'right' | 'bottom' | 'left' }>(), {
  side: 'top',
});

const open = ref(false);
let focused: Element | null = null;

function reopenAfterFocusScroll() {
  const element = focused;
  requestAnimationFrame(() => {
    if (element && element === document.activeElement) open.value = true;
  });
}

function stopWatchingScroll() {
  focused = null;
  window.removeEventListener('scroll', reopenAfterFocusScroll, true);
}

function onFocusIn(event: FocusEvent) {
  if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
  focused = event.target;
  window.addEventListener('scroll', reopenAfterFocusScroll, { capture: true, once: true });
}

onBeforeUnmount(stopWatchingScroll);
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <TooltipRoot v-model:open="open">
      <TooltipTrigger as-child @focusin="onFocusIn" @focusout="stopWatchingScroll">
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :side-offset="4"
          :collision-padding="8"
          class="z-50 max-w-xs rounded-sm bg-ink px-2 py-1 text-xs text-surface shadow-md"
        >
          {{ text }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
