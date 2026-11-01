import { expect, test } from '@playwright/test';
import { differentialRows, morphologyRows, rows } from '../src/components/kit/__harness__/fbcRows';
import { expectNoSeriousA11yIssues, heightOf } from './helpers';

const allRows = [...rows, ...differentialRows, ...morphologyRows];

async function model(page: import('@playwright/test').Page): Promise<Record<string, string>> {
  return JSON.parse((await page.getByTestId('model').textContent()) ?? '{}');
}

test.describe('entry section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kit-harness.html?view=fbc');
  });

  test('L1 renders every legacy row, range and unit', async ({ page }) => {
    await expect(page.getByTestId('result-row')).toHaveCount(allRows.length);
    for (const row of allRows) {
      const tr = page
        .getByTestId('result-row')
        .filter({ has: page.getByRole('rowheader', { name: row.label, exact: true }) });
      for (const text of [row.childRange, row.adultRangeMale, row.adultRangeFemale, row.unit]) {
        if (text) await expect(tr).toContainText(text);
      }
    }
    await expect(page.getByRole('columnheader', { name: 'Adult Range' })).toHaveAttribute(
      'colspan',
      '2'
    );
    await expect(page.getByRole('columnheader', { name: 'Male', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Differential' })).toHaveAttribute(
      'colspan',
      '6'
    );
    await expect(page.getByRole('columnheader', { name: 'RBC Morphology' })).toHaveAttribute(
      'colspan',
      '6'
    );
  });

  test('L2 density holds and nothing overflows at 1280px', async ({ page }) => {
    for (const row of await page.getByTestId('result-row').all()) {
      expect(await heightOf(row)).toBe(30);
      expect(await heightOf(row.getByRole('textbox'))).toBe(28);
    }
    const fontSize = await page
      .getByRole('textbox', { name: 'WBC' })
      .evaluate((e) => getComputedStyle(e).fontSize);
    expect(fontSize).toBe('12px');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);
  });

  test('L3 main rows can be entered by keyboard alone', async ({ page }) => {
    await page.getByRole('textbox', { name: rows[0]?.label }).focus();
    for (const [index, row] of rows.entries()) {
      await expect(page.getByRole('textbox', { name: row.label, exact: true })).toBeFocused();
      await page.keyboard.type(`${index + 1}.5`);
      await page.keyboard.press('Enter');
    }
    const values = await model(page);
    for (const [index, row] of rows.entries()) expect(values[row.model]).toBe(`${index + 1}.5`);

    await expect(
      page.getByRole('textbox', { name: differentialRows[0]?.label, exact: true })
    ).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(
      page.getByRole('textbox', { name: rows[rows.length - 1]?.label, exact: true })
    ).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByRole('textbox', { name: differentialRows[0]?.label, exact: true })
    ).toBeFocused();
  });

  test('L4 Tab reaches comments and text reaches the model', async ({ page }) => {
    await page
      .getByRole('textbox', { name: morphologyRows[morphologyRows.length - 1]?.label, exact: true })
      .focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'Comments' })).toBeFocused();
    await page.keyboard.type('Sample haemolysed');
    expect((await model(page)).comments).toBe('Sample haemolysed');
  });

  test('L6 no serious accessibility issues on entry', async ({ page }) => {
    await expectNoSeriousA11yIssues(page, 'entry');
  });
});

for (const section of ['ValidationSection', 'ApprovalSection']) {
  test.describe(section, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/kit-harness.html?view=fbc&section=${section}`);
    });

    test('L5 inputs are disabled and empty rows are hidden', async ({ page }) => {
      await expect(page.getByTestId('result-row')).toHaveCount(2);
      await expect(page.getByRole('textbox', { name: 'WBC' })).toBeDisabled();
      await expect(page.getByRole('textbox', { name: 'WBC' })).toHaveValue('7.1');
      await expect(page.getByRole('textbox', { name: 'Neutrophils' })).toBeDisabled();
      await expect(page.getByRole('textbox', { name: 'Comments' })).toBeDisabled();
      await expect(page.getByRole('textbox', { name: 'RBC', exact: true })).toHaveCount(0);
      await expect(page.getByRole('columnheader', { name: 'RBC Morphology' })).toHaveCount(0);
    });

    test('L6 no serious accessibility issues', async ({ page }) => {
      await expectNoSeriousA11yIssues(page, section);
    });
  });
}
