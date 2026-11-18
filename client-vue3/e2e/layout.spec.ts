import { expect, test, type Locator } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/kit-harness.html?view=layout');
});

const press = (locator: Locator, hasTouch: boolean) => (hasTouch ? locator.tap() : locator.click());

test.describe('native select', () => {
  test('is labelled, sets the model, and the placeholder clears it to null', async ({ page }) => {
    const unit = page.getByRole('combobox', { name: 'Unit', exact: true });
    await expect(page.getByTestId('unit')).toHaveText('null');
    await unit.selectOption('Bottle');
    await expect(page.getByTestId('unit')).toHaveText('Bottle');
    await unit.selectOption('');
    await expect(page.getByTestId('unit')).toHaveText('null');
  });

  test('ties an error to the field and marks it invalid', async ({ page }) => {
    const route = page.getByRole('combobox', { name: 'Route' });
    await expect(route).toHaveAttribute('aria-invalid', 'true');
    await expect(route).toHaveAccessibleDescription('The route field is required.');
  });

  test('can be disabled and shows focus by keyboard', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'keyboard focus check');
    await expect(page.getByRole('combobox', { name: 'Locked unit' })).toBeDisabled();
    const unit = page.getByRole('combobox', { name: 'Unit', exact: true });
    await unit.focus();
    expect(await unit.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  });
});

test.describe('drawer', () => {
  test('traps focus, closes on Escape and returns focus to its button', async ({
    page,
    hasTouch,
  }) => {
    test.skip(hasTouch, 'keyboard behaviour');
    const opener = page.getByTestId('open-drawer');
    await opener.click();
    const drawer = page.getByRole('dialog', { name: 'Filters' });
    await expect(drawer).toBeVisible();
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await expectNoSeriousA11yIssues(page, 'drawer open');
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('closes from its close button by tap or click', async ({ page, hasTouch }) => {
    await press(page.getByTestId('open-drawer'), hasTouch);
    const drawer = page.getByRole('dialog', { name: 'Filters' });
    await expect(drawer).toBeVisible();
    await press(drawer.getByRole('button', { name: 'Close' }), hasTouch);
    await expect(drawer).toHaveCount(0);
  });
});

test('record pager disables at the ends and announces the position', async ({ page, hasTouch }) => {
  const previous = page.getByRole('button', { name: 'Previous prescription' });
  const next = page.getByRole('button', { name: 'Next prescription' });
  await expect(page.getByRole('navigation', { name: 'Prescription queue' })).toBeVisible();
  await expect(previous).toBeDisabled();
  await press(next, hasTouch);
  await press(next, hasTouch);
  await expect(page.getByTestId('record-position')).toHaveText('3 of 3');
  await expect(next).toBeDisabled();
  await press(previous, hasTouch);
  await expect(page.getByTestId('record-position')).toHaveText('2 of 3');
});

test('back link fires once per press', async ({ page, hasTouch }) => {
  await press(page.getByRole('button', { name: 'Back to list' }), hasTouch);
  await expect(page.getByTestId('backs')).toHaveText('1');
});

test('stats, progress and description list expose their values', async ({ page }) => {
  const stats = page.getByRole('region', { name: 'Stats and progress' });
  await expect(stats.getByRole('term').filter({ hasText: 'Prescriptions' })).toBeVisible();
  await expect(stats.getByRole('definition').filter({ hasText: '62' })).toBeVisible();
  const dispensed = page.getByRole('progressbar', { name: 'Amoxicillin dispensed' });
  await expect(dispensed).toHaveAttribute('aria-valuetext', '3 of 6');
  await expect(page.getByRole('progressbar', { name: 'Queue dispensed' })).toHaveAttribute(
    'aria-valuetext',
    '40% dispensed'
  );
  await expect(stats.getByText('Not recorded')).toBeVisible();
});

test.describe('card list', () => {
  test('selects cards and keeps keys', async ({ page, hasTouch }) => {
    await press(page.getByRole('checkbox', { name: 'Select Paracetamol 500mg' }), hasTouch);
    await press(page.getByRole('checkbox', { name: 'Select Ceftriaxone 1g' }), hasTouch);
    await expect(page.getByTestId('selected')).toHaveText('[2,3]');
    await press(page.getByRole('checkbox', { name: 'Select Paracetamol 500mg' }), hasTouch);
    await expect(page.getByTestId('selected')).toHaveText('[3]');
    await expect(page.getByRole('list', { name: 'Store items' }).getByRole('listitem')).toHaveCount(
      3
    );
  });

  test('shows empty, error with retry, and loading states distinctly', async ({
    page,
    hasTouch,
  }) => {
    await press(page.getByRole('button', { name: 'Show empty' }), hasTouch);
    await expect(page.getByTestId('cards-empty')).toHaveText('No items match.');
    await press(page.getByRole('button', { name: 'Show error' }), hasTouch);
    await expect(page.getByTestId('cards-error')).toContainText('Could not load the items.');
    await press(page.getByTestId('cards-error').getByRole('button', { name: 'Retry' }), hasTouch);
    await expect(page.getByTestId('retries')).toHaveText('1');
    await press(page.getByRole('button', { name: 'Show loading' }), hasTouch);
    await expect(page.getByTestId('cards-empty')).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Loading' })).toHaveCount(1);
    await expectNoSeriousA11yIssues(page, 'card list loading');
  });
});

test.describe('error summary, form section and action bar', () => {
  test('a failed save focuses the summary, and each entry moves to its field', async ({
    page,
    hasTouch,
  }) => {
    await press(page.getByRole('button', { name: 'Save' }), hasTouch);
    const summary = page.getByRole('alert').filter({ hasText: 'Fix 2 fields before saving' });
    await expect(summary).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'summary');
    await press(summary.getByRole('button', { name: 'Dose' }), hasTouch);
    await expect(page.getByLabel('Dose')).toBeFocused();
    await page.getByLabel('Dose').fill('5mg');
    await page.getByLabel('Patient name').fill('Ada');
    await press(page.getByRole('button', { name: 'Save' }), hasTouch);
    await expect(summary).toHaveCount(0);
  });

  test('the section is named by its heading', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Patient' })).toBeVisible();
  });

  test('the action bar stays at the bottom of the screen while the form scrolls', async ({
    page,
  }) => {
    const save = page.getByRole('button', { name: 'Save' });
    await page.getByRole('region', { name: 'Patient' }).scrollIntoViewIfNeeded();
    await expect(save).toBeInViewport();
    const before = await save.boundingBox();
    await page.mouse.wheel(0, 300);
    await expect(save).toBeInViewport();
    const after = await save.boundingBox();
    expect(Math.round(after?.y ?? 0)).toBe(Math.round(before?.y ?? -1));
  });
});

test('no serious accessibility issues on the page', async ({ page }) => {
  await expectNoSeriousA11yIssues(page, 'layout');
});
