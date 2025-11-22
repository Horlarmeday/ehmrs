<template>
  <div class="deposit-transactions">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-receipt text-primary mr-3"></i>
        Deposit Transactions
      </h1>
      <div class="header-actions">
        <b-button variant="outline-primary" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>Refresh
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ totalTransactions }}</h3>
              <p class="summary-label">Total Transactions</p>
              <small class="summary-count">{{ formatCurrency(totalAmount) }}</small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ createdCount }}</h3>
              <p class="summary-label">Created Transactions</p>
              <small class="summary-count">{{ formatCurrency(createdAmount) }}</small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-arrow-up"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ topUpCount }}</h3>
              <p class="summary-label">Top-Up Transactions</p>
              <small class="summary-count">{{ formatCurrency(topUpAmount) }}</small>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ todayCount }}</h3>
              <p class="summary-label">Today's Transactions</p>
              <small class="summary-count">{{ formatCurrency(todayAmount) }}</small>
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
              <b-form-group label="Search" label-for="search">
                <div class="input-group">
                  <b-form-input
                    id="search"
                    key="search-input"
                    v-model="filters.search"
                    placeholder="Search by patient name, ID, or reference..."
                    @input="debouncedSearch"
                    :disabled="loading"
                  ></b-form-input>
                  <div class="input-group-append">
                    <b-button
                      variant="outline-secondary"
                      @click="loadTransactions"
                      :disabled="loading"
                    >
                      <i class="fas fa-search"></i>
                    </b-button>
                    <span class="input-group-text" v-if="loading">
                      <i class="fas fa-spinner fa-spin"></i>
                    </span>
                  </div>
                </div>
                <small class="form-text text-muted">
                  Search by patient firstname, lastname, hospital_id, or reference_number
                </small>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Transaction Type" label-for="transaction-type-filter">
                <b-form-select
                  id="transaction-type-filter"
                  key="transaction-type-filter"
                  v-model="filters.transaction_type"
                  :options="transactionTypeOptions"
                  @change="handleFilterChange"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Deposit Type" label-for="deposit-type-filter">
                <b-form-select
                  id="deposit-type-filter"
                  key="deposit-type-filter"
                  v-model="filters.deposit_type"
                  :options="depositTypeOptions"
                  @change="handleFilterChange"
                ></b-form-select>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="Start Date" label-for="start-date-filter">
                <b-form-input
                  id="start-date-filter"
                  key="start-date-filter"
                  v-model.lazy="filters.start_date"
                  type="date"
                  @change="handleFilterChange"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-2">
              <b-form-group label="End Date" label-for="end-date-filter">
                <b-form-input
                  id="end-date-filter"
                  key="end-date-filter"
                  v-model.lazy="filters.end_date"
                  type="date"
                  @change="handleFilterChange"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-1">
              <label>&nbsp;</label>
              <div class="d-flex gap-2">
                <b-button variant="outline-secondary" @click="clearFilters" size="sm">
                  Clear
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-table-section">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Deposit Transactions</h6>
          <div class="d-flex align-items-center">
            <span v-if="filters.search" class="text-muted mr-2">
              <i class="fas fa-search mr-1"></i>
              Search results: {{ totalRows }} transactions found
            </span>
            <span v-else class="text-muted">
              <i class="fas fa-list mr-1"></i>
              Total: {{ totalRows }} transactions
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Reference #</th>
                  <th>Transaction Date</th>
                  <th>Patient</th>
                  <th>Tx Type</th>
                  <th>Deposit Type</th>
                  <th>Amount</th>
                  <!-- <th>Previous Balance</th> -->
                  <th>New Balance</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="transactions.length === 0 && !loading">
                  <td colspan="10" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <p class="mb-2">
                      <strong>No transactions found</strong>
                    </p>
                    <p v-if="filters.search" class="mb-0">
                      No transactions found for search: "{{ filters.search }}"
                    </p>
                    <p v-else class="mb-0">Try adjusting your filters</p>
                  </td>
                </tr>
                <tr v-else-if="loading">
                  <td colspan="10" class="text-center py-4">
                    <b-spinner variant="primary" label="Loading..."></b-spinner>
                    <p class="mt-2">Loading transactions...</p>
                  </td>
                </tr>
                <tr v-else v-for="transaction in transactions" :key="transaction.id">
                  <td>
                    <strong>{{ transaction.reference_number }}</strong>
                  </td>
                  <td>{{ formatDate(transaction.createdAt) }}</td>
                  <td>
                    <div class="patient-info">
                      <div class="patient-name">
                        {{ transaction.deposit?.patient?.firstname }}
                        {{ transaction.deposit?.patient?.lastname }}
                      </div>
                      <small class="patient-number">{{
                        transaction.deposit?.patient?.hospital_id
                      }}</small>
                    </div>
                  </td>
                  <td>
                    <b-badge :variant="getTransactionTypeVariant(transaction.transaction_type)">
                      {{ transaction.transaction_type }}
                    </b-badge>
                  </td>
                  <td>
                    <b-badge :variant="getDepositTypeVariant(transaction.deposit?.deposit_type)">
                      {{ transaction.deposit?.deposit_type || 'N/A' }}
                    </b-badge>
                  </td>
                  <td>
                    <span class="amount">{{ formatCurrency(transaction.amount) }}</span>
                  </td>
                  <!-- <td>{{ formatCurrency(transaction.previous_balance) }}</td> -->
                  <td>{{ formatCurrency(transaction.new_balance) }}</td>
                  <td>
                    {{
                      transaction.createdByStaff
                        ? `${transaction.createdByStaff.firstname} ${transaction.createdByStaff.lastname}`
                        : 'N/A'
                    }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <b-button
                        variant="outline-primary"
                        size="sm"
                        :disabled="downloadingReceiptId === transaction.id"
                        @click="downloadReceipt(transaction.id)"
                      >
                        <i
                          class="fas"
                          :class="{
                            'fa-spinner fa-spin': downloadingReceiptId === transaction.id,
                            'fa-file-download': downloadingReceiptId !== transaction.id,
                          }"
                        ></i>
                      </b-button>
                      <b-button
                        variant="outline-secondary"
                        size="sm"
                        :disabled="printingReceiptId === transaction.id"
                        @click="printReceipt(transaction.id)"
                      >
                        <i
                          class="fas"
                          :class="{
                            'fa-spinner fa-spin': printingReceiptId === transaction.id,
                            'fa-print': printingReceiptId !== transaction.id,
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
  </div>
</template>

<script>
import { debounce } from 'lodash';
import Pagination from '@/utils/Pagination.vue';

export default {
  name: 'DepositTransactions',
  components: {
    Pagination,
  },
  data() {
    return {
      loading: false,
      filters: {
        search: '',
        transaction_type: '',
        deposit_type: '',
        start_date: '',
        end_date: '',
      },
      currentPage: 1,
      itemsPerPage: 10,
      downloadingReceiptId: null,
      printingReceiptId: null,
      transactionTypeOptions: [
        { value: '', text: 'All Types' },
        { value: 'CREATED', text: 'Created' },
        { value: 'TOP_UP', text: 'Top-Up' },
      ],
      depositTypeOptions: [
        { value: '', text: 'All Types' },
        { value: 'CASH', text: 'Cash' },
        { value: 'CARD', text: 'Card' },
        { value: 'BANK_TRANSFER', text: 'Bank Transfer' },
        { value: 'MOBILE_MONEY', text: 'Mobile Money' },
        { value: 'INSURANCE', text: 'Insurance' },
        { value: 'OTHER', text: 'Other' },
      ],
      debouncedSearch: null, // Will be initialized in created()
    };
  },
  computed: {
    transactions() {
      return this.$store.getters['accounting/getDepositTransactions'] || [];
    },
    queriedItems() {
      return this.$store.getters['accounting/getDepositTransactionsTotal'] || 0;
    },
    pages() {
      return this.$store.getters['accounting/getDepositTransactionsPages'] || 0;
    },
    perPage() {
      return this.transactions.length;
    },
    totalRows() {
      return this.queriedItems;
    },
    summary() {
      return (
        this.$store.getters['accounting/getDepositTransactionsSummary'] || {
          totalTransactions: 0,
          totalAmount: 0,
          createdCount: 0,
          createdAmount: 0,
          topUpCount: 0,
          topUpAmount: 0,
          todayCount: 0,
          todayAmount: 0,
        }
      );
    },
    // Use summary data for metrics instead of paginated transactions
    totalTransactions() {
      return this.summary.totalTransactions;
    },
    totalAmount() {
      return this.summary.totalAmount;
    },
    createdCount() {
      return this.summary.createdCount;
    },
    createdAmount() {
      return this.summary.createdAmount;
    },
    topUpCount() {
      return this.summary.topUpCount;
    },
    topUpAmount() {
      return this.summary.topUpAmount;
    },
    todayCount() {
      return this.summary.todayCount;
    },
    todayAmount() {
      return this.summary.todayAmount;
    },
  },
  created() {
    // Initialize debounced search function in created() to prevent recreation on each render
    this.debouncedSearch = debounce(() => {
      this.currentPage = 1; // Reset to first page on search
      this.loadTransactions();
    }, 500);
  },
  async mounted() {
    await Promise.all([this.loadTransactions(), this.loadSummary()]);
  },
  beforeDestroy() {
    // Cancel debounced function if component is destroyed
    if (this.debouncedSearch) {
      this.debouncedSearch.cancel();
    }
  },
  methods: {
    handlePageCount(count) {
      this.itemsPerPage = count;
      this.loadTransactions();
    },

    async loadTransactions() {
      try {
        this.loading = true;

        const params = {
          page: this.currentPage,
          limit: this.itemsPerPage,
        };

        if (this.filters.transaction_type) {
          params.transaction_type = this.filters.transaction_type;
        }
        if (this.filters.deposit_type) {
          params.deposit_type = this.filters.deposit_type;
        }
        if (this.filters.start_date) {
          params.start_date = this.filters.start_date;
        }
        if (this.filters.end_date) {
          params.end_date = this.filters.end_date;
        }
        if (this.filters.search && this.filters.search.trim()) {
          params.search = this.filters.search.trim();
        }

        await this.$store.dispatch('accounting/fetchDepositTransactions', params);

        // Load summary after transactions are loaded
        await this.loadSummary();
      } catch (error) {
        console.error('Failed to load transactions:', error);
        this.$bvToast.toast('Failed to load deposit transactions', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    async loadSummary() {
      try {
        const params = {};

        if (this.filters.transaction_type) {
          params.transaction_type = this.filters.transaction_type;
        }
        if (this.filters.deposit_type) {
          params.deposit_type = this.filters.deposit_type;
        }
        if (this.filters.start_date) {
          params.start_date = this.filters.start_date;
        }
        if (this.filters.end_date) {
          params.end_date = this.filters.end_date;
        }
        if (this.filters.search && this.filters.search.trim()) {
          params.search = this.filters.search.trim();
        }

        await this.$store.dispatch('accounting/fetchDepositTransactionSummary', params);
      } catch (error) {
        // Don't show error toast for summary - it's not critical
        console.error('Failed to load summary:', error);
      }
    },

    handleFilterChange() {
      this.currentPage = 1; // Reset to first page when filters change
      this.loadTransactions();
    },

    async refreshData() {
      await this.loadTransactions();
    },

    clearFilters() {
      this.filters = {
        search: '',
        transaction_type: '',
        deposit_type: '',
        start_date: '',
        end_date: '',
      };
      this.currentPage = 1;
      this.loadTransactions();
    },

    onPageChange(page) {
      this.currentPage = page;
      this.loadTransactions();
    },

    async downloadReceipt(transactionId) {
      if (this.downloadingReceiptId) {
        return;
      }

      this.downloadingReceiptId = transactionId;
      try {
        const result = await this.$store.dispatch(
          'accounting/downloadDepositTransactionReceipt',
          transactionId
        );

        if (result.success) {
          this.$bvToast.toast('Transaction receipt downloaded successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          this.$bvToast.toast(result.error || 'Failed to download transaction receipt', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to download transaction receipt:', error);
        this.$bvToast.toast('Failed to download transaction receipt', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.downloadingReceiptId = null;
      }
    },

    async printReceipt(transactionId) {
      if (this.printingReceiptId) {
        return;
      }

      this.printingReceiptId = transactionId;
      try {
        const result = await this.$store.dispatch(
          'accounting/printDepositTransactionReceipt',
          transactionId
        );

        if (result.success) {
          this.$bvToast.toast('Transaction receipt opened for printing', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          this.$bvToast.toast(result.error || 'Failed to print transaction receipt', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Failed to print transaction receipt:', error);
        this.$bvToast.toast('Failed to print transaction receipt', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.printingReceiptId = null;
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getTransactionTypeVariant(type) {
      const variants = {
        CREATED: 'success',
        TOP_UP: 'info',
      };
      return variants[type] || 'secondary';
    },

    getDepositTypeVariant(type) {
      const variants = {
        CASH: 'success',
        BANK_TRANSFER: 'info',
        CARD: 'primary',
        MOBILE_MONEY: 'warning',
        INSURANCE: 'danger',
        OTHER: 'secondary',
      };
      return variants[type] || 'secondary';
    },
  },
};
</script>

<style scoped>
.deposit-transactions {
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

.transactions-table-section {
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

@media (max-width: 768px) {
  .deposit-transactions {
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
