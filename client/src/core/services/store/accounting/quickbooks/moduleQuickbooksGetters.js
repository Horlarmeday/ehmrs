export default {
  quickbooksLoading: state => state.loading,
  quickbooksError: state => state.error,
  quickbooksConnectionStatus: state => state.connectionStatus,
  quickbooksIsConnected: state => Boolean(state.connectionStatus?.isConnected),
  quickbooksAuthorizationRequest: state => state.authorizationRequest,
  quickbooksSummaryExportResult: state => state.exportResults.summary,
  quickbooksDetailedExportResult: state => state.exportResults.detailed,
  quickbooksCredentials: state => state.credentials,
  quickbooksCredentialsLoading: state => state.loading.loadCredentials,
  quickbooksCredentialsSaving: state => state.loading.saveCredentials,
};

