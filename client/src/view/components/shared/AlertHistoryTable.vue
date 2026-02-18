<template>
  <div class="alert-history-table">
    <!-- Table Header -->
    <div class="alert-history-header">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <h6 class="mb-0 font-weight-bold">
            <i class="ki ki-time text-info mr-2"></i>
            Alert History
          </h6>
          <span v-if="totalCount > 0" class="badge badge-light-info ml-2">
            {{ totalCount }} total
          </span>
        </div>
        <div class="d-flex align-items-center">
          <!-- Export Button -->
          <div class="dropdown mr-2">
            <button
              class="btn btn-light-primary btn-sm dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              :disabled="filteredAlerts.length === 0"
            >
              <i class="ki ki-file-up mr-1"></i>
              Export
            </button>
            <div class="dropdown-menu dropdown-menu-right">
              <a class="dropdown-item" @click="exportData('csv')">
                <i class="ki ki-file-down mr-2"></i>Export as CSV
              </a>
              <a class="dropdown-item" @click="exportData('xlsx')">
                <i class="ki ki-file-down mr-2"></i>Export as Excel
              </a>
              <a class="dropdown-item" @click="exportData('json')">
                <i class="ki ki-file-down mr-2"></i>Export as JSON
              </a>
            </div>
          </div>

          <!-- Refresh Button -->
          <button
            type="button"
            class="btn btn-light btn-sm"
            @click="refreshData"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm mr-1"></span>
            <i v-else class="ki ki-refresh mr-1"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="alert-history-filters">
      <div class="row">
        <div class="col-md-3">
          <div class="form-group mb-3">
            <label class="form-label">Date Range</label>
            <div class="input-group">
              <input
                type="date"
                class="form-control form-control-sm"
                v-model="filters.dateFrom"
                @change="applyFilters"
              />
              <div class="input-group-prepend input-group-append">
                <span class="input-group-text">to</span>
              </div>
              <input
                type="date"
                class="form-control form-control-sm"
                v-model="filters.dateTo"
                @change="applyFilters"
              />
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group mb-3">
            <label class="form-label">Severity</label>
            <select
              class="form-control form-control-sm"
              v-model="filters.severity"
              @change="applyFilters"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group mb-3">
            <label class="form-label">Category</label>
            <select
              class="form-control form-control-sm"
              v-model="filters.category"
              @change="applyFilters"
            >
              <option value="">All Categories</option>
              <option value="expiry">Expiry</option>
              <option value="stock_level">Stock Level</option>
              <option value="procurement">Procurement</option>
              <option value="financial">Financial</option>
            </select>
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group mb-3">
            <label class="form-label">Status</label>
            <select
              class="form-control form-control-sm"
              v-model="filters.status"
              @change="applyFilters"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="snoozed">Snoozed</option>
            </select>
          </div>
        </div>
        <div class="col-md-3">
          <div class="form-group mb-3">
            <label class="form-label">Search</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Search alerts..."
                v-model="filters.search"
                @input="debounceSearch"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-light btn-sm"
                  type="button"
                  @click="clearSearch"
                  v-if="filters.search"
                >
                  <i class="ki ki-close"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="active-filters mb-3">
        <div class="d-flex align-items-center flex-wrap">
          <span class="text-muted mr-2">Filters:</span>
          <span v-if="filters.dateFrom || filters.dateTo" class="badge badge-light-primary mr-2">
            Date: {{ formatDateRange() }}
            <i class="ki ki-close ml-1 cursor-pointer" @click="clearDateFilter"></i>
          </span>
          <span v-if="filters.severity" class="badge badge-light-primary mr-2">
            Severity: {{ filters.severity }}
            <i
              class="ki ki-close ml-1 cursor-pointer"
              @click="
                filters.severity = '';
                applyFilters();
              "
            ></i>
          </span>
          <span v-if="filters.category" class="badge badge-light-primary mr-2">
            Category: {{ formatCategory(filters.category) }}
            <i
              class="ki ki-close ml-1 cursor-pointer"
              @click="
                filters.category = '';
                applyFilters();
              "
            ></i>
          </span>
          <span v-if="filters.status" class="badge badge-light-primary mr-2">
            Status: {{ filters.status }}
            <i
              class="ki ki-close ml-1 cursor-pointer"
              @click="
                filters.status = '';
                applyFilters();
              "
            ></i>
          </span>
          <span v-if="filters.search" class="badge badge-light-primary mr-2">
            Search: "{{ filters.search }}"
            <i class="ki ki-close ml-1 cursor-pointer" @click="clearSearch"></i>
          </span>
          <button
            type="button"
            class="btn btn-link btn-sm text-danger p-0"
            @click="clearAllFilters"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="alert-history-table-container">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="thead-light">
            <tr>
              <th width="50">
                <div class="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    id="select-all"
                    :indeterminate.prop="isIndeterminate"
                    v-model="allSelected"
                    @change="toggleAllSelection"
                  />
                  <label class="custom-control-label" for="select-all"></label>
                </div>
              </th>
              <th @click="sortBy('created_at')" class="sortable">
                Created
                <i :class="getSortIcon('created_at')" class="ml-1"></i>
              </th>
              <th @click="sortBy('severity')" class="sortable">
                Severity
                <i :class="getSortIcon('severity')" class="ml-1"></i>
              </th>
              <th>Alert Details</th>
              <th @click="sortBy('category')" class="sortable">
                Category
                <i :class="getSortIcon('category')" class="ml-1"></i>
              </th>
              <th>Item/Context</th>
              <th @click="sortBy('status')" class="sortable">
                Status
                <i :class="getSortIcon('status')" class="ml-1"></i>
              </th>
              <th>Timeline</th>
              <th width="120">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in paginatedAlerts" :key="alert.id" :class="getRowClass(alert)">
              <td>
                <div class="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    :id="`alert-${alert.id}`"
                    :value="alert.id"
                    v-model="selectedAlerts"
                  />
                  <label class="custom-control-label" :for="`alert-${alert.id}`"></label>
                </div>
              </td>

              <td>
                <div class="d-flex flex-column">
                  <span class="text-dark font-weight-bold">{{ formatDate(alert.created_at) }}</span>
                  <small class="text-muted">{{ formatTime(alert.created_at) }}</small>
                </div>
              </td>

              <td>
                <span class="badge" :class="getSeverityBadgeClass(alert)">
                  <i :class="getSeverityIcon(alert)" class="mr-1"></i>
                  {{ alert.severity }}
                </span>
              </td>

              <td>
                <div class="alert-details">
                  <div class="font-weight-bold text-dark mb-1">{{ alert.title }}</div>
                  <p class="text-muted mb-0 small">{{ truncateText(alert.message, 80) }}</p>
                  <div v-if="alert.current_value !== null" class="mt-1">
                    <small class="text-muted">
                      Current:
                      <span class="text-danger font-weight-bold">{{
                        formatCurrentValue(alert)
                      }}</span>
                      <span v-if="alert.threshold_value !== null" class="ml-2">
                        | Threshold: {{ formatThresholdValue(alert) }}
                      </span>
                    </small>
                  </div>
                </div>
              </td>

              <td>
                <span class="badge badge-light-info">{{ formatCategory(alert.category) }}</span>
                <div v-if="alert.store_type" class="mt-1">
                  <small class="badge badge-light-secondary">{{
                    formatStoreType(alert.store_type)
                  }}</small>
                </div>
              </td>

              <td>
                <div v-if="alert.item_name" class="d-flex align-items-center">
                  <i class="ki ki-package text-muted mr-1"></i>
                  <span class="font-weight-bold">{{ truncateText(alert.item_name, 25) }}</span>
                </div>
                <div v-if="alert.context" class="mt-1">
                  <small class="text-muted">{{ truncateText(alert.context, 50) }}</small>
                </div>
              </td>

              <td>
                <span class="badge" :class="getStatusBadgeClass(alert)">
                  {{ getStatusDisplay(alert) }}
                </span>
              </td>

              <td>
                <div class="timeline-info">
                  <div v-if="alert.acknowledged_at" class="timeline-item">
                    <small class="text-success">
                      <i class="ki ki-check mr-1"></i>
                      Ack: {{ formatTimeAgo(alert.acknowledged_at) }}
                    </small>
                    <div v-if="alert.acknowledged_by" class="text-muted small">
                      by {{ alert.acknowledged_by }}
                    </div>
                  </div>
                  <div v-if="alert.resolved_at" class="timeline-item mt-1">
                    <small class="text-primary">
                      <i class="ki ki-double-check mr-1"></i>
                      Resolved: {{ formatTimeAgo(alert.resolved_at) }}
                    </small>
                    <div v-if="alert.resolved_by" class="text-muted small">
                      by {{ alert.resolved_by }}
                    </div>
                  </div>
                  <div v-if="alert.snoozed_until" class="timeline-item mt-1">
                    <small class="text-warning">
                      <i class="ki ki-time mr-1"></i>
                      Snoozed until {{ formatDateTime(alert.snoozed_until) }}
                    </small>
                  </div>
                </div>
              </td>

              <td>
                <div class="btn-group btn-group-sm">
                  <button
                    type="button"
                    class="btn btn-light"
                    @click="viewAlertDetails(alert)"
                    title="View Details"
                  >
                    <i class="ki ki-eye"></i>
                  </button>
                  <div class="dropdown">
                    <button
                      class="btn btn-light dropdown-toggle"
                      type="button"
                      data-toggle="dropdown"
                    >
                      <i class="ki ki-more-ver"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" @click="viewAlertDetails(alert)">
                        <i class="ki ki-eye mr-2"></i>View Details
                      </a>
                      <a
                        v-if="!alert.acknowledged_at && alert.status === 'active'"
                        class="dropdown-item"
                        @click="acknowledgeAlert(alert.id)"
                      >
                        <i class="ki ki-check mr-2"></i>Acknowledge
                      </a>
                      <a
                        v-if="alert.status === 'active'"
                        class="dropdown-item"
                        @click="resolveAlert(alert.id)"
                      >
                        <i class="ki ki-double-check mr-2"></i>Resolve
                      </a>
                      <div class="dropdown-divider"></div>
                      <a class="dropdown-item" @click="copyAlertInfo(alert)">
                        <i class="ki ki-copy mr-2"></i>Copy Info
                      </a>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <tr v-if="paginatedAlerts.length === 0">
              <td colspan="9" class="text-center py-4">
                <div v-if="loading">
                  <div class="spinner-border spinner-border-sm mr-2"></div>
                  Loading alerts...
                </div>
                <div v-else-if="hasActiveFilters">
                  <i class="ki ki-search text-muted font-size-h2"></i>
                  <div class="text-muted mt-2">No alerts match your search criteria</div>
                  <button type="button" class="btn btn-link btn-sm" @click="clearAllFilters">
                    Clear filters
                  </button>
                </div>
                <div v-else>
                  <i class="ki ki-check-circle text-success font-size-h2"></i>
                  <div class="text-muted mt-2">No alert history found</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="alert-history-pagination">
      <div class="d-flex align-items-center justify-content-between">
        <div class="pagination-info">
          <span class="text-muted">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
            {{ Math.min(currentPage * itemsPerPage, totalCount) }} of {{ totalCount }} entries
          </span>
        </div>
        <div class="pagination-controls">
          <div class="btn-group">
            <button
              type="button"
              class="btn btn-light btn-sm"
              :disabled="currentPage === 1"
              @click="goToPage(1)"
            >
              <i class="ki ki-double-left"></i>
            </button>
            <button
              type="button"
              class="btn btn-light btn-sm"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <i class="ki ki-left"></i>
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="btn btn-sm"
              :class="page === currentPage ? 'btn-primary' : 'btn-light'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              class="btn btn-light btn-sm"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <i class="ki ki-right"></i>
            </button>
            <button
              type="button"
              class="btn btn-light btn-sm"
              :disabled="currentPage === totalPages"
              @click="goToPage(totalPages)"
            >
              <i class="ki ki-double-right"></i>
            </button>
          </div>

          <select
            class="form-control form-control-sm ml-2"
            style="width: auto; display: inline-block"
            v-model="itemsPerPage"
            @change="changeItemsPerPage"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedAlerts.length > 0" class="alert-history-bulk-actions">
      <div class="d-flex align-items-center justify-content-between">
        <span class="text-muted"
          >{{ selectedAlerts.length }} alert{{
            selectedAlerts.length > 1 ? 's' : ''
          }}
          selected</span
        >
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-light-success btn-sm"
            @click="bulkAcknowledge"
            :disabled="isBulkProcessing"
          >
            <i class="ki ki-check mr-1"></i>
            Acknowledge Selected
          </button>
          <button
            type="button"
            class="btn btn-light-primary btn-sm"
            @click="bulkResolve"
            :disabled="isBulkProcessing"
          >
            <i class="ki ki-double-check mr-1"></i>
            Resolve Selected
          </button>
          <button type="button" class="btn btn-light btn-sm" @click="clearSelection">
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AlertHistoryTable',
  data() {
    return {
      // Filters
      filters: {
        dateFrom: '',
        dateTo: '',
        severity: '',
        category: '',
        status: '',
        search: '',
      },

      // Sorting
      sortField: 'created_at',
      sortOrder: 'desc',

      // Pagination
      currentPage: 1,
      itemsPerPage: 25,

      // Selection
      selectedAlerts: [],

      // State
      loading: false,
      isBulkProcessing: false,

      // Search debounce
      searchTimeout: null,

      // Local data
      alerts: [],
      totalCount: 0,
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['error']),

    filteredAlerts() {
      let filtered = [...this.alerts];

      // Date range filter
      if (this.filters.dateFrom) {
        filtered = filtered.filter(
          (alert) => new Date(alert.created_at) >= new Date(this.filters.dateFrom)
        );
      }
      if (this.filters.dateTo) {
        filtered = filtered.filter(
          (alert) => new Date(alert.created_at) <= new Date(this.filters.dateTo + 'T23:59:59')
        );
      }

      // Severity filter
      if (this.filters.severity) {
        filtered = filtered.filter((alert) => alert.severity === this.filters.severity);
      }

      // Category filter
      if (this.filters.category) {
        filtered = filtered.filter((alert) => alert.category === this.filters.category);
      }

      // Status filter
      if (this.filters.status) {
        filtered = filtered.filter((alert) => {
          if (this.filters.status === 'acknowledged') {
            return alert.acknowledged_at && !alert.resolved_at;
          } else if (this.filters.status === 'snoozed') {
            return alert.snoozed_until && new Date(alert.snoozed_until) > new Date();
          }
          return alert.status === this.filters.status;
        });
      }

      // Search filter
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(
          (alert) =>
            alert.title.toLowerCase().includes(searchTerm) ||
            alert.message.toLowerCase().includes(searchTerm) ||
            (alert.item_name && alert.item_name.toLowerCase().includes(searchTerm)) ||
            (alert.context && alert.context.toLowerCase().includes(searchTerm))
        );
      }

      return filtered;
    },

    sortedAlerts() {
      return [...this.filteredAlerts].sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];

        // Handle date fields
        if (this.sortField.includes('_at')) {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        // Handle severity ordering
        if (this.sortField === 'severity') {
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          aValue = severityOrder[aValue] || 0;
          bValue = severityOrder[bValue] || 0;
        }

        if (this.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    },

    paginatedAlerts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedAlerts.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.sortedAlerts.length / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },

    hasActiveFilters() {
      return Object.values(this.filters).some((filter) => filter !== '');
    },

    allSelected: {
      get() {
        return (
          this.paginatedAlerts.length > 0 &&
          this.selectedAlerts.length === this.paginatedAlerts.length
        );
      },
      set() {
        // Handled by toggleAllSelection method
      },
    },

    isIndeterminate() {
      return (
        this.selectedAlerts.length > 0 && this.selectedAlerts.length < this.paginatedAlerts.length
      );
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', [
      'fetchAlerts',
      'acknowledgeAlert',
      'acknowledgeMultipleAlerts',
      'resolveAlert',
      'resolveMultipleAlerts',
    ]),

    async loadAlerts() {
      this.loading = true;
      try {
        const response = await this.fetchAlerts({
          page: 1,
          limit: 1000, // Load more for client-side filtering/sorting
          include_resolved: true,
        });

        this.alerts = response.alerts || [];
        this.totalCount = this.alerts.length;
      } catch (error) {
        console.error('Failed to load alert history:', error);
        this.$toast?.error('Failed to load alert history');
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadAlerts();
      this.$toast?.success('Alert history refreshed');
    },

    // Filtering methods
    applyFilters() {
      this.currentPage = 1; // Reset to first page
    },

    clearAllFilters() {
      this.filters = {
        dateFrom: '',
        dateTo: '',
        severity: '',
        category: '',
        status: '',
        search: '',
      };
      this.currentPage = 1;
    },

    clearDateFilter() {
      this.filters.dateFrom = '';
      this.filters.dateTo = '';
      this.applyFilters();
    },

    clearSearch() {
      this.filters.search = '';
      this.applyFilters();
    },

    debounceSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },

    // Sorting methods
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'desc';
      }
    },

    getSortIcon(field) {
      if (this.sortField !== field) {
        return 'ki ki-sort text-muted';
      }
      return this.sortOrder === 'asc' ? 'ki ki-sort-up' : 'ki ki-sort-down';
    },

    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    changeItemsPerPage() {
      this.currentPage = 1;
    },

    // Selection methods
    toggleAllSelection() {
      if (this.allSelected) {
        this.selectedAlerts = [];
      } else {
        this.selectedAlerts = this.paginatedAlerts.map((alert) => alert.id);
      }
    },

    clearSelection() {
      this.selectedAlerts = [];
    },

    // Alert actions
    viewAlertDetails(alert) {
      this.$emit('view-alert-details', alert);
    },

    async acknowledgeAlert(alertId) {
      try {
        await this.acknowledgeAlert({
          alertId,
          notes: 'Acknowledged from history table',
        });

        // Update local data
        const alert = this.alerts.find((a) => a.id === alertId);
        if (alert) {
          alert.acknowledged_at = new Date().toISOString();
          alert.acknowledged_by = 'current_user';
        }

        this.$toast?.success('Alert acknowledged');
      } catch (error) {
        this.$toast?.error('Failed to acknowledge alert');
      }
    },

    async resolveAlert(alertId) {
      try {
        await this.resolveAlert({
          alertId,
          resolution_notes: 'Resolved from history table',
          action_taken: 'manual_resolution',
        });

        // Update local data
        const alert = this.alerts.find((a) => a.id === alertId);
        if (alert) {
          alert.status = 'resolved';
          alert.resolved_at = new Date().toISOString();
          alert.resolved_by = 'current_user';
        }

        this.$toast?.success('Alert resolved');
      } catch (error) {
        this.$toast?.error('Failed to resolve alert');
      }
    },

    async bulkAcknowledge() {
      this.isBulkProcessing = true;
      try {
        await this.acknowledgeMultipleAlerts({
          alertIds: this.selectedAlerts,
          notes: 'Bulk acknowledged from history table',
        });

        // Update local data
        this.alerts.forEach((alert) => {
          if (this.selectedAlerts.includes(alert.id)) {
            alert.acknowledged_at = new Date().toISOString();
            alert.acknowledged_by = 'current_user';
          }
        });

        this.$toast?.success(`${this.selectedAlerts.length} alerts acknowledged`);
        this.clearSelection();
      } catch (error) {
        this.$toast?.error('Failed to acknowledge selected alerts');
      } finally {
        this.isBulkProcessing = false;
      }
    },

    async bulkResolve() {
      this.isBulkProcessing = true;
      try {
        await this.resolveMultipleAlerts({
          alertIds: this.selectedAlerts,
          resolution_notes: 'Bulk resolved from history table',
          action_taken: 'bulk_resolution',
        });

        // Update local data
        this.alerts.forEach((alert) => {
          if (this.selectedAlerts.includes(alert.id)) {
            alert.status = 'resolved';
            alert.resolved_at = new Date().toISOString();
            alert.resolved_by = 'current_user';
          }
        });

        this.$toast?.success(`${this.selectedAlerts.length} alerts resolved`);
        this.clearSelection();
      } catch (error) {
        this.$toast?.error('Failed to resolve selected alerts');
      } finally {
        this.isBulkProcessing = false;
      }
    },

    // Export methods
    exportData(format) {
      const data = this.filteredAlerts.map((alert) => ({
        id: alert.id,
        created_at: alert.created_at,
        severity: alert.severity,
        category: alert.category,
        title: alert.title,
        message: alert.message,
        item_name: alert.item_name,
        current_value: alert.current_value,
        threshold_value: alert.threshold_value,
        store_type: alert.store_type,
        status: alert.status,
        acknowledged_at: alert.acknowledged_at,
        acknowledged_by: alert.acknowledged_by,
        resolved_at: alert.resolved_at,
        resolved_by: alert.resolved_by,
        context: alert.context,
      }));

      const filename = `alert_history_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        this.exportToCSV(data, filename);
      } else if (format === 'xlsx') {
        this.exportToExcel(data, filename);
      } else if (format === 'json') {
        this.exportToJSON(data, filename);
      }
    },

    exportToCSV(data, filename) {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
      ].join('\n');

      this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    },

    exportToJSON(data, filename) {
      const jsonContent = JSON.stringify(data, null, 2);
      this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
    },

    downloadFile(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },

    copyAlertInfo(alert) {
      const info = `Alert #${alert.id}
Title: ${alert.title}
Severity: ${alert.severity}
Category: ${alert.category}
Created: ${this.formatDateTime(alert.created_at)}
Status: ${alert.status}
${alert.item_name ? 'Item: ' + alert.item_name : ''}
${alert.message}`;

      navigator.clipboard
        .writeText(info)
        .then(() => {
          this.$toast?.success('Alert information copied to clipboard');
        })
        .catch(() => {
          this.$toast?.error('Failed to copy alert information');
        });
    },

    // Helper methods
    getRowClass(alert) {
      const classes = ['table-row'];

      if (alert.severity === 'critical') {
        classes.push('table-row-critical');
      } else if (alert.severity === 'warning') {
        classes.push('table-row-warning');
      }

      if (this.selectedAlerts.includes(alert.id)) {
        classes.push('table-row-selected');
      }

      return classes.join(' ');
    },

    getSeverityBadgeClass(alert) {
      const classes = {
        critical: 'badge-danger',
        warning: 'badge-warning',
        info: 'badge-info',
      };
      return classes[alert.severity] || 'badge-info';
    },

    getSeverityIcon(alert) {
      const icons = {
        critical: 'ki ki-warning',
        warning: 'ki ki-warning',
        info: 'ki ki-information-circle',
      };
      return icons[alert.severity] || 'ki ki-information-circle';
    },

    getStatusBadgeClass(alert) {
      if (alert.status === 'resolved') return 'badge-success';
      if (alert.acknowledged_at) return 'badge-light-success';
      if (alert.snoozed_until && new Date(alert.snoozed_until) > new Date()) return 'badge-warning';
      return 'badge-light-primary';
    },

    getStatusDisplay(alert) {
      if (alert.status === 'resolved') return 'Resolved';
      if (alert.snoozed_until && new Date(alert.snoozed_until) > new Date()) return 'Snoozed';
      if (alert.acknowledged_at) return 'Acknowledged';
      return 'Active';
    },

    formatCategory(category) {
      const categories = {
        expiry: 'Expiry',
        stock_level: 'Stock Level',
        procurement: 'Procurement',
        financial: 'Financial',
      };
      return categories[category] || category;
    },

    formatStoreType(storeType) {
      const types = {
        pharmacy: 'Pharmacy',
        general_store: 'General Store',
      };
      return types[storeType] || storeType;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString();
    },

    formatDateTime(dateString) {
      return new Date(dateString).toLocaleString();
    },

    formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'just now';
    },

    formatDateRange() {
      const parts = [];
      if (this.filters.dateFrom) parts.push(this.formatDate(this.filters.dateFrom));
      if (this.filters.dateTo) parts.push(this.formatDate(this.filters.dateTo));
      return parts.join(' to ');
    },

    formatCurrentValue(alert) {
      if (alert.category === 'stock_level') {
        return `${alert.current_value} units`;
      } else if (alert.category === 'expiry') {
        return `${alert.current_value} days`;
      } else if (alert.category === 'financial') {
        return this.formatCurrency(alert.current_value);
      }
      return alert.current_value;
    },

    formatThresholdValue(alert) {
      if (alert.category === 'stock_level') {
        return `${alert.threshold_value} units`;
      } else if (alert.category === 'expiry') {
        return `${alert.threshold_value} days`;
      } else if (alert.category === 'financial') {
        return this.formatCurrency(alert.threshold_value);
      }
      return alert.threshold_value;
    },

    formatCurrency(amount) {
      if (!amount) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount);
    },

    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substr(0, length) + '...' : text;
    },
  },

  mounted() {
    this.loadAlerts();
  },
};
</script>

<style scoped>
.alert-history-table {
  background: #fff;
  border-radius: 0.42rem;
  box-shadow: 0px 2px 10px 0px rgba(82, 63, 105, 0.05);
  overflow: hidden;
}

.alert-history-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e5ec;
  background: #f8f9fa;
}

.alert-history-filters {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #f4f4f4;
}

.active-filters {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.25rem;
}

.cursor-pointer {
  cursor: pointer;
}

.alert-history-table-container {
  max-height: 600px;
  overflow-y: auto;
}

.table th {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5e6278;
  border-top: none;
  white-space: nowrap;
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 10;
}

.table td {
  font-size: 0.85rem;
  vertical-align: middle;
  border-color: #f4f4f4;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.sortable:hover {
  color: #00acc1;
}

.table-row-critical {
  background: linear-gradient(90deg, #fef5f5 0%, #fff 20%);
  border-left: 3px solid #f44434;
}

.table-row-warning {
  background: linear-gradient(90deg, #fffbf5 0%, #fff 20%);
  border-left: 3px solid #ffa800;
}

.table-row-selected {
  background: #e3f2fd !important;
  border-left: 3px solid #2196f3 !important;
}

.alert-details {
  max-width: 250px;
}

.timeline-info {
  min-width: 150px;
}

.timeline-item {
  line-height: 1.3;
}

.alert-history-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e5ec;
  background: #f8f9fa;
}

.alert-history-bulk-actions {
  padding: 1rem 1.5rem;
  background: #e3f2fd;
  border-top: 1px solid #2196f3;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5e6278;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.form-control-sm {
  font-size: 0.85rem;
}

.badge {
  font-size: 0.7rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Custom scrollbar */
.alert-history-table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.alert-history-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.alert-history-table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.alert-history-table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .alert-history-header,
  .alert-history-filters,
  .alert-history-pagination,
  .alert-history-bulk-actions {
    padding: 1rem;
  }

  .table th,
  .table td {
    font-size: 0.8rem;
  }

  .alert-details {
    max-width: 200px;
  }

  .timeline-info {
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .alert-history-table-container {
    overflow-x: auto;
  }

  .table {
    min-width: 800px;
  }
}
</style>
