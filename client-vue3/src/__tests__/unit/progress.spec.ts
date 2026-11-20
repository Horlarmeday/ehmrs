import { afterEach, describe, expect, it } from 'vitest';
import NProgress from 'nprogress';
import '../../core/axios';

afterEach(() => {
  NProgress.remove();
});

describe('progress bar configured by core/axios', () => {
  it('starts and renders the bar without invalid ARIA roles', () => {
    expect(() => NProgress.start()).not.toThrow();
    const root = document.getElementById('nprogress');
    expect(root?.querySelector('.bar')).not.toBeNull();
    expect(root?.querySelector('.spinner')).not.toBeNull();
    expect(root?.querySelector('[role]')).toBeNull();
    expect(() => NProgress.set(0.5)).not.toThrow();
    expect(() => NProgress.done(true)).not.toThrow();
  });
});
