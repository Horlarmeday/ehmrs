import { onBeforeUnmount, ref, type Ref } from 'vue';

const QUERY = '(pointer: coarse)';

export function useCoarsePointer(): Ref<boolean> {
  const media = typeof window === 'undefined' ? null : window.matchMedia(QUERY);
  const coarse = ref(media?.matches ?? false);
  const onChange = (event: MediaQueryListEvent) => {
    coarse.value = event.matches;
  };
  media?.addEventListener('change', onChange);
  onBeforeUnmount(() => media?.removeEventListener('change', onChange));
  return coarse;
}
