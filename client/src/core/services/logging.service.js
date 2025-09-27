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
      trace: 4,
    };

    // Performance optimization
    this.logQueue = [];
    this.maxQueueSize = 100;
    this.flushInterval = 1000; // 1 second
    this.lastFlush = Date.now();

    // Debouncing for similar messages
    this.messageCache = new Map();
    this.debounceTime = 500; // 500ms

    // Error filtering
    this.errorFilters = new Set([
      'ResizeObserver loop limit exceeded',
      'Non-passive event listener',
      'Script error.',
      'Network request failed',
      'Loading chunk',
      'ChunkLoadError',
    ]);

    // Rate limiting
    this.rateLimits = new Map();
    this.maxLogsPerMinute = 60;

    // Memory management
    this.maxCacheSize = 1000;
    this.cleanupInterval = 60000; // 1 minute

    // Start cleanup timer
    this.startCleanupTimer();

    // Start flush timer
    this.startFlushTimer();
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
   * Check if message should be filtered out
   */
  shouldFilter(message) {
    if (typeof message !== 'string') return false;

    return Array.from(this.errorFilters).some((filter) =>
      message.toLowerCase().includes(filter.toLowerCase())
    );
  }

  /**
   * Check rate limiting for message type
   */
  isRateLimited(messageKey) {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${messageKey}_${minute}`;

    const count = this.rateLimits.get(key) || 0;
    if (count >= this.maxLogsPerMinute) {
      return true;
    }

    this.rateLimits.set(key, count + 1);
    return false;
  }

  /**
   * Get debounced message key
   */
  getMessageKey(level, message) {
    return `${level}_${message.substring(0, 50)}`;
  }

  /**
   * Check if message should be debounced
   */
  shouldDebounce(messageKey) {
    const now = Date.now();
    const lastTime = this.messageCache.get(messageKey);

    if (lastTime && now - lastTime < this.debounceTime) {
      return true;
    }

    this.messageCache.set(messageKey, now);
    return false;
  }

  /**
   * Add log to queue for batch processing
   */
  queueLog(level, message, context) {
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flushLogs();
    }

    this.logQueue.push({
      level,
      message,
      context,
      timestamp: Date.now(),
    });

    // Auto-flush if it's been too long
    if (Date.now() - this.lastFlush > this.flushInterval) {
      this.flushLogs();
    }
  }

  /**
   * Flush queued logs to console
   */
  flushLogs() {
    if (this.logQueue.length === 0) return;

    // const startTime = performance.now();
    // const queueSize = this.logQueue.length;

    const logs = [...this.logQueue];
    this.logQueue = [];
    this.lastFlush = Date.now();

    logs.forEach(({ level, message, context }) => {
      const formattedMessage = this.formatMessage(level, message, context);
      console.log(formattedMessage);

      // Console output disabled to reduce browser console noise
      // switch (level) {
      //   case 'error':
      //     console.error(formattedMessage);
      //     break;
      //   case 'warn':
      //     console.warn(formattedMessage);
      //     break;
      //   case 'info':
      //     console.info(formattedMessage);
      //     break;
      //   case 'debug':
      //     console.debug(formattedMessage);
      //     break;
      //   case 'trace':
      //     console.trace(formattedMessage);
      //     break;
      // }
    });

    // Record performance metrics
    // if (performanceMonitoringService) {
    //   const flushTime = performance.now() - startTime;
    //   performanceMonitoringService.recordQueueSize(queueSize);
    //   performanceMonitoringService.recordFlush(flushTime);
    // }
  }

  /**
   * Start flush timer
   */
  startFlushTimer() {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  /**
   * Start cleanup timer for memory management
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupCache();
    }, this.cleanupInterval);
  }

  /**
   * Clean up old cache entries
   */
  cleanupCache() {
    const now = Date.now();

    // Clean message cache
    if (this.messageCache.size > this.maxCacheSize) {
      const entries = Array.from(this.messageCache.entries());
      entries.sort((a, b) => a[1] - b[1]); // Sort by timestamp

      // Remove oldest 20%
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.messageCache.delete(entries[i][0]);
      }
    }

    // Clean rate limits (remove old minute entries)
    const currentMinute = Math.floor(now / 60000);
    for (const [key] of this.rateLimits) {
      const keyMinute = parseInt(key.split('_').pop());
      if (currentMinute - keyMinute > 5) {
        // Keep last 5 minutes
        this.rateLimits.delete(key);
      }
    }
  }

  /**
   * Process log with all optimizations
   */
  processLog(level, message, context = {}) {
    // Filter out unwanted messages
    if (this.shouldFilter(message)) {
      return;
    }

    const messageKey = this.getMessageKey(level, message);

    // Check rate limiting
    if (this.isRateLimited(messageKey)) {
      return;
    }

    // Check debouncing
    if (this.shouldDebounce(messageKey)) {
      return;
    }

    // Queue for batch processing
    this.queueLog(level, message, context);
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr =
      Object.keys(context).length > 0 ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Send log to external service (if configured)
   */
  sendToExternalService() {
    // try {
    //   // Record logging metrics
    //   // if (performanceMonitoringService) {
    //   //   performanceMonitoringService.recordLog(level, message.length);
    //   // }
    //   // // Only send errors to error reporting service
    //   // if (level === 'error' && errorReportingService) {
    //   //   errorReportingService.reportError(new Error(message), {
    //   //     level,
    //   //     context,
    //   //     source: 'logging-service',
    //   //   });
    //   //   // Record error metrics
    //   //   if (performanceMonitoringService) {
    //   //     performanceMonitoringService.recordError('logging-service', message);
    //   //   }
    //   }
    // } catch (error) {
    //   // Prevent infinite loops - console output disabled
    //   // console.error('Failed to send log to external service:', error);
    // }
  }

  /**
   * Log error message
   */
  error(message, context = {}) {
    if (this.shouldLog('error')) {
      this.processLog('error', message, context);
      this.sendToExternalService('error', message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message, context = {}) {
    if (this.shouldLog('warn')) {
      this.processLog('warn', message, context);
    }
  }

  /**
   * Log info message
   */
  info(message, context = {}) {
    if (this.shouldLog('info')) {
      this.processLog('info', message, context);
    }
  }

  /**
   * Log debug message
   */
  debug(message, context = {}) {
    if (this.shouldLog('debug')) {
      this.processLog('debug', message, context);
    }
  }

  /**
   * Log trace message
   */
  trace(message, context = {}) {
    if (this.shouldLog('trace')) {
      this.processLog('trace', message, context);
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

  /**
   * Add error filter
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
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      queueSize: this.logQueue.length,
      cacheSize: this.messageCache.size,
      rateLimitEntries: this.rateLimits.size,
      lastFlush: this.lastFlush,
      errorFilters: Array.from(this.errorFilters),
    };
  }

  /**
   * Force flush logs immediately
   */
  forceFlush() {
    this.flushLogs();
  }

  /**
   * Reset all caches and queues
   */
  reset() {
    this.logQueue = [];
    this.messageCache.clear();
    this.rateLimits.clear();
    this.lastFlush = Date.now();
  }

  /**
   * Configure optimization settings
   */
  configure(options = {}) {
    if (options.maxQueueSize !== undefined) {
      this.maxQueueSize = options.maxQueueSize;
    }
    if (options.flushInterval !== undefined) {
      this.flushInterval = options.flushInterval;
    }
    if (options.debounceTime !== undefined) {
      this.debounceTime = options.debounceTime;
    }
    if (options.maxLogsPerMinute !== undefined) {
      this.maxLogsPerMinute = options.maxLogsPerMinute;
    }
    if (options.maxCacheSize !== undefined) {
      this.maxCacheSize = options.maxCacheSize;
    }
  }
}

// Create singleton instance
const loggingService = new LoggingService();

// Export both the class and the instance
export { LoggingService };
export default loggingService;
