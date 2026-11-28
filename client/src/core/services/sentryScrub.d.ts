import type { Breadcrumb, ErrorEvent } from '@sentry/vue';

export declare function scrubText(text: string): string;
export declare function scrubUrl(url: string): string;
export declare function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null;
export declare function scrubEvent(event: ErrorEvent): ErrorEvent;
