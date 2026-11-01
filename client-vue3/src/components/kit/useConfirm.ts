import { computed, shallowRef } from 'vue';
import { currentFocus } from './focusReturn';

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'primary' | 'danger' | 'warning' | 'success';
}

export interface ConfirmRequest extends ConfirmOptions {
  id: number;
  returnTo: HTMLElement | null;
  resolve: (confirmed: boolean) => void;
}

let nextId = 1;
const waiting: ConfirmRequest[] = [];
const active = shallowRef<ConfirmRequest | null>(null);

export const activeConfirm = computed(() => active.value);

export function answerConfirm(confirmed: boolean): void {
  active.value?.resolve(confirmed);
  active.value = waiting.shift() ?? null;
}

export function cancelAllConfirms(): void {
  while (active.value) answerConfirm(false);
}

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const request = { ...options, id: nextId++, returnTo: currentFocus(), resolve };
      if (active.value) waiting.push(request);
      else active.value = request;
    });
  }
  return { confirm };
}
