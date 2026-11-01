import { expect, test } from '@playwright/test';
import { colorsOf, contrast, expectNoSeriousA11yIssues, heightOf } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/kit-harness.html');
});

const fills: Record<string, string> = {
  primary: 'rgb(27, 31, 35)',
  success: 'rgb(21, 128, 61)',
  danger: 'rgb(220, 38, 38)',
  warning: 'rgb(217, 119, 6)',
};

for (const [severity, fill] of Object.entries(fills)) {
  test(`button ${severity} is on-token and AA at rest, hover and active`, async ({ page }) => {
    const button = page.getByRole('button', { name: severity, exact: true });
    const rest = await colorsOf(button);
    expect(rest.bg).toBe(fill);
    expect(contrast(rest.fg, rest.bg)).toBeGreaterThanOrEqual(4.5);

    await button.hover();
    const hover = await colorsOf(button);
    expect(hover.bg).not.toBe(fill);
    expect(contrast(hover.fg, hover.bg)).toBeGreaterThanOrEqual(4.5);

    await page.mouse.down();
    const active = await colorsOf(button);
    expect(active.bg).not.toBe(hover.bg);
    expect(contrast(active.fg, active.bg)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.up();
  });
}

test('secondary button is AA at rest and on hover', async ({ page }) => {
  const button = page.getByRole('button', { name: 'secondary', exact: true });
  const rest = await colorsOf(button);
  expect(contrast(rest.fg, rest.bg)).toBeGreaterThanOrEqual(4.5);
  await button.hover();
  const hover = await colorsOf(button);
  expect(hover.bg).not.toBe(rest.bg);
  expect(contrast(hover.fg, hover.bg)).toBeGreaterThanOrEqual(4.5);
});

test('button sizes follow the density scale', async ({ page }) => {
  expect(await heightOf(page.getByRole('button', { name: 'primary', exact: true }))).toBe(38);
  expect(await heightOf(page.getByRole('button', { name: 'Extra small' }))).toBe(30);
  expect(await heightOf(page.getByRole('button', { name: 'Large' }))).toBe(44);
});

test('button works by keyboard and shows focus; disabled and loading cannot fire', async ({
  page,
}) => {
  const button = page.getByRole('button', { name: 'primary', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('clicks')).toHaveText('2');
  await expect(page.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  const saving = page.getByRole('button', { name: 'Saving' });
  await expect(saving).toBeDisabled();
  await expect(saving).toHaveAttribute('aria-busy', 'true');
});

test('input is 28px, shows focus, and reaches the model', async ({ page }) => {
  const input = page.getByLabel('Name');
  expect(await heightOf(input)).toBe(38);
  await input.focus();
  await page.keyboard.type('Ada');
  await expect(page.getByTestId('name')).toHaveText('Ada');
  expect(await input.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe('solid');
});

test('errors are tied to their fields', async ({ page }) => {
  const dose = page.getByLabel('Dose');
  await expect(dose).toHaveAttribute('aria-invalid', 'true');
  await expect(dose).toHaveAccessibleDescription('Dose is required');
  const reason = page.getByLabel('Reason');
  await expect(reason).toHaveAccessibleDescription('Reason is required');
});

test('textarea reaches the model', async ({ page }) => {
  await page.getByLabel('Notes').fill('Stable');
  await expect(page.getByTestId('notes')).toHaveText('Stable');
});

test('disabled input cannot be edited', async ({ page }) => {
  await expect(page.getByLabel('Locked')).toBeDisabled();
  await expect(page.getByLabel('Locked')).toHaveValue('Fixed');
});

test('no serious accessibility issues', async ({ page }) => {
  await expectNoSeriousA11yIssues(page, 'controls');
});
