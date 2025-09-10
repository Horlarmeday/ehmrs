/**
 * Test script to verify logging optimization functionality
 * This script tests the optimized logging service, error filtering, and performance monitoring
 * Run this in browser console after the app loads
 */

// Test function to be called from browser console
window.testLoggingOptimization = function() {
  console.log('=== Testing Logging Service Optimization ===');
  
  // Access services from Vue app
  const app = document.querySelector('#app').__vue__;
  if (!app) {
    console.error('Vue app not found');
    return;
  }
  
  // Test basic logging (should be queued and batched)
  console.log('Testing basic logging...');
  app.$log.info('Test info message - should be batched');
  app.$log.warn('Test warning message - should be batched');
  app.$log.error('Test error message - should be batched');
  
  // Test error filtering (these should be filtered out)
  console.log('Testing error filtering...');
  app.$log.error('ResizeObserver loop limit exceeded - should be filtered');
  app.$log.error('Non-passive event listener - should be filtered');
  app.$log.error('Script error. - should be filtered');
  
  // Test rate limiting
  console.log('Testing rate limiting...');
  for (let i = 0; i < 10; i++) {
    app.$log.info(`Repeated message ${i} - rate limited after 60/min`);
  }
  
  // Test debouncing
  console.log('Testing debouncing...');
  for (let i = 0; i < 5; i++) {
    app.$log.warn('Similar warning message - should be debounced');
  }
  
  // Show metrics after a delay
  setTimeout(() => {
    console.log('=== Performance Metrics ===');
    
    // Force flush to see queued logs
    if (app.$log.forceFlush) {
      app.$log.forceFlush();
    }
    
    // Get metrics if available
    if (app.$log.getPerformanceMetrics) {
      const metrics = app.$log.getPerformanceMetrics();
      console.log('Logging Service Metrics:', metrics);
    }
    
    console.log('=== Test Complete ===');
    console.log('Check console for reduced noise and batched logging!');
  }, 2000);
};

// Auto-run test if in development
if (process.env.NODE_ENV === 'development') {
  // Wait for Vue app to be ready
  setTimeout(() => {
    if (window.testLoggingOptimization) {
      console.log('Logging optimization test available. Run: testLoggingOptimization()');
    }
  }, 3000);
}

console.log('Logging optimization test script loaded. Run testLoggingOptimization() in console.');