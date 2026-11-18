import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const press = (locator: Locator, hasTouch: boolean) => (hasTouch ? locator.tap() : locator.click());

async function open(page: Page, query = ''): Promise<void> {
  await page.goto(`/kit-harness.html?view=archetypes&screen=detail${query}`);
  await expect(page.getByRole('tablist', { name: 'Store item sections' })).toBeVisible();
}

test('shows the record header, details and no serious accessibility issues', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Metronidazole/);
  await expect(page.getByRole('tab', { name: 'Item detail' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(page.getByText('Purchase unit cost')).toBeVisible();
  await expectNoSeriousA11yIssues(page, 'detail');
});

test('History loads only when its tab opens, and the tab survives a reload', async ({
  page,
  hasTouch,
}) => {
  await open(page);
  await expect(page.getByRole('table', { name: 'Item history' })).toHaveCount(0);
  await press(page.getByRole('tab', { name: 'History' }), hasTouch);
  await expect(page).toHaveURL(/tab=history/);
  await expect(
    page.getByRole('table', { name: 'Item history' }).getByTestId('table-row')
  ).toHaveCount(6);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('table', { name: 'Item history' }).getByTestId('table-row')
  ).toHaveCount(6);
  await expectNoSeriousA11yIssues(page, 'history');
});

test('tabs move with the arrow keys', async ({ page, hasTouch }) => {
  test.skip(hasTouch, 'keyboard');
  await open(page);
  await page.getByRole('tab', { name: 'Item detail' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'History' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Logs' })).toBeFocused();
});

test('a tampered tab in the URL opens the first tab', async ({ page }) => {
  await open(page, '&tab=<script>');
  await expect(page.getByRole('tab', { name: 'Item detail' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
});

test('the back link returns to the list', async ({ page, hasTouch }) => {
  await open(page);
  await press(page.getByRole('button', { name: 'Store items' }), hasTouch);
  await expect(page.getByRole('heading', { level: 1, name: 'Store items' })).toBeVisible();
});
