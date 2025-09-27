/**
 * Logging Plugin for Vue.js
 * Makes the logging service available in all Vue components
 * Integrates with error reporting for comprehensive error handling
 */
import loggingService from '../services/logging.service';
import errorReportingService from '../services/errorReporting.service';

export default {
  install(Vue) {
    // Add logging service to Vue prototype
    Vue.prototype.$log = loggingService;

    // Add logging service to Vue instance
    Vue.prototype.$logging = loggingService;

    // Global logging methods disabled to prevent Vue method conflicts
    // Vue.prototype.$logError = loggingService.error.bind(loggingService);
    // Vue.prototype.$logWarn = loggingService.warn.bind(loggingService);
    // Vue.prototype.$logInfo = loggingService.info.bind(loggingService);
    // Vue.prototype.$logDebug = loggingService.debug.bind(loggingService);
    // Vue.prototype.$logTrace = loggingService.trace.bind(loggingService);

    // Logging mixin methods disabled to prevent Vue method conflicts
    Vue.mixin({
      // Log component lifecycle
      created() {
        if (this.$log.isDebugEnabled()) {
          this.$log.logComponentLifecycle(this.$options.name || 'Unknown', 'created', {
            route: this.$route?.path,
          });
        }
      },

      mounted() {
        if (this.$log.isDebugEnabled()) {
          this.$log.logComponentLifecycle(this.$options.name || 'Unknown', 'mounted', {
            route: this.$route?.path,
          });
        }
      },

      beforeDestroy() {
        if (this.$log.isDebugEnabled()) {
          this.$log.logComponentLifecycle(this.$options.name || 'Unknown', 'beforeDestroy', {
            route: this.$route?.path,
          });
        }
      },
    });

    // Add global error handler with integrated error reporting
    Vue.config.errorHandler = (err, vm, info) => {
      // Log the error
      loggingService.error('Vue Error', {
        error: err.message,
        stack: err.stack,
        component: vm?.$options?.name || 'Unknown',
        info: info,
        route: vm?.$route?.path,
      });

      // Also report to error reporting service
      errorReportingService.reportComponentError(err, {
        component: vm?.$options?.name || 'Unknown',
        route: vm?.$route?.path,
        info,
        lifecycle: 'errorHandler',
      });
    };

    // Add global warning handler with integrated error reporting
    Vue.config.warnHandler = (msg, vm, trace) => {
      // Log the warning
      loggingService.warn('Vue Warning', {
        message: msg,
        component: vm?.$options?.name || 'Unknown',
        trace: trace,
        route: vm?.$route?.path,
      });

      // Also report to error reporting service for severe warnings
      if (
        msg.includes('Unknown custom element') ||
        msg.includes('Property') ||
        msg.includes('Method')
      ) {
        errorReportingService.reportError(new Error(msg), {
          type: 'vue_warning',
          component: vm?.$options?.name || 'Unknown',
          route: vm?.$route?.path,
          trace,
          severity: 'low',
        });
      }
    };
  },
};
