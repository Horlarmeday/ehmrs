import { expect, test, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const consoleProblems: string[] = [];

test.beforeEach(async ({ page }) => {
  consoleProblems.length = 0;
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleProblems.push(message.text());
    }
  });
  await page.goto('/kit-harness.html?view=overlays');
});

test.afterEach(() => {
  expect(consoleProblems).toEqual([]);
});


test.describe('dialog', () => {
  test('focuses the first field, traps focus, Escape closes and focus returns', async ({ page }) => {
    const opener = page.getByTestId('open-form');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Create visit' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription('Start a new visit for this patient.');
    await expect(dialog.getByLabel('Reason')).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'dialog open');
    for (let press = 0; press < 8; press += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.getByTestId('dialog-events')).toHaveText('1/1');
    await expectNoSeriousA11yIssues(page, 'dialog closed');
  });

  test('a form dialog stays open on an outside click and keeps typed text', async ({ page }) => {
    await page.getByTestId('open-form').click();
    const dialog = page.getByRole('dialog', { name: 'Create visit' });
    await dialog.getByLabel('Reason').fill('Fever');
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Reason')).toHaveValue('Fever');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('open-form')).toBeFocused();
  });

  test('closeOnBackdrop closes on an outside click', async ({ page }) => {
    await page.getByTestId('open-backdrop').click();
    const dialog = page.getByRole('dialog', { name: 'Details' });
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
    await expect(page.locator('body')).not.toHaveCSS('pointer-events', 'none');
  });

  test('closeOnEscape false ignores Escape', async ({ page }) => {
    await page.getByTestId('open-locked').click();
    const dialog = page.getByRole('dialog', { name: 'Session timeout' });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
  });

  test('long content scrolls with title and actions visible', async ({ page }) => {
    await page.getByTestId('open-long').click();
    const dialog = page.getByRole('dialog', { name: 'Prescriptions history' });
    const body = page.getByTestId('dialog-body');
    await expect(body).toBeFocused();
    await page.keyboard.press('End');
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await expect(dialog.getByRole('heading', { name: 'Prescriptions history' })).toBeInViewport();
    await expect(page.getByTestId('long-done')).toBeInViewport();
    const box = await dialog.boundingBox();
    expect(box?.width).toBe(1120);
    await expectNoSeriousA11yIssues(page, 'long dialog');
  });

  test('fits a small screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.getByTestId('open-long').click();
    const box = await page.getByRole('dialog').boundingBox();
    expect(box?.width).toBe(328);
    expect(box?.height).toBeLessThanOrEqual(608);
  });

  test('locking scroll does not shift the page', async ({ page }) => {
    const opener = page.getByTestId('open-form');
    const before = await opener.boundingBox();
    await opener.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await opener.boundingBox()).toEqual(before);
  });
});

test.describe('confirm', () => {
  test('starts on Cancel, Cancel and Escape answer false, focus returns', async ({ page }) => {
    const opener = page.getByTestId('ask');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('alertdialog', { name: 'Delete this service?' });
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'confirm open');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('answer')).toHaveText('false');
    await expect(opener).toBeFocused();

    await page.reload();
    await expect(page.getByTestId('answer')).toHaveText('none');
    await opener.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('answer')).toHaveText('false');
    await expect(opener).toBeFocused();
  });

  test('Confirm answers true and an outside click does nothing', async ({ page }) => {
    await page.getByTestId('ask').click();
    const dialog = page.getByRole('alertdialog');
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('answer')).toHaveText('true');
    await expect(page.getByTestId('ask')).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('pointer-events', 'none');
  });

  test('a second question waits for the first, each with its own answer', async ({ page }) => {
    await page.getByTestId('ask-twice').click();
    const first = page.getByRole('alertdialog', { name: 'Confirm first' });
    await expect(first).toBeVisible();
    await first.getByRole('button', { name: 'Confirm' }).click();
    const second = page.getByRole('alertdialog', { name: 'Confirm second' });
    await expect(second).toBeVisible();
    await expect(second.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(second).toBeHidden();
    await expect(page.getByTestId('queued')).toHaveText('first:true,second:false');
    await expect(page.getByTestId('ask-twice')).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('pointer-events', 'none');
  });

  test('moves focus to main when the opening button has gone', async ({ page }) => {
    await page.getByTestId('ask-remove').click();
    const dialog = page.getByRole('alertdialog', { name: 'Removed row' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirm' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('main')).toBeFocused();
  });
});

test.describe('tabs', () => {
  const record = (page: Page) => page.getByRole('tablist', { name: 'Patient record' });

  test('arrow, Home and End move between tabs and skip disabled ones', async ({ page }) => {
    const list = record(page);
    await list.getByRole('tab', { name: 'Summary' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'Notes' })).toBeFocused();
    await expect(page.getByTestId('active-tab')).toHaveText('notes');
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'History' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(list.getByRole('tab', { name: 'Summary' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(list.getByRole('tab', { name: 'History' })).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'tabs');
  });

  test('a parent can change the tab', async ({ page }) => {
    await page.getByTestId('tab-from-parent').click();
    await expect(record(page).getByRole('tab', { name: 'Notes' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  test('typed values survive switching, and a lazy panel renders only when open', async ({
    page,
  }) => {
    const list = record(page);
    await list.getByRole('tab', { name: 'Notes' }).click();
    await page.getByLabel('Tab note').fill('kept');
    await expect(page.getByTestId('lazy-panel')).toHaveCount(0);
    await list.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByTestId('lazy-panel')).toBeVisible();
    await expect(page.getByLabel('Tab note')).toBeHidden();
    await list.getByRole('tab', { name: 'Notes' }).click();
    await expect(page.getByLabel('Tab note')).toHaveValue('kept');
    await expect(page.getByTestId('lazy-panel')).toHaveCount(0);
  });

  test('nested tabs do not react to each other', async ({ page }) => {
    const inner = page.getByRole('tablist', { name: 'Summary sections' });
    await inner.getByRole('tab', { name: 'Inner one' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(inner.getByRole('tab', { name: 'Inner two' })).toBeFocused();
    await expect(page.getByTestId('active-tab')).toHaveText('summary');
  });

  test('many tabs scroll and the page does not', async ({ page }) => {
    const list = page.getByRole('tablist', { name: 'Departments' });
    await list.getByRole('tab', { name: 'Department tab 1', exact: true }).focus();
    await page.keyboard.press('End');
    await expect(list.getByRole('tab', { name: 'Department tab 24' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expectNoSeriousA11yIssues(page, 'many tabs');
  });
});

test.describe('accordion', () => {
  test('works by keyboard, one open at a time, and can collapse', async ({ page }) => {
    const accordion = page.getByTestId('accordion');
    const vitals = accordion.getByRole('button', { name: 'Vitals' });
    const allergies = accordion.getByRole('button', { name: 'Allergies' });
    await vitals.focus();
    await page.keyboard.press('ArrowDown');
    await expect(allergies).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(allergies).toHaveAttribute('aria-expanded', 'true');
    await expect(vitals).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Space');
    await expect(allergies).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowDown');
    await expect(accordion.getByRole('button', { name: 'Past visits' })).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'accordion');
  });

  test('a parent can control it and multiple sections can stay open', async ({ page }) => {
    await page.getByTestId('section-from-parent').click();
    await expect(
      page.getByTestId('accordion').getByRole('button', { name: 'Allergies' })
    ).toHaveAttribute('aria-expanded', 'true');
    const multiple = page.getByTestId('accordion-multiple');
    await multiple.getByRole('button', { name: 'Vitals' }).click();
    await multiple.getByRole('button', { name: 'Allergies' }).click();
    await expect(multiple.getByText('Multi vitals')).toBeVisible();
    await expect(multiple.getByText('Multi allergies')).toBeVisible();
  });

  test('typed values survive collapsing, and a lazy section renders only when open', async ({
    page,
  }) => {
    const accordion = page.getByTestId('accordion');
    await page.getByLabel('Vitals note').fill('kept');
    await expect(page.getByTestId('lazy-item')).toHaveCount(0);
    await accordion.getByRole('button', { name: 'Past visits' }).click();
    await expect(page.getByTestId('lazy-item')).toBeVisible();
    await accordion.getByRole('button', { name: 'Vitals' }).click();
    await expect(page.getByLabel('Vitals note')).toHaveValue('kept');
    await expect(page.getByTestId('lazy-item')).toHaveCount(0);
  });

  test('closed rows are all the same height', async ({ page }) => {
    const accordion = page.getByTestId('accordion');
    await accordion.getByRole('button', { name: 'Vitals' }).click();
    for (const name of ['Vitals', 'Allergies', 'Archived', 'Past visits']) {
      const box = await accordion.getByRole('button', { name }).locator('xpath=ancestor::*[@data-state][@data-orientation][1]').last().boundingBox();
      expect(box?.height, name).toBeLessThanOrEqual(46);
    }
  });

  test('a disabled section cannot open', async ({ page }) => {
    const archived = page.getByTestId('accordion').getByRole('button', { name: 'Archived' });
    await expect(archived).toBeDisabled();
  });
});

test.describe('tooltip', () => {
  test('shows on keyboard focus, describes the trigger, Escape dismisses', async ({ page }) => {
    const trigger = page.getByTestId('tooltip-trigger');
    await page.getByTestId('accordion-multiple').getByRole('button', { name: 'Allergies' }).focus();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveText('Print the record');
    await expect(trigger).toHaveAccessibleDescription('Print the record');
    await expect(trigger).toHaveAccessibleName('Print');
    await expectNoSeriousA11yIssues(page, 'tooltip open');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
  });

  test('shows on hover, and the pointer can move onto it', async ({ page }) => {
    await page.getByTestId('tooltip-trigger').hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await page.locator('[data-reka-popper-content-wrapper] [data-side]').hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(700, 800);
    await expect(tooltip).toBeHidden();
  });
});

test.describe('dropdown', () => {
  const trigger = (page: Page) => page.getByRole('button', { name: 'More actions' });

  test('arrow keys skip disabled items, Enter selects, focus returns', async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: 'Dispense' })).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'dropdown open');
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Export' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Deactivate' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('picked')).toHaveText('deactivate');
    await expect(trigger(page)).toBeFocused();
  });

  test('a disabled item cannot be selected, type-ahead works, Escape returns focus', async ({
    page,
  }) => {
    await trigger(page).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('menuitem', { name: 'Reorder' }).click({ force: true });
    await expect(menu).toBeVisible();
    await expect(page.getByTestId('picked')).toHaveText('none');
    await page.keyboard.type('e');
    await expect(menu.getByRole('menuitem', { name: 'Export' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    await expect(page.getByTestId('picked')).toHaveText('none');
  });

  test('an item can open a dialog, and focus and clicks work afterwards', async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('menuitem', { name: 'Export' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export data' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('File name')).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'dialog from dropdown');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('pointer-events', 'none');
    await page.getByTestId('tab-from-parent').click();
    await expect(page.getByTestId('active-tab')).toHaveText('notes');
  });
});

test.describe('layers inside a dialog', () => {
  async function openLayers(page: Page) {
    await page.getByTestId('open-layers').click();
    const dialog = page.getByRole('dialog', { name: 'Layered controls' });
    await expect(dialog).toBeVisible();
    return dialog;
  }

  test('a select opens above the dialog, can be used, and Escape closes only it', async ({
    page,
  }) => {
    const dialog = await openLayers(page);
    const input = page.getByRole('combobox', { name: 'Dialog drug' });
    await input.click();
    await input.pressSequentially('amox');
    const option = page.getByRole('option').first();
    await expect(option).toBeVisible();
    const hit = await option.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return !!top && (el === top || el.contains(top));
    });
    expect(hit).toBe(true);
    await expectNoSeriousA11yIssues(page, 'select in dialog');
    await page.keyboard.press('Escape');
    await expect(option).toBeHidden();
    await expect(dialog).toBeVisible();
    await input.fill('');
    await input.pressSequentially('am');
    const again = page.getByRole('option').first();
    await again.click();
    await expect(dialog).toBeVisible();
    await expect(input).not.toHaveValue('');
  });

  test('a date picker opens above the dialog, can be used, and Escape closes only it', async ({
    page,
  }) => {
    const dialog = await openLayers(page);
    await page.getByRole('button', { name: /Dialog date/ }).click();
    const calendar = page.getByRole('application');
    await expect(calendar).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'date picker in dialog');
    await page.keyboard.press('Escape');
    await expect(calendar).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: /Dialog date/ }).click();
    await calendar.getByRole('button', { name: /15/ }).first().click();
    await expect(calendar).toBeHidden();
    await expect(dialog).toBeVisible();
  });

  test('Escape closes a tooltip before the dialog', async ({ page }) => {
    const dialog = await openLayers(page);
    await page.getByTestId('dialog-ask').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('dialog-tooltip')).toBeFocused();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'tooltip in dialog');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
    await expect(dialog).toBeVisible();
  });

  test('a confirm opens above the dialog and returns to it', async ({ page }) => {
    const dialog = await openLayers(page);
    await page.getByTestId('dialog-ask').click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    await expectNoSeriousA11yIssues(page, 'confirm over dialog');
    await page.keyboard.press('Escape');
    await expect(confirm).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('dialog-ask')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('open-layers')).toBeFocused();
  });
});

