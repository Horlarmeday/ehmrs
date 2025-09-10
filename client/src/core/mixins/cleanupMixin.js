/**
 * Cleanup Mixin
 * Provides standardized state cleanup on component destruction
 */
export default {
  data() {
    return {
      // Component-specific cleanup tasks
      cleanupTasks: [],
      // Timers and intervals to clear
      timers: [],
      intervals: [],
      // Event listeners to remove
      eventListeners: [],
    };
  },
  
  methods: {
    // Add cleanup task
    addCleanupTask(task) {
      this.cleanupTasks.push(task);
    },
    
    // Remove cleanup task
    removeCleanupTask(task) {
      const index = this.cleanupTasks.indexOf(task);
      if (index > -1) {
        this.cleanupTasks.splice(index, 1);
      }
    },
    
    // Add timer to cleanup list
    addTimer(timer) {
      this.timers.push(timer);
      return timer;
    },
    
    // Add interval to cleanup list
    addInterval(interval) {
      this.intervals.push(interval);
      return interval;
    },
    
    // Add event listener to cleanup list
    addEventListener(element, event, handler, options = {}) {
      element.addEventListener(event, handler, options);
      this.eventListeners.push({ element, event, handler, options });
    },
    
    // Clear specific entity state
    clearEntityState(entity) {
      const mutations = {
        categories: 'CLEAR_CATEGORIES_STATE',
        subcategories: 'CLEAR_SUBCATEGORIES_STATE',
        items: 'CLEAR_ITEMS_STATE',
        movements: 'CLEAR_MOVEMENTS_STATE',
        requests: 'CLEAR_REQUESTS_STATE',
        dispensaries: 'CLEAR_DISPENSARIES_STATE',
        reports: 'CLEAR_REPORTS_STATE',
        dashboard: 'CLEAR_DASHBOARD_STATE',
      };
      
      if (mutations[entity]) {
        this.$store.commit(`generalStore/${mutations[entity]}`);
      }
    },
    
    // Clear multiple entity states
    clearMultipleEntityStates(entities) {
      entities.forEach(entity => this.clearEntityState(entity));
    },
    
    // Clear all store state
    clearAllStoreState() {
      this.$store.commit('generalStore/CLEAR_ALL_STATE');
    },
    
    // Clear component-specific state
    clearComponentState() {
      // Override in component to clear component-specific state
    },
    
    // Clear all timers and intervals
    clearTimersAndIntervals() {
      this.timers.forEach(timer => clearTimeout(timer));
      this.intervals.forEach(interval => clearInterval(interval));
      this.timers = [];
      this.intervals = [];
    },
    
    // Remove all event listeners
    removeEventListeners() {
      this.eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.eventListeners = [];
    },
    
    // Execute all cleanup tasks
    executeCleanupTasks() {
      this.cleanupTasks.forEach(task => {
        try {
          if (typeof task === 'function') {
            task();
          } else if (task && typeof task.cleanup === 'function') {
            task.cleanup();
          }
        } catch (error) {
          console.warn('Cleanup task failed:', error);
        }
      });
      this.cleanupTasks = [];
    },
    
    // Full cleanup
    performFullCleanup() {
      // Execute custom cleanup tasks
      this.executeCleanupTasks();
      
      // Clear component state
      this.clearComponentState();
      
      // Clear timers and intervals
      this.clearTimersAndIntervals();
      
      // Remove event listeners
      this.removeEventListeners();
      
      // Clear store state (optional - usually done on route change)
      // this.clearAllStoreState();
    },
    
    // Cleanup specific to entity (for entity-specific components)
    performEntityCleanup(entity) {
      this.clearEntityState(entity);
      this.clearTimersAndIntervals();
      this.removeEventListeners();
    },
  },
  
  // Cleanup on component destruction
  beforeDestroy() {
    this.performFullCleanup();
  },
  
  // Cleanup on route leave (if using vue-router)
  beforeRouteLeave(to, from, next) {
    this.performFullCleanup();
    next();
  },
};


