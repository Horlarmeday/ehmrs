import type { App } from 'vue';
import { scrubBreadcrumb, scrubEvent } from './sentryScrub';

export const SENTRY_APP_TAG = 'v3';

export async function setupSentry(app: App, env: ImportMetaEnv = import.meta.env): Promise<boolean> {
  const dsn = env.VITE_SENTRY_DSN;
  if (!dsn) return false;
  const Sentry = await import('@sentry/vue');
  Sentry.init({
    app,
    dsn,
    environment: env.VITE_SENTRY_ENVIRONMENT || env.MODE,
    release: env.VITE_SENTRY_RELEASE || undefined,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    attachProps: false,
    tracesSampleRate: 0,
    integrations: (defaults) => [
      ...defaults.filter((integration) => !['Breadcrumbs', 'Console'].includes(integration.name)),
      Sentry.breadcrumbsIntegration({ dom: false, sentry: false }),
    ],
    initialScope: { tags: { app: SENTRY_APP_TAG } },
    beforeSend: (event) => scrubEvent(event),
    beforeBreadcrumb: (breadcrumb) => scrubBreadcrumb(breadcrumb),
  });
  return true;
}
