import { ref, shallowRef, type Ref } from 'vue';
import { useLatest } from './useLatest';

export interface ServerTableSort {
  id: string;
  desc: boolean;
}

export interface ServerTableQuery {
  page: number;
  pageSize: number;
  sort: ServerTableSort | null;
}

export interface ServerTableResult<TRow> {
  rows: TRow[];
  total: number;
}

export function useServerTable<TRow>(
  load: (query: ServerTableQuery) => Promise<ServerTableResult<TRow>>,
  options: { pageSize?: number; sort?: ServerTableSort | null; errorMessage?: string } = {}
) {
  const page = ref(1);
  const pageSize = ref(options.pageSize ?? 10);
  const sort: Ref<ServerTableSort | null> = ref(options.sort ?? null);
  const rows = shallowRef<TRow[]>([]);
  const total = ref(0);
  const error = ref<string | undefined>();

  const { loading, run } = useLatest(load, onResult, {
    onError: () => {
      error.value = options.errorMessage ?? 'Could not load records.';
    },
  });

  function reload(): void {
    run({ page: page.value, pageSize: pageSize.value, sort: sort.value });
  }

  function onResult(result: ServerTableResult<TRow>): void {
    const lastPage = Math.max(1, Math.ceil(result.total / pageSize.value));
    if (!result.rows.length && page.value > lastPage) {
      page.value = lastPage;
      reload();
      return;
    }
    error.value = undefined;
    rows.value = result.rows;
    total.value = result.total;
  }

  function setPage(next: number): void {
    page.value = next;
    reload();
  }

  function setPageSize(next: number): void {
    pageSize.value = next;
    setPage(1);
  }

  function setSort(next: ServerTableSort | null): void {
    sort.value = next;
    setPage(1);
  }

  return {
    page,
    pageSize,
    sort,
    rows,
    total,
    error,
    loading,
    reload,
    setPage,
    setPageSize,
    setSort,
  };
}
