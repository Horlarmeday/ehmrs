import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const press = (locator: Locator, hasTouch: boolean) => (hasTouch ? locator.tap() : locator.click());

async function openForm(page: Page): Promise<Locator> {
  await page.goto('/kit-harness.html?view=archetypes&screen=form');
  const form = page.getByRole('form', { name: 'Add store item' });
  await expect(form).toBeVisible();
  return form;
}

test.describe('entry form on a page', () => {
  test('a failed save focuses the summary with legacy messages under each field', async ({
    page,
    hasTouch,
  }) => {
    const form = await openForm(page);
    await press(form.getByRole('button', { name: 'Save item' }), hasTouch);
    const summary = page.getByRole('alert').filter({ hasText: /Fix \d+ fields before saving/ });
    await expect(summary).toBeFocused();
    await expect(form.getByText('The drug field is required')).toBeVisible();
    await expect(form.getByText('The unit_price field is required')).toBeVisible();
    await expect(form.getByText('The dosage form field is required')).toHaveCount(0);
    await expect(
      form
        .getByText('Brand')
        .locator('..')
        .getByText(/required/)
    ).toHaveCount(0);
    await expectNoSeriousA11yIssues(page, 'form errors');
    await press(summary.getByRole('button', { name: 'Quantity' }), hasTouch);
    await expect(page.getByLabel('Quantity *')).toBeFocused();
  });

  test('numeric fields ask for the number keypad', async ({ page }) => {
    await openForm(page);
    await expect(page.getByLabel('Quantity *')).toHaveAttribute('inputmode', 'numeric');
    await expect(page.getByLabel('Unit price (₦) *')).toHaveAttribute('inputmode', 'decimal');
  });

  test('cancelling with typed data asks first, and Keep editing keeps it', async ({
    page,
    hasTouch,
  }) => {
    const form = await openForm(page);
    await page.getByLabel('Brand').fill('Emzor');
    await press(form.getByRole('button', { name: 'Cancel' }), hasTouch);
    const question = page.getByRole('alertdialog', { name: 'Discard this item?' });
    await expect(question).toBeVisible();
    await press(question.getByRole('button', { name: 'Keep editing' }), hasTouch);
    await expect(page.getByLabel('Brand')).toHaveValue('Emzor');
    await press(form.getByRole('button', { name: 'Cancel' }), hasTouch);
    await press(question.getByRole('button', { name: 'Discard' }), hasTouch);
    await expect(page.getByRole('heading', { level: 1, name: 'Store items' })).toBeVisible();
  });

  test('cancelling an untouched form leaves without asking', async ({ page, hasTouch }) => {
    const form = await openForm(page);
    await press(form.getByRole('button', { name: 'Cancel' }), hasTouch);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Store items' })).toBeVisible();
  });

  test('reloading with typed data triggers the browser’s leave warning', async ({ page }) => {
    await openForm(page);
    await page.getByLabel('Brand').fill('Emzor');
    await page.getByLabel('Brand').press('Tab');
    const warned = new Promise<string>((resolve) => {
      page.once('dialog', async (dialog) => {
        resolve(dialog.type());
        await dialog.accept();
      });
    });
    await page.reload().catch(() => undefined);
    expect(await warned).toBe('beforeunload');
  });

  test('an untouched form reloads without a warning', async ({ page }) => {
    await openForm(page);
    let warned = false;
    page.once('dialog', async (dialog) => {
      warned = true;
      await dialog.accept();
    });
    await page.reload();
    expect(warned).toBe(false);
  });

  test('required fields check on leaving the field, as legacy does', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'uses Tab to leave the field');
    await openForm(page);
    const quantity = page.getByLabel('Quantity *');
    await quantity.focus();
    await quantity.press('Tab');
    await expect(page.getByText('The quantity field is required')).toBeVisible();
    await quantity.fill('5');
    await quantity.press('Tab');
    await expect(page.getByText('The quantity field is required')).toHaveCount(0);
  });

  test('the action bar stays on screen while the form scrolls', async ({ page }) => {
    await openForm(page);
    const save = page.getByRole('button', { name: 'Save item' });
    await expect(save).toBeInViewport();
    await page.mouse.wheel(0, 300);
    await expect(save).toBeInViewport();
  });
});

test.describe('entry form in a dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kit-harness.html?view=layout');
  });

  test('saves only when valid, then closes', async ({ page, hasTouch }) => {
    await press(page.getByTestId('open-dialog-form'), hasTouch);
    const dialog = page.getByRole('dialog', { name: 'Add ward' });
    await press(dialog.getByRole('button', { name: 'Save ward' }), hasTouch);
    await expect(dialog.getByText('The name field is required')).toBeVisible();
    await expect(dialog.getByRole('alert').filter({ hasText: 'Fix 2 fields' })).toBeFocused();
    await dialog.getByLabel('Ward name').fill('Male Ward');
    await dialog.getByLabel('Beds').fill('0');
    await press(dialog.getByRole('button', { name: 'Save ward' }), hasTouch);
    await expect(dialog.getByText('The beds field must be 1 or more')).toBeVisible();
    await dialog.getByLabel('Beds').fill('12');
    await press(dialog.getByRole('button', { name: 'Save ward' }), hasTouch);
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId('dialog-saves')).toHaveText('1');
  });

  test('closing with typed data asks first, from the close button and from Escape', async ({
    page,
    hasTouch,
  }) => {
    await press(page.getByTestId('open-dialog-form'), hasTouch);
    const dialog = page.getByRole('dialog', { name: 'Add ward' });
    await dialog.getByLabel('Ward name').fill('Male Ward');
    await press(dialog.getByRole('button', { name: 'Close' }), hasTouch);
    const question = page.getByRole('alertdialog', { name: 'Discard your changes?' });
    await expect(question).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'discard question over dialog');
    await press(question.getByRole('button', { name: 'Keep editing' }), hasTouch);
    await expect(dialog.getByLabel('Ward name')).toHaveValue('Male Ward');
    if (!hasTouch) {
      await dialog.getByLabel('Ward name').press('Escape');
      await expect(question).toBeVisible();
      await question.getByRole('button', { name: 'Discard' }).click();
      await expect(dialog).toHaveCount(0);
    }
  });

  test('closes straight away when nothing was typed', async ({ page, hasTouch }) => {
    await press(page.getByTestId('open-dialog-form'), hasTouch);
    const dialog = page.getByRole('dialog', { name: 'Add ward' });
    await press(dialog.getByRole('button', { name: 'Close' }), hasTouch);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(dialog).toHaveCount(0);
  });
});
