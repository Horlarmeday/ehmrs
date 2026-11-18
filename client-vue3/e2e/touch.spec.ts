import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

test.skip(({ hasTouch }) => !hasTouch, 'tap behaviour applies to touch screens only');

test.describe('pickers by tap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kit-harness.html?view=pickers');
  });

  test('select opens, filters and picks an option by tap', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Drug', exact: true }).tap();
    await page.keyboard.type('amox');
    const option = page.getByRole('option').first();
    await expect(option).toBeVisible();
    await option.tap();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(page.getByTestId('drug')).not.toHaveText('null');
  });

  test('clear button empties a saved value by tap', async ({ page }) => {
    await expect(page.getByTestId('existing')).toHaveText('201');
    await page.getByRole('button', { name: 'Clear Existing' }).tap();
    await expect(page.getByTestId('existing')).toHaveText('null');
  });

  test('checkbox toggles by tapping its label', async ({ page }) => {
    await page.getByText('Urgent', { exact: true }).tap();
    await expect(page.getByTestId('urgent')).toHaveText('true');
    await page.getByRole('checkbox', { name: 'Urgent' }).tap();
    await expect(page.getByTestId('urgent')).toHaveText('false');
  });

  test('radio selects by tapping its label', async ({ page }) => {
    await page.getByText('Female', { exact: true }).tap();
    await expect(page.getByTestId('sex')).toHaveText('female');
  });
});

test.describe('overlays by tap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kit-harness.html?view=overlays');
  });

  test('tabs switch by tap and skip disabled ones', async ({ page }) => {
    await page.getByRole('tab', { name: 'Notes' }).tap();
    await expect(page.getByTestId('active-tab')).toHaveText('notes');
    await page.getByRole('tab', { name: 'Billing' }).tap({ force: true });
    await expect(page.getByTestId('active-tab')).toHaveText('notes');
  });

  test('accordion opens and closes by tap', async ({ page }) => {
    const allergies = page.getByTestId('accordion').getByRole('button', { name: 'Allergies' });
    await allergies.tap();
    await expect(page.getByTestId('active-section')).toHaveText('allergies');
    await expect(allergies).toHaveAttribute('aria-expanded', 'true');
  });

  test('menu opens and runs an item by tap', async ({ page }) => {
    await page.getByRole('button', { name: 'More actions' }).tap();
    await page.getByRole('menuitem', { name: 'Export' }).tap();
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByTestId('picked')).toHaveText('export');
  });

  test('dialog closes by tapping its close button, and stays open on a backdrop tap', async ({
    page,
  }) => {
    await page.getByTestId('open-form').tap();
    const dialog = page.getByRole('dialog', { name: 'Create visit' });
    await expect(dialog).toBeVisible();
    await page.touchscreen.tap(4, 4);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).tap();
    await expect(dialog).toHaveCount(0);
  });

  test('a tooltip button works by its own name, and the tooltip never blocks the next tap', async ({
    page,
  }) => {
    const trigger = page.getByTestId('tooltip-trigger');
    await expect(trigger).toHaveAccessibleName('Print');
    await trigger.tap();
    await expect(trigger).toBeFocused();
    await page.getByRole('button', { name: 'More actions' }).tap();
    await expect(page.getByRole('menu')).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'after tooltip tap');
  });
});

test.describe('table by tap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kit-harness.html?view=table');
  });

  test('pagination, sorting and row selection work by tap', async ({ page }) => {
    await page.getByRole('button', { name: 'Page 2' }).tap();
    await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    const records = page.getByRole('table', { name: 'Records', exact: true });
    await records.getByRole('button', { name: /^Name/ }).tap();
    await expect(records.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      /ascending|descending/
    );
    const first = page.getByRole('checkbox', { name: /^Select Item/ }).first();
    await first.tap();
    await expect(first).toHaveAttribute('aria-checked', 'true');
  });
});
