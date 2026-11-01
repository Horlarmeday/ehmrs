import { expect, test } from '@playwright/test';
import { colorsOf, contrast, expectNoSeriousA11yIssues, heightOf } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/kit-harness.html?view=display');
});

for (const severity of ['primary', 'success', 'warning', 'danger', 'info', 'neutral']) {
  for (const variant of ['subtle', 'solid']) {
    test(`badge ${severity} ${variant} is AA with a real fill`, async ({ page }) => {
      const badge = page.getByTestId(`badge-${severity}-${variant}`);
      await expect(badge).toHaveText(severity);
      const { fg, bg } = await colorsOf(badge);
      expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
}

test('info badge stays distinct from primary', async ({ page }) => {
  const info = await colorsOf(page.getByTestId('badge-info-solid'));
  const primary = await colorsOf(page.getByTestId('badge-primary-solid'));
  expect(info.bg).not.toBe(primary.bg);
});

test('skeletons match real row and control heights and hide from assistive tech', async ({
  page,
}) => {
  const tables = page.getByTestId('skeleton').filter({ has: page.getByTestId('skeleton-row') });
  expect(await heightOf(tables.nth(0).getByTestId('skeleton-row').first())).toBe(30);
  expect(await heightOf(tables.nth(1).getByTestId('skeleton-row').first())).toBe(26);
  expect(await heightOf(page.getByTestId('skeleton-control').first())).toBe(28);
  for (const skeleton of await page.getByTestId('skeleton').all()) {
    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  }
});

test('skeleton animation stops under reduced motion', async ({ page }) => {
  const bar = page.getByTestId('skeleton-control').first();
  const animation = () => bar.evaluate((e) => getComputedStyle(e).animationName);
  expect(await animation()).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await animation()).toBe('none');
});

test('display view has no serious accessibility issues', async ({ page }) => {
  await expectNoSeriousA11yIssues(page, 'badges and skeletons');
});
