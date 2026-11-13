import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues } from './helpers';

const encode = (claims: object) => Buffer.from(JSON.stringify(claims)).toString('base64url');
const tokenFor = (claims: object) => `header.${encode(claims)}.signature`;

async function signIn(page: Page, claims: object): Promise<void> {
  await page.addInitScript((token) => {
    if (!sessionStorage.getItem('signed-out')) localStorage.setItem('user_token', token);
  }, tokenFor(claims));
}

const pharmacist = { role: 'Pharmacy', sub_role: 'Staff', fullname: 'Amina Yusuf' };
const press = (locator: Locator, hasTouch: boolean) => (hasTouch ? locator.tap() : locator.click());

async function ready(page: Page): Promise<void> {
  await expect(
    page
      .getByRole('navigation', { name: 'Main' })
      .or(page.getByRole('button', { name: 'Open menu' }))
  ).toBeVisible();
}

async function openMenu(page: Page, hasTouch: boolean): Promise<Locator> {
  await ready(page);
  const sidebar = page.getByRole('navigation', { name: 'Main' }).first();
  if (await sidebar.isVisible()) return sidebar;
  await press(page.getByRole('button', { name: 'Open menu' }), hasTouch);
  const drawer = page.getByRole('dialog', { name: 'eHMRS' });
  await expect(drawer).toBeVisible();
  return drawer.getByRole('navigation', { name: 'Main' });
}

test('signed-out visitors go to the sign-in page', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('the menu shows only the sections the role reached through its legacy tiles', async ({
  page,
  hasTouch,
}) => {
  await signIn(page, pharmacist);
  await page.goto('/dashboard');
  await ready(page);
  const menu = await openMenu(page, hasTouch);
  await expect(menu.getByRole('button')).toHaveText(['Home', 'Pharmacy', 'Stock']);
  await expect(menu.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveTitle('Home – eHMRS');
  await expectNoSeriousA11yIssues(page, 'shell');
});

test('choosing a section opens the role’s first legacy page there and marks it current', async ({
  page,
  hasTouch,
}) => {
  await signIn(page, pharmacist);
  await page.goto('/dashboard');
  await ready(page);
  let menu = await openMenu(page, hasTouch);
  await press(menu.getByRole('button', { name: 'Stock' }), hasTouch);
  await expect(page).toHaveURL(/\/request\/inventory-requests$/);
  await expect(page.getByRole('dialog', { name: 'eHMRS' })).toHaveCount(0);
  menu = await openMenu(page, hasTouch);
  await expect(menu.getByRole('button', { name: 'Stock' })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveTitle('Stock – eHMRS');
});

test('a nurse ward menu differs from a pharmacist menu', async ({ page, hasTouch }) => {
  await signIn(page, { role: 'Nurse', sub_role: 'Male Ward', fullname: 'Bisi Ojo' });
  await page.goto('/dashboard');
  await ready(page);
  const menu = await openMenu(page, hasTouch);
  await expect(menu.getByRole('button')).toHaveText(['Home', 'Inpatients']);
});

test('patient search opens the patient search page with the term', async ({ page }) => {
  await signIn(page, pharmacist);
  await page.goto('/dashboard');
  await ready(page);
  const search = page.getByRole('searchbox', { name: /Find a patient/ });
  await search.fill('Ada Obi');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/patient\/find-patient\?search=Ada\+Obi$/);
});

test.describe('keyboard', () => {
  test.skip(({ hasTouch }) => hasTouch, 'keyboard shortcuts need a keyboard');

  test('the skip link moves focus to the page content', async ({ page }) => {
    await signIn(page, pharmacist);
    await page.goto('/dashboard');
    await ready(page);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    expect((await skip.boundingBox())?.height).toBeGreaterThanOrEqual(24);
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('slash focuses patient search, but not while typing in a field', async ({ page }) => {
    await signIn(page, pharmacist);
    await page.goto('/dashboard');
    await ready(page);
    await page.locator('body').press('/');
    const search = page.getByRole('searchbox', { name: /Find a patient/ });
    await expect(search).toBeFocused();
    await search.type('a/b');
    await expect(search).toHaveValue('a/b');
  });
});

test('the account menu signs out to the sign-in page and clears the session', async ({
  page,
  hasTouch,
}) => {
  await signIn(page, pharmacist);
  await page.goto('/dashboard');
  await ready(page);
  await page.evaluate(() => sessionStorage.setItem('signed-out', 'yes'));
  await press(page.getByRole('button', { name: 'Account: Amina Yusuf' }), hasTouch);
  await press(page.getByRole('menuitem', { name: 'Sign out' }), hasTouch);
  await expect(page).toHaveURL(/\/auth\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('user_token'))).toBeNull();
});

test('on tablets the menu is a drawer that closes on Escape', async ({ page, hasTouch }) => {
  test.skip(!hasTouch, 'tablet layout');
  await signIn(page, pharmacist);
  await page.goto('/dashboard');
  await ready(page);
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu' }).tap();
  const drawer = page.getByRole('dialog', { name: 'eHMRS' });
  await expect(drawer).toBeVisible();
  await expectNoSeriousA11yIssues(page, 'menu drawer');
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});
