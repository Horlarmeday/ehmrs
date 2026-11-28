import { describe, expect, test } from 'vitest';
import type { Breadcrumb, ErrorEvent } from '@sentry/vue';
import * as v3 from '../sentryScrub';
import * as legacy from '../../../../client/src/core/services/sentryScrub.js';

const NAME = 'Zorvik Quellan';
const PHONE = '08031234567';
const NIN = '12345678901';
const EMAIL = 'zorvik.quellan@example.com';
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl';
const HASH = `$2b$10$${'a'.repeat(53)}`;

function eventWithPhi(): ErrorEvent {
  return {
    type: undefined,
    message: `Failed for ${PHONE} / ${EMAIL} / ${TOKEN}`,
    user: { id: '42', username: NAME, email: EMAIL, ip_address: '10.0.0.1' },
    extra: { patient: { name: NAME, nin: NIN } },
    request: {
      url: `https://ehmrs.example/patient/1203/visits?name=${encodeURIComponent(NAME)}#notes`,
      query_string: `name=${NAME}`,
      headers: { Authorization: `Bearer ${TOKEN}`, Referer: 'https://ehmrs.example/patient/1203' },
      cookies: { user_token: TOKEN },
      data: { firstname: NAME, phone: PHONE },
    },
    exception: { values: [{ type: 'Error', value: `NIN ${NIN} rejected, hash ${HASH}` }] },
    breadcrumbs: [
      { category: 'console', message: `patient ${NAME}`, timestamp: 1 },
      { category: 'ui.click', message: `input[name="${NAME}"]`, timestamp: 2 },
      { category: 'ui.input', message: NAME, timestamp: 3 },
      {
        type: 'http',
        category: 'xhr',
        timestamp: 4,
        data: {
          method: 'POST',
          url: `/api/patients/1203?phone=${PHONE}`,
          status_code: 400,
          request_body: { firstname: NAME },
          response_body: { message: NAME },
        },
      },
      { category: 'navigation', timestamp: 5, data: { from: '/patient/1203', to: `/patient/1204?q=${NAME}` } },
    ],
    contexts: {
      vue: { componentName: 'PatientCard', lifecycleHook: 'mounted', propsData: { patient: { name: NAME } } },
      state: { state: { type: 'pinia', value: { patient: { name: NAME } } } },
      browser: { name: 'Chrome' },
    },
  };
}

describe.each([
  ['v3', v3],
  ['legacy', legacy],
])('%s scrubber', (_app, scrubber) => {
  test('no patient value, token, hash or contact survives anywhere in the event', () => {
    const json = JSON.stringify(scrubber.scrubEvent(eventWithPhi()));
    for (const secret of [NAME, PHONE, NIN, EMAIL, TOKEN, HASH, '1203', '1204', 'Bearer', '10.0.0.1', 'Quellan']) {
      expect(json).not.toContain(secret);
    }
  });

  test('keeps what is needed to debug', () => {
    const out = scrubber.scrubEvent(eventWithPhi());
    expect(out.request).toEqual({ url: 'https://ehmrs.example/patient/:id/visits' });
    expect(out.exception?.values?.[0]?.type).toBe('Error');
    expect(out.contexts?.vue).toEqual({ componentName: 'PatientCard', lifecycleHook: 'mounted' });
    expect(out.contexts?.browser).toEqual({ name: 'Chrome' });
    expect(out.contexts?.state).toBeUndefined();
    expect(out.breadcrumbs?.map((b: Breadcrumb) => b.category)).toEqual(['xhr', 'navigation']);
    expect(out.breadcrumbs?.[0]?.data).toEqual({ method: 'POST', url: '/api/patients/:id', status_code: 400 });
    expect(out.breadcrumbs?.[1]?.data).toEqual({ from: '/patient/:id', to: '/patient/:id' });
  });

  test('urls lose query, hash and any segment with a digit or @', () => {
    expect(scrubber.scrubUrl('/api/laboratory/tests/77/results?x=1')).toBe('/api/laboratory/tests/:id/results');
    expect(scrubber.scrubUrl('/settings/change-password')).toBe('/settings/change-password');
    expect(scrubber.scrubUrl(`/staff/${EMAIL}`)).toBe('/staff/:id');
    expect(scrubber.scrubUrl('http://127.0.0.1:8090/x#y')).toBe('http://127.0.0.1:8090/x');
  });

  test('does not mutate the original event', () => {
    const original = eventWithPhi();
    const copy = JSON.stringify(original);
    scrubber.scrubEvent(original);
    expect(JSON.stringify(original)).toBe(copy);
  });

  test('drops non-network breadcrumbs entirely', () => {
    expect(scrubber.scrubBreadcrumb({ category: 'console', message: NAME })).toBeNull();
    expect(scrubber.scrubBreadcrumb({ message: NAME })).toBeNull();
  });
});
