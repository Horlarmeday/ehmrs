<template>
  <div v-if="showDebugPanel" class="debug-panel">
    <div class="debug-panel-header">
      <h6 class="mb-0">Debug Panel</h6>
      <button @click="togglePanel" class="btn btn-sm btn-outline-secondary">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="debug-panel-content">
      <!-- Log Level Control -->
      <div class="debug-section">
        <label class="debug-label">Log Level:</label>
        <select v-model="logLevel" @change="updateLogLevel" class="form-control form-control-sm">
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
          <option value="trace">Trace</option>
        </select>
      </div>
      
      <!-- Debug Mode Toggle -->
      <div class="debug-section">
        <div class="form-check">
          <input
            v-model="debugMode"
            @change="updateDebugMode"
            class="form-check-input"
            type="checkbox"
            id="debugMode"
          />
          <label class="form-check-label" for="debugMode">
            Debug Mode
          </label>
        </div>
      </div>
      
      <!-- Performance Metrics -->
      <div class="debug-section">
        <h6>Performance Metrics</h6>
        <div class="debug-metrics">
          <div class="metric-item">
            <span class="metric-label">Page Load:</span>
            <span class="metric-value">{{ pageLoadTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Memory Usage:</span>
            <span class="metric-value">{{ memoryUsage }}MB</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">API Calls:</span>
            <span class="metric-value">{{ apiCallCount }}</span>
          </div>
        </div>
      </div>
      
      <!-- Log History -->
      <div class="debug-section">
        <h6>Recent Logs</h6>
        <div class="log-history">
          <div
            v-for="(log, index) in recentLogs"
            :key="index"
            :class="['log-entry', `log-${log.level}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <button @click="clearLogs" class="btn btn-sm btn-outline-danger">
          Clear Logs
        </button>
      </div>
      
      <!-- Store State -->
      <div class="debug-section">
        <h6>Store State</h6>
        <div class="store-state">
          <div class="state-item">
            <span class="state-label">Loading:</span>
            <span class="state-value">{{ storeLoading }}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Error:</span>
            <span class="state-value">{{ storeError || 'None' }}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Pagination:</span>
            <span class="state-value">{{ paginationInfo }}</span>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="debug-section">
        <h6>Actions</h6>
        <div class="debug-actions">
          <button @click="exportLogs" class="btn btn-sm btn-outline-primary">
            Export Logs
          </button>
          <button @click="testLogging" class="btn btn-sm btn-outline-info">
            Test Logging
          </button>
          <button @click="clearStore" class="btn btn-sm btn-outline-warning">
            Clear Store
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Debug Toggle Button -->
  <button
    v-if="!showDebugPanel && isDevelopment"
    @click="togglePanel"
    class="debug-toggle-btn"
    title="Open Debug Panel"
  >
    <i class="fas fa-bug"></i>
  </button>
</template>

<script>
import loggingService from '../services/logging.service';

export default {
  name: 'DebugPanel',
  data() {
    return {
      showDebugPanel: false,
      logLevel: 'info',
      debugMode: false,
      pageLoadTime: 0,
      memoryUsage: 0,
      apiCallCount: 0,
      recentLogs: [],
      logHistory: [],
    };
  },
  
  computed: {
    isDevelopment() {
      return process.env.NODE_ENV === 'development';
    },
    
    storeLoading() {
      return this.$store.state.generalStore.loading;
    },
    
    storeError() {
      return this.$store.state.generalStore.error;
    },
    
    paginationInfo() {
      const pagination = this.$store.state.generalStore.pagination;
      return `${pagination.currentPage}/${pagination.totalPages}`;
    },
  },
  
  mounted() {
    this.initializeDebugPanel();
    this.startPerformanceMonitoring();
  },
  
  methods: {
    initializeDebugPanel() {
      this.logLevel = loggingService.getLogLevel();
      this.debugMode = loggingService.isDebugEnabled();
      
      // Override console methods to capture logs
      this.overrideConsoleMethods();
    },
    
    overrideConsoleMethods() {
      const originalConsole = {
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
        trace: console.trace,
      };
      
      ['error', 'warn', 'info', 'debug', 'trace'].forEach(level => {
        console[level] = (...args) => {
          originalConsole[level](...args);
          this.addToLogHistory(level, args.join(' '));
        };
      });
    },
    
    addToLogHistory(level, message) {
      const logEntry = {
        level,
        message,
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
      };
      
      this.logHistory.unshift(logEntry);
      this.recentLogs = this.logHistory.slice(0, 20); // Keep only last 20 logs
    },
    
    startPerformanceMonitoring() {
      // Monitor page load time
      window.addEventListener('load', () => {
        this.pageLoadTime = performance.now();
      });
      
      // Monitor memory usage
      setInterval(() => {
        if (performance.memory) {
          this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
      }, 5000);
      
      // Monitor API calls
      this.monitorApiCalls();
    },
    
    monitorApiCalls() {
      // Override fetch to monitor API calls
      const originalFetch = window.fetch;
      window.fetch = (...args) => {
        this.apiCallCount++;
        return originalFetch(...args);
      };
    },
    
    togglePanel() {
      this.showDebugPanel = !this.showDebugPanel;
    },
    
    updateLogLevel() {
      loggingService.setLogLevel(this.logLevel);
    },
    
    updateDebugMode() {
      loggingService.setDebugMode(this.debugMode);
    },
    
    clearLogs() {
      this.logHistory = [];
      this.recentLogs = [];
      loggingService.clearLogs();
    },
    
    exportLogs() {
      const logs = this.logHistory.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        level: log.level,
        message: log.message,
      }));
      
      const blob = new Blob([JSON.stringify(logs, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    
    testLogging() {
      this.$logError('Test error message');
      this.$logWarn('Test warning message');
      this.$logInfo('Test info message');
      this.$logDebug('Test debug message');
      this.$logTrace('Test trace message');
    },
    
    clearStore() {
      this.$store.commit('generalStore/CLEAR_ALL_STATE');
      this.$toast.info('Store cleared');
    },
  },
};
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
}

.debug-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.debug-panel-content {
  padding: 16px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.debug-label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
}

.debug-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.metric-label {
  font-weight: 500;
  color: #666;
}

.metric-value {
  font-weight: 600;
  color: #333;
}

.log-history {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.log-entry {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #999;
  min-width: 60px;
}

.log-level {
  min-width: 50px;
  font-weight: 600;
}

.log-error .log-level {
  color: #dc3545;
}

.log-warn .log-level {
  color: #ffc107;
}

.log-info .log-level {
  color: #17a2b8;
}

.log-debug .log-level {
  color: #6c757d;
}

.log-trace .log-level {
  color: #6f42c1;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.store-state {
  display: grid;
  gap: 8px;
}

.state-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.state-label {
  font-weight: 500;
  color: #666;
}

.state-value {
  font-weight: 600;
  color: #333;
}

.debug-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.debug-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.debug-toggle-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .debug-panel {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>



