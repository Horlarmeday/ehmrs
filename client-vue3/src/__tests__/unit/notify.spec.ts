import { describe, expect, it } from 'vitest';
import { notifyError, notifySuccess, setToastSink, type ToastPayload } from '../../common/notify';

describe('notify adapter (frozen legacy content)', () => {
  it('notifySuccess keeps legacy title/text/type', () => {
    const seen: ToastPayload[] = [];
    setToastSink((p) => seen.push(p));
    notifySuccess({ data: { message: 'Saved ok' } });
    expect(seen).toEqual([{ title: 'Success message', text: 'Saved ok', type: 'success' }]);
  });

  it('notifyError keeps legacy title/text/type from error.response.data.message', () => {
    const seen: ToastPayload[] = [];
    setToastSink((p) => seen.push(p));
    notifyError({ response: { data: { message: 'Validation failed' } } });
    expect(seen).toEqual([{ title: 'Error message', text: 'Validation failed', type: 'error' }]);
  });

  it('missing message degrades to undefined text instead of throwing', () => {
    const seen: ToastPayload[] = [];
    setToastSink((p) => seen.push(p));
    expect(() => notifySuccess({})).not.toThrow();
    expect(() => notifyError({})).not.toThrow();
    expect(seen).toEqual([
      { title: 'Success message', text: undefined, type: 'success' },
      { title: 'Error message', text: undefined, type: 'error' },
    ]);
  });

  it('unregistered sink is a no-op', () => {
    setToastSink(() => undefined);
    expect(() => notifySuccess({ data: { message: 'x' } })).not.toThrow();
  });
});
