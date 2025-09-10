<template>
  <div class="payment-management">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-history text-primary mr-3"></i>
        Payment History
      </h1>
      <div class="header-actions">
        <b-button
          variant="outline-info"
          @click="downloadSelectedReceipts"
          :disabled="selectedPayments.size === 0 || isAnyReceiptDownloading"
          title="Download selected receipts"
        >
          <i class="fas fa-download mr-2"></i>
          Download Selected ({{ selectedPayments.size }})
        </b-button>
        <b-button
          variant="outline-success"
          @click="downloadMultipleReceipts(filteredPayments)"
          :disabled="!hasPayments || isAnyReceiptDownloading"
          title="Download all visible receipts"
        >
          <i class="fas fa-download mr-2"></i>
          Download All Receipts
        </b-button>
        <b-button variant="outline-secondary" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>Refresh
        </b-button>
      </div>
    </div>

    <!-- Payment History Tab -->
    <div class="tab-content">
      <!-- Search and Filters -->
      <div class="filters-section mb-4">
        <div class="row">
          <div class="col-md-3">
            <b-form-group label="Payment Method" label-for="method-filter">
              <b-form-select
                id="method-filter"
                v-model="filters.payment_method"
                :options="paymentMethodOptions"
                @change="onFilterChange"
                :disabled="loadingFilters"
              >
                <template #first>
                  <option value="">All Methods</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-3">
            <b-form-group label="Date Range" label-for="date-range">
              <b-form-select
                id="date-range"
                v-model="filters.dateRange"
                :options="dateRangeOptions"
                @change="onFilterChange"
                :disabled="loadingFilters"
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-3">
            <b-form-group label="Status" label-for="status-filter">
              <b-form-select
                id="status-filter"
                v-model="filters.status"
                :options="statusOptions"
                @change="onFilterChange"
                :disabled="loadingFilters"
              >
                <template #first>
                  <option value="">All Statuses</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-3">
            <b-form-group label="Search" label-for="search-payments">
              <div class="input-group">
                <b-form-input
                  id="search-payments"
                  v-model="filters.search"
                  placeholder="Patient name, bill #, reference..."
                  @input="onSearchInput"
                  :disabled="loadingFilters"
                ></b-form-input>
                <div class="input-group-append" v-if="loadingFilters">
                  <span class="input-group-text">
                    <i class="fas fa-spinner fa-spin"></i>
                  </span>
                </div>
              </div>
            </b-form-group>
          </div>
        </div>

        <!-- Filter Loading Indicator -->
        <div v-if="loadingFilters" class="filter-loading mt-3 text-center">
          <small class="text-muted">
            <i class="fas fa-spinner fa-spin mr-2"></i>Applying filters...
          </small>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="payments-table">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="thead-light">
              <tr>
                <th>
                  <b-form-checkbox
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    title="Select all payments"
                  ></b-form-checkbox>
                </th>
                <th>Date</th>
                <th>Reference</th>
                <th>Patient</th>
                <th>Bill #</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Processed By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="isLoadingPayments">
                <td colspan="10" class="text-center py-4">
                  <b-spinner variant="primary" label="Loading..."></b-spinner>
                  <p class="mt-2">Loading payments...</p>
                </td>
              </tr>

              <!-- No Payments State -->
              <tr v-else-if="!hasPayments && !isLoadingPayments">
                <td colspan="10" class="text-center py-4">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5>No payments found</h5>
                  <p class="text-muted">There are no payments to display</p>
                </td>
              </tr>

              <!-- Payments Data -->
              <tr v-else v-for="payment in filteredPayments" :key="payment.id">
                <td>
                  <b-form-checkbox
                    :value="payment.id"
                    v-model="selectedPayments"
                    @change="onPaymentSelectionChange"
                  ></b-form-checkbox>
                </td>
                <td>{{ formatDate(payment.processed_at) }}</td>
                <td>
                  <strong>{{ payment.payment_reference }}</strong>
                </td>
                <td>{{ payment.patient?.fullname || 'N/A' }}</td>
                <td>{{ payment.bill?.bill_number || 'N/A' }}</td>
                <td>{{ formatCurrency(payment.amount) }}</td>
                <td>
                  <b-badge :variant="getPaymentMethodVariant(payment.payment_method)">
                    {{ payment.payment_method }}
                  </b-badge>
                </td>
                <td>
                  <b-badge :variant="getStatusVariant(payment.status)">
                    {{ payment.status }}
                  </b-badge>
                </td>
                <td>{{ payment.processedByStaff?.fullname || 'N/A' }}</td>
                <td>
                  <div class="action-buttons">
                    <b-button
                      variant="outline-primary"
                      size="sm"
                      @click="viewPaymentDetails(payment)"
                      title="View Details"
                    >
                      <i class="fas fa-eye"></i>
                    </b-button>
                    <b-button
                      variant="outline-success"
                      size="sm"
                      @click="printReceipt(payment)"
                      title="Download Receipt"
                      :disabled="downloadingReceipts.has(payment.id)"
                    >
                      <i
                        v-if="downloadingReceipts.has(payment.id)"
                        class="fas fa-spinner fa-spin"
                      ></i>
                      <i v-else class="fas fa-download"></i>
                    </b-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Results from Filters -->
        <div
          v-if="hasPayments && filteredPayments.length === 0 && !isLoadingPayments"
          class="no-results text-center py-5"
        >
          <i class="fas fa-search fa-3x text-muted mb-3"></i>
          <h5>No payments match your filters</h5>
          <p class="text-muted">Try adjusting your search criteria or filters</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalRows > itemsPerPage" class="pagination-section mt-4">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="itemsPerPage"
            @change="onPageChange"
            align="center"
            size="md"
          ></b-pagination>
          <div class="pagination-info text-center mt-2">
            <small class="text-muted">
              Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalRows }} payments
              <span v-if="totalPages > 1">(Page {{ currentPage }} of {{ totalPages }})</span>
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  name: 'PaymentManagement',
  data() {
    return {
      // Loading states
      loading: false,
      loadingFilters: false,
      currentPage: 1,
      itemsPerPage: 20,

      // Receipt download tracking
      downloadingReceipts: new Set(),

      // Selection tracking
      selectedPayments: new Set(),

      // Filters
      filters: {
        payment_method: '',
        dateRange: 'last30days',
        status: '',
        search: '',
      },

      // Data
      payments: [],
      filteredPayments: [],
      totalRows: 0,
      totalPages: 0,
      paginationStart: 0,
      paginationEnd: 0,

      // Options
      paymentMethodOptions: [
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'DEPOSIT', text: 'Deposit' },
      ],
      dateRangeOptions: [
        { value: 'today', text: 'Today' },
        { value: 'yesterday', text: 'Yesterday' },
        { value: 'last7days', text: 'Last 7 Days' },
        { value: 'last30days', text: 'Last 30 Days' },
        { value: 'last90days', text: 'Last 90 Days' },
        { value: 'thisMonth', text: 'This Month' },
        { value: 'lastMonth', text: 'Last Month' },
      ],
      statusOptions: [
        { value: 'PENDING', text: 'Pending' },
        { value: 'PARTIAL', text: 'Partial' },
        { value: 'PAID', text: 'Paid' },
        { value: 'CANCELLED', text: 'Cancelled' },
        { value: 'FAILED', text: 'Failed' },
        { value: 'REFUNDED', text: 'Refunded' },
        { value: 'CONFIRMED', text: 'Confirmed' },
        { value: 'SETTLED', text: 'Settled' },
      ],
    };
  },
  computed: {
    hasPayments() {
      return this.payments.length > 0;
    },
    isLoadingPayments() {
      return this.loading;
    },
    isAnyReceiptDownloading() {
      return this.downloadingReceipts.size > 0;
    },
    selectAll: {
      get() {
        return (
          this.filteredPayments.length > 0 &&
          this.selectedPayments.size === this.filteredPayments.length
        );
      },
      set(value) {
        if (value) {
          this.selectedPayments = new Set(this.filteredPayments.map(p => p.id));
        } else {
          this.selectedPayments.clear();
        }
      },
    },
  },
  async mounted() {
    await this.loadData();

    // Create debounced search function
    this.debouncedSearch = debounce(this.performSearch, 500);
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;

        // Load payments
        await this.loadPayments();
      } catch (error) {
        console.error('Failed to load data:', error);
        this.$bvToast.toast('Failed to load data', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    async loadPayments() {
      try {
        // Build server parameters including filters
        const serverParams = {
          page: this.currentPage,
          limit: this.itemsPerPage,
        };

        // Add payment method filter
        if (this.filters.payment_method) {
          serverParams.payment_method = this.filters.payment_method;
        }

        // Add status filter
        if (this.filters.status) {
          serverParams.status = this.filters.status;
        }

        // Add search filter
        if (this.filters.search && this.filters.search.trim()) {
          serverParams.search = this.filters.search.trim();
        }

        // Add date range filter
        if (this.filters.dateRange) {
          const now = new Date();
          let startDate = new Date();

          switch (this.filters.dateRange) {
            case 'today':
              startDate.setHours(0, 0, 0, 0);
              break;
            case 'yesterday':
              startDate.setDate(now.getDate() - 1);
              startDate.setHours(0, 0, 0, 0);
              break;
            case 'last7days':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'last30days':
              startDate.setDate(now.getDate() - 30);
              break;
            case 'last90days':
              startDate.setDate(now.getDate() - 90);
              break;
            case 'thisMonth':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'lastMonth':
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              break;
          }

          serverParams.start_date = startDate.toISOString();
        }

        const result = await this.$store.dispatch('accounting/fetchClinicalPayments', serverParams);

        // Extract data from the correct structure
        this.payments = result.docs || [];
        this.totalRows = result.total || 0;
        this.totalPages = result.pages || 0;
        this.updatePaginationInfo();

        // No need to apply filters since server already filtered the data
        this.filteredPayments = [...this.payments];

        // Show message if search returned no results
        if (this.filters.search && this.filters.search.trim() && this.payments.length === 0) {
          this.$bvToast.toast(`No payments found matching "${this.filters.search}"`, {
            title: 'Search Results',
            variant: 'info',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to load payments:', error);
        this.$bvToast.toast('Failed to load payments', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    // Filtering methods - No longer needed since server handles filtering
    // applyFilters() method removed - server now handles all filtering

    // Pagination methods
    onPageChange(newPage) {
      this.currentPage = newPage;
      this.loadPayments(); // Reload data for the new page
    },

    updatePaginationInfo() {
      this.paginationStart =
        this.totalRows > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
      this.paginationEnd = Math.min(this.currentPage * this.itemsPerPage, this.totalRows);
    },

    resetPagination() {
      this.currentPage = 1;
    },

    // Action methods
    viewPaymentDetails(payment) {
      // Navigate to payment details page
      this.$router.push({
        name: 'payment-details',
        params: { id: payment.id },
      });
    },

    async downloadMultipleReceipts(payments) {
      try {
        this.$bvToast.toast(`Downloading ${payments.length} receipts...`, {
          title: 'Processing',
          variant: 'info',
          solid: true,
        });

        // Download receipts sequentially to avoid overwhelming the server
        for (const payment of payments) {
          await this.printReceipt(payment);
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.$bvToast.toast('All receipts downloaded successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Bulk receipt download error:', error);
        this.$bvToast.toast('Some receipts failed to download', {
          title: 'Warning',
          variant: 'warning',
          solid: true,
        });
      }
    },

    downloadSelectedReceipts() {
      if (this.selectedPayments.size === 0) {
        this.$bvToast.toast('Please select payments to download receipts', {
          title: 'Info',
          variant: 'info',
          solid: true,
        });
        return;
      }

      const selectedPaymentObjects = this.filteredPayments.filter(p =>
        this.selectedPayments.has(p.id)
      );

      this.downloadMultipleReceipts(selectedPaymentObjects);
    },

    toggleSelectAll() {
      // This is handled by the computed property
    },

    onPaymentSelectionChange() {
      // This is handled by the computed property
    },

    async printReceipt(payment) {
      try {
        // Track this receipt as being downloaded
        this.downloadingReceipts.add(payment.id);

        // Show loading state
        this.$bvToast.toast('Generating receipt...', {
          title: 'Processing',
          variant: 'info',
          solid: true,
        });

        // Download receipt using the accounting store action
        const result = await this.$store.dispatch('accounting/downloadPaymentReceipt', payment.id);

        if (result.success) {
          this.$bvToast.toast('Receipt downloaded successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          throw new Error(result.error || 'Failed to download receipt');
        }
      } catch (error) {
        console.error('Receipt download error:', error);
        this.$bvToast.toast(`Failed to download receipt: ${error.message}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        // Remove from downloading set
        this.downloadingReceipts.delete(payment.id);
      }
    },

    // Utility methods
    refreshData() {
      this.resetPagination();
      this.loadData();
    },

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

    getPaymentMethodVariant(method) {
      const variants = {
        CASH: 'success',
        CARD: 'primary',
        BANK_TRANSFER: 'info',
        MOBILE_MONEY: 'warning',
        DEPOSIT: 'secondary',
      };
      return variants[method] || 'secondary';
    },

    getStatusVariant(status) {
      const variants = {
        PENDING: 'warning',
        PARTIAL: 'info',
        PAID: 'success',
        CANCELLED: 'secondary',
        FAILED: 'danger',
        REFUNDED: 'warning',
        CONFIRMED: 'primary',
        SETTLED: 'success',
      };
      return variants[status] || 'secondary';
    },

    // Filter change handler
    onFilterChange() {
      this.loadingFilters = true;
      this.resetPagination(); // Reset to page 1 when filters change
      this.selectedPayments.clear(); // Clear selections when filters change
      this.loadPayments().finally(() => {
        this.loadingFilters = false;
      });
    },

    // Search methods
    onSearchInput() {
      this.debouncedSearch();
    },

    performSearch() {
      this.loadingFilters = true;
      this.resetPagination(); // Reset to page 1 when search changes
      this.selectedPayments.clear(); // Clear selections when search changes
      this.loadPayments().finally(() => {
        this.loadingFilters = false;
      });
    },
  },
};
</script>

<style scoped>
.payment-management {
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

.tab-content {
  padding: 1rem 0;
}

.filters-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-loading {
  padding: 0.5rem;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(0, 123, 255, 0.2);
}

.filter-loading small {
  color: #007bff;
  font-weight: 500;
}

.filters-section .form-control:disabled,
.filters-section .form-select:disabled {
  background-color: #e9ecef;
  opacity: 0.7;
}

.payments-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons .btn {
  padding: 0.25rem 0.5rem;
}

.no-results {
  color: #6c757d;
}

.pagination-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.pagination-info {
  margin-top: 0.5rem;
}

.pagination-info small {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Selection styles */
.table th:first-child,
.table td:first-child {
  width: 50px;
  text-align: center;
}

.table th:first-child .custom-control {
  margin: 0;
}

.table td:first-child .custom-control {
  margin: 0;
  display: flex;
  justify-content: center;
}

/* Header actions spacing */
.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.header-actions .btn {
  white-space: nowrap;
}

/* Bootstrap Vue pagination customization */
.pagination-section .page-link {
  color: #007bff;
  border-color: #dee2e6;
}

.pagination-section .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.pagination-section .page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
}

@media (max-width: 768px) {
  .payment-management {
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

  .filters-section .row {
    margin: 0;
  }

  .filters-section .col-md-3,
  .filters-section .col-md-6 {
    padding: 0.5rem;
  }
}
</style>
