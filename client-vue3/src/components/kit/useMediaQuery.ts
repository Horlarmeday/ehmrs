import { onBeforeUnmount, ref, type Ref } from 'vue';

export function useMediaQuery(query: string): Ref<boolean> {
  const media = typeof window === 'undefined' ? null : window.matchMedia(query);
  const matches = ref(media?.matches ?? false);
  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches;
  };
  media?.addEventListener('change', onChange);
  onBeforeUnmount(() => media?.removeEventListener('change', onChange));
  return matches;
}
