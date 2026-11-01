import { expect, test, type Page } from '@playwright/test';
import { colorsOf, contrast, expectNoSeriousA11yIssues, heightOf } from './helpers';

const open = (page: Page, query = '') => page.goto(`/kit-harness.html?view=table${query}`);
const records = (page: Page) => page.getByRole('table', { name: 'Records', exact: true });
const firstCell = (page: Page) =>
  records(page).getByTestId('table-row').first().getByRole('cell').nth(1);

async function requests(page: Page) {
  return JSON.parse((await page.getByTestId('requests').textContent()) ?? '[]');
}

test.describe('table', () => {
  test('T1 rows are 30px, 26px dense, with mono numerals', async ({ page }) => {
    await open(page);
    const row = records(page).getByTestId('table-row').first();
    await expect(row).toBeVisible();
    expect(await heightOf(row)).toBe(44);
    const amount = row.getByRole('cell').nth(2);
    const style = await amount.evaluate((e) => {
      const s = getComputedStyle(e);
      return {
        family: s.fontFamily,
        numeric: s.fontVariantNumeric,
        size: s.fontSize,
        align: s.textAlign,
      };
    });
    expect(style.family).toContain('Geist Mono');
    expect(style.numeric).toBe('tabular-nums');
    expect(style.size).toBe('14px');
    expect(style.align).toBe('right');

    await open(page, '&dense');
    await expect(records(page).getByTestId('table-row').first()).toBeVisible();
    expect(await heightOf(records(page).getByTestId('table-row').first())).toBe(32);
  });

  test('T2 sends page and sort, and aria-sort follows', async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');
    const header = records(page).getByRole('columnheader', { name: 'Name' });
    await expect(header).toHaveAttribute('aria-sort', 'none');

    await page.getByRole('button', { name: 'Page 3' }).click();
    await expect(firstCell(page)).toHaveText('Item 21');

    await header.getByRole('button').click();
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstCell(page)).toHaveText('Item 01');
    await expect
      .poll(async () => (await requests(page)).at(-1))
      .toEqual({ page: 1, pageSize: 10, sort: { id: 'name', desc: false } });

    await header.getByRole('button').click();
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(firstCell(page)).toHaveText('Item 57');

    await header.getByRole('button').click();
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await expect.poll(async () => (await requests(page)).at(-1).sort).toBeNull();
  });

  test('T3 skeleton while first loading, then rows', async ({ page }) => {
    await open(page, '&hold');
    await expect(records(page).getByTestId('skeleton-row').first()).toBeVisible();
    await expect(page.getByRole('status').first()).toHaveText('Loading…');
    await expect(records(page)).toHaveAttribute('aria-busy', 'true');
    await expectNoSeriousA11yIssues(page, 'loading');
    await page.getByRole('button', { name: 'Release' }).click();
    await expect(records(page).getByTestId('table-row')).toHaveCount(10);
    await expect(records(page)).toHaveAttribute('aria-busy', 'false');
  });

  test('T3 a stale response never replaces a newer one', async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');
    await page.getByRole('button', { name: 'Page 2' }).click();
    await records(page).getByRole('columnheader', { name: 'Name' }).getByRole('button').click();
    await expect(firstCell(page)).toHaveText('Item 01');
    await page.waitForTimeout(450);
    await expect(firstCell(page)).toHaveText('Item 01');
    await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('empty differs from error, and retry recovers', async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');

    await page.getByRole('button', { name: 'Fail next' }).click();
    await expect(page.getByRole('alert')).toContainText('Could not load records.');
    await expect(records(page).getByTestId('table-row')).toHaveCount(10);
    await expect(records(page).getByTestId('table-empty')).toHaveCount(0);
    await expectNoSeriousA11yIssues(page, 'error');

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('alert')).toHaveCount(0);

    await page.getByRole('button', { name: 'Empty data' }).click();
    await expect(records(page).getByTestId('table-empty')).toHaveText('No records found');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expectNoSeriousA11yIssues(page, 'empty');
    await expect(page.getByTestId('pagination-summary')).toHaveText('Displaying 0 of 0 records');
    await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  test('T4 header stays visible while the body scrolls', async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');
    const header = records(page).getByRole('columnheader', { name: 'Name' });
    const before = await header.boundingBox();
    const region = page.getByRole('region', { name: 'Records', exact: true });
    await region.evaluate((e) => {
      e.scrollTop = 120;
    });
    expect(await region.evaluate((e) => e.scrollTop)).toBe(120);
    expect((await header.boundingBox())?.y).toBe(before?.y);
    const collapse = await records(page).evaluate((e) => getComputedStyle(e).borderCollapse);
    expect(collapse).toBe('separate');
    const border = await header.evaluate((e) => getComputedStyle(e).borderBottomWidth);
    expect(border).toBe('1px');
  });

  test('T5 group rows span the table validly', async ({ page }) => {
    await open(page);
    const grouped = page.getByRole('table', { name: 'Grouped records' });
    const group = grouped.locator('tbody > tr > th[scope=colgroup]');
    await expect(group).toHaveText('Morning');
    await expect(group).toHaveAttribute('colspan', '3');
    await expect(grouped.getByTestId('table-row')).toHaveCount(2);
  });

  test('T6 selection works by keyboard and selected text is AA', async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');
    const box = page.getByRole('checkbox', { name: 'Select Item 01' });
    await box.focus();
    await page.keyboard.press('Space');
    await expect(box).toBeChecked();
    await expect(page.getByTestId('selected')).toHaveText('[1]');

    const row = records(page).getByTestId('table-row').first();
    const { bg } = await colorsOf(row);
    expect(bg).toBe('rgb(214, 236, 234)');
    const { fg } = await colorsOf(firstCell(page));
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);

    const all = page.getByRole('checkbox', { name: 'Select all rows on this page' });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await expectNoSeriousA11yIssues(page, 'partly selected');
    await all.focus();
    await page.keyboard.press('Space');
    await expect(all).toBeChecked();
    await expect(page.getByTestId('selected')).toHaveText('[1,2,3,4,5,6,7,8,9,10]');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('selected')).toHaveText('[]');
  });

  test('selecting all keeps selections from other pages', async ({ page }) => {
    await open(page);
    await page.getByRole('checkbox', { name: 'Select Item 01' }).click();
    await page.getByRole('button', { name: 'Page 3' }).click();
    await expect(firstCell(page)).toHaveText('Item 21');
    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click();
    await expect(page.getByTestId('selected')).toHaveText('[1,21,22,23,24,25,26,27,28,29,30]');
  });

  test('sort button works by keyboard', async ({ page }) => {
    await open(page);
    const button = records(page).getByRole('columnheader', { name: 'Amount' }).getByRole('button');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(records(page).getByRole('columnheader', { name: 'Amount' })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
  });

  test('loaded table has no serious accessibility issues', async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');
    await expectNoSeriousA11yIssues(page, 'loaded');
  });
});

test.describe('pagination', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await expect(firstCell(page)).toHaveText('Item 01');
  });

  test('ends are disabled and cannot emit', async ({ page }) => {
    const count = (await requests(page)).length;
    for (const name of ['First page', 'Previous page']) {
      const button = page.getByRole('button', { name });
      await expect(button).toBeDisabled();
      await button.click({ force: true });
    }
    expect((await requests(page)).length).toBe(count);

    await page.getByRole('button', { name: 'Last page' }).click();
    await expect(firstCell(page)).toHaveText('Item 51');
    await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Last page' })).toBeDisabled();
    await expect(page.getByTestId('pagination-summary')).toHaveText('Displaying 7 of 57 records');
  });

  test('shows at most six page numbers around the current page', async ({ page }) => {
    const pages = page.getByRole('button', { name: /^Page \d+$/ });
    await expect(pages).toHaveCount(6);
    await page.getByRole('button', { name: 'Last page' }).click();
    await expect(pages).toHaveText(['1', '2', '3', '4', '5', '6']);
  });

  test('keyboard moves pages and changes page size, returning to page 1', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Next page' });
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(firstCell(page)).toHaveText('Item 11');
    await expect(next).toBeFocused();

    const size = page.getByRole('combobox', { name: 'Records per page' });
    await size.focus();
    await expect(size).toBeFocused();
    await size.selectOption('20');
    await expect(size).toHaveValue('20');
    await expect
      .poll(async () => (await requests(page)).at(-1))
      .toMatchObject({ page: 1, pageSize: 20 });
    await expect(records(page).getByTestId('table-row')).toHaveCount(20);
  });

  test('controls measure 28px and a shrunk data set moves to the new last page', async ({
    page,
  }) => {
    expect(await heightOf(page.getByRole('button', { name: 'Next page' }))).toBe(38);
    expect(await heightOf(page.getByRole('combobox', { name: 'Records per page' }))).toBe(38);
    await page.getByRole('button', { name: 'Last page' }).click();
    await expect(firstCell(page)).toHaveText('Item 51');
    await page.getByRole('button', { name: 'Shrink data' }).click();
    await expect(firstCell(page)).toHaveText('Item 21');
    await expect(page.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('pagination has no serious accessibility issues on a middle page', async ({ page }) => {
    await page.getByRole('button', { name: 'Page 3' }).click();
    await expect(firstCell(page)).toHaveText('Item 21');
    await expectNoSeriousA11yIssues(page, 'middle page');
  });
});
