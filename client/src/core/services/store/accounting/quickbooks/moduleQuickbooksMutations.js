import {
  createAuthorizationState,
  createConnectionState,
  createLoadingState,
} from './moduleQuickbooksState';

const LOADING_KEYS = [
  'status',
  'authorize',
  'disconnect',
  'exportSummary',
  'exportDetailed',
  'loadCredentials',
  'saveCredentials',
];

export default {
  RESET_STATE(state) {
    state.loading = createLoadingState();
    state.error = null;
    state.connectionStatus = createConnectionState();
    state.authorizationRequest = createAuthorizationState();
    state.exportResults = {
      summary: null,
      detailed: null,
    };
    state.credentials = null;
  },

  SET_LOADING(state, { key, value }) {
    if (!LOADING_KEYS.includes(key)) {
      return;
    }
    state.loading = {
      ...state.loading,
      [key]: Boolean(value),
    };
  },

  SET_ERROR(state, errorMessage) {
    state.error = errorMessage || null;
  },

  SET_CONNECTION_STATUS(state, status) {
    state.connectionStatus = {
      ...createConnectionState(),
      ...(status || {}),
    };
  },

  SET_AUTHORIZATION_REQUEST(state, payload) {
    state.authorizationRequest = {
      ...createAuthorizationState(),
      ...(payload || {}),
    };
  },

  CLEAR_AUTHORIZATION_REQUEST(state) {
    state.authorizationRequest = createAuthorizationState();
  },

  SET_SUMMARY_EXPORT_RESULT(state, result) {
    state.exportResults = {
      ...state.exportResults,
      summary: result || null,
    };
  },

  SET_DETAILED_EXPORT_RESULT(state, result) {
    state.exportResults = {
      ...state.exportResults,
      detailed: result || null,
    };
  },

  SET_CREDENTIALS(state, summary) {
    state.credentials = summary || null;
  },
};
