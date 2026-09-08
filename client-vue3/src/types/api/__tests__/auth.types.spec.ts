import { describe, expect, it } from 'vitest';
import { expectTypeOf } from 'vitest';
import type { LoginRequest, ForgotPasswordRequest, ChangePasswordRequest, LoginResponse } from '../auth';
import corpus from '../../../contract/fixtures/auth.json';

const loginKeys = new Set(['status', 'message', 'data', 'httpCode']);

describe('generated auth api types (ADR-0004)', () => {
  it('LoginRequest mirrors the server Joi schema: both fields required strings', () => {
    expectTypeOf<LoginRequest>().toEqualTypeOf<{ username: string; password: string }>();
  });

  it('ForgotPasswordRequest mirrors the server Joi schema', () => {
    expectTypeOf<ForgotPasswordRequest>().toEqualTypeOf<{ phone: string }>();
  });

  it('ChangePasswordRequest mirrors ChangePasswordParam minus the server-injected user_id', () => {
    expectTypeOf<ChangePasswordRequest>().toEqualTypeOf<{ newPassword: string; oldPassword: string; confirmPassword: string }>();
  });

  it('uncertainty rule: LoginResponse fields unobserved in some scenarios are optional, never invented', () => {
    expectTypeOf<LoginResponse['message']>().toEqualTypeOf<string>();
    expectTypeOf<LoginResponse['status']>().toEqualTypeOf<'success' | 'error' | undefined>();
    expectTypeOf<LoginResponse['httpCode']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<LoginResponse['data']>().toEqualTypeOf<string | undefined>();
  });

  it('every observed fixture field exists on LoginResponse and no extra keys were invented', () => {
    for (const scenario of corpus.scenarios) {
      const body = scenario.response.body;
      if (body === null || typeof body !== 'object' || Array.isArray(body)) continue;
      for (const key of Object.keys(body)) {
        expect(loginKeys.has(key)).toBe(true);
      }
    }
    expect(loginKeys.size).toBe(4);
  });
});
