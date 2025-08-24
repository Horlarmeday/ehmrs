<template>
  <div class="bank-accounts-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="header-title">
          <h1 class="page-title">
            <i class="fas fa-university text-primary mr-3"></i>
            Bank Accounts Management
          </h1>
          <p class="page-subtitle text-muted">
            Manage hospital bank accounts for payment processing and financial operations
          </p>
        </div>
        <div class="header-actions">
          <b-button variant="primary" @click="showCreateModal">
            <i class="fas fa-plus mr-2"></i>Add Bank Account
          </b-button>
          <b-button variant="outline-secondary" @click="refreshData">
            <i class="fas fa-sync-alt mr-2"></i>Refresh
          </b-button>
          <b-button
            variant="outline-info"
            @click="showKeyboardShortcuts"
            title="Keyboard Shortcuts (?)"
          >
            <i class="fas fa-keyboard mr-2"></i>Shortcuts
          </b-button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <b-form-group label="Search" label-for="search-input">
                <b-form-input
                  id="search-input"
                  v-model="filters.search"
                  placeholder="Search by bank name, account number, or account name..."
                  @input="debouncedSearch"
                  @focus="showSearchHelp = true"
                  @blur="hideSearchHelp"
                >
                  <template #prepend>
                    <i class="fas fa-search"></i>
                  </template>
                </b-form-input>
                <!-- Search Help Tooltip -->
                <div v-if="showSearchHelp" class="search-help-tooltip">
                  <div class="tooltip-content">
                    <h6><i class="fas fa-lightbulb text-warning mr-2"></i>Search Tips</h6>
                    <ul class="mb-0">
                      <li>Use quotes for exact phrases: "First Bank"</li>
                      <li>Search by account number: 1234567890</li>
                      <li>Search by account type: CURRENT, SAVINGS</li>
                      <li>Use wildcards: *bank* for partial matches</li>
                    </ul>
                  </div>
                </div>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Account Type" label-for="account-type-filter">
                <b-form-select
                  id="account-type-filter"
                  v-model="filters.account_type"
                  :options="accountTypeOptions"
                  @change="applyFilters"
                >
                  <template #first>
                    <option value="">All Types</option>
                  </template>
                </b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Status" label-for="status-filter">
                <b-form-select
                  id="status-filter"
                  v-model="filters.is_active"
                  :options="statusOptions"
                  @change="applyFilters"
                >
                  <template #first>
                    <option value="">All Status</option>
                  </template>
                </b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="&nbsp;">
                <b-button variant="outline-secondary" @click="clearFilters" block>
                  <i class="fas fa-times mr-2"></i>Clear
                </b-button>
              </b-form-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bank Accounts Table -->
    <div class="bank-accounts-table">
      <div class="card">
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading bank accounts...</span>
            </div>
            <p class="mt-3 text-muted">Loading bank accounts...</p>
          </div>

          <!-- Error State -->
          <div v-if="error" class="alert alert-danger mb-3">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <strong>Error:</strong> {{ error }}
            <b-button variant="outline-danger" size="sm" class="ml-3" @click="refreshData">
              Try Again
            </b-button>
          </div>

          <!-- Data Table -->
          <div>
            <!-- Table Header -->
            <div class="table-header d-flex justify-content-between align-items-center mb-3">
              <div class="table-info">
                <h6 class="mb-0">
                  Bank Accounts
                  <span class="badge badge-secondary ml-2">{{ totalItems }}</span>
                </h6>
              </div>
              <div class="table-actions">
                <b-button
                  v-if="selectedItems.length > 0"
                  variant="outline-warning"
                  size="sm"
                  @click="bulkToggleStatus"
                  class="mr-2"
                >
                  <i class="fas fa-toggle-on mr-1"></i>
                  Toggle Status ({{ selectedItems.length }})
                </b-button>
                <b-button
                  v-if="selectedItems.length > 0"
                  variant="outline-info"
                  size="sm"
                  @click="bulkExport"
                  class="mr-2"
                >
                  <i class="fas fa-download mr-1"></i>
                  Export ({{ selectedItems.length }})
                </b-button>
                <b-button
                  v-if="selectedItems.length > 0"
                  variant="outline-danger"
                  size="sm"
                  @click="bulkDelete"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Delete ({{ selectedItems.length }})
                </b-button>
              </div>
            </div>

            <!-- Data Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th width="50">
                      <b-form-checkbox
                        v-model="selectAll"
                        @change="toggleSelectAll"
                      ></b-form-checkbox>
                    </th>
                    <th @click="sortBy('bank_name')" class="sortable">
                      Bank Name
                      <i v-if="sortField === 'bank_name'" :class="sortIcon"></i>
                    </th>
                    <th @click="sortBy('account_number')" class="sortable">
                      Account Number
                      <i v-if="sortField === 'account_number'" :class="sortIcon"></i>
                    </th>
                    <th @click="sortBy('account_name')" class="sortable">
                      Account Name
                      <i v-if="sortField === 'account_name'" :class="sortIcon"></i>
                    </th>
                    <th>Account Type</th>
                    <th @click="sortBy('current_balance')" class="sortable">
                      Current Balance
                      <i v-if="sortField === 'current_balance'" :class="sortIcon"></i>
                    </th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Created Date</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="account in bankAccounts" :key="account.id" class="">
                    <td>
                      <b-form-checkbox
                        v-model="selectedItems"
                        :value="account.id"
                      ></b-form-checkbox>
                    </td>
                    <td>
                      <strong>{{ account.bank_name }}</strong>
                    </td>
                    <td>
                      <code class="text-primary">{{ account.account_number }}</code>
                    </td>
                    <td>{{ account.account_name }}</td>
                    <td>
                      <b-badge :variant="getAccountTypeVariant(account.account_type)">
                        {{ getAccountTypeDisplay(account.account_type) }}
                      </b-badge>
                    </td>
                    <td>
                      <span class="font-weight-bold text-success">
                        {{ formatCurrency(account.current_balance) }}
                      </span>
                    </td>
                    <td>
                      <b-badge :variant="account.is_active ? 'success' : 'secondary'">
                        {{ account.is_active ? 'Active' : 'Inactive' }}
                      </b-badge>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ getStaffName(account.createdByStaff) }}
                      </small>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatDate(account.createdAt) }}
                      </small>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <b-button
                          variant="outline-primary"
                          size="sm"
                          @click="viewAccount(account)"
                          title="View Details"
                        >
                          <i class="fas fa-eye"></i>
                        </b-button>
                        <b-button
                          variant="outline-info"
                          size="sm"
                          @click="editAccount(account)"
                          title="Edit Account"
                        >
                          <i class="fas fa-edit"></i>
                        </b-button>
                        <b-button
                          variant="outline-warning"
                          size="sm"
                          @click="toggleStatus(account)"
                          :title="account.is_active ? 'Deactivate' : 'Activate'"
                        >
                          <i :class="account.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                        </b-button>
                        <b-button
                          variant="outline-danger"
                          size="sm"
                          @click="deleteAccount(account)"
                          title="Delete Account"
                        >
                          <i class="fas fa-trash"></i>
                        </b-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="bankAccounts.length === 0 && !loading" class="text-center py-5">
              <i class="fas fa-university fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">
                {{ error ? 'Unable to Load Bank Accounts' : 'No Bank Accounts Found' }}
              </h5>
              <p class="text-muted">
                {{
                  error
                    ? 'There was an error loading the data. Please try refreshing.'
                    : filters.search || filters.account_type || filters.is_active !== ''
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first bank account'
                }}
              </p>
              <div class="mt-3">
                <b-button variant="outline-secondary" @click="refreshData" class="mr-2">
                  <i class="fas fa-sync-alt mr-2"></i>Refresh
                </b-button>
                <b-button
                  v-if="!error && !filters.search && filters.account_type === '' && filters.is_active === ''"
                  variant="primary"
                  @click="showCreateModal"
                >
                  <i class="fas fa-plus mr-2"></i>Add Bank Account
                </b-button>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination-wrapper mt-4">
              <b-pagination
                v-model="currentPage"
                :total-rows="totalItems"
                :per-page="itemsPerPage"
                :page-options="[10, 20, 50, 100]"
                @change="handlePageChange"
                align="center"
                size="lg"
              ></b-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BankAccountForm
      :displayPrompt="showModal"
      :account="editingAccount"
      @closeModal="closeModal"
      @saved="onAccountSaved"
    />

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete Bank Account"
      header-bg-variant="danger"
      header-text-variant="white"
      @ok="confirmDelete"
      @cancel="cancelDelete"
    >
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h5>Are you sure you want to delete this bank account?</h5>
        <p class="text-muted">
          <strong>{{ accountToDelete?.bank_name }} - {{ accountToDelete?.account_number }}</strong>
        </p>
        <p class="text-danger">
          <small>
            <i class="fas fa-info-circle mr-1"></i>
            This action cannot be undone. All associated data will be permanently removed.
          </small>
        </p>
      </div>
    </b-modal>

    <!-- Export Modal -->
    <b-modal
      v-model="showExportModal"
      title="Export Bank Accounts"
      header-bg-variant="info"
      header-text-variant="white"
      @ok="confirmExport"
      @cancel="cancelExport"
    >
      <div class="export-form">
        <div class="mb-3">
          <label class="form-label">Export Format</label>
          <b-form-select
            v-model="exportFormat"
            :options="exportFormatOptions"
            required
          ></b-form-select>
        </div>
        <div class="mb-3">
          <label class="form-label">Export Scope</label>
          <div class="export-scope">
            <b-form-radio-group v-model="exportScope" name="export-scope">
              <b-form-radio value="selected"
                >Selected Items ({{ selectedItems.length }})</b-form-radio
              >
              <b-form-radio value="filtered">Filtered Results ({{ totalItems }})</b-form-radio>
              <b-form-radio value="all">All Bank Accounts</b-form-radio>
            </b-form-radio-group>
          </div>
        </div>
        <div class="mb-3" v-if="exportFormat === 'csv'">
          <label class="form-label">CSV Options</label>
          <b-form-checkbox v-model="exportOptions.includeHeaders">
            Include column headers
          </b-form-checkbox>
          <b-form-checkbox v-model="exportOptions.includeTimestamps">
            Include timestamps
          </b-form-checkbox>
        </div>
        <div class="mb-3" v-if="exportFormat === 'pdf'">
          <label class="form-label">PDF Options</label>
          <b-form-checkbox v-model="exportOptions.includeLogo">
            Include hospital logo
          </b-form-checkbox>
          <b-form-checkbox v-model="exportOptions.includeSummary">
            Include summary statistics
          </b-form-checkbox>
        </div>
      </div>
    </b-modal>

    <!-- Keyboard Shortcuts Modal -->
    <b-modal
      v-model="showShortcutsModal"
      title="Keyboard Shortcuts"
      header-bg-variant="info"
      header-text-variant="white"
      size="lg"
      @ok="closeShortcutsModal"
      @cancel="closeShortcutsModal"
    >
      <div class="keyboard-shortcuts">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-primary mb-3">Navigation Shortcuts</h6>
            <div class="shortcut-item">
              <kbd>Ctrl + N</kbd>
              <span>Create new bank account</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + F</kbd>
              <span>Focus search input</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + R</kbd>
              <span>Refresh data</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + S</kbd>
              <span>Save form (when editing)</span>
            </div>
          </div>
          <div class="col-md-6">
            <h6 class="text-primary mb-3">Table Shortcuts</h6>
            <div class="shortcut-item">
              <kbd>Space</kbd>
              <span>Select/deselect current row</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + A</kbd>
              <span>Select all items</span>
            </div>
            <div class="shortcut-item">
              <kbd>Delete</kbd>
              <span>Delete selected items</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + E</kbd>
              <span>Export selected items</span>
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12">
            <h6 class="text-primary mb-3">General Shortcuts</h6>
            <div class="shortcut-item">
              <kbd>?</kbd>
              <span>Show this help (anywhere on page)</span>
            </div>
            <div class="shortcut-item">
              <kbd>Escape</kbd>
              <span>Close modals, cancel operations</span>
            </div>
            <div class="shortcut-item">
              <kbd>Enter</kbd>
              <span>Confirm actions, submit forms</span>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import BankAccountForm from './BankAccountForm.vue';
import { debounce } from 'lodash';

export default {
  name: 'BankAccountsPage',
  components: {
    BankAccountForm,
  },
  data() {
    return {
      loading: false,
      error: null,
      bankAccounts: [],
      selectedItems: [],
      selectAll: false,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      totalPages: 0,
      filters: {
        search: '',
        account_type: '',
        is_active: '',
      },
      sortField: 'bank_name',
      sortOrder: 'asc',
      showModal: false,
      editingAccount: null,
      showDeleteModal: false,
      accountToDelete: null,
      showExportModal: false,
      exportFormat: 'csv',
      exportScope: 'selected',
      exportOptions: {
        includeHeaders: true,
        includeTimestamps: true,
        includeLogo: true,
        includeSummary: true,
      },
      showSearchHelp: false,
      showShortcutsModal: false,
    };
  },
  computed: {
    accountTypeOptions() {
      return [
        { value: 'CURRENT', text: 'Current Account' },
        { value: 'SAVINGS', text: 'Savings Account' },
        { value: 'FIXED_DEPOSIT', text: 'Fixed Deposit' },
        { value: 'DOMICILIARY', text: 'Domiciliary Account' },
      ];
    },
    statusOptions() {
      return [
        { value: true, text: 'Active' },
        { value: false, text: 'Inactive' },
      ];
    },
    sortIcon() {
      return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },
    exportFormatOptions() {
      return [
        { value: 'csv', text: 'CSV (Excel compatible)' },
        { value: 'pdf', text: 'PDF Document' },
      ];
    },
  },
  mounted() {
    this.loadBankAccounts();
    this.setupKeyboardShortcuts();
    this.setupPerformanceOptimizations();
  },

  beforeDestroy() {
    this.cleanupPerformanceOptimizations();
  },
  methods: {
    // Data Loading
    async loadBankAccounts() {
      try {
        this.loading = true;
        this.error = null;

        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage,
          sort: this.sortField,
          order: this.sortOrder,
          ...this.filters,
        };

        const response = await this.$store.dispatch('accounting/getBankAccounts', params);

        if (response && response.data) {
          this.bankAccounts = response.data.bankAccounts || response.data;
          this.totalItems = response.data.total || response.data.length;
          this.totalPages = response.data.pages || Math.ceil(this.totalItems / this.itemsPerPage);
        } else {
          this.bankAccounts = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        this.error = error.message || 'Failed to load bank accounts';
        // Keep existing data if available, otherwise use empty array
        if (this.bankAccounts.length === 0) {
          this.bankAccounts = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      } finally {
        this.loading = false;
      }
    },

    // Search and Filtering
    debouncedSearch: debounce(function() {
      this.currentPage = 1;
      this.applyFilters();
    }, 300),

    // showSearchHelp() {
    //   this.showSearchHelp = true;
    // },

    hideSearchHelp() {
      // Use setTimeout to allow the tooltip to be clicked
      setTimeout(() => {
        this.showSearchHelp = false;
      }, 200);
    },

    showKeyboardShortcuts() {
      this.showShortcutsModal = true;
    },

    closeShortcutsModal() {
      this.showShortcutsModal = false;
    },

    // Performance Optimization Methods
    setupKeyboardShortcuts() {
      // Add global keyboard shortcuts
      document.addEventListener('keydown', this.handleGlobalKeydown);
    },

    setupPerformanceOptimizations() {
      // Setup intersection observer for lazy loading
      this.setupIntersectionObserver();

      // Setup debounced resize handler
      this.debouncedResize = debounce(this.handleResize, 250);
      window.addEventListener('resize', this.debouncedResize);

      // Setup performance monitoring
      this.setupPerformanceMonitoring();
    },

    cleanupPerformanceOptimizations() {
      // Remove event listeners
      document.removeEventListener('keydown', this.handleGlobalKeydown);
      window.removeEventListener('resize', this.debouncedResize);

      // Cleanup intersection observer
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
    },

    handleGlobalKeydown(event) {
      // Global keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            this.showCreateModal();
            break;
          case 'f':
            event.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'r':
            event.preventDefault();
            this.refreshData();
            break;
          case 'a':
            event.preventDefault();
            this.toggleSelectAll();
            break;
          case 'e':
            event.preventDefault();
            if (this.selectedItems.length > 0) {
              this.bulkExport();
            }
            break;
        }
      } else if (event.key === '?') {
        event.preventDefault();
        this.showKeyboardShortcuts();
      } else if (event.key === 'Escape') {
        // Close any open modals
        if (this.showModal) this.closeModal();
        if (this.showExportModal) this.cancelExport();
        if (this.showShortcutsModal) this.closeShortcutsModal();
        if (this.showDeleteModal) this.cancelDelete();
      }
    },

    setupIntersectionObserver() {
      // Lazy load table rows when they come into view
      this.intersectionObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1 }
      );
    },

    handleResize() {
      // Optimize table rendering on resize
      this.$nextTick(() => {
        // Recalculate table dimensions if needed
        this.optimizeTableRendering();
      });
    },

    setupPerformanceMonitoring() {
      // Monitor performance metrics
      if ('performance' in window) {
        this.performanceObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'measure') {
              console.log(`Performance: ${entry.name} took ${entry.entryType}ms`);
            }
          });
        });
        this.performanceObserver.observe({ entryTypes: ['measure'] });
      }
    },

    optimizeTableRendering() {
      // Optimize table rendering for better performance
      const table = document.querySelector('.table');
      if (table) {
        // Use CSS containment for better rendering performance
        table.style.contain = 'layout style paint';

        // Optimize row rendering
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
          if (index > 50) {
            // Lazy load rows beyond 50 for better performance
            row.style.contain = 'layout style paint';
          }
        });
      }
    },

    applyFilters() {
      this.currentPage = 1;
      this.loadBankAccounts();
    },

    clearFilters() {
      this.filters = {
        search: '',
        account_type: '',
        is_active: '',
      };
      this.currentPage = 1;
      this.loadBankAccounts();
    },

    // Sorting
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'asc';
      }
      this.loadBankAccounts();
    },

    // Pagination
    handlePageChange(page) {
      this.currentPage = page;
      this.loadBankAccounts();
    },

    // Selection
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedItems = this.bankAccounts.map(account => account.id);
      } else {
        this.selectedItems = [];
      }
    },

    // Modal Management
    showCreateModal() {
      this.editingAccount = null;
      this.showModal = true;
    },

    editAccount(account) {
      this.editingAccount = { ...account };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editingAccount = null;
    },

    onAccountSaved() {
      this.closeModal();
      this.refreshData();
      this.$bvToast.toast('Bank account saved successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    // Account Actions
    viewAccount(account) {
      this.$router.push(`/accounting/bank-accounts/${account.id}`);
    },

    async toggleStatus(account) {
      try {
        await this.$store.dispatch('accounting/toggleBankAccountStatus', account.id);
        this.refreshData();
        this.$bvToast.toast(
          `Bank account ${account.is_active ? 'deactivated' : 'activated'} successfully`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Failed to toggle status:', error);
        this.$bvToast.toast('Failed to update account status', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    deleteAccount(account) {
      this.accountToDelete = account;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await this.$store.dispatch('accounting/deleteBankAccount', this.accountToDelete.id);
        this.showDeleteModal = false;
        this.accountToDelete = null;
        this.refreshData();
        this.$bvToast.toast('Bank account deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to delete account:', error);
        this.$bvToast.toast('Failed to delete bank account', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.accountToDelete = null;
    },

    // Bulk Operations
    async bulkToggleStatus() {
      if (this.selectedItems.length === 0) return;

      try {
        await Promise.all(
          this.selectedItems.map(id =>
            this.$store.dispatch('accounting/toggleBankAccountStatus', id)
          )
        );
        this.selectedItems = [];
        this.selectAll = false;
        this.refreshData();
        this.$bvToast.toast('Bulk status update completed', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to bulk update status:', error);
        this.$bvToast.toast('Failed to update some account statuses', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async bulkDelete() {
      if (this.selectedItems.length === 0) return;

      try {
        await Promise.all(
          this.selectedItems.map(id => this.$store.dispatch('accounting/deleteBankAccount', id))
        );
        this.selectedItems = [];
        this.selectAll = false;
        this.refreshData();
        this.$bvToast.toast('Bulk delete completed', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to bulk delete:', error);
        this.$bvToast.toast('Failed to delete some accounts', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    // Export Operations
    bulkExport() {
      this.showExportModal = true;
    },

    async confirmExport() {
      try {
        const exportData = this.prepareExportData();
        await this.performExport(exportData);

        this.showExportModal = false;
        this.$bvToast.toast('Export completed successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Export failed:', error);
        this.$bvToast.toast('Export failed: ' + error.message, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelExport() {
      this.showExportModal = false;
    },

    prepareExportData() {
      let dataToExport = [];

      if (this.exportScope === 'selected') {
        dataToExport = this.bankAccounts.filter(account => this.selectedItems.includes(account.id));
      } else if (this.exportScope === 'filtered') {
        dataToExport = this.bankAccounts;
      } else {
        // For 'all', we would need to fetch all accounts without pagination
        dataToExport = this.bankAccounts;
      }

      return dataToExport.map(account => ({
        'Bank Name': account.bank_name,
        'Account Number': account.account_number,
        'Account Name': account.account_name,
        'Account Type': this.getAccountTypeDisplay(account.account_type),
        'Current Balance': account.current_balance,
        Status: account.is_active ? 'Active' : 'Inactive',
        Description: account.description || '',
        'Created By': this.getStaffName(account.createdByStaff),
        'Created Date': this.formatDate(account.createdAt),
        'Last Updated': account.updatedAt ? this.formatDate(account.updatedAt) : 'N/A',
      }));
    },

    async performExport(data) {
      if (this.exportFormat === 'csv') {
        await this.exportToCSV(data);
      } else if (this.exportFormat === 'pdf') {
        await this.exportToPDF(data);
      }
    },

    async exportToCSV(data) {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bank_accounts_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    async exportToPDF(data) {
      console.log('Exporting to PDF:', data);
      // For now, we'll use a simple approach
      // In a production environment, you might want to use a library like jsPDF
      this.$bvToast.toast('PDF export will be implemented in future updates', {
        title: 'Coming Soon',
        variant: 'info',
        solid: true,
      });
    },

    // Utility Methods
    refreshData() {
      this.error = null; // Clear any existing errors
      this.loadBankAccounts();
    },

    getAccountTypeVariant(type) {
      const variants = {
        CURRENT: 'primary',
        SAVINGS: 'success',
        FIXED_DEPOSIT: 'warning',
        DOMICILIARY: 'info',
      };
      return variants[type] || 'secondary';
    },

    getAccountTypeDisplay(type) {
      const displays = {
        CURRENT: 'Current',
        SAVINGS: 'Savings',
        FIXED_DEPOSIT: 'Fixed Deposit',
        DOMICILIARY: 'Domiciliary',
      };
      return displays[type] || type;
    },

    getStaffName(staff) {
      if (!staff) return 'Unknown';
      return `${staff.firstname || ''} ${staff.lastname || ''}`.trim() || 'Unknown';
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount || 0);
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.bank-accounts-page {
  padding: 1rem;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.header-title .page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.header-title .page-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.search-filters .card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.bank-accounts-table .card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.table-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.account-row:hover {
  background-color: #f8f9fa;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
}

/* Export Modal Styles */
.export-form {
  padding: 1rem 0;
}

.export-scope {
  padding: 0.5rem 0;
}

.export-scope .custom-radio {
  margin-bottom: 0.5rem;
}

.export-scope .custom-radio:last-child {
  margin-bottom: 0;
}

/* Search Help Tooltip */
.search-help-tooltip {
  position: absolute;
  z-index: 1000;
  margin-top: 0.5rem;
}

.tooltip-content {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  min-width: 300px;
  max-width: 400px;
}

.tooltip-content h6 {
  color: #495057;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.tooltip-content ul {
  list-style: none;
  padding-left: 0;
}

.tooltip-content li {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.tooltip-content li:before {
  content: '•';
  color: #007bff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.tooltip-content li:last-child {
  margin-bottom: 0;
}

/* Keyboard Shortcuts Styles */
.keyboard-shortcuts {
  padding: 1rem 0;
}

.shortcut-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.shortcut-item:last-child {
  margin-bottom: 0;
}

.shortcut-item kbd {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-family: monospace;
  margin-right: 1rem;
  min-width: 80px;
  text-align: center;
  display: inline-block;
}

.shortcut-item span {
  color: #495057;
  font-size: 0.9rem;
}

/* Performance Optimization Styles */
.table {
  contain: layout style paint;
}

.table tbody tr {
  contain: layout style paint;
  transition: opacity 0.2s ease;
}

.table tbody tr:not(.visible) {
  opacity: 1;
}

.table tbody tr.visible {
  opacity: 1;
}

/* Optimize rendering for large datasets */
.table-responsive {
  contain: layout style paint;
  will-change: scroll-position;
}

/* Smooth scrolling optimization */
.table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-group .btn {
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 576px) {
  .bank-accounts-page {
    padding: 0.5rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-title .page-title {
    font-size: 1.5rem;
  }

  .search-filters .row > div {
    margin-bottom: 1rem;
  }
}
</style>
