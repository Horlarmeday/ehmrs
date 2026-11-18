import { expect, test, type Page } from '@playwright/test';
import { controlHeight, expectNoSeriousA11yIssues, expectRowHeight, heightOf } from './helpers';

const open = (page: Page) => page.goto('/kit-harness.html?view=lab-desk');
const list = (page: Page) => page.getByRole('list', { name: 'Tests in this sample' });
async function pick(page: Page, name: string): Promise<void> {
  const back = page.getByRole('button', { name: 'All tests' });
  if (await back.isVisible()) await back.click();
  await list(page).getByRole('button', { name }).click();
  const opened = page.getByRole('region', { name });
  await expect(opened).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) < 1024) await expect(opened).toBeFocused();
}
const stage = (page: Page, name: string) =>
  page.getByRole('group', { name: 'Stage' }).getByRole('button', { name }).click();

test.beforeEach(async ({ page }) => {
  await open(page);
  await expect(
    list(page)
      .or(page.getByRole('textbox', { name: 'WBC' }))
      .first()
  ).toBeVisible();
  if (!(await page.getByRole('textbox', { name: 'WBC' }).isVisible())) {
    await pick(page, 'Full blood count');
  }
});

test('rows keep density, and the page fits 1280px', async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const row = page.getByTestId('result-row').first();
  await expectRowHeight(row, info, 44);
  expect(await heightOf(row.getByRole('textbox'))).toBe(controlHeight(info, 38));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('Enter and arrows move through a column, and a high value is flagged', async ({ page }) => {
  await page.getByRole('textbox', { name: 'WBC' }).focus();
  await page.keyboard.type('99999');
  await expect(page.getByTestId('result-row').first().getByTestId('flag')).toHaveText('High');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-row').nth(1).getByRole('textbox')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('result-row').nth(2).getByRole('textbox')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByTestId('result-row').nth(1).getByRole('textbox')).toBeFocused();
});

test('widal O and H are separate columns', async ({ page }) => {
  await pick(page, 'Widal reaction');
  await page.getByRole('textbox', { name: 'Salmonella Typhi O' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('textbox', { name: 'S. Paratyphi A. O' })).toBeFocused();
});

test('values survive switching between tests', async ({ page }) => {
  await page.getByRole('textbox', { name: 'WBC' }).fill('7.1');
  await pick(page, 'Widal reaction');
  await pick(page, 'Full blood count');
  await expect(page.getByRole('textbox', { name: 'WBC' })).toHaveValue('7.1');
  const back = page.getByRole('button', { name: 'All tests' });
  if (await back.isVisible()) await back.click();
  await expect(list(page).getByRole('button', { name: /Full blood count/ })).toContainText(
    'Entered'
  );
});

test('payment pending and approved tests are locked with a reason', async ({ page }) => {
  await pick(page, 'Stool microscopy');
  await expect(page.getByRole('status').filter({ hasText: 'Payment is pending' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Result' })).toBeDisabled();
  await pick(page, 'Pregnancy test');
  await expect(page.getByRole('status').filter({ hasText: 'approved' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Result' })).toBeDisabled();
});

test('a rejected test shows why', async ({ page }) => {
  await pick(page, 'Malaria parasite');
  await expect(page.getByRole('status').filter({ hasText: 'Repeat the film' })).toBeVisible();
});

test('referral fields appear only when referring', async ({ page }) => {
  await expect(page.getByLabel('Referral reason')).toHaveCount(0);
  await page.getByRole('checkbox', { name: /Refer this test/ }).click();
  await expect(page.getByLabel('Referral reason')).toBeVisible();
  await expect(page.getByLabel('Institute referred')).toBeVisible();
});

test('saving needs a tester, and a locked test does not count', async ({ page }) => {
  await pick(page, 'Malaria parasite');
  await page.getByRole('textbox', { name: 'Result' }).fill('');
  await page.getByRole('button', { name: 'Save results' }).click();
  await expect(page.getByRole('alert')).toHaveText('Input at least one result');
  await page.getByRole('textbox', { name: 'Result' }).fill('Scanty');
  await page.getByRole('button', { name: 'Save results' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose the tester before saving');
  await page.getByRole('combobox', { name: 'Tester' }).click();
  await page.getByRole('combobox', { name: 'Tester' }).fill('Demo');
  await page.getByRole('option', { name: 'Demo Lab Scientist' }).click();
  await page.getByRole('button', { name: 'Save results' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved 1 result.' })).toBeVisible();
});

test('a result goes from entry through validation to approval', async ({ page }) => {
  await pick(page, 'Malaria parasite');
  await stage(page, 'Approve');
  await page.getByRole('button', { name: 'Approve accepted results' }).click();
  await expect(page.getByRole('alert')).toHaveText('Approve at least one result');

  await stage(page, 'Validate');
  const item = page.getByTestId('review-item').filter({ hasText: 'Malaria parasite' });
  await expect(item).toContainText('Scanty');
  await item.getByRole('radio', { name: 'Accept' }).click();
  await item.getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Save validation' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Validated 1 result.' })).toBeVisible();

  await stage(page, 'Approve');
  const approval = page.getByTestId('approve-item');
  await expect(approval).toContainText('Abnormal');
  await page.getByRole('button', { name: 'Approve accepted results' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Approved 1 result.' })).toBeVisible();
  await expect(approval).toHaveCount(0);
});

test('no serious accessibility issues in each stage', async ({ page }) => {
  await expectNoSeriousA11yIssues(page, 'entry');
  await pick(page, 'Stool microscopy');
  await expectNoSeriousA11yIssues(page, 'locked');
  await stage(page, 'Validate');
  await expectNoSeriousA11yIssues(page, 'validate');
  await stage(page, 'Approve');
  await expectNoSeriousA11yIssues(page, 'approve');
});

test('portrait tablets open a test full width with a way back to the list', async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  test.skip(width >= 1024, 'side by side on wider screens');
  await expect(list(page)).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Full blood count' })).toBeFocused();
  await page.getByRole('button', { name: 'All tests' }).click();
  await expect(list(page).getByRole('button', { name: /Full blood count/ })).toBeFocused();
  await expect(page).not.toHaveURL(/item=/);
  await expectNoSeriousA11yIssues(page, 'test list');
});

test('the selected test is kept in the URL', async ({ page }) => {
  await pick(page, 'Widal reaction');
  await expect(page).toHaveURL(/item=\d+/);
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Salmonella Typhi O' })).toBeVisible();
});
