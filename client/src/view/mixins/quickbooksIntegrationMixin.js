import { mapActions, mapState } from 'vuex';

const base64UrlToJson = (payload) => {
  if (!payload || typeof payload !== 'string') {
    throw new Error('Invalid QuickBooks payload');
  }

  let normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  if (padding > 0) {
    normalized += '='.repeat(4 - padding);
  }

  const decoded = window.atob(normalized);
  return JSON.parse(decoded);
};

const createSummaryForm = () => ({
  revenueAccountId: '',
  offsetAccountId: '',
  pendingAccountId: '',
  depositsAccountId: '',
  txnDate: new Date().toISOString().slice(0, 10),
  memo: '',
});

const createDetailedForm = () => ({
  start: '',
  end: '',
  paymentMethod: '',
  status: '',
  currentPage: 1,
  pageLimit: 20,
  search: '',
  memoPrefix: 'EHMRS Payment',
  creditAccountId: '',
  debitAccounts: {
    default: '',
    CASH: '',
    CARD: '',
    BANK_TRANSFER: '',
    MOBILE_MONEY: '',
    INSURANCE: '',
    DEPOSIT: '',
  },
});

export default {
  data() {
    return {
      quickbooksWindow: null,
      quickbooksModals: {
        credentials: false,
        summary: false,
        detailed: false,
      },
      quickbooksForms: {
        credentials: {
          clientId: '',
          clientSecret: '',
          redirectUri: '',
          environment: 'SANDBOX',
        },
        summary: createSummaryForm(),
        detailed: createDetailedForm(),
      },
      quickbooksCredentialsModalId: `quickbooks-credentials-${this._uid}`,
      quickbooksSummaryModalId: `quickbooks-summary-${this._uid}`,
      quickbooksDetailedModalId: `quickbooks-detailed-${this._uid}`,
    };
  },
  computed: {
    ...mapState('accounting/quickbooks', {
      quickbooksStatus: (state) => state.connectionStatus,
      quickbooksLoading: (state) => state.loading,
      quickbooksError: (state) => state.error,
      quickbooksAuthorization: (state) => state.authorizationRequest,
      quickbooksExports: (state) => state.exportResults,
      quickbooksCredentialsSummary: (state) => state.credentials,
    }),
    isQuickbooksConnected() {
      return Boolean(this.quickbooksStatus?.isConnected);
    },
    quickbooksStatusVariant() {
      if (this.quickbooksLoading && this.quickbooksLoading.status) {
        return 'info';
      }
      if (!this.quickbooksCredentialsConfigured) {
        return 'warning';
      }
      return this.isQuickbooksConnected ? 'success' : 'warning';
    },
    quickbooksStatusLabel() {
      if (this.quickbooksLoading && this.quickbooksLoading.status) {
        return 'Checking...';
      }
      if (!this.quickbooksCredentialsConfigured) {
        return 'Not Configured';
      }
      return this.isQuickbooksConnected ? 'Connected' : 'Not Connected';
    },
    quickbooksCredentialsConfigured() {
      return Boolean(this.quickbooksCredentialsSummary);
    },
  },
  watch: {
    quickbooksError(newValue) {
      if (newValue) {
        this.$bvToast.toast(newValue, {
          title: 'QuickBooks',
          variant: 'danger',
          solid: true,
        });
        this.clearQuickbooksErrors();
      }
    },
    quickbooksCredentialsSummary: {
      immediate: true,
      handler(summary) {
        if (summary) {
          this.quickbooksForms.credentials.environment = summary.environment || 'SANDBOX';
          this.quickbooksForms.credentials.redirectUri = summary.redirectUri || '';
          this.quickbooksForms.credentials.clientId = '';
          this.quickbooksForms.credentials.clientSecret = '';
        } else {
          this.quickbooksForms.credentials.environment = 'SANDBOX';
          this.quickbooksForms.credentials.redirectUri = '';
          this.quickbooksForms.credentials.clientId = '';
          this.quickbooksForms.credentials.clientSecret = '';
        }
      },
    },
  },
  methods: {
    ...mapActions('accounting/quickbooks', [
      'fetchConnectionStatus',
      'startAuthorization',
      'disconnectQuickbooks',
      'exportQuickbooksSummary',
      'exportQuickbooksDetailed',
      'fetchQuickbooksCredentials',
      'saveQuickbooksCredentials',
      'applyQuickbooksConnectionStatus',
      'clearQuickbooksErrors',
    ]),
    async initializeQuickbooksIntegration() {
      window.addEventListener('message', this.handleQuickbooksMessage);
      try {
        await Promise.all([
          this.fetchConnectionStatus(),
          this.fetchQuickbooksCredentials().catch((error) => {
            console.error('QuickBooks credential fetch failed:', error);
          }),
        ]);
      } catch (error) {
        console.error('QuickBooks status initialization failed:', error);
      }
    },
    async refreshQuickbooksStatus() {
      try {
        await this.fetchConnectionStatus();
      } catch (error) {
        console.error('QuickBooks status refresh failed:', error);
      }
    },
    async connectQuickbooks() {
      if (this.quickbooksLoading?.authorize) return;
      try {
        const response = await this.startAuthorization();
        const authorizationUrl =
          response?.authorizationUrl || this.quickbooksAuthorization?.authorizationUrl;
        if (!authorizationUrl) {
          throw new Error('Authorization link was not provided by the server');
        }
        this.openQuickbooksPopup(authorizationUrl);
      } catch (error) {
        console.error('QuickBooks authorization failed:', error);
        this.$bvToast.toast(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to start QuickBooks authorization',
          {
            title: 'QuickBooks',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },
    async disconnectQuickbooksAccount() {
      if (!this.isQuickbooksConnected || this.quickbooksLoading?.disconnect) {
        return;
      }
      try {
        await this.disconnectQuickbooks();
        this.$bvToast.toast('QuickBooks connection has been disconnected', {
          title: 'QuickBooks',
          variant: 'info',
          solid: true,
        });
      } catch (error) {
        console.error('QuickBooks disconnect failed:', error);
      }
    },
    openQuickbooksPopup(url) {
      if (this.quickbooksWindow && !this.quickbooksWindow.closed) {
        this.quickbooksWindow.close();
      }
      this.quickbooksWindow = window.open(url, 'quickbooks-oauth', 'width=600,height=720,noopener');
      if (!this.quickbooksWindow) {
        this.$bvToast.toast('Please enable pop-ups to continue with QuickBooks authorization', {
          title: 'QuickBooks',
          variant: 'warning',
          solid: true,
        });
      }
    },
    closeQuickbooksPopup() {
      if (this.quickbooksWindow && !this.quickbooksWindow.closed) {
        this.quickbooksWindow.close();
      }
      this.quickbooksWindow = null;
    },
    handleQuickbooksMessage(event) {
      if (!event || !event.data || event.data.type !== 'quickbooks:connected') {
        return;
      }

      if (event.origin && event.origin !== window.location.origin) {
        return;
      }

      try {
        const payload = base64UrlToJson(event.data.payload);
        this.applyQuickbooksConnectionStatus(payload);
        this.$bvToast.toast('QuickBooks connection established successfully', {
          title: 'QuickBooks',
          variant: 'success',
          solid: true,
        });
        this.refreshQuickbooksStatus();
      } catch (error) {
        console.error('Failed to process QuickBooks message:', error);
        this.$bvToast.toast('Unable to complete QuickBooks connection handshake', {
          title: 'QuickBooks',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.closeQuickbooksPopup();
      }
    },
    formatQuickbooksTimestamp(value) {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return value;
        }
        return date.toLocaleString();
      } catch (error) {
        return value;
      }
    },
    openQuickbooksModal(type) {
      if (type === 'summary') {
        this.quickbooksModals.summary = true;
      }
      if (type === 'detailed') {
        this.quickbooksModals.detailed = true;
      }
    },
    closeQuickbooksModal(type) {
      if (type === 'summary') {
        this.quickbooksModals.summary = false;
      }
      if (type === 'detailed') {
        this.quickbooksModals.detailed = false;
      }
    },
    resetQuickbooksSummaryForm() {
      this.quickbooksForms.summary = createSummaryForm();
    },
    resetQuickbooksDetailedForm() {
      this.quickbooksForms.detailed = createDetailedForm();
    },
    sanitizeAccountId(value) {
      return value && value.toString().trim().length ? value.trim() : undefined;
    },
    buildDebitAccountsMap(input) {
      const entries = Object.entries(input || {}).reduce((acc, [key, value]) => {
        const sanitized = this.sanitizeAccountId(value);
        if (sanitized) {
          acc[key] = sanitized;
        }
        return acc;
      }, {});
      return entries;
    },
    async submitQuickbooksSummary() {
      const form = this.quickbooksForms.summary;
      if (!form.revenueAccountId || !form.offsetAccountId) {
        this.$bvToast.toast('Please provide both revenue and offset account IDs.', {
          title: 'QuickBooks Summary Export',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      const payload = {
        memo: form.memo || undefined,
        txnDate: form.txnDate || undefined,
        accountMappings: {
          revenueAccountId: form.revenueAccountId.trim(),
          offsetAccountId: form.offsetAccountId.trim(),
          pendingAccountId: this.sanitizeAccountId(form.pendingAccountId),
          depositsAccountId: this.sanitizeAccountId(form.depositsAccountId),
        },
      };

      try {
        await this.exportQuickbooksSummary(payload);
        this.$bvToast.toast('Summary exported to QuickBooks successfully.', {
          title: 'QuickBooks Summary Export',
          variant: 'success',
          solid: true,
        });
        this.closeQuickbooksModal('summary');
        this.resetQuickbooksSummaryForm();
        this.refreshQuickbooksStatus();
      } catch (error) {
        console.error('QuickBooks summary export failed:', error);
      }
    },
    async submitQuickbooksDetailed() {
      const form = this.quickbooksForms.detailed;
      if (!form.creditAccountId) {
        this.$bvToast.toast('Please provide a credit account ID.', {
          title: 'QuickBooks Detailed Export',
          variant: 'warning',
          solid: true,
        });
        return;
      }
      if (!form.debitAccounts.default) {
        this.$bvToast.toast('Please provide a default debit account ID.', {
          title: 'QuickBooks Detailed Export',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      const filters = {
        currentPage: form.currentPage,
        pageLimit: form.pageLimit,
      };

      if (form.start) filters.start = form.start;
      if (form.end) filters.end = form.end;
      if (form.paymentMethod) filters.paymentMethod = form.paymentMethod;
      if (form.status) filters.status = form.status;
      if (form.search) filters.search = form.search;

      const payload = {
        filters,
        memoPrefix: form.memoPrefix || 'EHMRS Payment',
        accountMappings: {
          creditAccountId: form.creditAccountId.trim(),
          debitAccounts: this.buildDebitAccountsMap(form.debitAccounts),
        },
      };

      try {
        await this.exportQuickbooksDetailed(payload);
        this.$bvToast.toast('Detailed transactions exported to QuickBooks successfully.', {
          title: 'QuickBooks Detailed Export',
          variant: 'success',
          solid: true,
        });
        this.closeQuickbooksModal('detailed');
        this.resetQuickbooksDetailedForm();
        this.refreshQuickbooksStatus();
      } catch (error) {
        console.error('QuickBooks detailed export failed:', error);
      }
    },
    openQuickbooksCredentialsModal() {
      this.quickbooksModals.credentials = true;
      if (this.quickbooksCredentialsSummary) {
        this.quickbooksForms.credentials.environment =
          this.quickbooksCredentialsSummary.environment || 'SANDBOX';
        this.quickbooksForms.credentials.redirectUri =
          this.quickbooksCredentialsSummary.redirectUri || '';
      }
    },
    closeQuickbooksCredentialsModal() {
      this.quickbooksModals.credentials = false;
      this.resetQuickbooksCredentialsForm();
    },
    resetQuickbooksCredentialsForm() {
      this.quickbooksForms.credentials = {
        clientId: '',
        clientSecret: '',
        redirectUri: this.quickbooksCredentialsSummary?.redirectUri || '',
        environment: this.quickbooksCredentialsSummary?.environment || 'SANDBOX',
      };
    },
    async submitQuickbooksCredentials() {
      if (this.quickbooksLoading && this.quickbooksLoading.saveCredentials) {
        return;
      }

      const form = this.quickbooksForms.credentials;
      if (!form.clientId || !form.clientSecret || !form.redirectUri) {
        this.$bvToast.toast('Client ID, Client Secret, and Redirect URI are required.', {
          title: 'QuickBooks Credentials',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      try {
        await this.saveQuickbooksCredentials({
          clientId: form.clientId,
          clientSecret: form.clientSecret,
          redirectUri: form.redirectUri,
          environment: form.environment,
        });

        this.$bvToast.toast('QuickBooks credentials saved successfully.', {
          title: 'QuickBooks Credentials',
          variant: 'success',
          solid: true,
        });

        this.closeQuickbooksCredentialsModal();
        await this.refreshQuickbooksStatus();
      } catch (error) {
        console.error('QuickBooks credential save failed:', error);
      }
    },
  },
  mounted() {
    this.initializeQuickbooksIntegration();
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleQuickbooksMessage);
    this.closeQuickbooksPopup();
  },
};
