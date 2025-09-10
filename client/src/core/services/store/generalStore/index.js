import state from './moduleGeneralStoreState.js';
import mutations from './moduleGeneralStoreMutations.js';
import actions from './moduleGeneralStoreActions.js';
import getters from './moduleGeneralStoreGetters.js';

// Import normalized module for enhanced state management
import normalizedModule from './moduleGeneralStoreNormalizedIntegration.js';

// Configuration for state management approach
const USE_NORMALIZED_STATE = process.env.VUE_APP_USE_NORMALIZED_STATE === 'true' || false;

// Original module structure
const originalModule = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

// Export the appropriate module based on configuration
export default USE_NORMALIZED_STATE ? normalizedModule : originalModule;

// Export both modules for flexibility
export { originalModule, normalizedModule };

// Export utilities for migration and development
export {
  MIGRATION_CONFIG,
  migrateToNormalizedState,
  createBackwardCompatibleState,
  validateNormalizedState,
  performanceMonitor,
  devUtils,
  createMigrationPlan,
} from './moduleGeneralStoreNormalizedIntegration.js';
