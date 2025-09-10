/**
 * Performance Monitoring Service
 * Tracks and monitors application performance metrics
 */
import loggingService from './logging.service';

class PerformanceMonitoringService {
  constructor() {
    this.metrics = {
      logging: {
        totalLogs: 0,
        logsByLevel: {
          error: 0,
          warn: 0,
          info: 0,
          debug: 0,
          trace: 0,
        },
        averageLogTime: 0,
        queueSize: 0,
        flushCount: 0,
        filteredLogs: 0,
        rateLimitedLogs: 0,
      },
      errors: {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
        filteredErrors: 0,
        rateLimitedErrors: 0,
      },
      performance: {
        memoryUsage: [],
        cpuUsage: [],
        renderTimes: [],
        apiResponseTimes: [],
        componentLoadTimes: [],
      },
      system: {
        startTime: Date.now(),
        lastUpdate: Date.now(),
        sessionDuration: 0,
      },
    };
    
    this.observers = [];
    this.isMonitoring = false;
    this.updateInterval = 30000; // 30 seconds
    this.maxMetricsHistory = 100;
    
    // Bind methods
    this.startMonitoring = this.startMonitoring.bind(this);
    this.stopMonitoring = this.stopMonitoring.bind(this);
    this.updateMetrics = this.updateMetrics.bind(this);
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics.system.startTime = Date.now();
    
    // Set up periodic metrics collection
    this.metricsInterval = setInterval(this.updateMetrics, this.updateInterval);
    
    // Set up performance observers
    this.setupPerformanceObservers();
    
    loggingService.info('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    // Clear intervals
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    // Disconnect observers
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers = [];
    
    loggingService.info('Performance monitoring stopped');
  }

  /**
   * Set up performance observers
   */
  setupPerformanceObservers() {
    try {
      // Navigation timing observer
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.recordNavigationTiming(entry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
        
        // Measure observer for custom metrics
        const measureObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.name.startsWith('component-')) {
              this.recordComponentLoadTime(entry);
            } else if (entry.name.startsWith('api-')) {
              this.recordApiResponseTime(entry);
            }
          });
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(measureObserver);
      }
    } catch (error) {
      loggingService.warn('Failed to setup performance observers', { error: error.message });
    }
  }

  /**
   * Update metrics periodically
   */
  updateMetrics() {
    this.metrics.system.lastUpdate = Date.now();
    this.metrics.system.sessionDuration = Date.now() - this.metrics.system.startTime;
    
    // Collect memory usage
    this.collectMemoryMetrics();
    
    // Collect CPU usage (if available)
    this.collectCPUMetrics();
    
    // Clean up old metrics
    this.cleanupOldMetrics();
  }

  /**
   * Collect memory usage metrics
   */
  collectMemoryMetrics() {
    if (performance.memory) {
      const memoryInfo = {
        timestamp: Date.now(),
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
      
      this.metrics.performance.memoryUsage.push(memoryInfo);
      
      // Keep only recent metrics
      if (this.metrics.performance.memoryUsage.length > this.maxMetricsHistory) {
        this.metrics.performance.memoryUsage.shift();
      }
    }
  }

  /**
   * Collect CPU usage metrics (approximation)
   */
  collectCPUMetrics() {
    // Simple CPU usage approximation based on timing
    const start = performance.now();
    const iterations = 10000;
    
    for (let i = 0; i < iterations; i++) {
      // Simple computation
      Math.random();
    }
    
    const duration = performance.now() - start;
    const cpuInfo = {
      timestamp: Date.now(),
      approximateUsage: Math.min(duration / 10, 100), // Normalize to percentage
    };
    
    this.metrics.performance.cpuUsage.push(cpuInfo);
    
    if (this.metrics.performance.cpuUsage.length > this.maxMetricsHistory) {
      this.metrics.performance.cpuUsage.shift();
    }
  }

  /**
   * Record navigation timing
   */
  recordNavigationTiming(entry) {
    const timing = {
      timestamp: Date.now(),
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      firstPaint: this.getFirstPaintTime(),
    };
    
    this.metrics.performance.renderTimes.push(timing);
  }

  /**
   * Record component load time
   */
  recordComponentLoadTime(entry) {
    const componentInfo = {
      timestamp: Date.now(),
      name: entry.name.replace('component-', ''),
      duration: entry.duration,
    };
    
    this.metrics.performance.componentLoadTimes.push(componentInfo);
    
    if (this.metrics.performance.componentLoadTimes.length > this.maxMetricsHistory) {
      this.metrics.performance.componentLoadTimes.shift();
    }
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(entry) {
    const apiInfo = {
      timestamp: Date.now(),
      endpoint: entry.name.replace('api-', ''),
      duration: entry.duration,
    };
    
    this.metrics.performance.apiResponseTimes.push(apiInfo);
    
    if (this.metrics.performance.apiResponseTimes.length > this.maxMetricsHistory) {
      this.metrics.performance.apiResponseTimes.shift();
    }
  }

  /**
   * Get first paint time
   */
  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }

  /**
   * Record logging metrics
   */
  recordLogMetric(level, duration, filtered = false, rateLimited = false) {
    this.metrics.logging.totalLogs++;
    this.metrics.logging.logsByLevel[level]++;
    
    if (filtered) {
      this.metrics.logging.filteredLogs++;
    }
    
    if (rateLimited) {
      this.metrics.logging.rateLimitedLogs++;
    }
    
    // Update average log time
    const currentAvg = this.metrics.logging.averageLogTime;
    const totalLogs = this.metrics.logging.totalLogs;
    this.metrics.logging.averageLogTime = (currentAvg * (totalLogs - 1) + duration) / totalLogs;
  }

  /**
   * Record error metrics
   */
  recordErrorMetric(type, severity, filtered = false, rateLimited = false) {
    this.metrics.errors.totalErrors++;
    this.metrics.errors.errorsByType[type] = (this.metrics.errors.errorsByType[type] || 0) + 1;
    this.metrics.errors.errorsBySeverity[severity]++;
    
    if (filtered) {
      this.metrics.errors.filteredErrors++;
    }
    
    if (rateLimited) {
      this.metrics.errors.rateLimitedErrors++;
    }
  }

  /**
   * Update queue size metric
   */
  updateQueueSize(size) {
    this.metrics.logging.queueSize = size;
  }

  /**
   * Record flush operation
   */
  recordFlush() {
    this.metrics.logging.flushCount++;
  }

  /**
   * Clean up old metrics
   */
  cleanupOldMetrics() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clean memory usage
    this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.filter(
      metric => metric.timestamp > cutoffTime
    );
    
    // Clean CPU usage
    this.metrics.performance.cpuUsage = this.metrics.performance.cpuUsage.filter(
      metric => metric.timestamp > cutoffTime
    );
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      summary: this.generateSummary(),
    };
  }

  /**
   * Generate metrics summary
   */
  generateSummary() {
    const memoryUsage = this.metrics.performance.memoryUsage;
    const currentMemory = memoryUsage[memoryUsage.length - 1];
    
    return {
      isMonitoring: this.isMonitoring,
      sessionDuration: this.metrics.system.sessionDuration,
      totalLogs: this.metrics.logging.totalLogs,
      totalErrors: this.metrics.errors.totalErrors,
      currentMemoryUsage: currentMemory ? currentMemory.used : 0,
      averageLogTime: this.metrics.logging.averageLogTime,
      errorFilteringEfficiency: this.calculateFilteringEfficiency(),
      performanceScore: this.calculatePerformanceScore(),
    };
  }

  /**
   * Calculate filtering efficiency
   */
  calculateFilteringEfficiency() {
    const totalPotentialLogs = this.metrics.logging.totalLogs + this.metrics.logging.filteredLogs;
    if (totalPotentialLogs === 0) return 100;
    
    return Math.round((this.metrics.logging.filteredLogs / totalPotentialLogs) * 100);
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for high memory usage
    const memoryUsage = this.metrics.performance.memoryUsage;
    if (memoryUsage.length > 0) {
      const currentMemory = memoryUsage[memoryUsage.length - 1];
      if (currentMemory.used > 100) score -= 20; // Over 100MB
      if (currentMemory.used > 200) score -= 30; // Over 200MB
    }
    
    // Deduct points for high error rate
    const errorRate = this.metrics.errors.totalErrors / Math.max(this.metrics.logging.totalLogs, 1);
    if (errorRate > 0.1) score -= 20; // More than 10% error rate
    if (errorRate > 0.2) score -= 30; // More than 20% error rate
    
    // Deduct points for slow logging
    if (this.metrics.logging.averageLogTime > 10) score -= 15; // Slower than 10ms
    if (this.metrics.logging.averageLogTime > 50) score -= 25; // Slower than 50ms
    
    return Math.max(score, 0);
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      logging: {
        totalLogs: 0,
        logsByLevel: { error: 0, warn: 0, info: 0, debug: 0, trace: 0 },
        averageLogTime: 0,
        queueSize: 0,
        flushCount: 0,
        filteredLogs: 0,
        rateLimitedLogs: 0,
      },
      errors: {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        filteredErrors: 0,
        rateLimitedErrors: 0,
      },
      performance: {
        memoryUsage: [],
        cpuUsage: [],
        renderTimes: [],
        apiResponseTimes: [],
        componentLoadTimes: [],
      },
      system: {
        startTime: Date.now(),
        lastUpdate: Date.now(),
        sessionDuration: 0,
      },
    };
  }

  /**
   * Configure monitoring settings
   */
  configure(options = {}) {
    if (options.updateInterval !== undefined) {
      this.updateInterval = options.updateInterval;
    }
    if (options.maxMetricsHistory !== undefined) {
      this.maxMetricsHistory = options.maxMetricsHistory;
    }
  }
}

// Create singleton instance
const performanceMonitoringService = new PerformanceMonitoringService();

// Export both the class and the instance
export { PerformanceMonitoringService };
export default performanceMonitoringService;