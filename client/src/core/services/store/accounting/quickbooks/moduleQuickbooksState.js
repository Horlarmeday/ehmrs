export const createConnectionState = () => ({
  isConnected: false,
  environment: null,
  realmId: null,
  connectedAt: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  lastSyncedAt: null,
});

export const createAuthorizationState = () => ({
  authorizationUrl: '',
  state: '',
});

export const createLoadingState = () => ({
  status: false,
  authorize: false,
  disconnect: false,
  exportSummary: false,
  exportDetailed: false,
  loadCredentials: false,
  saveCredentials: false,
});

export default {
  loading: createLoadingState(),
  error: null,
  connectionStatus: createConnectionState(),
  authorizationRequest: createAuthorizationState(),
  exportResults: {
    summary: null,
    detailed: null,
  },
  credentials: null,
};

