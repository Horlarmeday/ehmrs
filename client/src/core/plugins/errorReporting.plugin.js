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

    // Global error capture mixin - temporarily disabled for debugging
    Vue.mixin({
      errorCaptured(err, instance, info) {
        // Temporarily disabled to debug redirect issue
        console.log('Error captured but not processed:', err.message, instance, info);

        // Return true to allow error to propagate (default behavior)
        return true;
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


