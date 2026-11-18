import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoSeriousA11yIssues, isTouch } from './helpers';

interface Scenario {
  name: string;
  request: { method: string; url: string; body?: unknown };
  response: { status: number; body?: unknown };
}

interface ApiCall {
  method: string;
  path: string;
  body: unknown;
  authorization: string | undefined;
}

const corpus = (flow: string): Scenario[] =>
  JSON.parse(readFileSync(resolve(process.cwd(), `src/contract/fixtures/${flow}.json`), 'utf8'))
    .scenarios;

const scenarios = [...corpus('auth'), ...corpus('settings')];
const named = (name: string): Scenario => {
  const found = scenarios.find((s) => s.name === name);
  if (!found) throw new Error(`no scenario "${name}"`);
  return found;
};

const settingsGet = named('GET /api/settings/system-settings/get -> 200');
const loginOk = named('POST /api/auth/login -> 200');
const loginWrong = named('POST /api/auth/login -> 400');
const loginDeactivated = named('POST /api/auth/login -> 401');
const passwordOk = named('POST /api/auth/change-password -> 201');
const passwordWrong = named('POST /api/auth/change-password -> 400');
const passwordUnauthorized = named('POST /api/auth/change-password -> 401');

const field = (s: Scenario, key: string) => String(Reflect.get(Object(s.request.body), key));
const organization = String(
  Reflect.get(
    Object(Reflect.get(Object(settingsGet.response.body), 'data')),
    'name_of_organization'
  )
);
const token = String(Reflect.get(Object(loginOk.response.body), 'data'));

async function replayApi(page: Page, queue: Scenario[]): Promise<ApiCall[]> {
  const calls: ApiCall[] = [];
  const pending = [...queue];
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const body = request.postData() ? request.postDataJSON() : undefined;
    calls.push({
      method: request.method(),
      path,
      body,
      authorization: request.headers()['authorization'],
    });
    const index = pending.findIndex(
      (s) =>
        s.request.method === request.method() &&
        s.request.url.split('?')[0] === path &&
        JSON.stringify(s.request.body === '' ? undefined : s.request.body) === JSON.stringify(body)
    );
    const next = index >= 0 ? pending.splice(index, 1)[0] : undefined;
    if (!next) {
      await route.fulfill({ status: 599, json: { error: 'unexpected request', path, body } });
      return;
    }
    await route.fulfill({ status: next.response.status, json: next.response.body });
  });
  return calls;
}

const settingsAlways = (n = 6) => Array.from({ length: n }, () => settingsGet);

async function signedIn(page: Page): Promise<void> {
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('signed-out')) localStorage.setItem('user_token', value);
  }, token);
}

const press = async (locator: Locator, touch: boolean) => (touch ? locator.tap() : locator.click());
const submitButton = (page: Page) => page.getByRole('button', { name: /^Sign in$|^Signing in/ });

async function fillSignIn(page: Page, s: Scenario) {
  await page.getByLabel('Username').fill(field(s, 'username'));
  await page.getByLabel('Password').fill(field(s, 'password'));
}

test.describe('sign in', () => {
  test('shows the organization from settings, caches them and passes axe', async ({
    page,
  }, info) => {
    const calls = await replayApi(page, settingsAlways());
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
    await expect(page.getByText(organization)).toBeVisible();
    await expect(page).toHaveTitle('Sign in – eHMRS');
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      'GET /api/settings/system-settings/get',
    ]);
    expect(calls[0]?.authorization).toBeUndefined();
    expect(await page.evaluate(() => localStorage.getItem('settings'))).not.toBeNull();
    if (!isTouch(info)) await expect(page.getByLabel('Username')).toBeFocused();
    await expectNoSeriousA11yIssues(page, 'sign-in');
  });

  test('refuses short values in place, keeps credentials out of the URL and sends nothing', async ({
    page,
  }, info) => {
    const calls = await replayApi(page, settingsAlways());
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('ab');
    await page.getByLabel('Password').fill('12345');
    await press(submitButton(page), isTouch(info));
    await expect(page.getByText('The username field must be at least 3 characters')).toBeVisible();
    await expect(page.getByText('The password field must be at least 6 characters')).toBeVisible();
    await page.getByLabel('Password').press('Enter');
    await expect(page).toHaveURL(/\/auth\/login$/);
    expect(calls.filter((c) => c.path === '/api/auth/login')).toEqual([]);
    await expectNoSeriousA11yIssues(page, 'sign-in errors');
  });

  test('sends one exact request and shows the legacy toast when the password is wrong', async ({
    page,
  }, info) => {
    const calls = await replayApi(page, [...settingsAlways(), loginWrong]);
    await page.goto('/auth/login');
    await fillSignIn(page, loginWrong);
    await press(submitButton(page), isTouch(info));
    await expect(page.getByText('Error message', { exact: true })).toBeVisible();
    await expect(page.getByText('Invalid username or password', { exact: true })).toBeVisible();
    await expect(submitButton(page)).toBeEnabled();
    await expect(page).toHaveURL(/\/auth\/login$/);
    const logins = calls.filter((c) => c.path === '/api/auth/login');
    expect(logins.map((c) => c.body)).toEqual([loginWrong.request.body]);
    expect(await page.evaluate(() => localStorage.getItem('user_token'))).toBeNull();
  });

  test('a click on Sign in right after fixing a field with an error still submits', async ({
    page,
  }, info) => {
    const calls = await replayApi(page, [...settingsAlways(), loginWrong]);
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill(field(loginWrong, 'username'));
    await page.getByLabel('Password').fill('123');
    await page.getByLabel('Username').focus();
    await expect(page.getByText('The password field must be at least 6 characters')).toBeVisible();
    await page.getByLabel('Password').fill(field(loginWrong, 'password'));
    await press(submitButton(page), isTouch(info));
    await expect(page.getByText('Invalid username or password', { exact: true })).toBeVisible();
    expect(calls.filter((c) => c.path === '/api/auth/login')).toHaveLength(1);
  });

  test('stores user_token and opens /dashboard on success', async ({ page }) => {
    const calls = await replayApi(page, [...settingsAlways(), loginOk]);
    await page.goto('/auth/login');
    await fillSignIn(page, loginOk);
    await page.getByLabel('Password').press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(await page.evaluate(() => localStorage.getItem('user_token'))).toBe(token);
    expect(calls.filter((c) => c.path === '/api/auth/login')).toHaveLength(1);
  });

  test('a deactivated account is signed out and told why after the reload, once', async ({
    page,
  }, info) => {
    await replayApi(page, [...settingsAlways(), loginDeactivated]);
    await page.goto('/auth/login');
    await fillSignIn(page, loginDeactivated);
    await press(submitButton(page), isTouch(info));
    await expect(page.getByRole('alert')).toHaveText(
      'This account has been deactivated, please contact support'
    );
    await expect(page).toHaveURL(/\/auth\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('user_token'))).toBeNull();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expectNoSeriousA11yIssues(page, 'sign-in after deactivated');
  });

  test('/auth/register opens sign in', async ({ page }) => {
    await replayApi(page, settingsAlways());
    await page.goto('/auth/register');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
  });

  test('/ goes to sign in without a token and to /dashboard with one', async ({ page }) => {
    await replayApi(page, settingsAlways());
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await page.evaluate((value) => localStorage.setItem('user_token', value), token);
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe('session', () => {
  test('sign out removes user_token and returns to sign in', async ({ page }, info) => {
    await replayApi(page, settingsAlways());
    await signedIn(page);
    await page.goto('/dashboard');
    const menuButton = page.getByRole('button', { name: 'Open menu' });
    if (await menuButton.isVisible()) await press(menuButton, isTouch(info));
    await press(page.getByRole('button', { name: 'Account' }).first(), isTouch(info));
    await page.evaluate(() => sessionStorage.setItem('signed-out', '1'));
    await press(page.getByRole('menuitem', { name: 'Sign out' }), isTouch(info));
    await expect(page).toHaveURL(/\/auth\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('user_token'))).toBeNull();
  });

  test('a 401 mid-session signs out and returns to sign in', async ({ page }, info) => {
    await replayApi(page, [...settingsAlways(), passwordUnauthorized]);
    await signedIn(page);
    await page.goto('/settings/change-password');
    await page.evaluate(() => sessionStorage.setItem('signed-out', '1'));
    await page.getByLabel('Current password').fill(field(passwordUnauthorized, 'oldPassword'));
    await page.getByLabel('New password').fill(field(passwordUnauthorized, 'newPassword'));
    await page.getByLabel('Verify password').fill(field(passwordUnauthorized, 'confirmPassword'));
    await press(page.getByRole('button', { name: 'Change password' }), isTouch(info));
    await expect(page).toHaveURL(/\/auth\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('user_token'))).toBeNull();
  });

  test('signing out in one tab stops the other tab sending the old token', async ({
    context,
  }, info) => {
    const first = await context.newPage();
    const second = await context.newPage();
    await replayApi(first, settingsAlways());
    const secondCalls = await replayApi(second, [...settingsAlways(), passwordUnauthorized]);
    await first.addInitScript((value) => {
      if (!sessionStorage.getItem('signed-out')) localStorage.setItem('user_token', value);
    }, token);
    await first.goto('/dashboard');
    await second.goto('/settings/change-password');
    await expect(second.getByRole('heading', { level: 1, name: 'Change password' })).toBeVisible();
    await first.evaluate(() => {
      sessionStorage.setItem('signed-out', '1');
      localStorage.removeItem('user_token');
    });
    await second.getByLabel('Current password').fill(field(passwordUnauthorized, 'oldPassword'));
    await second.getByLabel('New password').fill(field(passwordUnauthorized, 'newPassword'));
    await second.getByLabel('Verify password').fill(field(passwordUnauthorized, 'confirmPassword'));
    await press(second.getByRole('button', { name: 'Change password' }), isTouch(info));
    await expect(second).toHaveURL(/\/auth\/login$/);
    const change = secondCalls.find((c) => c.path === '/api/auth/change-password');
    expect(change?.authorization).toBeUndefined();
  });
});

test.describe('change password', () => {
  test('sends the legacy payload with the Bearer token, clears the fields and shows the success toast', async ({
    page,
  }, info) => {
    const calls = await replayApi(page, [...settingsAlways(), passwordWrong, passwordOk]);
    await signedIn(page);
    await page.goto('/settings/change-password');
    await expectNoSeriousA11yIssues(page, 'change password');

    await press(page.getByRole('button', { name: 'Change password' }), isTouch(info));
    await expect(page.getByText('The current_password field is required')).toBeVisible();

    const fillFrom = async (s: Scenario) => {
      await page.getByLabel('Current password').fill(field(s, 'oldPassword'));
      await page.getByLabel('New password').fill(field(s, 'newPassword'));
      await page.getByLabel('Verify password').fill(field(s, 'confirmPassword'));
    };

    await fillFrom(passwordWrong);
    await press(page.getByRole('button', { name: 'Change password' }), isTouch(info));
    await expect(page.getByText('Old password not correct', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Current password')).toHaveValue(
      field(passwordWrong, 'oldPassword')
    );

    await fillFrom(passwordOk);
    await press(page.getByRole('button', { name: 'Change password' }), isTouch(info));
    await expect(page.getByText('Password changed!', { exact: true })).toBeVisible();
    for (const label of ['Current password', 'New password', 'Verify password']) {
      await expect(page.getByLabel(label)).toHaveValue('');
    }
    await expect(page.getByText(/field is required/)).toHaveCount(0);

    const changes = calls.filter((c) => c.path === '/api/auth/change-password');
    expect(changes.map((c) => c.body)).toEqual([
      passwordWrong.request.body,
      passwordOk.request.body,
    ]);
    expect(changes.map((c) => c.authorization)).toEqual([`Bearer ${token}`, `Bearer ${token}`]);
  });

  test('refuses a mismatched confirmation with the legacy message and sends nothing', async ({
    page,
  }, info) => {
    const calls = await replayApi(page, settingsAlways());
    await signedIn(page);
    await page.goto('/settings/change-password');
    await page.getByLabel('Current password').fill('OldPass1');
    await page.getByLabel('Verify password').fill('NewPass2');
    await page.getByLabel('New password').fill('NewPass1');
    await press(page.getByRole('button', { name: 'Change password' }), isTouch(info));
    await expect(page.getByText('The new_password confirmation does not match')).toBeVisible();
    expect(calls.filter((c) => c.path === '/api/auth/change-password')).toEqual([]);
  });
});
