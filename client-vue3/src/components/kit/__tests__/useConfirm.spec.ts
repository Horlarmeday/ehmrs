import { describe, expect, it } from 'vitest';
import { activeConfirm, answerConfirm, cancelAllConfirms, useConfirm } from '../useConfirm';

describe('useConfirm', () => {
  it('asks one question at a time, in order', async () => {
    const { confirm } = useConfirm();
    const first = confirm({ title: 'first' });
    const second = confirm({ title: 'second' });
    expect(activeConfirm.value?.title).toBe('first');
    answerConfirm(true);
    expect(activeConfirm.value?.title).toBe('second');
    answerConfirm(false);
    expect(activeConfirm.value).toBeNull();
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(false);
  });

  it('answers false for every open and waiting question when the host goes away', async () => {
    const { confirm } = useConfirm();
    const answers = Promise.all([confirm({ title: 'a' }), confirm({ title: 'b' })]);
    cancelAllConfirms();
    await expect(answers).resolves.toEqual([false, false]);
    expect(activeConfirm.value).toBeNull();
  });
});
