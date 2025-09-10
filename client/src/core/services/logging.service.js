/**
 * Logging Service
 * Provides standardized logging functionality for the application
 */

class LoggingService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebugMode = localStorage.getItem('debug_mode') === 'true';
    this.logLevel = localStorage.getItem('log_level') || 'info';
    
    // Log levels
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
  }

  /**
   * Check if logging is enabled for the given level
   */
  shouldLog(level) {
    if (!this.isDevelopment && level !== 'error') {
      return false;
    }
    
    if (this.isDebugMode) {
      return true;
    }
    
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Send log to external service (if configured)
   */
  sendToExternalService(level, message, context) {
    // In production, you might want to send logs to an external service
    // like Sentry, LogRocket, or your own logging API
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // Example: Send error to external service
      // this.sendToSentry(message, context);
    }
  }

  /**
   * Log error message
   */
  error(message, context = {}) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, context);
      console.error(formattedMessage);
      this.sendToExternalService('error', message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message, context = {}) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, context);
      console.warn(formattedMessage);
    }
  }

  /**
   * Log info message
   */
  info(message, context = {}) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, context);
      console.info(formattedMessage);
    }
  }

  /**
   * Log debug message
   */
  debug(message, context = {}) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, context);
      console.debug(formattedMessage);
    }
  }

  /**
   * Log trace message
   */
  trace(message, context = {}) {
    if (this.shouldLog('trace')) {
      const formattedMessage = this.formatMessage('trace', message, context);
      console.trace(formattedMessage);
    }
  }

  /**
   * Log API request
   */
  logApiRequest(method, url, data = null) {
    this.debug(`API Request: ${method} ${url}`, { data });
  }

  /**
   * Log API response
   */
  logApiResponse(method, url, status, data = null) {
    const level = status >= 400 ? 'error' : 'debug';
    this[level](`API Response: ${method} ${url} - ${status}`, { data });
  }

  /**
   * Log API error
   */
  logApiError(method, url, error) {
    this.error(`API Error: ${method} ${url}`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }

  /**
   * Log user action
   */
  logUserAction(action, context = {}) {
    this.info(`User Action: ${action}`, context);
  }

  /**
   * Log component lifecycle
   */
  logComponentLifecycle(componentName, lifecycle, context = {}) {
    this.debug(`Component ${lifecycle}: ${componentName}`, context);
  }

  /**
   * Log performance metric
   */
  logPerformance(operation, duration, context = {}) {
    this.info(`Performance: ${operation} took ${duration}ms`, context);
  }

  /**
   * Set debug mode
   */
  setDebugMode(enabled) {
    this.isDebugMode = enabled;
    localStorage.setItem('debug_mode', enabled.toString());
  }

  /**
   * Set log level
   */
  setLogLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
      localStorage.setItem('log_level', level);
    }
  }

  /**
   * Get current log level
   */
  getLogLevel() {
    return this.logLevel;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled() {
    return this.isDebugMode;
  }

  /**
   * Clear all logs (for development)
   */
  clearLogs() {
    if (this.isDevelopment) {
      console.clear();
    }
  }
}

// Create singleton instance
const loggingService = new LoggingService();

// Export both the class and the instance
export { LoggingService };
export default loggingService;
