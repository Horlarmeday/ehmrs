import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { InternalAxiosRequestConfig } from 'axios';
import axios from '../../core/axios';
import { expectHardRedirects, resetSideEffects } from '../../contract/effects';
import { useAuthStore } from '../auth';
import { useSettingsStore } from '../settings';
import { useAlertStore } from '../alert';

beforeEach(() => {
  setActivePinia(createPinia());
  resetSideEffects();
});

afterEach(() => {
  vi.unstubAllGlobals();
  axios.defaults.adapter = undefined;
});

describe('auth store (legacy moduleAuthMutations and logout)', () => {
  it('reads the shared user_token when created', () => {
    localStorage.setItem('user_token', 'header.payload.signature');
    setActivePinia(createPinia());
    expect(useAuthStore().token).toBe('header.payload.signature');
  });

  it('keeps the four legacy mutations as same-named actions', () => {
    const auth = useAuthStore();
    auth.auth_request();
    expect(auth.status).toBe('loading');
    auth.auth_success('t');
    expect([auth.status, auth.token]).toEqual(['success', 't']);
    auth.auth_error();
    expect(auth.status).toBe('error');
    auth.logout();
    expect([auth.status, auth.token]).toEqual(['', '']);
  });

  it('logoutSession clears state, removes user_token and the default header, then replaces to /', async () => {
    localStorage.setItem('user_token', 'header.payload.signature');
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.status = 'success';
    axios.defaults.headers.common['authorization'] = 'Bearer header.payload.signature';
    await auth.logoutSession();
    expect([auth.status, auth.token]).toEqual(['', '']);
    expect(localStorage.getItem('user_token')).toBeNull();
    expect(axios.defaults.headers.common['authorization']).toBeUndefined();
    expect(expectHardRedirects(['/'])).toEqual([]);
  });

  it('has no register action (dead legacy code calling a missing endpoint, owner decision)', () => {
    expect('register' in useAuthStore()).toBe(false);
  });
});

describe('settings store', () => {
  it('posts a FormData payload unchanged and stores the returned settings', async () => {
    const sent: InternalAxiosRequestConfig[] = [];
    const returned = { id: 1, name_of_organization: 'Hospital', organization_logo: 'logo-1.png' };
    axios.defaults.adapter = async (config) => {
      sent.push(config);
      return {
        data: { status: 'success', message: 'Successful! Data updated', data: returned },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };
    const form = new FormData();
    form.append('name_of_organization', 'Hospital');
    form.append('logo', new Blob(['x'], { type: 'image/png' }), 'logo.png');

    const settings = useSettingsStore();
    await settings.updateSettings(form);

    expect(sent).toHaveLength(1);
    expect(sent[0]?.method).toBe('post');
    expect(sent[0]?.url).toBe('/settings/system-settings/update');
    expect(sent[0]?.data).toBe(form);
    expect(settings.settings).toEqual(returned);
  });

  it('keeps SET_SETTINGS and CHANGE_PASSWORD as same-named actions', () => {
    const settings = useSettingsStore();
    settings.CHANGE_PASSWORD();
    expect(settings.settings).toBeNull();
    const saved = {
      address_of_organization: 'Street',
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'hospital@example.invalid',
      id: 1,
      name_of_organization: 'Hospital',
      nhis_daily_quota_amount: '0',
      organization_logo: null,
      patient_id_prefix: 'H',
      phone: '00000000000',
      stamp_image: null,
      system_color: 'teal',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    settings.SET_SETTINGS(saved);
    expect(settings.settings).toEqual(saved);
  });
});

describe('alert store', () => {
  it('starts with the legacy state and keeps the four mutations as actions', () => {
    const alerts = useAlertStore();
    expect(alerts.$state).toEqual({ alert: null, alerts: [], total: null, pages: 0 });
    alerts.SET_ALERTS_TOTAL(3);
    alerts.SET_ALERTS_PAGES(1);
    alerts.ADD_ALERT([1]);
    expect([alerts.total, alerts.pages, alerts.alert]).toEqual([3, 1, [1]]);
  });

  it('sends only visit_id when a caller passes only an id, as AlertsTable does', async () => {
    const urls: string[] = [];
    axios.defaults.adapter = async (config) => {
      urls.push(axios.getUri(config));
      return {
        data: { status: 'success', message: 'success', data: { docs: [], total: 0, pages: 0 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };
    await useAlertStore().fetchAlerts({ id: 27 });
    expect(urls).toEqual(['/api/alerts/get?visit_id=27']);
  });
});
