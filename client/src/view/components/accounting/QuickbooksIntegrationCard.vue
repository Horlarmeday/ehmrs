<template>
  <div class="quickbooks-integration card card-custom gutter-b">
    <div class="card-body">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between">
        <div class="mb-3 mb-lg-0">
          <h4 class="mb-1 d-flex align-items-center">
            <span class="mr-2">QuickBooks Online</span>
            <b-badge :variant="quickbooksStatusVariant">
              <span v-if="quickbooksLoading && quickbooksLoading.status">
                <b-spinner small class="mr-1" />
                Checking...
              </span>
              <span v-else>{{ quickbooksStatusLabel }}</span>
            </b-badge>
          </h4>
          <p class="text-muted mb-1" v-if="!quickbooksCredentialsConfigured">
            QuickBooks credentials are not configured. Configure them before connecting.
          </p>
          <p class="text-muted mb-1" v-else-if="isQuickbooksConnected">
            Connected to
            <strong>{{ quickbooksStatus.realmId }}</strong>
            ({{ quickbooksStatus.environment }})
          </p>
          <p class="text-muted mb-1" v-else>
            Connect QuickBooks Online to sync accounting summaries and detailed transactions.
          </p>
          <small class="text-muted d-block" v-if="quickbooksCredentialsSummary">
            Environment: {{ quickbooksCredentialsSummary.environment }}
          </small>
          <small class="text-muted d-block" v-if="quickbooksCredentialsSummary?.redirectUri">
            Redirect URI: {{ quickbooksCredentialsSummary.redirectUri }}
          </small>
          <small class="text-muted" v-if="quickbooksStatus && quickbooksStatus.connectedAt">
            Connected on: {{ formatQuickbooksTimestamp(quickbooksStatus.connectedAt) }}
          </small>
          <small class="text-muted d-block" v-if="quickbooksStatus && quickbooksStatus.lastSyncedAt">
            Last exported: {{ formatQuickbooksTimestamp(quickbooksStatus.lastSyncedAt) }}
          </small>
        </div>
        <div class="d-flex flex-wrap align-items-center">
          <b-button
            size="sm"
            variant="outline-primary"
            class="mr-2 mb-2"
            :disabled="quickbooksLoading && (quickbooksLoading.saveCredentials || quickbooksLoading.loadCredentials)"
            @click="openQuickbooksCredentialsModal"
          >
            Configure
          </b-button>
          <b-button
            size="sm"
            variant="outline-secondary"
            class="mr-2 mb-2"
            :disabled="quickbooksLoading && quickbooksLoading.status"
            @click="refreshQuickbooksStatus"
          >
            <b-spinner small v-if="quickbooksLoading && quickbooksLoading.status" class="mr-1" />
            Refresh
          </b-button>
          <b-button
            v-if="!isQuickbooksConnected"
            size="sm"
            variant="success"
            class="mr-2 mb-2"
            :disabled="!quickbooksCredentialsConfigured || (quickbooksLoading && quickbooksLoading.authorize)"
            @click="connectQuickbooks"
          >
            <b-spinner small v-if="quickbooksLoading && quickbooksLoading.authorize" class="mr-1" />
            Connect
          </b-button>
          <b-button
            v-if="isQuickbooksConnected"
            size="sm"
            variant="outline-danger"
            class="mr-2 mb-2"
            :disabled="quickbooksLoading && quickbooksLoading.disconnect"
            @click="disconnectQuickbooksAccount"
          >
            <b-spinner small v-if="quickbooksLoading && quickbooksLoading.disconnect" class="mr-1" />
            Disconnect
          </b-button>
          <b-button
            v-if="isQuickbooksConnected"
            size="sm"
            variant="primary"
            class="mr-2 mb-2"
            :disabled="quickbooksLoading && quickbooksLoading.exportSummary"
            @click="openQuickbooksModal('summary')"
          >
            <b-spinner
              small
              v-if="quickbooksLoading && quickbooksLoading.exportSummary"
              class="mr-1"
            />
            Export Summary
          </b-button>
          <b-button
            v-if="isQuickbooksConnected"
            size="sm"
            variant="info"
            class="mr-2 mb-2"
            :disabled="quickbooksLoading && quickbooksLoading.exportDetailed"
            @click="openQuickbooksModal('detailed')"
          >
            <b-spinner
              small
              v-if="quickbooksLoading && quickbooksLoading.exportDetailed"
              class="mr-1"
            />
            Export Detailed
          </b-button>
        </div>
      </div>
    </div>

    <b-modal
      :id="quickbooksCredentialsModalId"
      v-model="quickbooksModals.credentials"
      title="Configure QuickBooks Credentials"
      @hidden="resetQuickbooksCredentialsForm"
    >
      <b-form @submit.prevent="submitQuickbooksCredentials">
        <b-alert variant="info" show v-if="quickbooksCredentialsSummary">
          Saved Client ID: {{ quickbooksCredentialsSummary.clientIdMasked || '***' }}<br />
          Environment: {{ quickbooksCredentialsSummary.environment }}
        </b-alert>

        <b-form-group label="Client ID" label-for="qb-credentials-client-id">
          <b-form-input
            id="qb-credentials-client-id"
            v-model="quickbooksForms.credentials.clientId"
            required
            placeholder="Enter QuickBooks client ID"
          />
        </b-form-group>

        <b-form-group label="Client Secret" label-for="qb-credentials-client-secret">
          <b-form-input
            id="qb-credentials-client-secret"
            v-model="quickbooksForms.credentials.clientSecret"
            required
            type="password"
            placeholder="Enter QuickBooks client secret"
          />
        </b-form-group>

        <b-form-group label="Redirect URI" label-for="qb-credentials-redirect">
          <b-form-input
            id="qb-credentials-redirect"
            v-model="quickbooksForms.credentials.redirectUri"
            required
            placeholder="https://your-domain.com/api/integrations/quickbooks/callback"
          />
        </b-form-group>

        <b-form-group label="Environment" label-for="qb-credentials-environment">
          <b-form-select
            id="qb-credentials-environment"
            v-model="quickbooksForms.credentials.environment"
            :options="[
              { value: 'SANDBOX', text: 'Sandbox' },
              { value: 'PRODUCTION', text: 'Production' },
            ]"
          />
        </b-form-group>

        <template #modal-footer>
          <b-button variant="outline-secondary" @click="closeQuickbooksCredentialsModal">
            Cancel
          </b-button>
          <b-button
            variant="primary"
            :disabled="quickbooksLoading && quickbooksLoading.saveCredentials"
            @click="submitQuickbooksCredentials"
          >
            <b-spinner
              small
              v-if="quickbooksLoading && quickbooksLoading.saveCredentials"
              class="mr-1"
            />
            Save
          </b-button>
        </template>
      </b-form>
    </b-modal>

    <b-modal
      :id="quickbooksSummaryModalId"
      v-model="quickbooksModals.summary"
      title="Export Summary to QuickBooks"
      size="lg"
      @hidden="resetQuickbooksSummaryForm"
    >
      <b-form @submit.prevent="submitQuickbooksSummary">
        <b-form-group label="Revenue Account ID" label-for="qb-revenue-account" label-cols-md="4">
          <b-form-input
            id="qb-revenue-account"
            v-model="quickbooksForms.summary.revenueAccountId"
            required
          />
        </b-form-group>

        <b-form-group label="Offset Account ID" label-for="qb-offset-account" label-cols-md="4">
          <b-form-input
            id="qb-offset-account"
            v-model="quickbooksForms.summary.offsetAccountId"
            required
          />
        </b-form-group>

        <b-form-group label="Pending Account ID" label-for="qb-pending-account" label-cols-md="4">
          <b-form-input
            id="qb-pending-account"
            v-model="quickbooksForms.summary.pendingAccountId"
            placeholder="Optional"
          />
        </b-form-group>

        <b-form-group label="Deposits Account ID" label-for="qb-deposits-account" label-cols-md="4">
          <b-form-input
            id="qb-deposits-account"
            v-model="quickbooksForms.summary.depositsAccountId"
            placeholder="Optional"
          />
        </b-form-group>

        <b-form-group label="Transaction Date" label-for="qb-summary-date" label-cols-md="4">
          <b-form-input
            id="qb-summary-date"
            type="date"
            v-model="quickbooksForms.summary.txnDate"
          />
        </b-form-group>

        <b-form-group label="Memo" label-for="qb-summary-memo" label-cols-md="4">
          <b-form-textarea
            id="qb-summary-memo"
            rows="2"
            v-model="quickbooksForms.summary.memo"
            placeholder="Optional memo describing this export"
          />
        </b-form-group>

        <template #modal-footer>
          <b-button variant="outline-secondary" @click="closeQuickbooksModal('summary')">
            Cancel
          </b-button>
          <b-button
            variant="primary"
            :disabled="quickbooksLoading && quickbooksLoading.exportSummary"
            @click="submitQuickbooksSummary"
          >
            <b-spinner
              small
              v-if="quickbooksLoading && quickbooksLoading.exportSummary"
              class="mr-1"
            />
            Export
          </b-button>
        </template>
      </b-form>
    </b-modal>

    <b-modal
      :id="quickbooksDetailedModalId"
      v-model="quickbooksModals.detailed"
      title="Export Detailed Transactions"
      size="xl"
      @hidden="resetQuickbooksDetailedForm"
    >
      <b-form @submit.prevent="submitQuickbooksDetailed">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Start Date" label-for="qb-detailed-start">
              <b-form-input
                id="qb-detailed-start"
                type="date"
                v-model="quickbooksForms.detailed.start"
              />
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="End Date" label-for="qb-detailed-end">
              <b-form-input
                id="qb-detailed-end"
                type="date"
                v-model="quickbooksForms.detailed.end"
              />
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Payment Method" label-for="qb-detailed-method">
              <b-form-select
                id="qb-detailed-method"
                v-model="quickbooksForms.detailed.paymentMethod"
                :options="[
                  { value: '', text: 'All' },
                  { value: 'CASH', text: 'Cash' },
                  { value: 'CARD', text: 'Card' },
                  { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
                  { value: 'MOBILE_MONEY', text: 'Mobile Money' },
                  { value: 'INSURANCE', text: 'Insurance' },
                  { value: 'DEPOSIT', text: 'Deposit' },
                ]"
              />
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Payment Status" label-for="qb-detailed-status">
              <b-form-select
                id="qb-detailed-status"
                v-model="quickbooksForms.detailed.status"
                :options="[
                  { value: '', text: 'All' },
                  { value: 'PENDING', text: 'Pending' },
                  { value: 'PAID', text: 'Paid' },
                  { value: 'PARTIAL', text: 'Partial' },
                  { value: 'REFUNDED', text: 'Refunded' },
                ]"
              />
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Search Term" label-for="qb-detailed-search">
              <b-form-input
                id="qb-detailed-search"
                v-model="quickbooksForms.detailed.search"
                placeholder="Reference, patient name or phone (optional)"
              />
            </b-form-group>
          </div>
          <div class="col-md-3">
            <b-form-group label="Page" label-for="qb-detailed-page">
              <b-form-input
                id="qb-detailed-page"
                type="number"
                min="1"
                v-model.number="quickbooksForms.detailed.currentPage"
              />
            </b-form-group>
          </div>
          <div class="col-md-3">
            <b-form-group label="Page Limit" label-for="qb-detailed-limit">
              <b-form-input
                id="qb-detailed-limit"
                type="number"
                min="1"
                max="100"
                v-model.number="quickbooksForms.detailed.pageLimit"
              />
            </b-form-group>
          </div>
        </div>

        <b-form-group
          label="Memo Prefix"
          label-for="qb-detailed-memo"
          description="Each journal entry will use this prefix followed by payment details."
        >
          <b-form-input
            id="qb-detailed-memo"
            v-model="quickbooksForms.detailed.memoPrefix"
            placeholder="EHMRS Payment"
          />
        </b-form-group>

        <b-form-group label="Credit Account ID" label-for="qb-credit-account">
          <b-form-input
            id="qb-credit-account"
            v-model="quickbooksForms.detailed.creditAccountId"
            required
          />
        </b-form-group>

        <b-form-group
          label="Debit Account IDs"
          description="Provide account IDs for payment methods. At minimum, the default debit account is required."
        >
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Default Debit Account" label-for="qb-debit-default">
                <b-form-input
                  id="qb-debit-default"
                  v-model="quickbooksForms.detailed.debitAccounts.default"
                  required
                />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Cash" label-for="qb-debit-cash">
                <b-form-input
                  id="qb-debit-cash"
                  v-model="quickbooksForms.detailed.debitAccounts.CASH"
                  placeholder="Optional"
                />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Card" label-for="qb-debit-card">
                <b-form-input
                  id="qb-debit-card"
                  v-model="quickbooksForms.detailed.debitAccounts.CARD"
                  placeholder="Optional"
                />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Bank Transfer" label-for="qb-debit-transfer">
                <b-form-input
                  id="qb-debit-transfer"
                  v-model="quickbooksForms.detailed.debitAccounts.BANK_TRANSFER"
                  placeholder="Optional"
                />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Mobile Money" label-for="qb-debit-mobile">
                <b-form-input
                  id="qb-debit-mobile"
                  v-model="quickbooksForms.detailed.debitAccounts.MOBILE_MONEY"
                  placeholder="Optional"
                />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Insurance" label-for="qb-debit-insurance">
                <b-form-input
                  id="qb-debit-insurance"
                  v-model="quickbooksForms.detailed.debitAccounts.INSURANCE"
                  placeholder="Optional"
                />
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Deposit" label-for="qb-debit-deposit">
                <b-form-input
                  id="qb-debit-deposit"
                  v-model="quickbooksForms.detailed.debitAccounts.DEPOSIT"
                  placeholder="Optional"
                />
              </b-form-group>
            </div>
          </div>
        </b-form-group>

        <template #modal-footer>
          <b-button variant="outline-secondary" @click="closeQuickbooksModal('detailed')">
            Cancel
          </b-button>
          <b-button
            variant="primary"
            :disabled="quickbooksLoading && quickbooksLoading.exportDetailed"
            @click="submitQuickbooksDetailed"
          >
            <b-spinner
              small
              v-if="quickbooksLoading && quickbooksLoading.exportDetailed"
              class="mr-1"
            />
            Export
          </b-button>
        </template>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import quickbooksIntegrationMixin from '@/view/mixins/quickbooksIntegrationMixin';

export default {
  name: 'QuickbooksIntegrationCard',
  mixins: [quickbooksIntegrationMixin],
};
</script>

<style scoped>
.quickbooks-integration .card-body {
  padding: 1.5rem;
}

.quickbooks-integration h4 {
  font-weight: 600;
}
</style>

