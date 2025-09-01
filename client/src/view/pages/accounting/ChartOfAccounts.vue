<template>
  <div class="chart-of-accounts">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-sitemap text-primary mr-3"></i>
          Chart of Accounts
        </h1>
        <p class="page-subtitle">
          Manage your hierarchical account structure with advanced categorization and budget
          allocation
        </p>
      </div>
      <div class="header-actions">
        <b-button variant="outline-info" @click="getSystemAccountsSummary">
          <i class="fas fa-chart-pie mr-2"></i>System Summary
        </b-button>
        <b-button variant="outline-primary" @click="exportAccounts">
          <i class="fas fa-download mr-2"></i>Export
        </b-button>
        <b-button variant="primary" @click="showCreateModal">
          <i class="fas fa-plus mr-2"></i>New Account
        </b-button>
        <b-button
          variant="outline-secondary"
          @click="showChartOfAccountsHelp"
          title="Get help with Chart of Accounts"
        >
          <i class="fas fa-question-circle mr-2"></i>Help
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-sitemap"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData?.totalAccounts || 0 }}</h3>
              <p class="summary-label">Total Accounts</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData?.activeAccounts || 0 }}</h3>
              <p class="summary-label">Active Accounts</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData?.hierarchicalLevels }}</h3>
              <p class="summary-label">Hierarchy Levels</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData?.accountsNeedingReview }}</h3>
              <p class="summary-label">Need Review</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation and Conflict Resolution Section -->
    <div class="validation-section">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-shield-alt mr-2"></i>
            Account Validation & Conflict Resolution
          </h5>
          <div class="validation-actions">
            <b-button variant="outline-info" size="sm" @click="quickValidationCheck">
              <i class="fas fa-bolt mr-1"></i>Quick Check
            </b-button>
            <b-button variant="outline-warning" size="sm" @click="validateAllAccounts">
              <i class="fas fa-search mr-1"></i>Full Validation
            </b-button>
            <b-button variant="outline-success" size="sm" @click="getValidationStatistics">
              <i class="fas fa-chart-bar mr-1"></i>Statistics
            </b-button>
            <b-button variant="outline-primary" size="sm" @click="getSystemWideConflictSummary">
              <i class="fas fa-globe mr-1"></i>System Summary
            </b-button>
            <b-button
              variant="outline-info"
              size="sm"
              @click="showValidationHelp"
              title="Get help with validation"
            >
              <i class="fas fa-question-circle mr-1"></i>Help
            </b-button>
            <b-button
              variant="outline-danger"
              size="sm"
              @click="clearAllValidationData"
              title="Clear all validation data"
            >
              <i class="fas fa-trash mr-1"></i>Clear All
            </b-button>
            <b-button
              variant="outline-primary"
              size="sm"
              @click="exportValidationReport"
              title="Export validation report"
            >
              <i class="fas fa-download mr-1"></i>Export Report
            </b-button>
          </div>
        </div>
        <div class="card-body">
          <!-- Quick Validation Result -->
          <div v-if="quickValidationResult" class="validation-result mb-3">
            <div
              class="alert"
              :class="getValidationAlertClass(quickValidationResult.overall_status)"
            >
              <h6 class="alert-heading">
                <i class="fas fa-info-circle mr-2"></i>
                Quick Validation Result
              </h6>
              <p class="mb-2">
                <strong>Status:</strong> {{ quickValidationResult.overall_status }}
              </p>
              <p class="mb-2">
                <strong>Accounts Checked:</strong> {{ quickValidationResult.accounts_checked }}
              </p>
              <p
                class="mb-0"
                v-if="quickValidationResult.warnings && quickValidationResult.warnings.length > 0"
              >
                <strong>Warnings:</strong> {{ quickValidationResult.warnings.length }}
              </p>
            </div>
          </div>

          <!-- Validation Statistics -->
          <div v-if="validationStatistics" class="validation-statistics mb-3">
            <div class="row">
              <div class="col-md-3">
                <div class="stat-card bg-success text-white">
                  <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h4 class="stat-value">{{ validationStatistics.valid_accounts || 0 }}</h4>
                    <p class="stat-label">Valid Accounts</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-warning text-white">
                  <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <div class="stat-content">
                    <h4 class="stat-value">
                      {{ validationStatistics.accounts_with_warnings || 0 }}
                    </h4>
                    <p class="stat-label">With Warnings</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-danger text-white">
                  <div class="stat-icon">
                    <i class="fas fa-times-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h4 class="stat-value">{{ validationStatistics.accounts_with_errors || 0 }}</h4>
                    <p class="stat-label">With Errors</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                  <div class="stat-icon">
                    <i class="fas fa-question-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h4 class="stat-value">{{ validationStatistics.missing_accounts || 0 }}</h4>
                    <p class="stat-label">Missing Accounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Conflict Resolution Suggestions -->
          <div
            v-if="
              accountConflictSuggestions &&
                (accountConflictSuggestions.conflicts?.length > 0 ||
                  accountConflictSuggestions.suggestions?.length > 0 ||
                  accountConflictSuggestions.warnings?.length > 0 ||
                  accountConflictSuggestions.alternativeCodes?.length > 0)
            "
            class="conflict-suggestions mb-3"
          >
            <div class="alert alert-warning">
              <h6 class="alert-heading d-flex justify-content-between align-items-center">
                <span>
                  <i class="fas fa-exclamation-triangle mr-2"></i>
                  Conflict Resolution Suggestions
                </span>
                <div class="d-flex gap-2">
                  <b-button
                    variant="outline-success"
                    size="sm"
                    @click="applyAllSuggestions"
                    v-if="
                      accountConflictSuggestions.alternativeCodes &&
                        accountConflictSuggestions.alternativeCodes.length > 0
                    "
                  >
                    <i class="fas fa-magic mr-1"></i>Apply All
                  </b-button>
                  <b-button variant="outline-warning" size="sm" @click="ignoreConflictsAndProceed">
                    <i class="fas fa-exclamation-triangle mr-1"></i>Ignore & Proceed
                  </b-button>
                  <b-button variant="outline-info" size="sm" @click="manuallyResolveConflicts">
                    <i class="fas fa-edit mr-1"></i>Manual Edit
                  </b-button>
                  <b-button variant="outline-secondary" size="sm" @click="getDetailedConflictInfo">
                    <i class="fas fa-search-plus mr-1"></i>Details
                  </b-button>
                  <b-button variant="outline-danger" size="sm" @click="clearConflictSuggestions">
                    <i class="fas fa-times mr-1"></i>Clear
                  </b-button>
                  <b-button variant="outline-primary" size="sm" @click="exportConflictReport">
                    <i class="fas fa-download mr-1"></i>Export
                  </b-button>
                  <b-button
                    variant="outline-info"
                    size="sm"
                    @click="showConflictResolutionHelp"
                    title="Get help with conflict resolution"
                  >
                    <i class="fas fa-question-circle mr-1"></i>Help
                  </b-button>
                  <b-button
                    variant="outline-secondary"
                    size="sm"
                    @click="refreshConflictSuggestions"
                    title="Refresh conflict suggestions"
                  >
                    <i class="fas fa-sync-alt mr-1"></i>Refresh
                  </b-button>
                </div>
              </h6>
              <div
                v-if="
                  accountConflictSuggestions.suggestions &&
                    accountConflictSuggestions.suggestions.length > 0
                "
              >
                <p class="mb-2"><strong>Suggestions:</strong></p>
                <ul class="mb-2">
                  <li
                    v-for="(suggestion, index) in accountConflictSuggestions.suggestions"
                    :key="index"
                  >
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
              <div
                v-if="
                  accountConflictSuggestions.alternativeCodes &&
                    accountConflictSuggestions.alternativeCodes.length > 0
                "
              >
                <p class="mb-2"><strong>Alternative Codes:</strong></p>
                <div class="alternative-codes">
                  <b-badge
                    v-for="code in accountConflictSuggestions.alternativeCodes"
                    :key="code"
                    variant="info"
                    class="mr-2 mb-1"
                    style="cursor: pointer;"
                    @click="useAlternativeCode(code)"
                  >
                    {{ code }}
                  </b-badge>
                </div>
              </div>
              <div
                v-if="
                  accountConflictSuggestions.warnings &&
                    accountConflictSuggestions.warnings.length > 0
                "
              >
                <p class="mb-0"><strong>Warnings:</strong></p>
                <ul class="mb-0">
                  <li v-for="(warning, index) in accountConflictSuggestions.warnings" :key="index">
                    {{ warning }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Conflict Suggestions Display -->
          <div
            v-if="
              accountConflictSuggestions &&
                (accountConflictSuggestions.conflicts?.length > 0 ||
                  accountConflictSuggestions.suggestions?.length > 0 ||
                  accountConflictSuggestions.warnings?.length > 0 ||
                  accountConflictSuggestions.alternativeCodes?.length > 0)
            "
            class="mt-3 p-3 border rounded bg-light"
          >
            <h6 class="text-warning mb-2">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Account Validation Results
            </h6>

            <div
              v-if="
                accountConflictSuggestions.suggestions &&
                  accountConflictSuggestions.suggestions.length > 0
              "
              class="mb-3"
            >
              <strong>Suggestions:</strong>
              <ul class="mb-0 mt-1">
                <li
                  v-for="suggestion in accountConflictSuggestions.suggestions"
                  :key="suggestion"
                  class="text-info"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Account Type Validation -->
          <div class="account-type-validation">
            <h6 class="mb-3">
              <i class="fas fa-filter mr-2"></i>
              Validate Specific Account Type
            </h6>
            <div class="row">
              <div class="col-md-4">
                <b-form-select
                  v-model="selectedAccountType"
                  :options="accountTypeOptions.filter(opt => opt.value)"
                  placeholder="Select Account Type"
                  @change="validateAccountType"
                ></b-form-select>
              </div>
              <div class="col-md-8">
                <div v-if="typeValidationResult" class="type-validation-result">
                  <div
                    class="alert"
                    :class="getValidationAlertClass(typeValidationResult.overall_status)"
                  >
                    <p class="mb-1"><strong>Type:</strong> {{ selectedAccountType }}</p>
                    <p class="mb-1">
                      <strong>Status:</strong> {{ typeValidationResult.overall_status }}
                    </p>
                    <p class="mb-0">
                      <strong>Accounts:</strong> {{ typeValidationResult.accounts_checked }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
              <b-form-group label="Search" label-for="search-input">
                <b-form-input
                  id="search-input"
                  v-model="filters.search"
                  placeholder="Search accounts..."
                  @input="debounceSearch"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Type" label-for="type-filter">
                <b-form-select
                  id="type-filter"
                  v-model="filters.type"
                  :options="accountTypeOptions"
                  @change="loadAccounts"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Status" label-for="status-filter">
                <b-form-select
                  id="status-filter"
                  v-model="filters.status"
                  :options="statusOptions"
                  @change="loadAccounts"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Level" label-for="level-filter">
                <b-form-select
                  id="level-filter"
                  v-model="filters.level"
                  :options="levelOptions"
                  @change="loadAccounts"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <label>&nbsp;</label>
              <div class="d-flex gap-2">
                <b-button variant="outline-secondary" @click="clearFilters">
                  Clear
                </b-button>
                <b-button variant="primary" @click="loadAccounts">
                  <i class="fas fa-search mr-2"></i>Search
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accounts Tree View -->
    <div class="accounts-tree-section">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-tree mr-2"></i>
            Account Hierarchy
          </h5>
          <div class="view-controls">
            <b-button-group size="sm">
              <b-button
                @click="setViewMode('tree')"
                :variant="viewMode === 'tree' ? 'primary' : 'outline-primary'"
              >
                <i class="fas fa-tree mr-1"></i>Tree
              </b-button>
              <b-button
                @click="setViewMode('table')"
                :variant="viewMode === 'table' ? 'primary' : 'outline-primary'"
              >
                <i class="fas fa-table mr-1"></i>Table
              </b-button>
            </b-button-group>
          </div>
        </div>
        <div class="card-body">
          <!-- Tree View -->
          <div v-if="viewMode === 'tree'" class="tree-view">
            <div class="tree-container">
              <div
                v-for="account in hierarchicalAccounts"
                :key="account.id"
                class="tree-item"
                :style="{ marginLeft: `${account.level * 20}px` }"
              >
                <div class="tree-node" :class="getAccountClass(account)">
                  <div class="node-content">
                    <div class="node-icon">
                      <i :class="getAccountIcon(account)"></i>
                    </div>
                    <div class="node-details">
                      <div class="account-code">{{ account.code }}</div>
                      <div class="account-name">{{ account.name }}</div>
                      <div class="account-type">
                        <b-badge :variant="getTypeVariant(account.type)">
                          {{ account.type }}
                        </b-badge>
                      </div>
                    </div>
                    <div class="node-balance">
                      <div class="balance-amount">{{ formatCurrency(account.balance) }}</div>
                      <div class="balance-label">Balance</div>
                    </div>
                    <div class="node-actions">
                      <b-button
                        v-if="account.hasChildren"
                        variant="outline-primary"
                        size="sm"
                        @click="toggleNode(account.id)"
                      >
                        <i
                          :class="account.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
                        ></i>
                      </b-button>
                      <b-button variant="outline-info" size="sm" @click="viewAccount(account.id)">
                        <i class="fas fa-eye"></i>
                      </b-button>
                      <b-button
                        variant="outline-warning"
                        size="sm"
                        @click="editAccount(account.id)"
                      >
                        <i class="fas fa-edit"></i>
                      </b-button>
                      <b-button
                        variant="outline-danger"
                        size="sm"
                        @click="deleteAccount(account.id)"
                      >
                        <i class="fas fa-trash"></i>
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table View -->
          <div v-else class="table-view">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Parent</th>
                    <th>Balance</th>
                    <th>Tax Code</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="account in flatAccounts" :key="account.id">
                    <td>
                      <strong>{{ account.code }}</strong>
                    </td>
                    <td>{{ account.name }}</td>
                    <td>
                      <b-badge :variant="getTypeVariant(account.type)">
                        {{ account.type }}
                      </b-badge>
                    </td>
                    <td>{{ account.parent?.name || 'Root' }}</td>
                    <td>
                      <span class="balance-amount">{{ formatCurrency(account.balance) }}</span>
                    </td>
                    <td>
                      <span v-if="account.tax_code" class="text-info">{{ account.tax_code }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span v-if="account.budget_allocation > 0" class="text-success">
                        {{ formatCurrency(account.budget_allocation) }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <b-badge :variant="getStatusVariant(account.is_active)">
                        {{ account.is_active ? 'Active' : 'Inactive' }}
                      </b-badge>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <b-button variant="outline-info" size="sm" @click="viewAccount(account.id)">
                          <i class="fas fa-eye"></i>
                        </b-button>
                        <b-button
                          variant="outline-warning"
                          size="sm"
                          @click="editAccount(account.id)"
                        >
                          <i class="fas fa-edit"></i>
                        </b-button>
                        <b-button
                          variant="outline-danger"
                          size="sm"
                          @click="deleteAccount(account.id)"
                        >
                          <i class="fas fa-trash"></i>
                        </b-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Account Modal -->
    <b-modal
      v-model="showAccountModal"
      :title="isEditing ? 'Edit Account' : 'Create New Account'"
      size="lg"
      @ok="saveAccount"
      @hidden="resetForm"
      @shown="onModalShown"
    >
      <div class="modal-body">
        <!-- Smart Validation Info -->
        <div class="alert alert-info mb-3">
          <i class="fas fa-info-circle mr-2"></i>
          <strong>Smart Validation:</strong> This form automatically validates your account data
          after you fill in both the Account Code and Account Name fields. You can also manually
          validate using the button below.
        </div>

        <b-form @submit.prevent="saveAccount">
          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Account Code" label-for="account-code">
                <div class="d-flex align-items-center">
                  <b-form-input
                    v-model="accountForm.code"
                    type="text"
                    placeholder="e.g., 1001"
                    :state="!formErrors.code"
                    required
                    @input="
                      clearConflictsOnInput;
                      checkAccountCodeConflicts;
                    "
                    @blur="clearConflictsOnInput"
                  ></b-form-input>
                  <div v-if="isValidationInProgress" class="ml-2">
                    <b-spinner small label="Validating..."></b-spinner>
                  </div>
                </div>
                <div v-if="formErrors.code" class="invalid-feedback d-block">
                  {{ formErrors.code }}
                </div>
                <small class="form-text text-muted">
                  💡 Enter a 4-digit code (e.g., 1001 for Assets, 2001 for Liabilities)
                </small>
                <div
                  v-if="
                    accountConflictSuggestions &&
                      (accountConflictSuggestions.suggestions?.length > 0 ||
                        accountConflictSuggestions.warnings?.length > 0)
                  "
                  class="mt-2"
                >
                  <small class="text-warning">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    Potential conflicts detected. Check suggestions below.
                  </small>
                </div>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Account Name" label-for="account-name">
                <b-form-input
                  v-model="accountForm.name"
                  type="text"
                  placeholder="e.g., Cash on Hand"
                  :state="!formErrors.name"
                  required
                  @input="
                    clearConflictsOnInput;
                    checkAccountNameConflicts;
                  "
                  @blur="clearConflictsOnInput"
                ></b-form-input>
                <div v-if="formErrors.name" class="invalid-feedback d-block">
                  {{ formErrors.name }}
                </div>
                <small class="form-text text-muted">
                  💡 Validation will occur automatically after you fill both the code and name
                  fields
                </small>
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Account Type" label-for="account-type">
                <b-form-select
                  id="account-type"
                  v-model="accountForm.type"
                  :options="accountTypeOptions"
                  :state="!formErrors.type"
                  required
                  @change="checkAccountTypeConflicts"
                  @blur="clearConflictsOnInput"
                ></b-form-select>
                <div v-if="formErrors.type" class="invalid-feedback d-block">
                  {{ formErrors.type }}
                </div>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Parent Account" label-for="parent-account">
                <b-form-select
                  id="parent-account"
                  v-model="accountForm.parent_id"
                  :options="parentAccountOptions"
                  @change="checkAccountParentConflicts"
                  @blur="clearConflictsOnInput"
                ></b-form-select>
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4">
              <b-form-group label="Tax Code" label-for="tax-code">
                <b-form-select
                  id="tax-code"
                  v-model="accountForm.tax_code"
                  :options="taxCodeOptions"
                  :state="!formErrors.tax_code"
                  @blur="clearConflictsOnInput"
                ></b-form-select>
                <div v-if="formErrors.tax_code" class="invalid-feedback d-block">
                  {{ formErrors.tax_code }}
                </div>
              </b-form-group>
            </div>
            <div class="col-md-4">
              <b-form-group label="Budget Allocation" label-for="budget-allocation">
                <b-form-input
                  id="budget-allocation"
                  v-model.number="accountForm.budget_allocation"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  :state="!formErrors.budget_allocation"
                  @blur="clearConflictsOnInput"
                ></b-form-input>
                <div v-if="formErrors.budget_allocation" class="invalid-feedback d-block">
                  {{ formErrors.budget_allocation }}
                </div>
              </b-form-group>
            </div>
            <div class="col-md-4">
              <b-form-group label="Current Balance" label-for="account-balance">
                <b-form-input
                  id="account-balance"
                  v-model.number="accountForm.balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  :state="!formErrors.balance"
                  @blur="clearConflictsOnInput"
                ></b-form-input>
                <div v-if="formErrors.balance" class="invalid-feedback d-block">
                  {{ formErrors.balance }}
                </div>
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <b-form-group label="Description" label-for="account-description">
                <b-form-textarea
                  id="account-description"
                  v-model="accountForm.description"
                  rows="3"
                  placeholder="Detailed description of this account..."
                  :state="!formErrors.description"
                  @blur="clearConflictsOnInput"
                ></b-form-textarea>
                <div v-if="formErrors.description" class="invalid-feedback d-block">
                  {{ formErrors.description }}
                </div>
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <b-form-group label="Status" label-for="account-status">
                <b-form-checkbox id="account-status" v-model="accountForm.is_active" switch>
                  Active Account
                </b-form-checkbox>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group label="Allow Manual Entries" label-for="manual-entries">
                <b-form-checkbox
                  id="manual-entries"
                  v-model="accountForm.allow_manual_entries"
                  switch
                >
                  Allow Manual Journal Entries
                </b-form-checkbox>
              </b-form-group>
            </div>
          </div>

          <!-- Conflict Resolution Section Inside Modal -->
          <div
            v-if="
              accountConflictSuggestions &&
                (accountConflictSuggestions.conflicts?.length > 0 ||
                  accountConflictSuggestions.suggestions?.length > 0 ||
                  accountConflictSuggestions.warnings?.length > 0 ||
                  accountConflictSuggestions.alternativeCodes?.length > 0)
            "
            class="conflict-section mt-4 p-3 border rounded bg-light"
          >
            <h6 class="text-warning mb-3">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Account Validation Results
            </h6>

            <!-- Suggestions -->
            <div
              v-if="
                accountConflictSuggestions.suggestions &&
                  accountConflictSuggestions.suggestions.length > 0
              "
              class="mb-3"
            >
              <strong class="text-info">Suggestions:</strong>
              <ul class="mb-0 mt-1">
                <li
                  v-for="suggestion in accountConflictSuggestions.suggestions"
                  :key="suggestion"
                  class="text-info"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </div>

            <!-- Alternative Codes -->
            <div
              v-if="
                accountConflictSuggestions.alternativeCodes &&
                  accountConflictSuggestions.alternativeCodes.length > 0
              "
              class="mb-3"
            >
              <strong class="text-info">Alternative Codes:</strong>
              <div class="alternative-codes mt-2">
                <b-badge
                  v-for="code in accountConflictSuggestions.alternativeCodes"
                  :key="code"
                  variant="info"
                  class="mr-2 mb-1"
                  style="cursor: pointer;"
                  @click="useAlternativeCode(code)"
                >
                  {{ code }}
                </b-badge>
              </div>
              <small class="text-muted">Click on a code to apply it to the form</small>
            </div>

            <!-- Warnings -->
            <div
              v-if="
                accountConflictSuggestions.warnings &&
                  accountConflictSuggestions.warnings.length > 0
              "
              class="mb-3"
            >
              <strong class="text-warning">Warnings:</strong>
              <ul class="mb-0 mt-1">
                <li
                  v-for="warning in accountConflictSuggestions.warnings"
                  :key="warning"
                  class="text-warning"
                >
                  {{ warning }}
                </li>
              </ul>
            </div>

            <!-- Quick Action Buttons -->
            <div class="d-flex gap-2 mt-3">
              <b-button
                variant="outline-success"
                size="sm"
                @click="applyAllSuggestions"
                v-if="
                  accountConflictSuggestions.alternativeCodes &&
                    accountConflictSuggestions.alternativeCodes.length > 0
                "
              >
                <i class="fas fa-magic mr-1"></i>Apply All
              </b-button>
              <b-button variant="outline-warning" size="sm" @click="ignoreConflictsAndProceed">
                <i class="fas fa-exclamation-triangle mr-1"></i>Ignore & Proceed
              </b-button>
              <b-button variant="outline-info" size="sm" @click="clearConflictSuggestions">
                <i class="fas fa-times mr-1"></i>Clear
              </b-button>
            </div>
          </div>

          <!-- Server Error Display Section -->
          <div
            v-if="serverError"
            class="server-error-section mt-4 p-3 border rounded"
            :class="getErrorAlertClass(serverError.type)"
          >
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="mb-2">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                {{ serverError.type }}
              </h6>
              <b-button
                variant="outline-secondary"
                size="sm"
                @click="clearServerError"
                title="Clear error"
              >
                <i class="fas fa-times"></i>
              </b-button>
            </div>

            <div class="error-message mb-2"><strong>Error:</strong> {{ serverError.message }}</div>

            <div v-if="serverError.details" class="error-details mb-2">
              <strong>Details:</strong>
              <pre class="error-details-text">{{ serverError.details }}</pre>
            </div>

            <div class="error-timestamp text-muted">
              <small>Occurred at: {{ formatErrorTimestamp(serverError.timestamp) }}</small>
            </div>

            <div class="error-actions mt-3">
              <b-button variant="outline-info" size="sm" @click="showErrorHelp">
                <i class="fas fa-question-circle mr-1"></i>Get Help
              </b-button>
              <b-button variant="outline-warning" size="sm" @click="retrySaveAccount">
                <i class="fas fa-redo mr-1"></i>Retry
              </b-button>
            </div>
          </div>

          <div class="row">
            <div class="col-12 text-center">
              <b-button variant="outline-info" size="sm" @click="getFormSummary">
                <i class="fas fa-info-circle mr-2"></i>Show Form Summary
              </b-button>
            </div>
          </div>
        </b-form>
      </div>

      <template #modal-footer>
        <div class="d-flex justify-content-between w-100">
          <div>
            <b-button
              variant="outline-info"
              size="sm"
              @click="manualValidateForm"
              :disabled="isValidationInProgress || !accountForm.code || !accountForm.name"
            >
              <b-spinner small v-if="isValidationInProgress"></b-spinner>
              {{ isValidationInProgress ? 'Validating...' : 'Validate Form' }}
            </b-button>
          </div>
          <div>
            <b-button class="mr-2" variant="outline-secondary" @click="closeModal">
              Cancel
            </b-button>
            <b-button variant="primary" @click="saveAccount" :disabled="saving || !isFormValid">
              <b-spinner small v-if="saving"></b-spinner>
              {{ saving ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account' }}
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'ChartOfAccounts',
  data() {
    return {
      // View mode
      viewMode: 'tree',

      // Filters
      filters: {
        search: undefined,
        type: undefined,
        status: undefined,
        level: undefined,
      },

      // Modal and form
      showAccountModal: false,
      isEditing: false,
      editingAccountId: null,
      saving: false,
      accountForm: {
        id: null,
        code: '',
        name: '',
        type: '',
        parent_id: null,
        description: '',
        tax_code: '',
        budget_allocation: 0,
        balance: 0,
        is_active: true,
        allow_manual_entries: false,
      },
      formErrors: {},

      // Options
      accountTypeOptions: [
        { value: '', text: 'Select Account Type' },
        { value: 'ASSET', text: 'Asset' },
        { value: 'LIABILITY', text: 'Liability' },
        { value: 'EQUITY', text: 'Equity' },
        { value: 'REVENUE', text: 'Revenue' },
        { value: 'EXPENSE', text: 'Expense' },
      ],
      statusOptions: [
        { value: undefined, text: 'All Statuses' },
        { value: 'active', text: 'Active' },
        { value: 'inactive', text: 'Inactive' },
      ],
      levelOptions: [
        { value: undefined, text: 'All Levels' },
        { value: '1', text: 'Level 1' },
        { value: '2', text: 'Level 2' },
        { value: '3', text: 'Level 3' },
        { value: '4', text: 'Level 4' },
      ],
      taxCodeOptions: [
        { value: '', text: 'Select Tax Code' },
        { value: 'VAT', text: 'VAT (5%)' },
        { value: 'WITHHOLDING', text: 'Withholding Tax (10%)' },
        { value: 'EXEMPT', text: 'Tax Exempt' },
        { value: 'ZERO_RATE', text: 'Zero Rate' },
      ],
      parentAccountOptions: [],

      // Validation and conflict resolution
      selectedAccountType: null,
      typeValidationResult: null,
      conflictCheckTimeout: null,
      nameConflictCheckTimeout: null,
      isValidationInProgress: false, // New: track validation state
      accountConflictSuggestions: null, // Moved from computed to data

      // Server error handling
      serverError: null,
    };
  },
  computed: {
    accounts() {
      return this.$store.getters['accounting/getChartOfAccounts'] || [];
    },
    summaryData() {
      return this.$store.getters['accounting/getChartOfAccountsSummary'] || {};
    },
    hierarchicalAccounts() {
      return this.buildHierarchy(this.accounts);
    },
    flatAccounts() {
      return this.accounts;
    },
    isLoading() {
      return this.$store.getters['accounting/loading'];
    },
    quickValidationResult() {
      return this.$store.getters['accounting/getQuickValidationResult'];
    },
    validationStatistics() {
      return this.$store.getters['accounting/getValidationStatistics'];
    },
    isFormValid() {
      // Check if required fields are filled
      const hasRequiredFields =
        this.accountForm.code &&
        this.accountForm.code.trim() !== '' &&
        this.accountForm.name &&
        this.accountForm.name.trim() !== '' &&
        this.accountForm.type &&
        this.accountForm.type.trim() !== '';

      // Check if validation is not in progress
      const notValidating = !this.isValidationInProgress;

      return hasRequiredFields && notValidating;
    },
  },
  async mounted() {
    await this.loadAccounts();
    await this.loadParentAccounts();
  },
  methods: {
    async loadAccounts() {
      try {
        // Filter out empty strings to avoid validation errors
        const params = {};
        Object.keys(this.filters).forEach(key => {
          if (
            this.filters[key] !== '' &&
            this.filters[key] !== null &&
            this.filters[key] !== undefined
          ) {
            params[key] = this.filters[key];
          }
        });
        await this.$store.dispatch('accounting/fetchChartOfAccounts', params);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    },

    async loadParentAccounts() {
      try {
        const accounts = await this.$store.dispatch('accounting/fetchChartOfAccounts', {});
        this.parentAccountOptions = [
          { value: null, text: 'Root Account' },
          ...(accounts.docs || accounts).map(account => ({
            value: account.id,
            text: `${account.code} - ${account.name}`,
          })),
        ];
      } catch (error) {
        console.error('Failed to load parent accounts:', error);
      }
    },

    buildHierarchy(accounts) {
      const accountMap = new Map();
      const rootAccounts = [];

      // Create a map of all accounts
      accounts?.forEach(account => {
        accountMap.set(account.id, { ...account, children: [], expanded: false });
      });

      // Build the hierarchy
      accounts?.forEach(account => {
        if (account.parent_id) {
          const parent = accountMap.get(account.parent_id);
          if (parent) {
            parent.children.push(accountMap.get(account.id));
            parent.hasChildren = true;
          }
        } else {
          rootAccounts.push(accountMap.get(account.id));
        }
      });

      return this.flattenHierarchy(rootAccounts);
    },

    flattenHierarchy(accounts, level = 0) {
      const result = [];
      accounts?.forEach(account => {
        account.level = level;
        result.push(account);
        if (account.children && account.children.length > 0) {
          result.push(...this.flattenHierarchy(account.children, level + 1));
        }
      });
      return result;
    },

    toggleNode(accountId) {
      const account = this.hierarchicalAccounts.find(a => a.id === accountId);
      if (account) {
        account.expanded = !account.expanded;
      }
    },

    setViewMode(mode) {
      this.viewMode = mode;
    },

    // Modal actions
    showCreateModal() {
      this.isEditing = false;
      this.editingAccountId = null;
      this.resetForm();
      this.showAccountModal = true;
    },

    editAccount(accountId) {
      this.isEditing = true;
      // Find the account from the existing list
      const account = this.accounts.find(acc => acc.id === accountId);
      if (account) {
        this.loadAccountForEdit(account);
      }
    },

    /**
     * Load account data for editing
     */
    loadAccountForEdit(account) {
      this.editingAccountId = account.id;
      this.isEditing = true;
      this.accountForm = { ...account };
      this.showAccountModal = true;

      // Clear any existing conflict suggestions when editing
      this.clearConflictSuggestions();
    },

    /**
     * Close the modal and reset form
     */
    closeModal() {
      this.showAccountModal = false;
      this.resetForm();
    },

    async saveAccount() {
      try {
        // Validate form before saving
        if (!this.validateForm()) {
          return;
        }

        // Check for conflicts before saving
        const conflictCheck = await this.checkForConflictsBeforeSave();
        if (conflictCheck.hasConflicts && !conflictCheck.userConfirmed) {
          return; // User didn't confirm to proceed with conflicts
        }

        this.saving = true;

        let result;
        if (this.isEditing) {
          result = await this.$store.dispatch('accounting/updateChartOfAccount', {
            id: this.accountForm.id,
            data: this.accountForm,
          });
        } else {
          delete this.accountForm.id;
          result = await this.$store.dispatch('accounting/createChartOfAccount', this.accountForm);
          console.log(result, 'result');
        }

        if (result.success) {
          this.showAccountModal = false;
          this.resetForm();
          await this.loadAccounts();
          this.$bvToast.toast(`Account ${this.isEditing ? 'updated' : 'created'} successfully`, {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to save account:', error);

        // Extract detailed error information
        let errorMessage = 'Unknown error occurred';
        let errorDetails = '';
        let errorType = 'Error';

        if (error.response && error.response.data) {
          // Server error response
          const serverError = error.response.data;
          errorMessage = serverError.message || serverError.error || 'Server error occurred';
          errorDetails = serverError.details || serverError.stack || '';
          errorType = serverError.name || 'Server Error';
        } else if (error.message) {
          // JavaScript error
          errorMessage = error.message;
          errorType = 'Validation Error';
        }

        // Set error state for display in modal
        this.serverError = {
          type: errorType,
          message: errorMessage,
          details: errorDetails,
          timestamp: new Date(),
        };

        // Also show toast for immediate feedback
        this.$bvToast.toast(`Failed to save account: ${errorMessage}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    async checkForConflictsBeforeSave() {
      try {
        const accountData = {
          code: this.accountForm.code,
          name: this.accountForm.name,
          type: this.accountForm.type,
          parent_id: this.accountForm.parent_id,
        };

        const result = await this.$store.dispatch('accounting/getAccountConflictSuggestions', {
          accountData,
          existingAccountId: this.isEditing ? this.accountForm.id : null,
        });

        if (
          result.success &&
          result.data &&
          ((result.data.conflicts && result.data.conflicts.length > 0) ||
            (result.data.warnings && result.data.warnings.length > 0))
        ) {
          const hasConflicts = result.data.conflicts && result.data.conflicts.length > 0;
          const hasWarnings = result.data.warnings && result.data.warnings.length > 0;

          let message = 'The following issues were detected:\n\n';
          if (hasConflicts) {
            message += 'Conflicts:\n';
            result.data.conflicts.forEach(conflict => {
              message += `• ${conflict.message}\n`;
            });
            message += '\n';
          }
          if (hasWarnings) {
            message += 'Warnings:\n';
            result.data.warnings.forEach(warning => {
              message += `• ${warning}\n`;
            });
            message += '\n';
          }
          message += hasConflicts
            ? 'Do you want to proceed anyway? This may cause issues.'
            : 'Do you want to proceed with these warnings?';

          const userConfirmed = confirm(message);
          return { hasConflicts: hasConflicts || hasWarnings, userConfirmed };
        }

        return { hasConflicts: false, userConfirmed: true };
      } catch (error) {
        console.error('Failed to check for conflicts:', error);
        // If we can't check for conflicts, allow the save to proceed
        return { hasConflicts: false, userConfirmed: true };
      }
    },

    validateForm() {
      this.formErrors = {};
      let isValid = true;

      // Required field validation
      if (!this.accountForm.code?.trim()) {
        this.formErrors.code = 'Account code is required';
        isValid = false;
      }

      if (!this.accountForm.name?.trim()) {
        this.formErrors.name = 'Account name is required';
        isValid = false;
      }

      if (!this.accountForm.type) {
        this.formErrors.type = 'Account type is required';
        isValid = false;
      }

      // Format validation
      if (this.accountForm.code && this.accountForm.code.length > 50) {
        this.formErrors.code = 'Account code cannot exceed 50 characters';
        isValid = false;
      }

      if (this.accountForm.name && this.accountForm.name.length > 100) {
        this.formErrors.name = 'Account name cannot exceed 100 characters';
        isValid = false;
      }

      if (this.accountForm.description && this.accountForm.description.length > 500) {
        this.formErrors.description = 'Description cannot exceed 500 characters';
        isValid = false;
      }

      if (this.accountForm.tax_code && this.accountForm.tax_code.length > 20) {
        this.formErrors.tax_code = 'Tax code cannot exceed 20 characters';
        isValid = false;
      }

      // Numeric validation
      if (this.accountForm.budget_allocation < 0) {
        this.formErrors.budget_allocation = 'Budget allocation cannot be negative';
        isValid = false;
      }

      if (this.accountForm.balance < 0) {
        this.formErrors.balance = 'Balance cannot be negative';
        isValid = false;
      }

      return isValid;
    },

    /**
     * Clear all conflict suggestions and validation data
     */
    clearConflictSuggestions() {
      this.accountConflictSuggestions = null;
      this.isValidationInProgress = false;
      this.$store.commit('accounting/CLEAR_ACCOUNT_VALIDATION_DATA');
    },

    /**
     * Reset the account form
     */
    resetForm() {
      this.accountForm = {
        id: null,
        code: '',
        name: '',
        type: '',
        parent_id: null,
        description: '',
        is_active: true,
        balance: 0,
        tax_code: '',
        budget_allocation: 0,
        allow_manual_entries: false,
      };
      this.isEditing = false;
      this.formErrors = {};

      // Clear validation and conflict data
      this.clearConflictSuggestions();

      // Clear server errors
      this.clearServerError();

      // Clear timeouts
      if (this.conflictCheckTimeout) {
        clearTimeout(this.conflictCheckTimeout);
        this.conflictCheckTimeout = null;
      }
      if (this.nameConflictCheckTimeout) {
        clearTimeout(this.nameConflictCheckTimeout);
        this.nameConflictCheckTimeout = null;
      }
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    getAccountClass(account) {
      return {
        'account-active': account.is_active,
        'account-inactive': !account.is_active,
        'account-parent': account.hasChildren,
        'account-child': account.parent_id,
      };
    },

    getAccountIcon(account) {
      if (account.hasChildren) return 'fas fa-folder text-primary';
      return 'fas fa-file-invoice-dollar text-muted';
    },

    getTypeVariant(type) {
      const variants = {
        ASSET: 'success',
        LIABILITY: 'danger',
        EQUITY: 'primary',
        INCOME: 'info',
        EXPENSE: 'warning',
      };
      return variants[type] || 'secondary';
    },

    getStatusVariant(isActive) {
      return isActive ? 'success' : 'danger';
    },

    // Filter methods
    clearFilters() {
      this.filters = {
        search: undefined,
        type: undefined,
        status: undefined,
        level: undefined,
      };
      this.loadAccounts();
    },

    debounceSearch: debounce(function() {
      this.loadAccounts();
    }, 500),

    // Navigation methods
    viewAccount(accountId) {
      this.$router.push({ name: 'account-details', params: { id: accountId } });
    },

    async deleteAccount(accountId) {
      if (confirm('Are you sure you want to delete this account?')) {
        try {
          await this.$store.dispatch('accounting/deleteChartOfAccount', accountId);
          await this.loadAccounts();
          this.$bvToast.toast('Account deleted successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } catch (error) {
          console.error('Failed to delete account:', error);
          this.$bvToast.toast('Failed to delete account: ' + error.message, {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      }
    },

    exportAccounts() {
      // Implement export functionality
      this.$bvToast.toast('Export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    // Validation and Conflict Resolution methods
    async quickValidationCheck() {
      try {
        const result = await this.$store.dispatch('accounting/quickValidationCheck');
        this.quickValidationResult = result;
        this.$bvToast.toast('Quick validation check completed.', {
          title: 'Validation Complete',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to perform quick validation check:', error);
        this.$bvToast.toast(
          'Failed to perform quick validation check: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    async validateAllAccounts() {
      try {
        await this.$store.dispatch('accounting/validateAllAccounts');
        this.$bvToast.toast('Full validation check completed.', {
          title: 'Validation Complete',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to perform full validation check:', error);
        this.$bvToast.toast(
          'Failed to perform full validation check: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    async getValidationStatistics() {
      try {
        const stats = await this.$store.dispatch('accounting/getValidationStatistics');
        this.validationStatistics = stats;
        this.$bvToast.toast('Validation statistics retrieved.', {
          title: 'Statistics',
          variant: 'info',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to get validation statistics:', error);
        this.$bvToast.toast(
          'Failed to get validation statistics: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    async getAccountConflictSuggestions() {
      try {
        const suggestions = await this.$store.dispatch('accounting/getAccountConflictSuggestions');
        this.accountConflictSuggestions = suggestions;
        this.$bvToast.toast('Conflict resolution suggestions retrieved.', {
          title: 'Conflict Resolution',
          variant: 'warning',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to get conflict resolution suggestions:', error);
        this.$bvToast.toast(
          'Failed to get conflict resolution suggestions: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    async useAlternativeCode(code) {
      if (
        confirm(`Are you sure you want to use alternative code "${code}" for the current account?`)
      ) {
        // Update the form with the alternative code
        this.accountForm.code = code;
        this.$bvToast.toast(`Alternative code "${code}" applied to form.`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        // Clear conflict suggestions since we've applied one
        this.accountConflictSuggestions = null;
      }
    },

    async applyAllSuggestions() {
      if (!this.accountConflictSuggestions) return;

      if (confirm('Do you want to apply all suggested fixes to resolve conflicts?')) {
        try {
          // Apply alternative code if available
          if (
            this.accountConflictSuggestions.alternativeCodes &&
            this.accountConflictSuggestions.alternativeCodes.length > 0
          ) {
            this.accountForm.code = this.accountConflictSuggestions.alternativeCodes[0];
          }

          // Clear conflict suggestions
          this.accountConflictSuggestions = null;

          this.$bvToast.toast('All suggestions applied successfully.', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } catch (error) {
          console.error('Failed to apply suggestions:', error);
          this.$bvToast.toast(
            'Failed to apply suggestions: ' + (error.message || 'Unknown error'),
            {
              title: 'Error',
              variant: 'danger',
              solid: true,
            }
          );
        }
      }
    },

    async ignoreConflictsAndProceed() {
      if (
        confirm(
          'Are you sure you want to ignore all conflicts and proceed? This may cause issues with your Chart of Accounts.'
        )
      ) {
        this.accountConflictSuggestions = null;
        this.$bvToast.toast('Conflicts ignored. Proceeding with save.', {
          title: 'Warning',
          variant: 'warning',
          solid: true,
        });
        // Continue with save
        return true;
      }
      return false;
    },

    async manuallyResolveConflicts() {
      // This method allows users to manually edit the form to resolve conflicts
      this.$bvToast.toast('Please manually edit the form fields to resolve conflicts.', {
        title: 'Manual Resolution',
        variant: 'info',
        solid: true,
      });
      // The conflict suggestions will remain visible for reference
    },

    async getDetailedConflictInfo() {
      try {
        const accountData = {
          code: this.accountForm.code,
          name: this.accountForm.name,
          type: this.accountForm.type,
          parent_id: this.accountForm.parent_id,
        };

        const result = await this.$store.dispatch('accounting/validateChartOfAccount', accountData);
        if (result.success) {
          this.$bvToast.toast('Detailed validation completed. Check the results below.', {
            title: 'Validation Complete',
            variant: 'info',
            solid: true,
          });
          // The detailed validation result will be displayed in the validation section
        }
      } catch (error) {
        console.error('Failed to get detailed conflict info:', error);
        this.$bvToast.toast(
          'Failed to get detailed conflict info: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    async exportConflictReport() {
      if (!this.accountConflictSuggestions) {
        this.$bvToast.toast('No conflict report to export.', {
          title: 'Info',
          variant: 'info',
          solid: true,
        });
        return;
      }

      try {
        // Create a simple text report
        let report = 'Account Conflict Resolution Report\n';
        report += '=====================================\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n\n`;

        if (this.accountConflictSuggestions.suggestions) {
          report += 'Suggestions:\n';
          this.accountConflictSuggestions.suggestions.forEach((suggestion, index) => {
            report += `${index + 1}. ${suggestion}\n`;
          });
          report += '\n';
        }

        if (this.accountConflictSuggestions.alternativeCodes) {
          report += 'Alternative Codes:\n';
          this.accountConflictSuggestions.suggestions.forEach((code, index) => {
            report += `${index + 1}. ${code}\n`;
          });
          report += '\n';
        }

        if (this.accountConflictSuggestions.warnings) {
          report += 'Warnings:\n';
          this.accountConflictSuggestions.warnings.forEach((warning, index) => {
            report += `${index + 1}. ${warning}\n`;
          });
        }

        // Create and download the file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conflict-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.$bvToast.toast('Conflict report exported successfully.', {
          title: 'Export Complete',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to export conflict report:', error);
        this.$bvToast.toast(
          'Failed to export conflict report: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    showConflictResolutionHelp() {
      const helpText = `
Account Conflict Resolution Help:

1. **Code Conflicts**: When account codes are duplicated or invalid
   - Use alternative codes suggested by the system
   - Ensure codes follow the hierarchy rules (1000-1999 for Assets, etc.)

2. **Name Conflicts**: When account names are duplicated
   - Make names more specific (e.g., "Cash - Main Branch" instead of just "Cash")
   - Use parent account context to differentiate

3. **Type Conflicts**: When account types don't match the hierarchy
   - Asset accounts should be 1000-1999
   - Liability accounts should be 2000-2999
   - Equity accounts should be 3000-3999
   - Revenue accounts should be 4000-4999
   - Expense accounts should be 5000-5999

4. **Parent Conflicts**: When parent-child relationships are invalid
   - Ensure parent accounts exist
   - Check for circular references
   - Verify hierarchy levels

5. **Resolution Strategies**:
   - Apply All: Automatically apply all suggested fixes
   - Manual Edit: Edit the form fields manually
   - Ignore & Proceed: Continue despite conflicts (not recommended)
   - Export Report: Save conflict details for review
       `;

      alert(helpText);
    },

    async refreshConflictSuggestions() {
      if (!this.accountForm.code && !this.accountForm.name) {
        this.$bvToast.toast('Please enter account code or name first.', {
          title: 'Info',
          variant: 'info',
          solid: true,
        });
        return;
      }

      try {
        await this.checkAccountCodeConflicts();
        this.$bvToast.toast('Conflict suggestions refreshed.', {
          title: 'Refreshed',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to refresh conflict suggestions:', error);
        this.$bvToast.toast(
          'Failed to refresh conflict suggestions: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    async getSystemWideConflictSummary() {
      try {
        const result = await this.$store.dispatch('accounting/validateAllChartOfAccounts');
        if (result.success) {
          this.$bvToast.toast(
            'System-wide conflict summary generated. Check the validation section above.',
            {
              title: 'Summary Generated',
              variant: 'info',
              solid: true,
            }
          );
          // The system-wide validation result will be displayed in the validation section
        }
      } catch (error) {
        console.error('Failed to get system-wide conflict summary:', error);
        this.$bvToast.toast(
          'Failed to get system-wide conflict summary: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    showValidationHelp() {
      const helpText = `
Account Validation Help:

1. **Quick Check**: Performs a fast validation of critical account issues
   - Checks for duplicate codes and names
   - Validates basic hierarchy rules
   - Provides immediate feedback

2. **Full Validation**: Comprehensive validation of all accounts
   - Detailed analysis of all accounts
   - Identifies missing required accounts
   - Generates comprehensive report

3. **Statistics**: Overview of validation results
   - Count of valid accounts
   - Count of accounts with warnings
   - Count of accounts with errors
   - Count of missing accounts

4. **System Summary**: Overall system health check
   - System-wide conflict analysis
   - Recommendations for improvements
   - Priority issues identification

5. **Account Type Validation**: Validate specific account types
   - Focus on specific account categories
   - Type-specific validation rules
   - Targeted conflict resolution
       `;

      alert(helpText);
    },

    clearAllValidationData() {
      this.quickValidationResult = null;
      this.validationStatistics = null;
      this.typeValidationResult = null;
      this.accountConflictSuggestions = null;

      this.$bvToast.toast('All validation data cleared.', {
        title: 'Cleared',
        variant: 'info',
        solid: true,
      });
    },

    async exportValidationReport() {
      try {
        let report = 'Account Validation Report\n';
        report += '==========================\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n\n`;

        if (this.quickValidationResult) {
          report += 'Quick Validation Result:\n';
          report += `Status: ${this.quickValidationResult.overall_status}\n`;
          report += `Accounts Checked: ${this.quickValidationResult.accounts_checked}\n`;
          if (this.quickValidationResult.warnings) {
            report += `Warnings: ${this.quickValidationResult.warnings.length}\n`;
          }
          report += '\n';
        }

        if (this.validationStatistics) {
          report += 'Validation Statistics:\n';
          report += `Valid Accounts: ${this.validationStatistics.accounts_with_warnings || 0}\n`;
          report += `Accounts with Warnings: ${this.validationStatistics.accounts_with_warnings ||
            0}\n`;
          report += `Accounts with Errors: ${this.validationStatistics.accounts_with_errors ||
            0}\n`;
          report += `Missing Accounts: ${this.validationStatistics.missing_accounts || 0}\n`;
          report += '\n';
        }

        if (this.typeValidationResult) {
          report += `Type Validation (${this.selectedAccountType}):\n`;
          report += `Status: ${this.typeValidationResult.overall_status}\n`;
          report += `Accounts Checked: ${this.typeValidationResult.accounts_checked}\n`;
          report += '\n';
        }

        if (this.accountConflictSuggestions) {
          report += 'Conflict Resolution Suggestions:\n';
          if (this.accountConflictSuggestions.suggestions) {
            report += 'Suggestions:\n';
            this.accountConflictSuggestions.suggestions.forEach((suggestion, index) => {
              report += `${index + 1}. ${suggestion}\n`;
            });
          }
          if (this.accountConflictSuggestions.alternativeCodes) {
            report += 'Alternative Codes:\n';
            this.accountConflictSuggestions.alternativeCodes.forEach((code, index) => {
              report += `${index + 1}. ${code}\n`;
            });
          }
          if (this.accountConflictSuggestions.warnings) {
            report += 'Warnings:\n';
            this.accountConflictSuggestions.warnings.forEach((warning, index) => {
              report += `${index + 1}. ${warning}\n`;
            });
          }
        }

        // Create and download the file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.$bvToast.toast('Validation report exported successfully.', {
          title: 'Export Complete',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to export validation report:', error);
        this.$bvToast.toast(
          'Failed to export validation report: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    getFormSummary() {
      const summary = {
        code: this.accountForm.code || 'Not set',
        name: this.accountForm.name || 'Not set',
        type: this.accountForm.type || 'Not set',
        parent: this.accountForm.parent_id ? 'Set' : 'Not set',
        description: this.accountForm.description ? 'Set' : 'Not set',
        taxCode: this.accountForm.tax_code || 'Not set',
        budget: this.accountForm.budget_allocation || 0,
        balance: this.accountForm.balance || 0,
        isActive: this.accountForm.is_active ? 'Yes' : 'No',
        allowManualEntries: this.accountForm.allow_manual_entries ? 'Yes' : 'No',
      };

      let summaryText = 'Current Form State:\n';
      summaryText += '==================\n\n';
      Object.entries(summary).forEach(([key, value]) => {
        summaryText += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
      });

      alert(summaryText);
    },

    getSystemAccountsSummary() {
      const accounts = this.accounts || [];
      const summary = {
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter(acc => acc.is_active).length,
        inactiveAccounts: accounts.filter(acc => !acc.is_active).length,
        assetAccounts: accounts.filter(acc => acc.type === 'ASSET').length,
        liabilityAccounts: accounts.filter(acc => acc.type === 'LIABILITY').length,
        equityAccounts: accounts.filter(acc => acc.type === 'EQUITY').length,
        revenueAccounts: accounts.filter(acc => acc.type === 'REVENUE').length,
        expenseAccounts: accounts.filter(acc => acc.type === 'EXPENSE').length,
        accountsWithBudget: accounts.filter(acc => acc.budget_allocation > 0).length,
        accountsWithTaxCode: accounts.filter(acc => acc.tax_code).length,
        totalBalance: accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
        totalBudget: accounts.reduce((sum, acc) => sum + (acc.budget_allocation || 0), 0),
      };

      let summaryText = 'System Accounts Summary:\n';
      summaryText += '========================\n\n';
      Object.entries(summary).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        if (typeof value === 'number' && (key.includes('Balance') || key.includes('Budget'))) {
          summaryText += `${formattedKey}: ${new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
          }).format(value)}\n`;
        } else {
          summaryText += `${formattedKey}: ${value}\n`;
        }
      });

      alert(summaryText);
    },

    async validateAccountType() {
      if (!this.selectedAccountType) return;

      try {
        const result = await this.$store.dispatch(
          'accounting/validateAccountType',
          this.selectedAccountType
        );
        if (result.success) {
          this.typeValidationResult = result.data;
          this.$bvToast.toast(
            `Account type validation completed for ${this.selectedAccountType}.`,
            {
              title: 'Validation Complete',
              variant: 'success',
              solid: true,
            }
          );
        }
      } catch (error) {
        console.error('Failed to validate account type:', error);
        this.$bvToast.toast(
          'Failed to validate account type: ' + (error.message || 'Unknown error'),
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      }
    },

    /**
     * Check for account code conflicts with debouncing
     */
    checkAccountCodeConflicts() {
      // Clear existing timeout
      if (this.conflictCheckTimeout) {
        clearTimeout(this.conflictCheckTimeout);
      }

      // Only validate if we have both code and name
      if (
        !this.accountForm.code ||
        !this.accountForm.name ||
        this.accountForm.code.trim() === '' ||
        this.accountForm.name.trim() === ''
      ) {
        return;
      }

      // Set validation in progress
      this.isValidationInProgress = true;

      // Set a new timeout for debounced validation
      this.conflictCheckTimeout = setTimeout(async () => {
        try {
          const result = await this.$store.dispatch('accounting/getAccountConflictSuggestions', {
            accountData: {
              code: this.accountForm.code,
              name: this.accountForm.name,
              type: this.accountForm.type,
              parent_id: this.accountForm.parent_id,
            },
            existingAccountId: this.editingAccountId,
          });

          // Set the local conflict suggestions data
          if (result && result.success && result.data) {
            console.log('API Response:', result);
            console.log('Setting accountConflictSuggestions to:', result.data);
            this.accountConflictSuggestions = result.data;
            // Clear if there are no actual conflicts to display
            this.clearEmptyConflictSuggestions();
          } else {
            console.log('API Response (no data):', result);
            this.accountConflictSuggestions = null;
          }
        } catch (error) {
          console.error('Error checking account code conflicts:', error);
        } finally {
          this.isValidationInProgress = false;
        }
      }, 500); // 500ms debounce delay
    },

    /**
     * Check for account name conflicts with debouncing
     */
    checkAccountNameConflicts() {
      // Clear existing timeout
      if (this.nameConflictCheckTimeout) {
        clearTimeout(this.nameConflictCheckTimeout);
      }

      // Only validate if we have both code and name
      if (
        !this.accountForm.code ||
        !this.accountForm.name ||
        this.accountForm.code.trim() === '' ||
        this.accountForm.name.trim() === ''
      ) {
        return;
      }

      // Set a new timeout for debounced validation
      this.nameConflictCheckTimeout = setTimeout(async () => {
        try {
          const result = await this.$store.dispatch('accounting/getAccountConflictSuggestions', {
            accountData: {
              code: this.accountForm.code,
              name: this.accountForm.name,
              type: this.accountForm.type,
              parent_id: this.accountForm.parent_id,
            },
            existingAccountId: this.editingAccountId,
          });

          // Set the local conflict suggestions data
          if (result && result.success && result.data) {
            this.accountConflictSuggestions = result.data;
            // Clear if there are no actual conflicts to display
            this.clearEmptyConflictSuggestions();
          } else {
            this.accountConflictSuggestions = null;
          }
        } catch (error) {
          console.error('Error checking account name conflicts:', error);
        } finally {
          this.isValidationInProgress = false;
        }
      }, 500); // 500ms debounce delay
    },

    /**
     * Check for account type conflicts
     */
    checkAccountTypeConflicts() {
      // Only check if we have both code and name
      if (
        !this.accountForm.code ||
        !this.accountForm.name ||
        this.accountForm.code.trim() === '' ||
        this.accountForm.name.trim() === ''
      ) {
        return;
      }

      // Trigger a comprehensive conflict check
      this.checkAccountCodeConflicts();
    },

    /**
     * Check for account parent conflicts
     */
    checkAccountParentConflicts() {
      // Only check if we have both code and name
      if (
        !this.accountForm.code ||
        !this.accountForm.name ||
        this.accountForm.code.trim() === '' ||
        this.accountForm.name.trim() === ''
      ) {
        return;
      }

      // Trigger a comprehensive conflict check
      this.checkAccountCodeConflicts();
    },

    getValidationAlertClass(status) {
      switch (status) {
        case 'valid':
          return 'alert-success';
        case 'warning':
          return 'alert-warning';
        case 'error':
          return 'alert-danger';
        default:
          return '';
      }
    },

    showChartOfAccountsHelp() {
      const helpText = `
Chart of Accounts Management Help:

1. **Account Creation**: 
   - Use the "New Account" button to create accounts
   - Fill in required fields: Code, Name, Type
   - Set parent account for hierarchical structure

2. **Account Types**:
   - ASSET (1000-1999): Cash, Bank, Receivables, Inventory
   - LIABILITY (2000-2999): Payables, Loans, Taxes
   - EQUITY (3000-3999): Capital, Retained Earnings
   - REVENUE (4000-4999): Sales, Fees, Interest
   - EXPENSE (5000-5999): Costs, Salaries, Utilities

3. **Validation Features**:
   - Real-time conflict detection
   - Automatic code suggestions
   - Hierarchy validation
   - Business rule compliance

4. **Conflict Resolution**:
   - Apply suggested fixes automatically
   - Manual editing for complex cases
   - Export reports for review
   - Get detailed validation results

5. **Best Practices**:
   - Use consistent naming conventions
   - Follow hierarchical structure
   - Regular validation checks
   - Document account purposes
      `;

      alert(helpText);
    },

    /**
     * Clear conflict suggestions when form fields change
     */
    clearConflictsOnInput() {
      // Clear conflict suggestions when user starts typing
      if (this.accountConflictSuggestions) {
        this.accountConflictSuggestions = null;
      }

      // Clear form errors for the field being typed in
      this.clearFormErrors();
    },

    /**
     * Clear form errors to allow the form to be valid again
     */
    clearFormErrors() {
      this.formErrors = {};
    },

    /**
     * Manually trigger validation for the current form
     */
    async manualValidateForm() {
      if (
        !this.accountForm.code ||
        !this.accountForm.name ||
        this.accountForm.code.trim() === '' ||
        this.accountForm.name.trim() === ''
      ) {
        this.$bvToast.toast('Please fill in both Account Code and Account Name before validating', {
          title: 'Validation Required',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      this.isValidationInProgress = true;
      try {
        const result = await this.$store.dispatch('accounting/getAccountConflictSuggestions', {
          accountData: {
            code: this.accountForm.code,
            name: this.accountForm.name,
            type: this.accountForm.type,
            parent_id: this.accountForm.parent_id,
          },
          existingAccountId: this.editingAccountId,
        });

        // Set the local conflict suggestions data
        if (result && result.success && result.data) {
          this.accountConflictSuggestions = result.data;
          // Clear if there are no actual conflicts to display
          this.clearEmptyConflictSuggestions();
        } else {
          this.accountConflictSuggestions = null;
        }

        this.$bvToast.toast('Form validation completed', {
          title: 'Validation Complete',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Manual validation failed:', error);
        this.$bvToast.toast('Validation failed: ' + (error.message || 'Unknown error'), {
          title: 'Validation Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isValidationInProgress = false;
      }
    },

    /**
     * Handle modal shown event to ensure proper form initialization
     */
    onModalShown() {
      // Ensure form is properly initialized
      if (!this.isEditing) {
        this.resetForm();
      }

      // Clear any existing validation state
      this.clearFormErrors();
      this.clearConflictSuggestions();
    },

    /**
     * Debug method to show current form state
     */
    debugFormState() {
      const debugInfo = {
        formData: { ...this.accountForm },
        formErrors: { ...this.formErrors },
        isEditing: this.isEditing,
        isValidationInProgress: this.isValidationInProgress,
        isFormValid: this.isFormValid,
        hasRequiredFields:
          this.accountForm.code &&
          this.accountForm.code.trim() !== '' &&
          this.accountForm.name &&
          this.accountForm.name.trim() !== '' &&
          this.accountForm.type &&
          this.accountForm.type.trim() !== '',
        notValidating: !this.isValidationInProgress,
      };

      console.log('Form Debug Info:', debugInfo);

      // Show in alert for easy viewing
      alert(`Form Debug Info:
      
Form Data:
- Code: "${this.accountForm.code}"
- Name: "${this.accountForm.name}"
- Type: "${this.accountForm.type}"

Form State:
- Is Editing: ${this.isEditing}
- Validation In Progress: ${this.isValidationInProgress}
- Has Required Fields: ${debugInfo.hasRequiredFields}
- Not Validating: ${debugInfo.notValidating}
- Is Form Valid: ${this.isFormValid}

Form Errors: ${
        Object.keys(this.formErrors).length > 0 ? JSON.stringify(this.formErrors) : 'None'
      }`);
    },

    /**
     * Clear conflict suggestions if there are no actual conflicts to display
     */
    clearEmptyConflictSuggestions() {
      if (this.accountConflictSuggestions) {
        const hasConflicts =
          Array.isArray(this.accountConflictSuggestions.conflicts) &&
          this.accountConflictSuggestions.conflicts.length > 0;
        const hasSuggestions =
          Array.isArray(this.accountConflictSuggestions.conflicts) &&
          this.accountConflictSuggestions.suggestions.length > 0;
        const hasWarnings =
          Array.isArray(this.accountConflictSuggestions.warnings) &&
          this.accountConflictSuggestions.warnings.length > 0;
        const hasAlternativeCodes =
          Array.isArray(this.accountConflictSuggestions.alternativeCodes) &&
          this.accountConflictSuggestions.alternativeCodes.length > 0;

        // If there are no actual conflicts, suggestions, warnings, or alternative codes, clear it
        if (!hasConflicts && !hasSuggestions && !hasWarnings && !hasAlternativeCodes) {
          console.log('Clearing empty conflict suggestions:', this.accountConflictSuggestions);
          this.accountConflictSuggestions = null;
        }
      }
    },

    /**
     * Get CSS class for error alert styling
     */
    getErrorAlertClass(errorType) {
      switch (errorType.toLowerCase()) {
        case 'validation error':
          return 'border-warning bg-warning-light';
        case 'server error':
          return 'border-danger bg-danger-light';
        case 'conflict error':
          return 'border-info bg-info-light';
        default:
          return 'border-danger bg-danger-light';
      }
    },

    /**
     * Format error timestamp for display
     */
    formatErrorTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString();
    },

    /**
     * Clear server error
     */
    clearServerError() {
      this.serverError = null;
    },

    /**
     * Show error help information
     */
    showErrorHelp() {
      const helpText = `
Error Resolution Help:

1. **Validation Errors**: 
   - Check that all required fields are filled
   - Ensure account code follows the 4-digit format
   - Verify account type matches the code range

2. **Server Errors**:
   - Check your internet connection
   - Try refreshing the page
   - Contact system administrator if problem persists

3. **Conflict Errors**:
   - Use the conflict resolution suggestions above
   - Apply alternative codes if available
   - Check for duplicate account codes or names

4. **General Tips**:
   - Review the error details below
   - Use the "Retry" button to attempt the operation again
   - Clear the error and start fresh if needed
      `;

      alert(helpText);
    },

    /**
     * Retry saving the account
     */
    async retrySaveAccount() {
      // Clear the error first
      this.clearServerError();

      // Attempt to save again
      await this.saveAccount();
    },
  },
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.chart-of-accounts {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary-section {
  margin-bottom: 2rem;
}

.validation-section {
  margin-bottom: 2rem;
}

.validation-actions {
  display: flex;
  gap: 0.5rem;
}

.stat-card {
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.alternative-codes {
  margin-top: 0.5rem;
}

.alternative-codes .badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.account-type-validation {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
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
  margin: 0;
  opacity: 0.9;
}

.filters-section {
  margin-bottom: 2rem;
}

.accounts-tree-section {
  margin-bottom: 2rem;
}

.tree-view {
  min-height: 400px;
}

.tree-container {
  padding: 1rem;
}

.tree-item {
  margin-bottom: 0.5rem;
}

.tree-node {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
}

.tree-node:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.node-icon {
  font-size: 1.2rem;
  width: 30px;
  text-align: center;
}

.node-details {
  flex: 1;
}

.account-code {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.account-name {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 0.25rem;
}

.account-type {
  margin-top: 0.25rem;
}

.node-balance {
  text-align: right;
  min-width: 120px;
}

.balance-amount {
  font-weight: 600;
  font-size: 1.1rem;
  color: #28a745;
}

.balance-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
}

.table-view {
  min-height: 400px;
}

.balance-amount {
  font-weight: 600;
  color: #28a745;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Form validation styles */
.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.form-control.is-valid,
.form-select.is-valid {
  border-color: #28a745;
}

/* Table column styling for new fields */
.text-info {
  color: #17a2b8 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-muted {
  color: #6c757d !important;
}

/* Conflict section styling inside modal */
.conflict-section {
  border-left: 4px solid #ffc107 !important;
  background-color: #fff3cd !important;
}

.conflict-section h6 {
  color: #856404;
  font-weight: 600;
}

.conflict-section .text-info {
  color: #0c5460 !important;
}

.conflict-section .text-warning {
  color: #856404 !important;
}

.conflict-section .alternative-codes .badge {
  transition: all 0.2s;
}

.conflict-section .alternative-codes .badge:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Server error section styling */
.server-error-section {
  border-left: 4px solid !important;
}

.server-error-section.border-warning {
  border-left-color: #ffc107 !important;
  background-color: #fff3cd !important;
}

.server-error-section.border-danger {
  border-left-color: #dc3545 !important;
  background-color: #f8d7da !important;
}

.server-error-section.border-info {
  border-left-color: #17a2b8 !important;
  background-color: #d1ecf1 !important;
}

.server-error-section h6 {
  font-weight: 600;
}

.server-error-section.border-warning h6 {
  color: #856404;
}

.server-error-section.border-danger h6 {
  color: #721c24;
}

.server-error-section.border-info h6 {
  color: #0c5460;
}

.error-message {
  font-size: 1rem;
}

.error-details {
  margin-top: 1rem;
}

.error-details-text {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.error-timestamp {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .chart-of-accounts {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .node-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .node-balance,
  .node-actions {
    align-self: flex-end;
  }
}
</style>
