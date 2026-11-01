import { expect, test, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const open = async (page: Page) => {
  await page.goto('/kit-harness.html?view=patient-desk');
  await expect(
    page.getByRole('table', { name: 'Patients' }).getByTestId('table-row').first()
  ).toBeVisible();
};
const box = (page: Page) => page.getByRole('searchbox');
const rows = (page: Page) => page.getByRole('table', { name: 'Patients' }).getByTestId('table-row');

async function find(page: Page, term: string) {
  await box(page).fill(term);
  await box(page).press('Enter');
  await expect(page.getByTestId('result-summary')).toContainText(term);
}

async function pick(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('combobox', { name: label }).fill(option);
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('search starts focused and / returns to it', async ({ page }) => {
  await open(page);
  await expect(box(page)).toBeFocused();
  await page.getByRole('button', { name: 'Register patient' }).focus();
  await page.keyboard.press('/');
  await expect(box(page)).toBeFocused();
  await expect(box(page)).toHaveValue('');
});

for (const [kind, term, expected] of [
  ['name', 'Testa Alpha', 'Testa Alpha'],
  ['phone', '08030001001', 'Demo Bravo'],
  ['hospital number', 'DEMO/1002', 'Sample Charlie'],
] as const) {
  test(`finds a patient by ${kind}`, async ({ page }) => {
    await open(page);
    await find(page, term);
    await expect(rows(page).first()).toContainText(expected);
  });
}

test('date range filters results', async ({ page }) => {
  await open(page);
  await page
    .getByRole('group', { name: 'Registered from' })
    .getByRole('spinbutton')
    .first()
    .click();
  await page.keyboard.type('01102026');
  await page.getByRole('group', { name: 'Registered to' }).getByRole('spinbutton').first().click();
  await page.keyboard.type('01102026');
  await expect(page.getByTestId('pagination-summary')).toHaveText('Displaying 2 of 2 records');
});

test('no match offers registration and carries the name over', async ({ page }) => {
  await open(page);
  await find(page, 'Zainab Bello');
  await page.getByRole('button', { name: /Register “Zainab Bello”/ }).click();
  await expect(page.getByLabel('First name')).toHaveValue('Zainab');
  await expect(page.getByLabel('Last name')).toHaveValue('Bello');
});

test('no match carries a phone number over', async ({ page }) => {
  await open(page);
  await find(page, '07098765321');
  await page.getByRole('button', { name: /Register “07098765321”/ }).click();
  await expect(page.getByRole('textbox', { name: 'Phone', exact: true })).toHaveValue(
    '07098765321'
  );
});

test('role rules: visits and deactivation', async ({ page }) => {
  await open(page);
  const role = page.getByLabel('Prototype role');
  await expect(page.getByRole('button', { name: /^Deactivate/ })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Start visit for Testa Alpha' }).first()
  ).toBeEnabled();

  await role.selectOption('Nurse');
  await expect(
    page.getByRole('button', { name: 'Start visit for Testa Alpha' }).first()
  ).toBeDisabled();
  await expect(page.getByRole('navigation', { name: 'Main' })).not.toContainText('Patients');

  await role.selectOption('Admin');
  const first = rows(page).first();
  const deactivate = first.getByRole('button', { name: /^Deactivate/ });
  await deactivate.click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
  await expect(first).toContainText('Active');
  await deactivate.click();
  await expectNoSeriousA11yIssues(page, 'deactivate dialog');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Deactivate' }).click();
  await expect(first).toContainText('Inactive');
  await expect(first.getByRole('button', { name: /^Start visit/ })).toBeDisabled();
});

test.describe('registration', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Register patient' }).click();
  });

  test('an existing phone warns at once, blocks saving and links to the chart', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('08030001001');
    const warning = page.getByTestId('duplicate');
    await expect(warning).toContainText('Demo Bravo');
    await expectNoSeriousA11yIssues(page, 'duplicate warning');
    await expect(
      page.locator('form').getByRole('button', { name: 'Register patient' })
    ).toBeDisabled();
    await warning.getByRole('button', { name: 'Open their chart' }).click();
    await expect(page.getByRole('heading', { name: 'Demo Bravo' })).toBeVisible();
  });

  test('normal account requires all legacy fields and the photo', async ({ page }) => {
    await page.locator('form').getByRole('button', { name: 'Register patient' }).click();
    await expect(page.getByText('This field is required')).toHaveCount(15);
    await expect(page.getByText('Please take patient photo')).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'registration errors');
    await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('12345678901');
    await expect(page.getByText('should match the Nigerian phone pattern')).toBeVisible();
  });

  test('walk-in hides and stops requiring next of kin, occupation and photo', async ({ page }) => {
    await page.getByRole('radio', { name: 'Walk-in' }).click();
    await expect(page.getByLabel('Occupation')).toHaveCount(0);
    await expect(page.getByLabel('Next of kin name')).toHaveCount(0);
    await page.locator('form').getByRole('button', { name: 'Register patient' }).click();
    await expect(page.getByText('This field is required')).toHaveCount(10);
    await expect(page.getByText('Please take patient photo')).toHaveCount(0);
  });

  test('complete walk-in reaches the chart with next steps', async ({ page }) => {
    await page.getByRole('radio', { name: 'Walk-in' }).click();
    await page.getByRole('textbox', { name: 'Phone', exact: true }).fill('07098765321');
    await page.getByLabel('First name').fill('Newly');
    await page.getByLabel('Last name').fill('Added');
    await page
      .getByRole('group', { name: 'Date of birth' })
      .getByRole('spinbutton')
      .first()
      .click();
    await page.keyboard.type('01021990');
    await page.getByRole('radio', { name: 'Female' }).click();
    await pick(page, 'Marital status', 'Single');
    await pick(page, 'Religion', 'Other');
    await pick(page, 'State', 'Oyo');
    await pick(page, 'Local government area', 'Ibadan North');
    await page.getByRole('textbox', { name: 'Address', exact: true }).fill('1 Demo Street');
    await page.locator('form').getByRole('button', { name: 'Register patient' }).click();
    await expect(page.getByRole('heading', { name: 'Newly Added' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Patient registered' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add insurance' })).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'registered');
  });
});

test('rows keep the 44px rule with actions', async ({ page }) => {
  await open(page);
  await page.getByLabel('Prototype role').selectOption('Admin');
  expect((await rows(page).first().boundingBox())?.height).toBe(44);
});

test('search screen has no serious accessibility issues and fits 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  await expectNoSeriousA11yIssues(page, 'search');
  await page.getByLabel('Prototype role').selectOption('Admin');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});
