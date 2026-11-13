import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const press = (locator: Locator, hasTouch: boolean) => (hasTouch ? locator.tap() : locator.click());

async function open(page: Page, query = ''): Promise<void> {
  await page.goto(`/kit-harness.html?view=archetypes&screen=list${query}`);
  await expect(page.getByTestId('list-summary')).toContainText('records');
}

const items = (page: Page) =>
  page
    .getByRole('table', { name: 'Store items' })
    .getByTestId('table-row')
    .or(page.getByRole('list', { name: 'Store items' }).getByTestId('card'));

async function chooseFilter(page: Page, label: string, value: string, hasTouch: boolean) {
  const filtersButton = page.getByRole('button', { name: /^Filters/ });
  if (await filtersButton.isVisible()) {
    await press(filtersButton, hasTouch);
    await page.getByRole('dialog', { name: 'Filters' }).getByLabel(label).selectOption(value);
    await press(page.getByRole('button', { name: 'Show results' }), hasTouch);
  } else {
    await page.getByLabel(label).selectOption(value);
  }
}

test('shows the first page with a total and no serious accessibility issues', async ({ page }) => {
  await open(page);
  await expect(page.getByTestId('list-summary')).toHaveText(/47\s+records/);
  await expect(items(page)).toHaveCount(10);
  await expectNoSeriousA11yIssues(page, 'list');
});

test('a filter narrows the list, shows in the URL, and survives a reload', async ({
  page,
  hasTouch,
}) => {
  await open(page);
  await chooseFilter(page, 'Drug type', 'NHIS', hasTouch);
  await expect(page).toHaveURL(/type=NHIS/);
  await expect(page.getByTestId('list-summary')).toContainText('1 filter on');
  await expect(page.getByTestId('list-summary')).not.toContainText('47');
  const filtered = await page.getByTestId('list-summary').textContent();
  await page.reload();
  await expect(page.getByTestId('list-summary')).toHaveText(filtered ?? '');
  await press(page.getByRole('button', { name: 'Clear filters' }).first(), hasTouch);
  await expect(page).not.toHaveURL(/type=/);
});

test('paging is kept in the URL and restored by Back from an item', async ({ page, hasTouch }) => {
  await open(page);
  await press(page.getByRole('button', { name: 'Page 2' }), hasTouch);
  await expect(page).toHaveURL(/page=2/);
  const first = items(page).first();
  const name = (
    await first
      .getByRole('button')
      .filter({ hasNotText: /^Select/ })
      .first()
      .textContent()
  )?.trim();
  await press(first.getByRole('button', { name: name ?? '' }), hasTouch);
  await expect(page.getByRole('heading', { level: 1, name: name ?? '' })).toBeVisible();
  await press(page.getByRole('button', { name: 'Store items' }), hasTouch);
  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('a tampered URL falls back to the first page instead of failing', async ({ page }) => {
  await open(page, '&page=-3&size=7&sort=secret&type=DROP');
  await expect(page.getByTestId('list-summary')).toHaveText(/47\s+records/);
  await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('selecting items shows the bulk action bar', async ({ page, hasTouch }) => {
  await open(page);
  await press(page.getByRole('checkbox', { name: /^Select / }).nth(1), hasTouch);
  const bar = page.getByRole('region', { name: 'Selected Store items' });
  await expect(bar).toContainText('1 selected');
  await press(bar.getByRole('button', { name: 'Clear selection' }), hasTouch);
  await expect(bar).toHaveCount(0);
});

test('filters are inline from 1024px wide and in a side panel below that', async ({
  page,
  hasTouch,
}) => {
  await open(page);
  const width = page.viewportSize()?.width ?? 0;
  if (width < 1024) {
    await expect(page.getByLabel('Drug type')).toHaveCount(0);
    await press(page.getByRole('button', { name: /^Filters/ }), hasTouch);
    await expect(
      page.getByRole('dialog', { name: 'Filters' }).getByLabel('Drug type')
    ).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'filter panel');
  } else {
    await expect(page.getByLabel('Drug type')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Filters/ })).toHaveCount(0);
  }
});

test('portrait tablets show cards and wider screens show the table', async ({ page }) => {
  await open(page);
  const width = page.viewportSize()?.width ?? 0;
  if (width < 768) {
    await expect(page.getByRole('list', { name: 'Store items' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Store items' })).toHaveCount(0);
  } else {
    await expect(page.getByRole('table', { name: 'Store items' })).toBeVisible();
  }
});
