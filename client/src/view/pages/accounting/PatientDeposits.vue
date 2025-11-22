<template>
  <div class="patient-deposits">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-piggy-bank text-warning mr-3"></i>
        Patient Deposits Management
      </h1>
      <div class="header-actions">
        <b-button variant="warning" @click="showCreateDepositModal">
          <i class="fas fa-plus mr-2"></i>New Deposit
        </b-button>
        <b-button variant="outline-primary" @click="exportDeposits">
          <i class="fas fa-download mr-2"></i>Export
        </b-button>
      </div>
    </div>

    <!-- Enhanced Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-piggy-bank"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ enhancedMetrics.totalDeposits }}</h3>
              <p class="summary-label">Total Deposits</p>
              <small class="summary-count">{{ formatCurrency(enhancedMetrics.totalAmount) }}</small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ enhancedMetrics.activeDeposits }}</h3>
              <p class="summary-label">Active Deposits</p>
              <small class="summary-count">{{
                formatCurrency(enhancedMetrics.activeAmount)
              }}</small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ enhancedMetrics.expiringDeposits }}</h3>
              <p class="summary-label">Expiring Soon</p>
              <small class="summary-count">{{
                formatCurrency(enhancedMetrics.expiringAmount)
              }}</small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ enhancedMetrics.utilizationRate }}%</h3>
              <p class="summary-label">Utilization Rate</p>
              <small class="summary-count">This Period</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Deposit Actions -->
    <div class="quick-actions-section mb-4">
      <div class="card">
        <div class="card-body">
          <h6 class="card-title"><i class="fas fa-bolt mr-2"></i>Quick Deposit Actions</h6>
          <div class="d-flex gap-2 flex-wrap">
            <b-button variant="outline-warning mr-2" @click="viewDepositReports">
              <i class="fas fa-chart-bar mr-2"></i>Deposit Reports
            </b-button>
            <b-button variant="outline-info mr-2" @click="viewReconciliation">
              <i class="fas fa-balance-scale mr-2"></i>Reconciliation
            </b-button>
            <b-button
              variant="outline-primary mr-2"
              :disabled="consolidationLoading"
              @click="openConsolidationModal('dryRun')"
            >
              <i class="fas fa-vial mr-2"></i>Dry-Run Consolidation
            </b-button>
            <b-button
              variant="outline-danger"
              :disabled="consolidationLoading"
              @click="openConsolidationModal('execute')"
            >
              <i class="fas fa-sync-alt mr-2"></i>Execute Consolidation
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Consolidation Report -->
    <div
      class="consolidation-report-section mb-4"
      v-if="consolidationReport.duplicatePatients?.length"
    >
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="fas fa-file-medical mr-2"></i>Deposit Consolidation Health Report
          </h6>
          <b-button
            size="sm"
            variant="outline-secondary"
            :disabled="consolidationLoading"
            @click="loadConsolidationReport"
          >
            <i class="fas fa-sync-alt mr-1" :class="{ 'fa-spin': consolidationLoading }"></i>
            Refresh
          </b-button>
        </div>
        <div class="card-body">
          <div class="row text-center mb-3">
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="metric-value">{{ consolidationReport.duplicateCount }}</div>
              <div class="metric-label">Patients With Duplicates</div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="metric-value">{{ consolidationReport.activeDepositCount }}</div>
              <div class="metric-label">Active Deposit Records</div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="metric-value">{{ consolidationReport.uniqueActivePatientCount }}</div>
              <div class="metric-label">Patients With Active Deposits</div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div
                class="metric-value"
                :class="{
                  'text-success': consolidationReport.isConstraintSatisfied,
                  'text-danger': !consolidationReport.isConstraintSatisfied,
                }"
              >
                <i
                  class="fas mr-1"
                  :class="{
                    'fa-check-circle': consolidationReport.isConstraintSatisfied,
                    'fa-exclamation-triangle': !consolidationReport.isConstraintSatisfied,
                  }"
                ></i>
                {{ consolidationReport.isConstraintSatisfied ? 'Healthy' : 'Action Needed' }}
              </div>
              <div class="metric-label">Constraint Status</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="report-stat">
                <strong>Total Current Balance:</strong>
                {{ formatCurrency(consolidationReport.totalCurrentBalance) }}
              </div>
              <div class="report-stat">
                <strong>Total Initial Amount:</strong>
                {{ formatCurrency(consolidationReport.totalInitialAmount) }}
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="report-stat">
                <strong>Total Recorded Amount:</strong>
                {{ formatCurrency(consolidationReport.totalAmount) }}
              </div>
              <div class="report-stat">
                <strong>Total Refundable Amount:</strong>
                {{ formatCurrency(consolidationReport.totalRefundableAmount) }}
              </div>
            </div>
          </div>

          <div v-if="consolidationReport.duplicatePatients?.length">
            <h6 class="mt-4">Patients Requiring Consolidation Attention</h6>
            <p class="text-muted">
              These patient IDs have multiple active deposit records.
              <span class="d-block">Run the consolidation to resolve.</span>
            </p>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="patientId in consolidationReport.duplicatePatients" :key="patientId">
                    <td>
                      <b-badge variant="warning">{{ patientId }}</b-badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="alert alert-success mb-0">
            <i class="fas fa-check-circle mr-2"></i>
            No duplicate active deposits detected.
          </div>
        </div>
      </div>
    </div>

    <!-- Consolidation Results -->
    <div
      class="consolidation-results-section mb-4"
      v-if="consolidationResults && consolidationResults.length"
    >
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0 d-flex align-items-center">
            <i class="fas fa-clipboard-check mr-2"></i>
            Latest Consolidation Run
          </h6>
          <b-badge :variant="consolidationSummary?.status === 'CONSOLIDATED' ? 'success' : 'info'">
            {{ consolidationSummary?.status || 'COMPLETED' }}
          </b-badge>
        </div>
        <div class="card-body">
          <p class="text-muted mb-3">
            Showing results from the most recent consolidation action.
            <span class="d-block">Dry-run results highlight what would change.</span>
          </p>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead class="thead-light">
                <tr>
                  <th>Patient ID</th>
                  <th>Primary Deposit</th>
                  <th>Consolidated Deposits</th>
                  <th>Transferred Balance</th>
                  <th>Status</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in consolidationResults" :key="`cons-${result.patientId}`">
                  <td>{{ result.patientId }}</td>
                  <td>{{ result.mergedDepositReference || '—' }}</td>
                  <td>
                    <span v-if="result.consolidatedDepositIds?.length">
                      {{ result.consolidatedDepositIds.join(', ') }}
                    </span>
                    <span v-else>—</span>
                  </td>
                  <td>{{ formatCurrency(result.transferredBalance || 0) }}</td>
                  <td>
                    <b-badge
                      :variant="
                        result.status === 'CONSOLIDATED'
                          ? 'success'
                          : result.status === 'DRY_RUN'
                          ? 'primary'
                          : 'secondary'
                      "
                    >
                      {{ result.status || 'N/A' }}
                    </b-badge>
                  </td>
                  <td>{{ result.message || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Patient Search" label-for="patient-search">
                <div class="input-group">
                  <b-form-input
                    id="patient-search"
                    v-model="filters.patientSearch"
                    placeholder="Search by name, ID, or phone..."
                    @input="debounceSearch"
                    :disabled="loading"
                  ></b-form-input>
                  <div class="input-group-append">
                    <b-button variant="outline-secondary" @click="loadDeposits" :disabled="loading">
                      <i class="fas fa-search"></i>
                    </b-button>
                    <span class="input-group-text" v-if="loading">
                      <i class="fas fa-spinner fa-spin"></i>
                    </span>
                  </div>
                </div>
                <small class="form-text text-muted">
                  Search by patient name, hospital ID, or phone number
                </small>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Status" label-for="status-filter">
                <b-form-select
                  id="status-filter"
                  v-model="filters.status"
                  :options="statusOptions"
                  @change="loadDeposits"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Type" label-for="type-filter">
                <b-form-select
                  id="type-filter"
                  v-model="filters.type"
                  :options="typeOptions"
                  @change="loadDeposits"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Date Range" label-for="date-filter">
                <b-form-input
                  id="date-filter"
                  v-model="filters.dateRange"
                  type="date"
                  @change="loadDeposits"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <label>&nbsp;</label>
              <div class="d-flex gap-2">
                <b-button variant="outline-secondary" @click="clearFilters"> Clear All </b-button>
                <b-button
                  variant="outline-warning"
                  @click="clearPatientSearch"
                  v-if="filters.patientSearch"
                >
                  Clear Search
                </b-button>
                <b-button variant="primary" @click="loadDeposits"> Search </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposits Table -->
    <div class="deposits-table-section">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Deposits List</h6>
          <div class="d-flex align-items-center">
            <span v-if="filters.patientSearch" class="text-muted mr-2">
              <i class="fas fa-search mr-1"></i>
              Search results: {{ totalRows }} deposits found
            </span>
            <span v-else class="text-muted">
              <i class="fas fa-list mr-1"></i>
              Total: {{ totalRows }} deposits
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Reference #</th>
                  <th>Patient</th>
                  <th>Initial Amount</th>
                  <th>Current Balance</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="deposits.length === 0 && !loading">
                  <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <p class="mb-2">
                      <strong>No deposits found</strong>
                    </p>
                    <p v-if="filters.patientSearch" class="mb-0">
                      No deposits found for patient search: "{{ filters.patientSearch }}"
                    </p>
                    <p v-else class="mb-0">Try adjusting your filters or create a new deposit</p>
                  </td>
                </tr>
                <tr v-else-if="loading">
                  <td colspan="7" class="text-center py-4">
                    <b-spinner variant="primary" label="Loading..."></b-spinner>
                    <p class="mt-2">Loading deposits...</p>
                  </td>
                </tr>
                <tr v-else v-for="deposit in deposits" :key="deposit.id">
                  <td>
                    <strong>{{ deposit.reference_number }}</strong>
                  </td>
                  <td>
                    <div class="patient-info">
                      <div class="patient-name">
                        {{ deposit.patient?.firstname }} {{ deposit.patient?.lastname }}
                      </div>
                      <small class="patient-number">{{ deposit.patient?.hospital_id }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="amount">{{ formatCurrency(deposit.initial_amount) }}</span>
                  </td>
                  <td>
                    <span class="amount">{{ formatCurrency(deposit.current_balance) }}</span>
                  </td>
                  <td>
                    <b-badge :variant="getDepositTypeVariant(deposit.deposit_type)">
                      {{ deposit.deposit_type }}
                    </b-badge>
                  </td>
                  <td>
                    <b-badge :variant="getDepositStatusVariant(deposit.status)">
                      {{ deposit.status }}
                    </b-badge>
                  </td>
                  <td>{{ formatDate(deposit.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <b-button
                        variant="outline-primary"
                        size="sm"
                        @click="viewDeposit(deposit.id)"
                      >
                        <i class="fas fa-eye"></i>
                      </b-button>
                      <b-button
                        variant="outline-warning"
                        size="sm"
                        @click="editDeposit(deposit.id)"
                      >
                        <i class="fas fa-edit"></i>
                      </b-button>
                      <!-- <b-button
                        v-if="deposit.status === 'ACTIVE'"
                        variant="outline-success"
                        size="sm"
                        @click="useDeposit(deposit.id)"
                      >
                        <i class="fas fa-credit-card"></i>
                      </b-button> -->
                      <b-button
                        variant="outline-secondary"
                        size="sm"
                        :disabled="downloadingReceiptId === deposit.id"
                        @click="downloadDepositReceipt(deposit.id)"
                      >
                        <i
                          class="fas"
                          :class="{
                            'fa-spinner fa-spin': downloadingReceiptId === deposit.id,
                            'fa-file-download': downloadingReceiptId !== deposit.id,
                          }"
                        ></i>
                      </b-button>
                      <b-button
                        variant="outline-secondary"
                        size="sm"
                        :disabled="printingReceiptId === deposit.id"
                        @click="printDepositReceipt(deposit.id)"
                      >
                        <i
                          class="fas"
                          :class="{
                            'fa-spinner fa-spin': printingReceiptId === deposit.id,
                            'fa-print': printingReceiptId !== deposit.id,
                          }"
                        ></i>
                      </b-button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-section">
            <Pagination
              :total-pages="pages"
              :total="queriedItems"
              :per-page="perPage"
              :current-page="currentPage"
              @pagechanged="onPageChange"
              @changepagecount="handlePageCount"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Deposit Modal -->
    <b-modal
      v-model="showDepositModal"
      :title="isEditing ? 'Edit Deposit' : 'Create New Deposit'"
      size="lg"
      @ok="saveDeposit"
      @hidden="resetDepositForm"
    >
      <b-form @submit.prevent="saveDeposit">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Patient" label-for="deposit-patient">
              <div class="patient-search-container">
                <div class="input-group">
                  <b-form-input
                    id="deposit-patient-search"
                    autocomplete="off"
                    v-model="patientSearchQuery"
                    placeholder="Search patient by name, ID, or phone..."
                    @input="searchPatients"
                    @focus="showPatientResults = true"
                    required
                  ></b-form-input>
                  <div class="input-group-append" v-if="loadingPatients">
                    <span class="input-group-text">
                      <i class="fas fa-spinner fa-spin"></i>
                    </span>
                  </div>
                </div>

                <!-- Patient Search Results Dropdown -->
                <div
                  v-if="showPatientResults && (filteredPatients.length > 0 || loadingPatients)"
                  class="patient-results-dropdown"
                >
                  <div v-if="loadingPatients" class="patient-result-item text-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>Searching...
                  </div>
                  <div
                    v-else-if="filteredPatients.length > 0"
                    v-for="patient in filteredPatients.slice(0, 10)"
                    :key="patient.id"
                    class="patient-result-item"
                    @click="selectPatient(patient)"
                  >
                    <div class="patient-info">
                      <div class="patient-name">{{ patient.firstname }} {{ patient.lastname }}</div>
                      <div class="patient-details">
                        <small>ID: {{ patient.hospital_id }}</small>
                        <small v-if="patient.phone">• {{ patient.phone }}</small>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="patientSearchQuery.length >= 2"
                    class="patient-result-item text-center text-muted"
                  >
                    No patients found
                  </div>
                </div>

                <!-- Selected Patient Display -->
                <div v-if="selectedPatient" class="selected-patient-display">
                  <div class="selected-patient-info">
                    <strong>{{ selectedPatient.firstname }} {{ selectedPatient.lastname }}</strong>
                    <small class="ml-2">ID: {{ selectedPatient.hospital_id }}</small>
                    <b-button
                      variant="link"
                      size="sm"
                      class="ml-2 text-danger"
                      @click="clearSelectedPatient"
                    >
                      <i class="fas fa-times"></i>
                    </b-button>
                  </div>
                </div>
              </div>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Payment Method" label-for="deposit-payment-method">
              <b-form-select
                id="deposit-payment-method"
                v-model="depositForm.payment_method"
                :options="paymentMethodOptions"
                required
                @change="onPaymentMethodChange"
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Amount" label-for="deposit-amount">
              <b-form-input
                id="deposit-amount"
                v-model.number="depositForm.amount"
                type="number"
                step="0.01"
                min="0"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Payment Reference" label-for="deposit-payment-reference">
              <b-form-input
                id="deposit-payment-reference"
                v-model="depositForm.payment_reference"
                placeholder="Payment reference number (optional)"
                maxlength="100"
              ></b-form-input>
              <small class="form-text text-muted">
                Optional: Bank reference, transaction ID, or receipt number
              </small>
            </b-form-group>
          </div>
        </div>

        <!-- Dynamic Fields Based on Payment Method -->
        <div class="row" v-if="depositForm.payment_method === 'BANK_TRANSFER'">
          <div class="col-md-6">
            <b-form-group label="Bank Account" label-for="deposit-bank-account">
              <b-form-select
                id="deposit-bank-account"
                v-model="depositForm.bank_account_id"
                :options="bankAccountOptions"
                placeholder="Select bank account"
                required
              ></b-form-select>
              <small class="form-text text-muted">
                Required: Select bank account for bank transfer deposits
              </small>
            </b-form-group>
          </div>
        </div>

        <div class="row" v-if="depositForm.payment_method === 'CARD'">
          <div class="col-md-6">
            <b-form-group label="POS Terminal" label-for="deposit-pos-terminal">
              <b-form-select
                id="deposit-pos-terminal"
                v-model="depositForm.pos_terminal_id"
                :options="posTerminalOptions"
                placeholder="Select POS terminal"
                required
              ></b-form-select>
              <small class="form-text text-muted">
                Required: Select POS terminal used for card payment
              </small>
            </b-form-group>
          </div>
        </div>

        <!-- Description Field - Always Last -->
        <div class="row">
          <div class="col-12">
            <b-form-group label="Description" label-for="deposit-description">
              <b-form-textarea
                id="deposit-description"
                v-model="depositForm.description"
                rows="3"
                placeholder="Deposit description or notes..."
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showDepositModal = false"> Cancel </b-button>
        <b-button variant="warning" @click="saveDeposit" :disabled="saving">
          <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
          <span v-else>
            {{ isEditing ? 'Update Deposit' : 'Create Deposit' }}
          </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Use Deposit Modal -->
    <b-modal
      v-model="showUseDepositModal"
      title="Use Deposit for Payment"
      size="lg"
      @ok="processDepositUsage"
      @hidden="resetUsageForm"
    >
      <div v-if="selectedDeposit">
        <div class="deposit-summary mb-4">
          <h6>Deposit Summary</h6>
          <p><strong>Reference:</strong> {{ selectedDeposit.reference_number }}</p>
          <p>
            <strong>Patient:</strong> {{ selectedDeposit.patient?.firstname }}
            {{ selectedDeposit.patient?.lastname }}
          </p>
          <p><strong>Available Amount:</strong> {{ formatCurrency(selectedDeposit.amount) }}</p>
        </div>

        <b-form @submit.prevent="processDepositUsage">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Usage Amount" label-for="usage-amount">
                <b-form-input
                  id="usage-amount"
                  v-model.number="usageForm.amount"
                  type="number"
                  step="0.01"
                  :max="selectedDeposit.amount"
                  min="0"
                  required
                ></b-form-input>
                <small class="form-text text-muted">
                  Maximum: {{ formatCurrency(selectedDeposit.amount) }}
                </small>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Purpose" label-for="usage-purpose">
                <b-form-input
                  id="usage-purpose"
                  v-model="usageForm.purpose"
                  placeholder="What is this payment for?"
                  required
                ></b-form-input>
              </b-form-group>
            </div>
          </div>

          <!-- Bill Selection Section -->
          <div class="row">
            <div class="col-12">
              <b-form-group label="Select Bill to Pay" label-for="bill-selection">
                <div class="bill-selection-container">
                  <div class="input-group">
                    <b-form-input
                      id="bill-search"
                      v-model="billSearchQuery"
                      placeholder="Search bills by bill number, service type, or amount..."
                      @input="searchBills"
                      @focus="showBillResults = true"
                      required
                    ></b-form-input>
                    <div class="input-group-append" v-if="loadingBills">
                      <span class="input-group-text">
                        <i class="fas fa-spinner fa-spin"></i>
                      </span>
                    </div>
                  </div>

                  <!-- Bill Search Results Dropdown -->
                  <div
                    v-if="showBillResults && (filteredBills.length > 0 || loadingBills)"
                    class="bill-results-dropdown"
                  >
                    <div v-if="loadingBills" class="bill-result-item text-center">
                      <i class="fas fa-spinner fa-spin mr-2"></i>Searching bills...
                    </div>
                    <div
                      v-else-if="filteredBills.length > 0"
                      v-for="bill in filteredBills.slice(0, 8)"
                      :key="bill.id"
                      class="bill-result-item"
                      @click="selectBill(bill)"
                    >
                      <div class="bill-info">
                        <div class="bill-number">{{ bill.bill_number }}</div>
                        <div class="bill-details">
                          <small>{{ bill.service_type || 'General Service' }}</small>
                          <small class="bill-amount">{{ formatCurrency(bill.total_amount) }}</small>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="billSearchQuery.length >= 2"
                      class="bill-result-item text-center text-muted"
                    >
                      No bills found
                    </div>
                  </div>

                  <!-- Selected Bill Display -->
                  <div v-if="selectedBill" class="selected-bill-display">
                    <div class="selected-bill-info">
                      <strong>Bill #{{ selectedBill.bill_number }}</strong>
                      <small class="ml-2">{{
                        selectedBill.service_type || 'General Service'
                      }}</small>
                      <small class="ml-2 text-success">{{
                        formatCurrency(selectedBill.total_amount)
                      }}</small>
                      <b-button
                        variant="link"
                        size="sm"
                        class="ml-2 text-danger"
                        @click="clearSelectedBill"
                      >
                        <i class="fas fa-times"></i>
                      </b-button>
                    </div>
                  </div>
                </div>
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <b-form-group label="Notes" label-for="usage-notes">
                <b-form-textarea
                  id="usage-notes"
                  v-model="usageForm.notes"
                  rows="3"
                  placeholder="Additional notes..."
                ></b-form-textarea>
              </b-form-group>
            </div>
          </div>
        </b-form>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showUseDepositModal = false"> Cancel </b-button>
        <b-button
          variant="success"
          @click="processDepositUsage"
          :disabled="processingUsage || !selectedBill"
        >
          <span v-if="processingUsage">
            <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
          </span>
          <span v-else> Use Deposit </span>
        </b-button>
      </template>
    </b-modal>

    <!-- Deposit Usage History Modal -->
    <b-modal
      v-model="showUsageHistoryModal"
      title="Deposit Usage History"
      size="lg"
      @hidden="resetUsageHistory"
    >
      <div v-if="usageHistory.length > 0">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="thead-light">
              <tr>
                <th>Date</th>
                <th>Amount Used</th>
                <th>Purpose</th>
                <th>Bill #</th>
                <th>Processed By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usage in usageHistory" :key="usage.id">
                <td>{{ formatDate(usage.created_at) }}</td>
                <td>{{ formatCurrency(usage.amount) }}</td>
                <td>{{ usage.purpose }}</td>
                <td>{{ usage.bill?.bill_number || 'N/A' }}</td>
                <td>{{ usage.processedBy?.firstname }} {{ usage.processedBy?.lastname }}</td>
                <td>{{ usage.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center">
        <p>No usage history found for this deposit.</p>
      </div>
    </b-modal>

    <!-- Consolidation Modal -->
    <b-modal
      v-model="showConsolidationModal"
      :title="consolidationModalTitle"
      size="md"
      @hidden="resetConsolidationForm"
      :ok-disabled="consolidationSubmitting"
      :ok-title="consolidationOkLabel"
      @ok="handleConsolidationSubmit"
    >
      <b-form @submit.prevent="handleConsolidationSubmit">
        <b-alert v-if="!consolidationForm.dryRun" show variant="danger" class="mb-3">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          This will merge duplicate active deposits for the selected scope.
          <span class="d-block">
            Ensure you have completed a dry-run and reviewed the report before executing.
          </span>
        </b-alert>

        <b-form-group
          label="Patient ID (optional)"
          label-for="consolidation-patient-id"
          description="Provide a specific patient ID to consolidate only that patient. Leave blank to process all duplicates."
        >
          <b-form-input
            id="consolidation-patient-id"
            v-model.number="consolidationForm.patientId"
            type="number"
            min="1"
            placeholder="Enter patient ID"
          ></b-form-input>
        </b-form-group>

        <b-form-group>
          <b-form-checkbox v-model="consolidationForm.dryRun">
            Run as dry-run (no changes applied)
          </b-form-checkbox>
        </b-form-group>

        <b-form-group
          label="Notes"
          label-for="consolidation-notes"
          description="Optional contextual note for this consolidation run."
        >
          <b-form-textarea
            id="consolidation-notes"
            v-model="consolidationForm.notes"
            rows="3"
            placeholder="Document why this consolidation is being executed..."
          ></b-form-textarea>
        </b-form-group>
      </b-form>
      <template #modal-footer>
        <b-button
          variant="secondary"
          @click="showConsolidationModal = false"
          :disabled="consolidationSubmitting"
        >
          Cancel
        </b-button>
        <b-button
          :variant="consolidationForm.dryRun ? 'primary' : 'danger'"
          @click="handleConsolidationSubmit"
          :disabled="consolidationSubmitting"
        >
          <span v-if="consolidationSubmitting">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Processing...
          </span>
          <span v-else>{{ consolidationOkLabel }}</span>
        </b-button>
      </template>
    </b-modal>

    <!-- Export Modal -->
    <b-modal
      v-model="showExportModal"
      title="Export Deposits"
      size="md"
      @ok="executeExport"
      @hidden="resetExportForm"
    >
      <b-form @submit.prevent="executeExport">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Export Format" label-for="export-format">
              <b-form-select
                id="export-format"
                v-model="exportForm.format"
                :options="exportFormatOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Date Range" label-for="export-date-range">
              <b-form-select
                id="export-date-range"
                v-model="exportForm.dateRange"
                :options="exportDateRangeOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Status Filter" label-for="export-status">
              <b-form-select
                id="export-status"
                v-model="exportForm.status"
                :options="exportStatusOptions"
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Type Filter" label-for="export-type">
              <b-form-select
                id="export-type"
                v-model="exportForm.type"
                :options="exportTypeOptions"
              ></b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <b-form-group label="Include Details" label-for="export-include-details">
              <b-form-checkbox
                id="export-include-details"
                v-model="exportForm.includeDetails"
                value="true"
                unchecked-value="false"
              >
                Include detailed information (patient details, payment history, etc.)
              </b-form-checkbox>
            </b-form-group>
          </div>
        </div>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showExportModal = false"> Cancel </b-button>
        <b-button variant="primary" @click="executeExport" :disabled="exporting">
          <span v-if="exporting"> <i class="fas fa-spinner fa-spin mr-2"></i>Exporting... </span>
          <span v-else> Export Deposits </span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import Pagination from '@/utils/Pagination.vue';

export default {
  name: 'PatientDeposits',
  components: {
    Pagination,
  },
  data() {
    return {
      // Loading states
      loading: false,
      loadingPatients: false,
      loadingBills: false, // Added for bill search

      // Filters
      filters: {
        patientSearch: '',
        status: 'ACTIVE',
        type: '',
        dateRange: '',
      },

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Modal and forms
      showDepositModal: false,
      isEditing: false,
      saving: false,
      depositForm: {
        patient_id: null,
        payment_method: 'CASH', // This replaces deposit_type
        amount: 0,
        description: '',
        bank_account_id: null,
        pos_terminal_id: null,
        payment_reference: '',
      },
      selectedDepositData: null, // Store deposit object for editing

      // Usage modal
      showUseDepositModal: false,
      selectedDeposit: null,
      processingUsage: false,
      usageForm: {
        amount: 0,
        purpose: '',
        notes: '',
        bill_id: null, // Added bill_id property
      },

      // Consolidation modal
      showConsolidationModal: false,
      consolidationMode: 'dryRun',
      consolidationSubmitting: false,
      consolidationForm: {
        patientId: null,
        dryRun: true,
        notes: '',
      },

      // Usage history modal
      showUsageHistoryModal: false,
      usageHistory: [],

      // Patient search
      patientSearchQuery: '',
      showPatientResults: false,
      filteredPatients: [],
      selectedPatient: null,

      // Receipt download state
      downloadingReceiptId: null,
      printingReceiptId: null,
      // Bill search
      billSearchQuery: '',
      showBillResults: false,
      filteredBills: [],
      selectedBill: null,

      // Options
      statusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'ACTIVE', text: 'Active' },
        { value: 'USED', text: 'Used' },
        { value: 'REFUNDED', text: 'Refunded' },
      ],
      typeOptions: [
        { value: '', text: 'All Types' },
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'INSURANCE', text: 'Insurance' },
        { value: 'OTHER', text: 'Other' },
      ],
      paymentMethodOptions: [
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'INSURANCE', text: 'Insurance' },
        { value: 'OTHER', text: 'Other' },
      ],
      bankAccountOptions: [
        { value: null, text: 'Select Bank Account' },
        // Will be populated from API
      ],
      posTerminalOptions: [
        { value: null, text: 'Select POS Terminal' },
        // Will be populated from API
      ],

      // Export Modal
      showExportModal: false,
      exporting: false,
      exportForm: {
        format: 'CSV',
        dateRange: 'ALL',
        status: '',
        type: '',
        includeDetails: 'false',
      },
      exportFormatOptions: [
        { value: 'CSV', text: 'CSV' },
        { value: 'Excel', text: 'Excel' },
        { value: 'PDF', text: 'PDF' },
      ],
      exportDateRangeOptions: [
        { value: 'ALL', text: 'All Time' },
        { value: 'LAST_7_DAYS', text: 'Last 7 Days' },
        { value: 'LAST_30_DAYS', text: 'Last 30 Days' },
        { value: 'LAST_90_DAYS', text: 'Last 90 Days' },
        { value: 'LAST_YEAR', text: 'Last Year' },
      ],
      exportStatusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'ACTIVE', text: 'Active' },
        { value: 'USED', text: 'Used' },
        { value: 'REFUNDED', text: 'Refunded' },
      ],
      exportTypeOptions: [
        { value: '', text: 'All Types' },
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'INSURANCE', text: 'Insurance' },
        { value: 'OTHER', text: 'Other' },
      ],
    };
  },
  computed: {
    deposits() {
      return this.$store.getters['accounting/getDeposits'] || [];
    },
    queriedItems() {
      return this.$store.getters['accounting/getDepositsTotal'] || 0;
    },
    pages() {
      return this.$store.getters['accounting/getDepositsPages'] || 0;
    },
    perPage() {
      return this.deposits.length;
    },
    summaryData() {
      return this.$store.getters['accounting/getDepositsSummary'] || {};
    },
    enhancedMetrics() {
      const summary = this.$store.getters['accounting/getDepositsSummary'];
      return (
        summary || {
          totalDeposits: 0,
          totalAmount: 0,
          activeDeposits: 0,
          activeAmount: 0,
          expiringDeposits: 0,
          expiringAmount: 0,
          utilizationRate: 0,
        }
      );
    },
    isLoading() {
      return this.$store.getters['accounting/loading'];
    },
    error() {
      return this.$store.getters['accounting/error'];
    },
    consolidationResults() {
      return this.$store.getters['accounting/getDepositConsolidationResults'] || [];
    },
    consolidationSummary() {
      return this.$store.getters['accounting/getDepositConsolidationSummary'];
    },
    consolidationReport() {
      return this.$store.getters['accounting/getDepositConsolidationReport'];
    },
    consolidationLoading() {
      return this.$store.getters['accounting/isDepositConsolidationLoading'];
    },
    consolidationModalTitle() {
      return this.consolidationMode === 'dryRun'
        ? 'Dry-Run Deposit Consolidation'
        : 'Execute Deposit Consolidation';
    },
    consolidationOkLabel() {
      return this.consolidationForm.dryRun ? 'Run Dry-Run' : 'Consolidate Deposits';
    },
  },
  watch: {
    showDepositModal(val) {
      if (!val) return;
      if (!this.selectedDepositData || Object.entries(this.selectedDepositData).length === 0) {
        // Create mode - reset form
        this.resetDepositForm();
      } else {
        // Edit mode - populate form from deposit object
        const deposit = this.selectedDepositData;
        this.depositForm = {
          patient_id: deposit.patient_id,
          payment_method: deposit.payment_method || deposit.deposit_type || 'CASH',
          amount: deposit.initial_amount || deposit.amount || deposit.current_balance || 0,
          description: deposit.description || '',
          bank_account_id: deposit.bank_account_id || null,
          pos_terminal_id: deposit.pos_terminal_id || null,
          payment_reference: deposit.payment_reference || '',
        };

        // Load patient info for display
        if (deposit.patient) {
          this.selectedPatient = deposit.patient;
          this.patientSearchQuery = `${deposit.patient.firstname} ${deposit.patient.lastname}`;
        }
      }
    },
  },
  async mounted() {
    await this.loadDeposits();
    await this.loadSummary();
    await this.loadEnhancedMetrics();
    await this.loadOptions();
    await this.loadConsolidationReport();

    // Add click outside listener to close patient results
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    // Clean up event listener
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    handlePageCount(count) {
      this.itemsPerPage = count;
      this.loadDeposits();
    },

    async loadDeposits() {
      try {
        // Map client filters to server-expected parameters
        const serverParams = {
          page: this.currentPage,
          limit: this.itemsPerPage,
        };

        // Only include valid server parameters
        if (this.filters.status) serverParams.status = this.filters.status;
        if (this.filters.type) serverParams.deposit_type = this.filters.type;
        if (this.filters.dateRange) serverParams.start_date = this.filters.dateRange;

        // Handle patient search - send to server for processing
        if (this.filters.patientSearch && this.filters.patientSearch.trim()) {
          serverParams.patient_search = this.filters.patientSearch.trim();
        }

        await this.$store.dispatch('accounting/fetchDeposits', serverParams);
      } catch (error) {
        console.error('Failed to load deposits:', error);
        this.$bvToast.toast('Failed to load deposits', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async loadSummary() {
      try {
        // Use Vuex store action for summary
        await this.$store.dispatch('accounting/fetchAccountingSummary');
        // The action will automatically update the store state
      } catch (error) {
        console.error('Failed to load summary:', error);
      }
    },

    async loadEnhancedMetrics() {
      try {
        // Load enhanced deposit metrics for detailed overview
        const response = await this.$store.dispatch('accounting/fetchDepositsSummary');

        if (response && response.success) {
          // The action will automatically update the store state
          console.log('Enhanced metrics loaded successfully');
        } else {
          console.warn('Failed to load enhanced metrics:', response?.error);
        }
      } catch (error) {
        console.error('Failed to load enhanced metrics:', error);
        // Don't show error toast for metrics - it's not critical
      }
    },

    async loadOptions() {
      try {
        // Initialize with empty options - patients will be searched dynamically
        this.filteredPatients = [];

        // Load bank account and POS terminal options
        await Promise.all([this.loadBankAccountOptions(), this.loadPOSTerminalOptions()]);
      } catch (error) {
        console.error('Failed to load options:', error);
      }
    },

    async loadConsolidationReport() {
      try {
        await this.$store.dispatch('accounting/fetchDepositConsolidationReport');
      } catch (error) {
        console.error('Failed to load consolidation report:', error);
        this.$bvToast.toast('Unable to load deposit consolidation report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async loadBankAccountOptions() {
      try {
        const response = await this.$store.dispatch('accounting/getBankAccounts', { limit: 100 });
        if (response && response.data) {
          this.bankAccountOptions = [
            { value: null, text: 'Select Bank Account' },
            ...response.data.map((account) => ({
              value: account.id,
              text: `${account.account_name} (${account.account_number})`,
            })),
          ];
        }
      } catch (error) {
        console.error('Failed to load bank account options:', error);
      }
    },

    async loadPOSTerminalOptions() {
      try {
        const response = await this.$store.dispatch('accounting/getPOSTerminals', { limit: 100 });
        if (response && response.data) {
          this.posTerminalOptions = [
            { value: null, text: 'Select POS Terminal' },
            ...response.data.map((terminal) => ({
              value: terminal.id,
              text: `${terminal.terminal_id} (${terminal.terminal_type})`,
            })),
          ];
        }
      } catch (error) {
        console.error('Failed to load POS terminal options:', error);
      }
    },

    onPaymentMethodChange() {
      // Clear dependent fields when payment method changes
      if (this.depositForm.payment_method !== 'BANK_TRANSFER') {
        this.depositForm.bank_account_id = null;
      }
      if (this.depositForm.payment_method !== 'CARD') {
        this.depositForm.pos_terminal_id = null;
      }
    },

    debounceSearchPatients: debounce(async (search, vm) => {
      vm.patientSearchQuery = search;

      try {
        vm.loadingPatients = true;
        // Search patients using Vuex store
        const response = await vm.$store.dispatch('patient/fetchPatients', {
          currentPage: 1,
          itemsPerPage: 20,
          search: vm.patientSearchQuery,
          filter: {},
        });

        if (response && response.data && response.data.data) {
          vm.filteredPatients = response.data.data.docs || [];
          vm.showPatientResults = true;
        } else {
          vm.filteredPatients = [];
        }
      } catch (error) {
        console.error('Failed to search patients:', error);
        vm.filteredPatients = [];
        this.$bvToast.toast('Failed to search patients', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        vm.loadingPatients = false;
      }
    }, 500),

    // Patient search methods
    async searchPatients() {
      if (!this.patientSearchQuery || this.patientSearchQuery.length < 2) {
        this.filteredPatients = [];
        this.showPatientResults = false;
        return;
      }

      this.debounceSearchPatients(this.patientSearchQuery, this);
    },

    selectPatient(patient) {
      this.selectedPatient = patient;
      this.depositForm.patient_id = patient.id;
      this.patientSearchQuery = `${patient.firstname} ${patient.lastname}`;
      this.showPatientResults = false;
      this.filteredPatients = [];
    },

    clearSelectedPatient() {
      this.selectedPatient = null;
      this.depositForm.patient_id = null;
      this.patientSearchQuery = '';
      this.showPatientResults = false;
      this.filteredPatients = [];
    },

    handleClickOutside(event) {
      const container = document.querySelector('.patient-search-container');
      if (container && !container.contains(event.target)) {
        this.showPatientResults = false;
      }
    },

    // Modal actions
    showCreateDepositModal() {
      this.isEditing = false;
      this.selectedDepositData = null;
      this.showDepositModal = true;
    },

    openConsolidationModal(mode = 'dryRun') {
      this.consolidationMode = mode;
      this.consolidationForm = {
        patientId: null,
        dryRun: mode === 'dryRun',
        notes: '',
      };
      this.showConsolidationModal = true;
    },

    editDeposit(depositId) {
      const deposit = this.deposits.find((d) => d.id === depositId);
      if (deposit) {
        this.selectedDepositData = JSON.parse(JSON.stringify(deposit));
        this.isEditing = true;
        this.showDepositModal = true;
      }
    },

    async saveDeposit() {
      try {
        // Validate required fields
        if (!this.depositForm.patient_id) {
          this.$bvToast.toast('Please select a patient', {
            title: 'Validation Error',
            variant: 'warning',
            solid: true,
          });
          return;
        }

        if (!this.depositForm.amount || this.depositForm.amount <= 0) {
          this.$bvToast.toast('Please enter a valid amount', {
            title: 'Validation Error',
            variant: 'warning',
            solid: true,
          });
          return;
        }

        // Validate payment method specific fields
        if (
          this.depositForm.payment_method === 'BANK_TRANSFER' &&
          !this.depositForm.bank_account_id
        ) {
          this.$bvToast.toast('Please select a bank account for bank transfer', {
            title: 'Validation Error',
            variant: 'warning',
            solid: true,
          });
          return;
        }

        if (this.depositForm.payment_method === 'CARD' && !this.depositForm.pos_terminal_id) {
          this.$bvToast.toast('Please select a POS terminal for card payment', {
            title: 'Validation Error',
            variant: 'warning',
            solid: true,
          });
          return;
        }

        this.saving = true;

        // Prepare deposit data with required fields
        const depositData = {
          ...this.depositForm,
          deposit_type: this.depositForm.payment_method, // Map payment_method to deposit_type for server
        };

        let result;
        if (this.isEditing) {
          result = await this.$store.dispatch('accounting/updateDeposit', {
            id: this.selectedDepositData.id,
            depositData: depositData,
          });
          if (result.success) {
            this.$bvToast.toast('Deposit updated successfully', {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
          }
        } else {
          result = await this.$store.dispatch('accounting/createDeposit', depositData);
          if (result.success) {
            this.$bvToast.toast('Deposit created successfully', {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
          }
        }

        if (result.success) {
          this.showDepositModal = false;
          this.resetForm();
          await this.loadDeposits(); // Refresh the deposits list
          await this.loadSummary();
        } else {
          this.$bvToast.toast(result.error || 'Failed to save deposit', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to save deposit:', error);
        this.$bvToast.toast(error.message || 'Failed to save deposit', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    // Usage functionality
    useDeposit(depositId) {
      this.selectedDeposit = this.deposits.find((d) => d.id === depositId);
      this.usageForm.amount = this.selectedDeposit.amount;
      this.showUseDepositModal = true;
    },

    async processDepositUsage() {
      try {
        this.processingUsage = true;

        const usageData = {
          deposit_id: this.selectedDeposit.id,
          amount: this.usageForm.amount,
          bill_id: this.selectedBill?.id || 0, // Use selectedBill.id if available, otherwise 0
          description: this.usageForm.purpose,
          used_by: this.$store.state.user?.id || 1,
        };

        // Use Vuex store action
        await this.$store.dispatch('accounting/useDeposit', usageData);

        this.$bvToast.toast('Deposit used successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.showUseDepositModal = false;
        await this.loadDeposits();
        await this.loadSummary();
      } catch (error) {
        console.error('Failed to use deposit:', error);
        this.$bvToast.toast('Failed to use deposit', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.processingUsage = false;
      }
    },

    // Usage history
    async viewUsage(depositId) {
      try {
        // Use Vuex store action
        this.usageHistory = await this.$store.dispatch(
          'accounting/getDepositUsageHistory',
          depositId
        );
        this.showUsageHistoryModal = true;
      } catch (error) {
        console.error('Failed to load usage history:', error);
      }
    },

    // Navigation methods
    viewDeposit(depositId) {
      this.$router.push({ name: 'deposit-details', params: { id: depositId } });
    },

    viewAllDeposits() {
      // Already on deposits page, just refresh
      this.loadDeposits();
    },

    viewDepositReports() {
      this.$router.push({ name: 'deposit-reports' });
    },

    viewReconciliation() {
      this.$router.push({ name: 'deposit-reconciliation' });
    },

    // Form resets
    resetDepositForm() {
      this.depositForm = {
        patient_id: null,
        payment_method: 'CASH',
        amount: 0,
        description: '',
        bank_account_id: null,
        pos_terminal_id: null,
        payment_reference: '',
      };
      this.isEditing = false;
      this.selectedDepositData = null;
      this.clearSelectedPatient();
    },

    resetUsageForm() {
      this.usageForm = {
        amount: 0,
        purpose: '',
        notes: '',
        bill_id: null, // Reset bill_id
      };
      this.selectedDeposit = null;
      this.selectedBill = null; // Clear selected bill
      this.billSearchQuery = ''; // Clear bill search query
      this.showBillResults = false; // Hide bill results
    },

    resetUsageHistory() {
      this.usageHistory = [];
    },

    resetForm() {
      this.resetDepositForm();
    },

    resetConsolidationForm() {
      this.consolidationForm = {
        patientId: null,
        dryRun: true,
        notes: '',
      };
      this.consolidationSubmitting = false;
    },

    // Filter methods
    clearFilters() {
      this.filters = {
        patientSearch: '',
        status: '',
        type: '',
        dateRange: '',
      };
      this.loadDeposits();
    },

    clearPatientSearch() {
      this.filters.patientSearch = '';
      this.loadDeposits();
    },

    debounceSearch: debounce(function () {
      this.loadDeposits();
    }, 500),

    onPageChange(page) {
      this.currentPage = page;
      this.loadDeposits();
    },

    onPatientChange() {
      // Could load patient-specific information here
    },

    async handleConsolidationSubmit() {
      if (this.consolidationSubmitting) return;

      try {
        this.consolidationSubmitting = true;

        const payload = {
          dryRun: !!this.consolidationForm.dryRun,
        };

        const patientIdValue = this.consolidationForm.patientId;
        if (
          typeof patientIdValue === 'number' &&
          Number.isFinite(patientIdValue) &&
          patientIdValue > 0
        ) {
          payload.patientId = patientIdValue;
        }

        const response = await this.$store.dispatch('accounting/consolidateDeposits', payload);
        const isSuccess = response?.success !== false;

        if (!isSuccess) {
          this.$bvToast.toast(response?.message || 'Failed to run consolidation', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          return;
        }

        const toastMessage = payload.dryRun
          ? 'Dry-run consolidation completed. Review the results below.'
          : 'Deposit consolidation executed successfully.';

        this.$bvToast.toast(toastMessage, {
          title: payload.dryRun ? 'Dry-Run Complete' : 'Consolidation Complete',
          variant: payload.dryRun ? 'primary' : 'success',
          solid: true,
        });

        if (!payload.dryRun) {
          await Promise.all([this.loadDeposits(), this.loadSummary()]);
        }

        await this.loadConsolidationReport();

        this.showConsolidationModal = false;
        this.resetConsolidationForm();
      } catch (error) {
        console.error('Failed to run deposit consolidation:', error);
        this.$bvToast.toast(error.message || 'Failed to run deposit consolidation', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.consolidationSubmitting = false;
      }
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-NG');
    },

    getDepositTypeVariant(type) {
      const variants = {
        CASH: 'success',
        BANK_TRANSFER: 'info',
        CARD: 'primary',
        MOBILE_MONEY: 'warning',
        OTHER: 'secondary',
      };
      return variants[type] || 'secondary';
    },

    getDepositStatusVariant(status) {
      const variants = {
        ACTIVE: 'success',
        USED: 'info',
        REFUNDED: 'warning',
        EXPIRED: 'danger',
      };
      return variants[status] || 'secondary';
    },

    getExpiryDateClass(expiryDate) {
      if (!expiryDate) return '';

      const today = new Date();
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) return 'text-danger'; // Expired
      if (daysUntilExpiry <= 7) return 'text-warning'; // Expiring soon
      return 'text-success'; // Valid
    },

    exportDeposits() {
      this.showExportModal = true;
    },

    // Bill search methods
    async searchBills() {
      if (!this.billSearchQuery || this.billSearchQuery.length < 2) {
        this.filteredBills = [];
        this.showBillResults = false;
        return;
      }

      this.debounceSearchBills(this.billSearchQuery, this);
    },

    debounceSearchBills: debounce(async (search, vm) => {
      vm.billSearchQuery = search;

      try {
        vm.loadingBills = true;
        // Search bills using Vuex store
        const response = await vm.$store.dispatch('billing/fetchBills', {
          currentPage: 1,
          itemsPerPage: 20,
          search: vm.billSearchQuery,
          filter: {},
        });

        if (response && response.data && response.data.data) {
          vm.filteredBills = response.data.data.docs || [];
          vm.showBillResults = true;
        } else {
          vm.filteredBills = [];
        }
      } catch (error) {
        console.error('Failed to search bills:', error);
        vm.filteredBills = [];
        this.$bvToast.toast('Failed to search bills', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        vm.loadingBills = false;
      }
    }, 500),

    selectBill(bill) {
      this.selectedBill = bill;
      this.usageForm.bill_id = bill.id; // Store the selected bill ID
      this.billSearchQuery = `${bill.bill_number}`;
      this.showBillResults = false;
      this.filteredBills = [];
    },

    clearSelectedBill() {
      this.selectedBill = null;
      this.usageForm.bill_id = 0; // Reset to 0 or null if no bill is selected
      this.billSearchQuery = '';
      this.showBillResults = false;
      this.filteredBills = [];
    },

    // Export functionality
    async executeExport() {
      try {
        this.exporting = true;
        const params = {
          format: this.exportForm.format,
          date_range: this.exportForm.dateRange,
          status: this.exportForm.status,
          type: this.exportForm.type,
          include_details: this.exportForm.includeDetails,
        };

        const result = await this.$store.dispatch('accounting/exportDeposits', params);

        if (result.success) {
          this.$bvToast.toast('Deposits exported successfully!', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.showExportModal = false;
          this.resetExportForm();
        } else {
          this.$bvToast.toast(result.error || 'Failed to export deposits', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to execute export:', error);
        this.$bvToast.toast(error.message || 'Failed to export deposits', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.exporting = false;
      }
    },

    resetExportForm() {
      this.exportForm = {
        format: 'CSV',
        dateRange: 'ALL',
        status: '',
        type: '',
        includeDetails: 'false',
      };
    },

    async downloadDepositReceipt(depositId) {
      if (this.downloadingReceiptId) {
        return;
      }

      this.downloadingReceiptId = depositId;
      try {
        const result = await this.$store.dispatch('accounting/downloadDepositReceipt', depositId);

        if (result.success) {
          this.$bvToast.toast('Deposit receipt downloaded successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          this.$bvToast.toast(result.error || 'Failed to download deposit receipt', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to download deposit receipt:', error);
        this.$bvToast.toast('Failed to download deposit receipt', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.downloadingReceiptId = null;
      }
    },

    async printDepositReceipt(depositId) {
      if (this.printingReceiptId) {
        return;
      }

      this.printingReceiptId = depositId;
      try {
        const result = await this.$store.dispatch('accounting/printDepositReceipt', depositId);
        if (result.success) {
          this.$bvToast.toast('Deposit receipt printed successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          this.$bvToast.toast(result.error || 'Failed to print deposit receipt', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to print deposit receipt:', error);
        this.$bvToast.toast('Failed to print deposit receipt', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.printingReceiptId = null;
      }
    },
  },
};
</script>

<style scoped>
.patient-deposits {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.summary-label {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.summary-count {
  font-size: 0.875rem;
  opacity: 0.8;
}

.filters-section {
  margin-bottom: 2rem;
}

.deposits-table-section {
  margin-bottom: 2rem;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
}

.patient-number {
  color: #6c757d;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* Quick Actions Section */
.quick-actions-section {
  margin-bottom: 2rem;
}

.quick-actions-section .card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-actions-section .card-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

.quick-actions-section .btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quick-actions-section .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.consolidation-report-section .metric-value,
.consolidation-results-section .metric-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.consolidation-report-section .metric-label {
  font-size: 0.9rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.report-stat {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.consolidation-results-section .card-header {
  border-bottom: 1px solid #e9ecef;
}

.consolidation-results-section table td {
  vertical-align: middle;
}

.deposit-summary {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.deposit-summary h6 {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.deposit-summary p {
  margin-bottom: 0.5rem;
}

/* Patient Search Styles */
.patient-search-container {
  position: relative;
}

/* Enhanced Filter Styles */
.filters-section .input-group-append .input-group-text {
  background-color: #f8f9fa;
  border-left: none;
}

.filters-section .form-text {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Card Header Styling */
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.25rem;
}

.card-header h6 {
  color: #495057;
  font-weight: 600;
}

/* Form Field Styling */
.form-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.form-group label {
  font-weight: 500;
  color: #495057;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Dynamic Form Fields */
.row[v-if] {
  transition: all 0.3s ease;
}

.row[v-if] .form-group {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Required Field Indicators */
.form-group label.required::after {
  content: ' *';
  color: #dc3545;
  font-weight: bold;
}

/* No Results Styling */
.text-muted .fas {
  color: #6c757d;
  opacity: 0.6;
}

.text-muted p {
  margin-bottom: 0.5rem;
}

.text-muted p:last-child {
  margin-bottom: 0;
}

.patient-search-container .input-group {
  position: relative;
}

.patient-search-container .input-group-append .input-group-text {
  background-color: #f8f9fa;
  border-left: none;
}

.patient-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.patient-result-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.patient-result-item:hover {
  background-color: #f8f9fa;
}

.patient-result-item:last-child {
  border-bottom: none;
}

.patient-info .patient-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.patient-info .patient-details {
  color: #6c757d;
  font-size: 0.875rem;
}

.patient-info .patient-details small {
  margin-right: 0.5rem;
}

.selected-patient-display {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 6px;
}

.selected-patient-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-patient-info strong {
  color: #155724;
}

.selected-patient-info small {
  color: #6c757d;
}

/* Bill Search Styles */
.bill-selection-container {
  position: relative;
}

.bill-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.bill-result-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bill-result-item:hover {
  background-color: #f8f9fa;
}

.bill-result-item:last-child {
  border-bottom: none;
}

.bill-info .bill-number {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.bill-info .bill-details {
  color: #6c757d;
  font-size: 0.875rem;
}

.bill-info .bill-amount {
  font-weight: 600;
  color: #28a745;
}

.selected-bill-display {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 6px;
}

.selected-bill-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-bill-info strong {
  color: #155724;
}

.selected-bill-info small {
  color: #6c757d;
}

@media (max-width: 768px) {
  .patient-deposits {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
