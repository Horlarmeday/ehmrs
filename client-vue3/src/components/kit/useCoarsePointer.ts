import type { Ref } from 'vue';
import { useMediaQuery } from './useMediaQuery';

export function useCoarsePointer(): Ref<boolean> {
  return useMediaQuery('(pointer: coarse)');
}
