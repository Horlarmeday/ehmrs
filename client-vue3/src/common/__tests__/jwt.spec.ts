import { describe, expect, it } from 'vitest';
import { parseJwt } from '../jwt';

const encode = (claims: object) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(claims))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const token = (claims: object) => `header.${encode(claims)}.signature`;

describe('parseJwt', () => {
  it('reads the role claims from a token', () => {
    expect(parseJwt(token({ role: 'Nurse', sub_role: 'G-OPD' }))).toMatchObject({
      role: 'Nurse',
      sub_role: 'G-OPD',
    });
  });

  it('reads base64url payloads and non-ASCII names', () => {
    expect(parseJwt(token({ firstname: 'Ọlá', note: '??>>' }))?.firstname).toBe('Ọlá');
  });

  it('returns null for missing or malformed tokens instead of throwing', () => {
    expect(parseJwt(null)).toBeNull();
    expect(parseJwt('')).toBeNull();
    expect(parseJwt('no-dots')).toBeNull();
    expect(parseJwt('a.%%%.c')).toBeNull();
    expect(parseJwt(`a.${btoa('[1,2]')}.c`)).toBeNull();
  });
});
