/**
 * Error Reporting Service
 * Provides comprehensive error reporting and tracking functionality
 */
import loggingService from './logging.service';

class ErrorReportingService {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.reportingEnabled = process.env.NODE_ENV === 'production';
    this.reportingEndpoint = process.env.VUE_APP_ERROR_REPORTING_ENDPOINT || '/api/errors';
    this.userContext = null;
    this.sessionId = this.generateSessionId();
    
    // Error filtering and rate limiting
    this.errorFilters = new Set([
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Script error.',
      'Network request failed',
      'Loading chunk',
      'ChunkLoadError',
      'TypeError: Failed to fetch',
      'AbortError: The operation was aborted',
      'SecurityError: Blocked a frame',
      'InvalidStateError: An attempt was made',
      'NotAllowedError: The request is not allowed',
    ]);
    this.errorCounts = new Map();
    this.rateLimits = new Map();
    this.maxErrorsPerMinute = 5;
    this.filteringEnabled = true;
    
    // Bind methods to preserve context
    this.reportError = this.reportError.bind(this);
    this.reportApiError = this.reportApiError.bind(this);
    this.reportUserError = this.reportUserError.bind(this);
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Set user context for error reporting
   */
  setUserContext(user) {
    this.userContext = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }

  /**
   * Clear user context
   */
  clearUserContext() {
    this.userContext = null;
  }

  /**
   * Check if error should be filtered
   */
  shouldFilterError(error, context = {}) {
    const errorMessage = error.message || error.toString();
    
    // Check against predefined filters
    for (const filter of this.errorFilters) {
      if (errorMessage.includes(filter)) {
        return true;
      }
    }
    
    // Filter low-severity validation errors
    if (context.type === 'validation_error' && context.severity === 'low') {
      return true;
    }
    
    // Filter network errors in development
    if (process.env.NODE_ENV === 'development' && 
        (errorMessage.includes('fetch') || errorMessage.includes('network'))) {
      return true;
    }
    
    // Filter duplicate component errors
    if (context.type === 'component_error' && this.isDuplicateError(error)) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if error is rate limited
   */
  isRateLimited(error) {
    const errorKey = this.getErrorKey(error);
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    // Initialize rate limit tracking for this error
    if (!this.rateLimits.has(errorKey)) {
      this.rateLimits.set(errorKey, { minute, count: 0 });
    }
    
    const rateLimit = this.rateLimits.get(errorKey);
    
    // Reset count if we're in a new minute
    if (rateLimit.minute !== minute) {
      rateLimit.minute = minute;
      rateLimit.count = 0;
    }
    
    // Check if we've exceeded the rate limit
    if (rateLimit.count >= this.maxErrorsPerMinute) {
      return true;
    }
    
    // Increment count
    rateLimit.count++;
    return false;
  }

  /**
   * Check if error is a duplicate
   */
  isDuplicateError(error) {
    const errorKey = this.getErrorKey(error);
    const now = Date.now();
    
    if (this.errorCounts.has(errorKey)) {
      const lastSeen = this.errorCounts.get(errorKey);
      // Consider it duplicate if seen within last 5 seconds
      if (now - lastSeen < 5000) {
        return true;
      }
    }
    
    this.errorCounts.set(errorKey, now);
    return false;
  }

  /**
   * Generate error key for tracking
   */
  getErrorKey(error) {
    const message = error.message || error.toString();
    const stack = error.stack || '';
    // Use first line of stack trace for more specific grouping
    const stackLine = stack.split('\n')[1] || '';
    return `${message}:${stackLine}`.substring(0, 100);
  }

  /**
   * Add custom error filter
   */
  addErrorFilter(filter) {
    this.errorFilters.add(filter);
  }

  /**
   * Remove error filter
   */
  removeErrorFilter(filter) {
    this.errorFilters.delete(filter);
  }

  /**
   * Configure filtering settings
   */
  configureFiltering(options = {}) {
    if (options.enabled !== undefined) {
      this.filteringEnabled = options.enabled;
    }
    if (options.maxErrorsPerMinute !== undefined) {
      this.maxErrorsPerMinute = options.maxErrorsPerMinute;
    }
    if (options.filters) {
      this.errorFilters = new Set(options.filters);
    }
  }

  /**
   * Get filtering statistics
   */
  getFilteringStats() {
    return {
      filtersCount: this.errorFilters.size,
      rateLimitedErrors: this.rateLimits.size,
      duplicateErrors: this.errorCounts.size,
      filteringEnabled: this.filteringEnabled,
      maxErrorsPerMinute: this.maxErrorsPerMinute,
    };
  }

  /**
   * Report a general error
   */
  reportError(error, context = {}) {
    // Apply error filtering
    if (this.filteringEnabled && this.shouldFilterError(error, context)) {
      loggingService.debug('Error filtered', { error: error.message, context });
      return;
    }
    
    // Apply rate limiting
    if (this.isRateLimited(error)) {
      loggingService.debug('Error rate limited', { error: error.message });
      return;
    }
    
    const errorReport = this.createErrorReport(error, context);
    this.queueError(errorReport);
    this.logError(error, context);
  }

  /**
   * Report an API error
   */
  reportApiError(error, apiContext = {}) {
    const context = {
      type: 'api_error',
      ...apiContext,
    };
    this.reportError(error, context);
  }

  /**
   * Report a user action error
   */
  reportUserError(error, userAction = {}) {
    const context = {
      type: 'user_error',
      ...userAction,
    };
    this.reportError(error, context);
  }

  /**
   * Report a component error
   */
  reportComponentError(error, componentContext = {}) {
    const context = {
      type: 'component_error',
      ...componentContext,
    };
    this.reportError(error, context);
  }

  /**
   * Report a validation error
   */
  reportValidationError(error, validationContext = {}) {
    const context = {
      type: 'validation_error',
      ...validationContext,
    };
    this.reportError(error, context);
  }

  /**
   * Create standardized error report
   */
  createErrorReport(error, context = {}) {
    const report = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      user: this.userContext,
      error: {
        name: error.name || 'Unknown Error',
        message: error.message || 'An unknown error occurred',
        stack: error.stack || null,
        code: error.code || null,
      },
      context: {
        ...context,
        timestamp: Date.now(),
        memoryUsage: this.getMemoryUsage(),
        performance: this.getPerformanceMetrics(),
      },
      severity: this.determineSeverity(error, context),
    };

    return report;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Determine error severity
   */
  determineSeverity(error, context) {
    // Critical errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'critical';
    }
    
    // API errors
    if (context.type === 'api_error') {
      if (error.response?.status >= 500) return 'high';
      if (error.response?.status >= 400) return 'medium';
      return 'low';
    }
    
    // Component errors
    if (context.type === 'component_error') {
      return 'medium';
    }
    
    // Validation errors
    if (context.type === 'validation_error') {
      return 'low';
    }
    
    // Default to medium
    return 'medium';
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      return {
        loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        firstPaint: this.getFirstPaint(),
      };
    }
    return null;
  }

  /**
   * Get first paint time
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }

  /**
   * Queue error for reporting
   */
  queueError(errorReport) {
    this.errorQueue.push(errorReport);
    
    // Remove old errors if queue is too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Report immediately for critical errors
    if (errorReport.severity === 'critical') {
      this.sendErrorReport(errorReport);
    }
  }

  /**
   * Send error report to server
   */
  async sendErrorReport(errorReport) {
    if (!this.reportingEnabled) {
      loggingService.debug('Error reporting disabled', { errorReport });
      return;
    }

    try {
      const response = await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }

      loggingService.debug('Error report sent successfully', { errorId: errorReport.id });
    } catch (error) {
      loggingService.error('Failed to send error report', { error: error.message });
    }
  }

  /**
   * Send all queued errors
   */
  async sendQueuedErrors() {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorReport of errorsToSend) {
      await this.sendErrorReport(errorReport);
    }
  }

  /**
   * Log error locally
   */
  logError(error, context) {
    const logContext = {
      errorId: this.generateErrorId(),
      ...context,
    };

    loggingService.error(error.message, logContext);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {},
      byType: {},
      recent: this.errorQueue.slice(-10),
    };

    this.errorQueue.forEach(error => {
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Count by type
      const type = error.context.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error queue
   */
  clearErrorQueue() {
    this.errorQueue = [];
  }

  /**
   * Enable/disable error reporting
   */
  setReportingEnabled(enabled) {
    this.reportingEnabled = enabled;
  }

  /**
   * Set reporting endpoint
   */
  setReportingEndpoint(endpoint) {
    this.reportingEndpoint = endpoint;
  }

  /**
   * Get current error queue
   */
  getErrorQueue() {
    return [...this.errorQueue];
  }
}

// Create singleton instance
const errorReportingService = new ErrorReportingService();

// Export both the class and the instance
export { ErrorReportingService };
export default errorReportingService;



