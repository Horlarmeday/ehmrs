export function onGridKeydown(event: KeyboardEvent): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.dataset.gridCol) return;
  const step =
    event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' || event.key === 'Enter' ? 1 : 0;
  if (!step) return;
  const grid = event.currentTarget;
  if (!(grid instanceof HTMLElement)) return;
  const column = Array.from(
    grid.querySelectorAll<HTMLInputElement>(
      `input[data-grid-col="${CSS.escape(target.dataset.gridCol)}"]:not(:disabled)`
    )
  );
  const next = column[column.indexOf(target) + step];
  event.preventDefault();
  next?.focus();
  next?.select();
}
