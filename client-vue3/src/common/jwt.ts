export interface TokenClaims {
  role?: string;
  sub_role?: string;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  [claim: string]: unknown;
}

function decodeSegment(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function parseJwt(token: string | null | undefined): TokenClaims | null {
  if (!token) return null;
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const claims: unknown = JSON.parse(decodeSegment(payload));
    return claims && typeof claims === 'object' && !Array.isArray(claims)
      ? Object.fromEntries(Object.entries(claims))
      : null;
  } catch {
    return null;
  }
}
