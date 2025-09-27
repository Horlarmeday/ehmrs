<template>
  <div class="pos-terminals-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="header-title">
          <h1 class="page-title">
            <i class="fas fa-credit-card text-primary mr-3"></i>
            POS Terminals Management
          </h1>
          <p class="page-subtitle text-muted">
            Manage hospital POS terminals for card payment processing
          </p>
        </div>
        <div class="header-actions">
          <b-button variant="primary" @click="showCreateModal">
            <i class="fas fa-plus mr-2"></i>Add POS Terminal
          </b-button>
          <b-button variant="outline-secondary" @click="refreshData">
            <i class="fas fa-sync-alt mr-2"></i>Refresh
          </b-button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <b-form-group label="Search" label-for="search-input">
                <b-form-input
                  id="search-input"
                  v-model="filters.search"
                  placeholder="Search by terminal ID, location, or merchant name..."
                  @input="debouncedSearch"
                >
                  <template #prepend>
                    <i class="fas fa-search"></i>
                  </template>
                </b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Bank Account" label-for="bank-account-filter">
                <b-form-select
                  id="bank-account-filter"
                  v-model="filters.bank_account_id"
                  :options="bankAccountOptions"
                  @change="applyFilters"
                  :disabled="bankAccountOptions.length === 0"
                >
                  <template #first>
                    <option value="">
                      {{ bankAccountOptions.length === 0 ? 'Loading...' : 'All Bank Accounts' }}
                    </option>
                  </template>
                </b-form-select>
                <small v-if="bankAccountOptions.length === 0" class="form-text text-muted">
                  Loading bank accounts...
                </small>
              </b-form-group>
            </div>
            <div class="col-md-3">
              <b-form-group label="Terminal Type" label-for="terminal-type-filter">
                <b-form-select
                  id="terminal-type-filter"
                  v-model="filters.terminal_type"
                  :options="terminalTypeOptions"
                  @change="applyFilters"
                >
                  <template #first>
                    <option value="">All Types</option>
                  </template>
                </b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
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
            <div class="col-md-1">
              <b-form-group label="&nbsp;">
                <b-button variant="outline-secondary" @click="clearFilters" block>
                  <i class="fas fa-times"></i>
                </b-button>
              </b-form-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- POS Terminals Table -->
    <div class="pos-terminals-table">
      <div class="card">
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading POS terminals...</span>
            </div>
            <p class="mt-3 text-muted">Loading POS terminals...</p>
          </div>

          <!-- Data Table -->
          <div>
            <!-- Error State -->
            <div v-if="error" class="alert alert-danger mb-3">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>Error:</strong> {{ error }}
              <b-button variant="outline-danger" size="sm" class="ml-3" @click="refreshData">
                Try Again
              </b-button>
            </div>

            <!-- Table Header -->
            <div class="table-header d-flex justify-content-between align-items-center mb-3">
              <div class="table-info">
                <h6 class="mb-0">
                  POS Terminals
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
                    <th @click="sortBy('terminal_id')" class="sortable">
                      Terminal ID
                      <i v-if="sortField === 'terminal_id'" :class="sortIcon"></i>
                    </th>
                    <th @click="sortBy('location')" class="sortable">
                      Location
                      <i v-if="sortField === 'location'" :class="sortIcon"></i>
                    </th>
                    <th>Bank Account</th>
                    <th>Terminal Type</th>
                    <th>Merchant Info</th>
                    <th>Daily Limits</th>
                    <th>Status</th>
                    <th>Last Used</th>
                    <th>Created By</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="terminal in posTerminals" :key="terminal.id" class="terminal-row">
                    <td>
                      <b-form-checkbox
                        v-model="selectedItems"
                        :value="terminal.id"
                      ></b-form-checkbox>
                    </td>
                    <td>
                      <strong>{{ terminal.terminal_id }}</strong>
                    </td>
                    <td>{{ terminal.location }}</td>
                    <td>
                      <div class="bank-account-info">
                        <div class="bank-name">{{ terminal.bankAccount?.bank_name }}</div>
                        <small class="text-muted">{{ terminal.bankAccount?.account_number }}</small>
                      </div>
                    </td>
                    <td>
                      <b-badge :variant="getTerminalTypeVariant(terminal.terminal_type)">
                        {{ getTerminalTypeDisplay(terminal.terminal_type) }}
                      </b-badge>
                    </td>
                    <td>
                      <div class="merchant-info">
                        <div v-if="terminal.merchant_name">{{ terminal.merchant_name }}</div>
                        <small v-if="terminal.merchant_id" class="text-muted"
                          >ID: {{ terminal.merchant_id }}</small
                        >
                      </div>
                    </td>
                    <td>
                      <div class="daily-limits">
                        <div v-if="terminal.daily_transaction_limit">
                          <small class="text-muted"
                            >Tx: {{ terminal.daily_transaction_limit }}</small
                          >
                        </div>
                        <div v-if="terminal.daily_amount_limit">
                          <small class="text-muted"
                            >₦{{ formatCurrency(terminal.daily_amount_limit) }}</small
                          >
                        </div>
                      </div>
                    </td>
                    <td>
                      <b-badge :variant="terminal.is_active ? 'success' : 'secondary'">
                        {{ terminal.is_active ? 'Active' : 'Inactive' }}
                      </b-badge>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatDate(terminal.last_used_at) }}
                      </small>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ getStaffName(terminal.createdByStaff) }}
                      </small>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <b-button
                          variant="outline-primary"
                          size="sm"
                          @click="viewTerminal(terminal)"
                          title="View Details"
                        >
                          <i class="fas fa-eye"></i>
                        </b-button>
                        <b-button
                          variant="outline-info"
                          size="sm"
                          @click="editTerminal(terminal)"
                          title="Edit Terminal"
                        >
                          <i class="fas fa-edit"></i>
                        </b-button>
                        <b-button
                          variant="outline-warning"
                          size="sm"
                          @click="toggleStatus(terminal)"
                          :title="terminal.is_active ? 'Deactivate' : 'Activate'"
                        >
                          <i :class="terminal.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                        </b-button>
                        <b-button
                          variant="outline-danger"
                          size="sm"
                          @click="deleteTerminal(terminal)"
                          title="Delete Terminal"
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
            <div v-if="posTerminals.length === 0 && !loading" class="text-center py-5">
              <i class="fas fa-credit-card fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">
                {{ error ? 'Unable to Load POS Terminals' : 'No POS Terminals Found' }}
              </h5>
              <p class="text-muted">
                {{
                  error
                    ? 'There was an error loading the data. Please try refreshing.'
                    : filters.search ||
                      filters.bank_account_id ||
                      filters.terminal_type ||
                      filters.is_active !== ''
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first POS terminal'
                }}
              </p>
              <div class="mt-3">
                <b-button variant="outline-secondary" @click="refreshData" class="mr-2">
                  <i class="fas fa-sync-alt mr-2"></i>Refresh
                </b-button>
                <b-button
                  v-if="
                    !error &&
                    !filters.search &&
                    !filters.bank_account_id &&
                    filters.terminal_type === '' &&
                    filters.is_active === ''
                  "
                  variant="primary"
                  @click="showCreateModal"
                >
                  <i class="fas fa-plus mr-2"></i>Add POS Terminal
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
    <POSTerminalForm
      :displayPrompt="showModal"
      :terminal="editingTerminal"
      @closeModal="closeModal"
      @saved="onTerminalSaved"
      :bank-account-options="bankAccountOptions"
    />

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete POS Terminal"
      header-bg-variant="danger"
      header-text-variant="white"
      @ok="confirmDelete"
      @cancel="cancelDelete"
    >
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h5>Are you sure you want to delete this POS terminal?</h5>
        <p class="text-muted">
          <strong>{{ terminalToDelete?.terminal_id }} - {{ terminalToDelete?.location }}</strong>
        </p>
        <p class="text-danger">
          <small>
            <i class="fas fa-info-circle mr-1"></i>
            This action cannot be undone. All associated data will be permanently removed.
          </small>
        </p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import POSTerminalForm from './POSTerminalForm.vue';
import { debounce } from 'lodash';

export default {
  name: 'POSTerminalsPage',
  components: {
    POSTerminalForm,
  },
  data() {
    return {
      loading: false,
      error: null,
      posTerminals: [],
      selectedItems: [],
      selectAll: false,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      totalPages: 0,
      filters: {
        search: '',
        bank_account_id: '',
        terminal_type: '',
        is_active: '',
      },
      sortField: 'terminal_id',
      sortOrder: 'asc',
      showModal: false,
      editingTerminal: null,
      showDeleteModal: false,
      terminalToDelete: null,
      bankAccountOptions: [],
    };
  },
  computed: {
    terminalTypeOptions() {
      return [
        { value: 'MOBILE', text: 'Mobile Terminal' },
        { value: 'FIXED', text: 'Fixed Terminal' },
        { value: 'KIOSK', text: 'Self-Service Kiosk' },
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
  },
  mounted() {
    this.loadPOSTerminals();
    this.loadBankAccounts();
  },
  methods: {
    // Data Loading
    async loadPOSTerminals() {
      try {
        this.loading = true;
        this.error = null;

        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage,
          ...this.filters,
        };

        const response = await this.$store.dispatch('accounting/getPOSTerminals', params);

        if (response && response.data) {
          this.posTerminals = response.data.posTerminals || response.data;
          this.totalItems = response.data.total || response.data.length;
          this.totalPages = response.data.pages || Math.ceil(this.totalItems / this.itemsPerPage);
        } else {
          this.posTerminals = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      } catch (error) {
        console.error('Failed to load POS terminals:', error);
        this.error = error.message || 'Failed to load POS terminals';
        // Keep existing data if available, otherwise use empty array
        if (this.posTerminals.length === 0) {
          this.posTerminals = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      } finally {
        this.loading = false;
      }
    },

    async loadBankAccounts() {
      try {
        // Fetch active bank accounts for the filter dropdown
        const response = await this.$store.dispatch('accounting/getActiveBankAccounts');

        if (response && response.success && response.data) {
          // Map bank accounts to select options format
          this.bankAccountOptions = response.data.map((account) => ({
            value: account.id,
            text: `${account.bank_name} - ${account.account_number}`,
          }));
        } else {
          // If no response data, set empty options
          this.bankAccountOptions = [];
        }
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        // On error, set empty options and show error toast
        this.bankAccountOptions = [];
        this.$bvToast.toast('Failed to load bank accounts for filter', {
          title: 'Warning',
          variant: 'warning',
          solid: true,
        });
      }
    },

    // Method to manually refresh bank accounts
    async refreshBankAccounts() {
      await this.loadBankAccounts();
    },

    // Search and Filtering
    debouncedSearch: debounce(function () {
      this.currentPage = 1;
      this.applyFilters();
    }, 300),

    applyFilters() {
      this.currentPage = 1;
      this.loadPOSTerminals();
    },

    clearFilters() {
      this.filters = {
        search: '',
        bank_account_id: '',
        terminal_type: '',
        is_active: '',
      };
      this.currentPage = 1;
      this.loadPOSTerminals();
    },

    // Sorting
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'asc';
      }
      this.loadPOSTerminals();
    },

    // Pagination
    handlePageChange(page) {
      this.currentPage = page;
      this.loadPOSTerminals();
    },

    // Selection
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedItems = this.posTerminals.map((terminal) => terminal.id);
      } else {
        this.selectedItems = [];
      }
    },

    // Modal Management
    showCreateModal() {
      this.editingTerminal = null;
      this.showModal = true;
    },

    editTerminal(terminal) {
      this.editingTerminal = { ...terminal };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editingTerminal = null;
    },

    onTerminalSaved() {
      this.closeModal();
      this.refreshData();
      this.$bvToast.toast('POS terminal saved successfully', {
        title: 'Success',
        variant: 'success',
        solid: true,
      });
    },

    // Terminal Actions
    viewTerminal(terminal) {
      this.$router.push(`/accounting/pos-terminals/${terminal.id}`);
    },

    async toggleStatus(terminal) {
      try {
        await this.$store.dispatch('accounting/togglePOSTerminalStatus', terminal.id);
        this.refreshData();
        this.$bvToast.toast(
          `POS terminal ${terminal.is_active ? 'deactivated' : 'activated'} successfully`,
          {
            title: 'Success',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Failed to toggle status:', error);
        this.$bvToast.toast('Failed to update terminal status', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    deleteTerminal(terminal) {
      this.terminalToDelete = terminal;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      try {
        await this.$store.dispatch('accounting/deletePOSTerminal', this.terminalToDelete.id);
        this.showDeleteModal = false;
        this.terminalToDelete = null;
        this.refreshData();
        this.$bvToast.toast('POS terminal deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to delete terminal:', error);
        this.$bvToast.toast('Failed to delete POS terminal', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.terminalToDelete = null;
    },

    // Bulk Operations
    async bulkToggleStatus() {
      if (this.selectedItems.length === 0) return;

      try {
        await Promise.all(
          this.selectedItems.map((id) =>
            this.$store.dispatch('accounting/togglePOSTerminalStatus', id)
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
        this.$bvToast.toast('Failed to update some terminal statuses', {
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
          this.selectedItems.map((id) => this.$store.dispatch('accounting/deletePOSTerminal', id))
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
        this.$bvToast.toast('Failed to delete some terminals', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    // Utility Methods
    refreshData() {
      this.error = null; // Clear any existing errors
      this.loadPOSTerminals();
      this.loadBankAccounts(); // Also refresh bank accounts
    },

    getTerminalTypeVariant(type) {
      const variants = {
        MOBILE: 'info',
        FIXED: 'primary',
        KIOSK: 'warning',
      };
      return variants[type] || 'secondary';
    },

    getTerminalTypeDisplay(type) {
      const displays = {
        MOBILE: 'Mobile',
        FIXED: 'Fixed',
        KIOSK: 'Kiosk',
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
      if (!date) return 'Never';
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
.pos-terminals-page {
  padding: 1rem;
}

.page-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

.pos-terminals-table .card {
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

.terminal-row:hover {
  background-color: #f8f9fa;
}

.bank-account-info .bank-name {
  font-weight: 600;
  color: #495057;
}

.merchant-info {
  min-width: 120px;
}

.daily-limits {
  min-width: 100px;
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
  .pos-terminals-page {
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
