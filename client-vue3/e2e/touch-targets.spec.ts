import { expect, test, type Page } from '@playwright/test';

const MIN = 44;

async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    const selector = [
      'button',
      'a[href]',
      'input:not([type=hidden])',
      'textarea',
      'select',
      '[role=checkbox]',
      '[role=radio]',
      '[role=tab]',
      '[role=combobox]',
      '[role=option]',
      '[role=menuitem]',
      '[role=switch]',
    ].join(',');
    const union = (a: DOMRect, b: DOMRect): DOMRect => {
      const left = Math.min(a.left, b.left);
      const top = Math.min(a.top, b.top);
      return new DOMRect(
        left,
        top,
        Math.max(a.right, b.right) - left,
        Math.max(a.bottom, b.bottom) - top
      );
    };
    const pseudoRect = (element: Element, rect: DOMRect): DOMRect | null => {
      const style = getComputedStyle(element, '::before');
      if (style.content === 'none' || style.position !== 'absolute') return null;
      const px = (value: string) => Number.parseFloat(value) || 0;
      return new DOMRect(
        rect.left + px(style.left),
        rect.top + px(style.top),
        rect.width - px(style.left) - px(style.right),
        rect.height - px(style.top) - px(style.bottom)
      );
    };
    const describe = (element: Element): string => {
      const name =
        element.getAttribute('aria-label') ??
        element.getAttribute('data-testid') ??
        (element.textContent ?? '').trim().slice(0, 30);
      return `${element.tagName.toLowerCase()}${element.getAttribute('role') ? `[${element.getAttribute('role')}]` : ''} "${name}"`;
    };
    const failures: string[] = [];
    for (const element of document.querySelectorAll(selector)) {
      if (element.closest('[aria-hidden=true], [inert]')) continue;
      if (element.matches(':disabled, [aria-disabled=true], [data-disabled]')) continue;
      const own = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      if (own.width <= 1 || own.height <= 1) {
        const id = element.id;
        const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
        if (!label) continue;
      }
      let hit = own;
      const before = pseudoRect(element, own);
      if (before) hit = union(hit, before);
      const labels = element.id
        ? document.querySelectorAll(`label[for="${CSS.escape(element.id)}"]`)
        : [];
      for (const label of labels) {
        const rect = label.getBoundingClientRect();
        if (rect.width > 1 && rect.height > 1) hit = union(hit, rect);
      }
      const wrapping = element.closest('label');
      if (wrapping) hit = union(hit, wrapping.getBoundingClientRect());
      if (hit.width + 0.5 < min || hit.height + 0.5 < min) {
        failures.push(`${describe(element)} ${Math.round(hit.width)}x${Math.round(hit.height)}`);
      }
    }
    return failures;
  }, MIN);
}

test.skip(({ hasTouch }) => !hasTouch, 'touch target sizes apply to touch screens only');

const views = ['controls', 'pickers', 'validation', 'table', 'display', 'overlays', 'fbc'];

for (const view of views) {
  test(`every tap target is at least 44px on the ${view} view`, async ({ page }) => {
    await page.goto(`/kit-harness.html?view=${view}`);
    await page.waitForLoadState('networkidle');
    expect(await smallTargets(page)).toEqual([]);
  });
}

test('select options are at least 44px when open', async ({ page }) => {
  await page.goto('/kit-harness.html?view=pickers');
  await page.getByRole('combobox', { name: 'Drug', exact: true }).tap();
  await page.keyboard.type('a');
  await expect(page.getByRole('option').first()).toBeVisible();
  expect(await smallTargets(page)).toEqual([]);
});

test('calendar days are at least 44px when open', async ({ page }) => {
  await page.goto('/kit-harness.html?view=pickers');
  await page.getByRole('button', { name: /calendar/i }).tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await smallTargets(page)).toEqual([]);
});

test('menu items are at least 44px when open', async ({ page }) => {
  await page.goto('/kit-harness.html?view=overlays');
  await page.getByRole('button', { name: 'More actions' }).tap();
  await expect(page.getByRole('menuitem').first()).toBeVisible();
  expect(await smallTargets(page)).toEqual([]);
});

test('dialog controls are at least 44px when open', async ({ page }) => {
  await page.goto('/kit-harness.html?view=overlays');
  await page.getByTestId('open-form').tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await smallTargets(page)).toEqual([]);
});
