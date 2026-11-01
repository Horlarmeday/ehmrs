import { expect, test, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues, heightOf } from './helpers';

declare global {
  interface Window {
    kitHarness: { log: string[]; delays: Record<string, number>; failing: string[] };
  }
}

const drug = (page: Page) => page.getByRole('combobox', { name: 'Drug', exact: true });
const drugs = (page: Page) => page.getByRole('combobox', { name: 'Drugs', exact: true });
const day = (page: Page) => page.getByRole('spinbutton', { name: /day/i });
const calendarButton = (page: Page) =>
  page.getByRole('button', { name: 'Open Sample date calendar' });

test.beforeEach(async ({ page }) => {
  await page.goto('/kit-harness.html?view=pickers');
});

test.describe('select', () => {
  test('S1 is 28px tall', async ({ page }) => {
    expect(await heightOf(drug(page).locator('xpath=..'))).toBe(38);
  });

  test('S2 debounces and ignores stale responses', async ({ page }) => {
    await page.evaluate(() =>
      Object.assign(window.kitHarness.delays, { para: 700, 'paracetamol 1': 20 })
    );
    await drug(page).click();
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.kitHarness.log.length);
    await page.keyboard.type('para', { delay: 20 });
    await page.waitForTimeout(260);
    await page.keyboard.type('cetamol 1', { delay: 20 });
    await expect(page.getByRole('option', { name: 'Paracetamol 1g' })).toBeVisible();
    await page.waitForTimeout(800);
    await expect(page.getByRole('option', { name: 'Paracetamol 500mg' })).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'Paracetamol 1g' })).toBeVisible();
    expect(await page.evaluate((from) => window.kitHarness.log.slice(from), before)).toEqual([
      'para',
      'paracetamol 1',
    ]);
  });

  test('S3 stores the id, shows the label, and restores it after abandoned typing', async ({
    page,
  }) => {
    await drug(page).click();
    await page.getByRole('option', { name: 'Amoxicillin 250mg' }).click();
    await expect(page.getByTestId('drug')).toHaveText('201');
    await expect(drug(page)).toHaveValue('Amoxicillin 250mg');
    await drug(page).click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('xyz');
    await page.getByLabel('Urgent').focus();
    await expect(drug(page)).toHaveValue('Amoxicillin 250mg');
    await expect(page.getByTestId('drug')).toHaveText('201');
  });

  test('shows the label of an existing value when editing', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Existing' })).toHaveValue('Amoxicillin 250mg');
  });

  test('a single value can be cleared by keyboard', async ({ page }) => {
    const clear = page.getByRole('button', { name: 'Clear Existing' });
    await clear.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('existing')).toHaveText('null');
    await expect(page.getByRole('combobox', { name: 'Existing' })).toHaveValue('');
    await expect(clear).toHaveCount(0);
  });

  test('S4 multiple selection with keyboard removal', async ({ page }) => {
    await drugs(page).click();
    await page.getByRole('option', { name: 'Metformin 500mg' }).click();
    await page.getByRole('option', { name: 'Amoxicillin 250mg' }).click();
    await expect(page.getByTestId('drugs')).toHaveText('[301,201]');
    await drugs(page).focus();
    await page.keyboard.press('Backspace');
    await expect(page.getByTestId('drugs')).toHaveText('[301]');
    await page.getByRole('button', { name: 'Remove Metformin 500mg' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('drugs')).toHaveText('[]');
  });

  test('S5 shows loading, no results, and failed search states', async ({ page }) => {
    await page.evaluate(() => {
      window.kitHarness.delays.zzz = 500;
      window.kitHarness.failing.push('boom');
    });
    await drug(page).click();
    await page.keyboard.type('zzz');
    await expect(page.getByRole('status').filter({ hasText: 'Searching' })).toBeVisible();
    await expect(page.getByText('No results found')).toBeVisible();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('boom');
    await expect(page.getByRole('alert').filter({ hasText: 'Search failed' })).toBeVisible();
    await expect(page.getByText('No results found')).toHaveCount(0);
  });

  test('S6 works by keyboard only', async ({ page }) => {
    await drug(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('drug')).not.toHaveText('null');
    await drug(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(drug(page)).toBeFocused();
  });

  test('clears stale ARIA references on close', async ({ page }) => {
    await drug(page).click();
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    const refs = await drug(page).evaluate((element) =>
      ['aria-controls', 'aria-activedescendant'].map((name) => {
        const id = element.getAttribute(name);
        return !id || Boolean(document.getElementById(id));
      })
    );
    expect(refs).toEqual([true, true]);
  });
});

test.describe('date picker', () => {
  test('D1 is 28px tall', async ({ page }) => {
    expect(await heightOf(day(page).locator('xpath=..'))).toBe(38);
  });

  test('D2 typed entry gives an ISO date without opening the calendar', async ({ page }) => {
    await day(page).focus();
    await page.keyboard.type('15062026');
    await expect(page.getByTestId('date')).toHaveText('2026-06-15');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('D3 min and max block typed and picked dates', async ({ page }) => {
    await day(page).focus();
    await page.keyboard.type('05012026');
    await expect(page.getByTestId('date')).toHaveText('null');
    await expect(page.getByRole('alert')).toHaveText('Date is out of range');
    await day(page).focus();
    await page.keyboard.type('15062026');
    await expect(page.getByTestId('date')).toHaveText('2026-06-15');
    await day(page).focus();
    await page.keyboard.type('21122026');
    await expect(page.getByTestId('date')).toHaveText('null');
    await day(page).focus();
    await page.keyboard.type('20122026');
    await calendarButton(page).click();
    const blocked = page.locator('[data-reka-calendar-cell-trigger][data-value="2026-12-21"]');
    await expect(blocked).toHaveAttribute('data-disabled', '');
    await blocked.click({ force: true });
    await expect(page.getByTestId('date')).toHaveText('2026-12-20');
  });

  test('D4 works by keyboard and closes on select', async ({ page }) => {
    await day(page).focus();
    await page.keyboard.type('15062026');
    await calendarButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('[data-reka-calendar-cell-trigger]:focus')).toHaveAttribute(
      'data-value',
      '2026-06-15'
    );
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('date')).toHaveText('2026-06-23');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await calendarButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the calendar opens under its field', async ({ page }) => {
    const field = await day(page).locator('xpath=..').boundingBox();
    await calendarButton(page).click();
    const dialog = await page.getByRole('dialog').boundingBox();
    if (!field || !dialog) throw new Error('missing box');
    expect(Math.abs(dialog.x - field.x)).toBeLessThanOrEqual(1);
    expect(dialog.y).toBeGreaterThanOrEqual(field.y + field.height);
  });
});

test.describe('checkbox, radio and file upload', () => {
  test('checkbox toggles by keyboard and label, with a 24px target', async ({ page }) => {
    const box = page.getByRole('checkbox', { name: 'Urgent' });
    await box.focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('urgent')).toHaveText('true');
    await page.getByText('Urgent', { exact: true }).click();
    await expect(page.getByTestId('urgent')).toHaveText('false');
    const hit = await box.evaluate((element) => {
      const before = getComputedStyle(element, '::before');
      return Math.min(parseFloat(before.width), parseFloat(before.height));
    });
    expect(hit).toBeGreaterThanOrEqual(24);
    await expect(page.getByRole('checkbox', { name: 'Locked option' })).toBeDisabled();
  });

  test('radio moves by arrow keys and selects by label', async ({ page }) => {
    await page.getByText('Male', { exact: true }).click();
    await expect(page.getByTestId('sex')).toHaveText('male');
    await page.getByRole('radio', { name: 'Male', exact: true }).focus();
    await page.keyboard.press('ArrowRight', { delay: 50 });
    await expect(page.getByTestId('sex')).toHaveText('female');
    await expect(page.getByRole('radiogroup', { name: 'Sex' })).toBeVisible();
    const hit = await page.getByRole('radio', { name: 'Male', exact: true }).evaluate((element) => {
      const before = getComputedStyle(element, '::before');
      return Math.min(parseFloat(before.width), parseFloat(before.height));
    });
    expect(hit).toBeGreaterThanOrEqual(24);
  });

  test('file upload is 28px and reaches the model', async ({ page }) => {
    const input = page.getByLabel('Logo');
    expect(await heightOf(input)).toBe(38);
    await input.setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('x'),
    });
    await expect(page.getByTestId('files')).toHaveText('logo.png');
  });
});

test('no serious accessibility issues in each state', async ({ page }) => {
  await expectNoSeriousA11yIssues(page, 'base');
  await drug(page).click();
  await expect(page.getByRole('option').first()).toBeVisible();
  await expectNoSeriousA11yIssues(page, 'select-open');
  await page.keyboard.press('Escape');
  await drugs(page).click();
  await page.getByRole('option', { name: 'Metformin 500mg' }).click();
  await page.keyboard.press('Escape');
  await expectNoSeriousA11yIssues(page, 'multi-selected');
  await calendarButton(page).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoSeriousA11yIssues(page, 'calendar-open');
  await page.keyboard.press('Escape');
  await day(page).focus();
  await page.keyboard.type('05012026');
  await expectNoSeriousA11yIssues(page, 'date-invalid');
  await page.getByRole('checkbox', { name: 'Urgent' }).click();
  await page.getByRole('radio', { name: 'Male', exact: true }).click();
  await expectNoSeriousA11yIssues(page, 'checked');
});
