const KEY = 'ehmrs.sign-in-notice';

function messageOf(rejection: unknown): string | undefined {
  if (typeof rejection !== 'object' || rejection === null) return undefined;
  const code = Reflect.get(rejection, 'httpCode');
  const message = Reflect.get(rejection, 'message');
  return code === 401 && typeof message === 'string' && message ? message : undefined;
}

export function keepSignInNotice(rejection: unknown): void {
  const message = messageOf(rejection);
  if (!message) return;
  try {
    sessionStorage.setItem(KEY, message);
  } catch {
    return;
  }
}

export function takeSignInNotice(): string {
  try {
    const message = sessionStorage.getItem(KEY) ?? '';
    sessionStorage.removeItem(KEY);
    return message;
  } catch {
    return '';
  }
}
