import { onBeforeUnmount, ref } from 'vue';

export function useLatest<TArgs extends unknown[], TResult>(
  load: (...args: TArgs) => Promise<TResult>,
  onResult: (result: TResult) => void,
  options: { debounceMs?: number; onError?: () => void } = {}
) {
  const loading = ref(false);
  let ticket = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function run(...args: TArgs): void {
    const current = ++ticket;
    loading.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      load(...args)
        .then((result) => {
          if (current === ticket) onResult(result);
        })
        .catch(() => {
          if (current === ticket) options.onError?.();
        })
        .finally(() => {
          if (current === ticket) loading.value = false;
        });
    }, options.debounceMs ?? 0);
  }

  onBeforeUnmount(() => {
    ticket += 1;
    clearTimeout(timer);
  });

  return { loading, run };
}
