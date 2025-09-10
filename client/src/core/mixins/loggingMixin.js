/**
 * Logging Mixin
 * Provides advanced logging functionality for Vue components
 */
import loggingService from '../services/logging.service';

export default {
  data() {
    return {
      // Performance tracking
      performanceTimers: {},
    };
  },
  
  methods: {
    // Start performance timer
    startTimer(operation) {
      this.performanceTimers[operation] = Date.now();
    },
    
    // End performance timer and log
    endTimer(operation, context = {}) {
      if (this.performanceTimers[operation]) {
        const duration = Date.now() - this.performanceTimers[operation];
        this.$logPerformance(operation, duration, context);
        delete this.performanceTimers[operation];
        return duration;
      }
      return 0;
    },
    
    // Log API call with performance tracking
    async logApiCall(operation, apiCall, context = {}) {
      this.startTimer(operation);
      try {
        const result = await apiCall();
        this.endTimer(operation, { ...context, success: true });
        return result;
      } catch (error) {
        this.endTimer(operation, { ...context, success: false, error: error.message });
        throw error;
      }
    },
    
    // Log user interaction
    logUserInteraction(action, element = null, context = {}) {
      this.$logUserAction(action, {
        element: element,
        ...context
      });
    },
    
    // Log form submission
    logFormSubmission(formName, success = true, context = {}) {
      this.$logUserAction(`Form ${success ? 'submitted' : 'failed'}: ${formName}`, {
        success,
        ...context
      });
    },
    
    // Log data loading
    logDataLoading(operation, success = true, context = {}) {
      this.$logInfo(`Data ${success ? 'loaded' : 'failed to load'}: ${operation}`, {
        success,
        ...context
      });
    },
    
    // Log navigation
    logNavigation(from, to, context = {}) {
      this.$logUserAction('Navigation', {
        from,
        to,
        ...context
      });
    },
    
    // Log filter changes
    logFilterChange(filterName, value, context = {}) {
      this.$logUserAction('Filter changed', {
        filter: filterName,
        value,
        ...context
      });
    },
    
    // Log pagination changes
    logPaginationChange(page, limit, context = {}) {
      this.$logUserAction('Pagination changed', {
        page,
        limit,
        ...context
      });
    },
    
    // Log search
    logSearch(query, resultsCount, context = {}) {
      this.$logUserAction('Search performed', {
        query,
        resultsCount,
        ...context
      });
    },
    
    // Log CRUD operations
    logCreate(entity, data, success = true, context = {}) {
      this.$logUserAction(`Create ${entity}`, {
        success,
        data: success ? data : null,
        ...context
      });
    },
    
    logUpdate(entity, id, data, success = true, context = {}) {
      this.$logUserAction(`Update ${entity}`, {
        id,
        success,
        data: success ? data : null,
        ...context
      });
    },
    
    logDelete(entity, id, success = true, context = {}) {
      this.$logUserAction(`Delete ${entity}`, {
        id,
        success,
        ...context
      });
    },
    
    // Log errors with context
    logError(message, error, context = {}) {
      this.$logError(message, {
        error: error.message,
        stack: error.stack,
        ...context
      });
    },
    
    // Log warnings with context
    logWarning(message, context = {}) {
      this.$logWarn(message, context);
    },
    
    // Log info with context
    logInfo(message, context = {}) {
      this.$logInfo(message, context);
    },
    
    // Log debug with context
    logDebug(message, context = {}) {
      this.$logDebug(message, context);
    },
    
    // Set debug mode
    setDebugMode(enabled) {
      loggingService.setDebugMode(enabled);
    },
    
    // Set log level
    setLogLevel(level) {
      loggingService.setLogLevel(level);
    },
    
    // Check if debug is enabled
    isDebugEnabled() {
      return loggingService.isDebugEnabled();
    },
    
    // Clear logs
    clearLogs() {
      loggingService.clearLogs();
    },
  },
  
  // Cleanup performance timers on destroy
  beforeDestroy() {
    Object.keys(this.performanceTimers).forEach(operation => {
      this.endTimer(operation, { cleanup: true });
    });
  },
};


