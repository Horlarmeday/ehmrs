/**
 * Error Reporting Plugin for Vue.js
 * Provides global error reporting functionality
 */
import errorReportingService from '../services/errorReporting.service';

export default {
  install(Vue) {
    // Add error reporting service to Vue prototype
    Vue.prototype.$errorReporting = errorReportingService;

    // Global error reporting methods disabled to prevent Vue method conflicts
    // Vue.prototype.$reportError = errorReportingService.reportError.bind(errorReportingService);
    // Vue.prototype.$reportApiError = errorReportingService.reportApiError.bind(
    //   errorReportingService
    // );
    // Vue.prototype.$reportUserError = errorReportingService.reportUserError.bind(
    //   errorReportingService
    // );
    // Vue.prototype.$reportComponentError = errorReportingService.reportComponentError.bind(
    //   errorReportingService
    // );
    // Vue.prototype.$reportValidationError = errorReportingService.reportValidationError.bind(
    //   errorReportingService
    // );

    // Error reporting mixin methods disabled to prevent Vue method conflicts
    Vue.mixin({

      // Report component errors
      errorCaptured(error, instance, info) {
        this.$errorReporting.reportComponentError(error, {
          component: instance.$options.name || 'Unknown',
          route: this.$route?.path,
          info,
          lifecycle: 'errorCaptured',
        });
        return false; // Don't prevent error from propagating
      },
    });

    // Note: Global error and warning handlers are managed by logging plugin
    // to avoid conflicts and ensure centralized error handling

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      errorReportingService.reportError(event.reason, {
        type: 'unhandled_promise_rejection',
        severity: 'high',
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', event => {
      errorReportingService.reportError(event.error, {
        type: 'uncaught_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: 'high',
      });
    });

    // Send queued errors periodically
    setInterval(() => {
      errorReportingService.sendQueuedErrors();
    }, 30000); // Every 30 seconds

    // Send queued errors before page unload
    window.addEventListener('beforeunload', () => {
      errorReportingService.sendQueuedErrors();
    });
  },
};

