<template>
  <div class="alert-sidebar-overlay" v-if="showSidebar" @click.self="closeSidebar">
    <div class="alert-sidebar" :class="{ 'alert-sidebar-open': showSidebar }">
      <!-- Sidebar Header -->
      <div class="alert-sidebar-header">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <i class="ki ki-notification text-primary font-size-h3 mr-3"></i>
            <div>
              <h5 class="mb-0">Inventory Alerts</h5>
              <small class="text-muted">
                {{ totalActiveAlertsCount }} active alerts
                <span v-if="unreadAlertsCount > 0" class="ml-1">
                  ({{ unreadAlertsCount }} unread)
                </span>
              </small>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-light" @click="closeSidebar">
            <i class="ki ki-close"></i>
          </button>
        </div>
      </div>

      <!-- Alert Summary Cards -->
      <div class="alert-sidebar-summary">
        <div class="row">
          <div class="col-4">
            <div class="summary-card summary-card-critical" @click="filterBySeverity('critical')">
              <div class="summary-number">{{ criticalAlertsCount }}</div>
              <div class="summary-label">Critical</div>
            </div>
          </div>
          <div class="col-4">
            <div class="summary-card summary-card-warning" @click="filterBySeverity('warning')">
              <div class="summary-number">{{ warningAlertsCount }}</div>
              <div class="summary-label">Warning</div>
            </div>
          </div>
          <div class="col-4">
            <div class="summary-card summary-card-info" @click="filterBySeverity('info')">
              <div class="summary-number">{{ infoAlertsCount }}</div>
              <div class="summary-label">Info</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Controls -->
      <div class="alert-sidebar-filters">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="d-flex align-items-center">
            <div class="dropdown mr-2">
              <button
                class="btn btn-sm btn-light dropdown-toggle"
                type="button"
                data-toggle="dropdown"
              >
                <i class="ki ki-filter mr-1"></i>
                {{ getFilterLabel() }}
              </button>
              <div class="dropdown-menu">
                <h6 class="dropdown-header">Filter by Severity</h6>
                <a
                  class="dropdown-item"
                  @click="clearSeverityFilter"
                  :class="{ active: !currentSeverityFilter }"
                >
                  <i class="ki ki-check mr-2" v-if="!currentSeverityFilter"></i>
                  All Severities
                </a>
                <a
                  class="dropdown-item"
                  @click="filterBySeverity('critical')"
                  :class="{ active: currentSeverityFilter === 'critical' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentSeverityFilter === 'critical'"></i>
                  Critical Only
                </a>
                <a
                  class="dropdown-item"
                  @click="filterBySeverity('warning')"
                  :class="{ active: currentSeverityFilter === 'warning' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentSeverityFilter === 'warning'"></i>
                  Warning Only
                </a>
                <a
                  class="dropdown-item"
                  @click="filterBySeverity('info')"
                  :class="{ active: currentSeverityFilter === 'info' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentSeverityFilter === 'info'"></i>
                  Info Only
                </a>
                <div class="dropdown-divider"></div>
                <h6 class="dropdown-header">Filter by Category</h6>
                <a
                  class="dropdown-item"
                  @click="filterByCategory('expiry')"
                  :class="{ active: currentCategoryFilter === 'expiry' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentCategoryFilter === 'expiry'"></i>
                  Expiry Alerts
                </a>
                <a
                  class="dropdown-item"
                  @click="filterByCategory('stock_level')"
                  :class="{ active: currentCategoryFilter === 'stock_level' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentCategoryFilter === 'stock_level'"></i>
                  Stock Level
                </a>
                <a
                  class="dropdown-item"
                  @click="filterByCategory('procurement')"
                  :class="{ active: currentCategoryFilter === 'procurement' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentCategoryFilter === 'procurement'"></i>
                  Procurement
                </a>
                <a
                  class="dropdown-item"
                  @click="filterByCategory('financial')"
                  :class="{ active: currentCategoryFilter === 'financial' }"
                >
                  <i class="ki ki-check mr-2" v-if="currentCategoryFilter === 'financial'"></i>
                  Financial
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-danger" @click="clearAllFilters">
                  <i class="ki ki-close mr-2"></i>
                  Clear All Filters
                </a>
              </div>
            </div>

            <div class="dropdown mr-2">
              <button
                class="btn btn-sm btn-light dropdown-toggle"
                type="button"
                data-toggle="dropdown"
              >
                <i class="ki ki-sort mr-1"></i>
                Sort
              </button>
              <div class="dropdown-menu">
                <a
                  class="dropdown-item"
                  @click="setSortBy('created_at', 'desc')"
                  :class="{ active: sortBy === 'created_at' && sortOrder === 'desc' }"
                >
                  <i
                    class="ki ki-check mr-2"
                    v-if="sortBy === 'created_at' && sortOrder === 'desc'"
                  ></i>
                  Newest First
                </a>
                <a
                  class="dropdown-item"
                  @click="setSortBy('created_at', 'asc')"
                  :class="{ active: sortBy === 'created_at' && sortOrder === 'asc' }"
                >
                  <i
                    class="ki ki-check mr-2"
                    v-if="sortBy === 'created_at' && sortOrder === 'asc'"
                  ></i>
                  Oldest First
                </a>
                <a
                  class="dropdown-item"
                  @click="setSortBy('severity', 'desc')"
                  :class="{ active: sortBy === 'severity' && sortOrder === 'desc' }"
                >
                  <i
                    class="ki ki-check mr-2"
                    v-if="sortBy === 'severity' && sortOrder === 'desc'"
                  ></i>
                  By Severity
                </a>
                <a
                  class="dropdown-item"
                  @click="setSortBy('category', 'asc')"
                  :class="{ active: sortBy === 'category' && sortOrder === 'asc' }"
                >
                  <i
                    class="ki ki-check mr-2"
                    v-if="sortBy === 'category' && sortOrder === 'asc'"
                  ></i>
                  By Category
                </a>
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center">
            <button
              v-if="unreadAlertsCount > 1"
              type="button"
              class="btn btn-sm btn-light-success mr-2"
              :disabled="isAcknowledgingAll"
              @click="acknowledgeAllFiltered"
            >
              <span v-if="isAcknowledgingAll" class="spinner-border spinner-border-sm mr-1"></span>
              <i v-else class="ki ki-check mr-1"></i>
              Ack All
            </button>

            <button
              type="button"
              class="btn btn-sm btn-light-primary"
              @click="refreshAlerts"
              :disabled="isRefreshing"
            >
              <span v-if="isRefreshing" class="spinner-border spinner-border-sm mr-1"></span>
              <i v-else class="ki ki-refresh mr-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Alert List -->
      <div class="alert-sidebar-content">
        <div class="alert-sidebar-list" id="alertList">
          <div
            v-for="alert in filteredAndSortedAlerts"
            :key="alert.id"
            :class="[
              'alert-sidebar-item',
              getSidebarAlertClass(alert),
              { 'alert-sidebar-item-unread': !alert.acknowledged_at },
              { 'alert-sidebar-item-selected': selectedAlerts.includes(alert.id) },
            ]"
          >
            <!-- Selection Checkbox -->
            <div class="alert-item-select">
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
            </div>

            <!-- Alert Content -->
            <div class="alert-item-content" @click="toggleAlertExpansion(alert.id)">
              <div class="alert-item-header">
                <div class="d-flex align-items-start justify-content-between">
                  <div class="d-flex align-items-start flex-grow-1">
                    <div class="alert-item-icon mr-2">
                      <i :class="getAlertIcon(alert)" class="font-size-h6"></i>
                    </div>
                    <div class="alert-item-info flex-grow-1">
                      <div class="alert-item-title-row d-flex align-items-center mb-1">
                        <span class="alert-item-title font-weight-bold">{{ alert.title }}</span>
                        <span class="badge badge-sm ml-2" :class="getSeverityBadgeClass(alert)">
                          {{ alert.severity }}
                        </span>
                        <span class="badge badge-sm badge-light-info ml-1">
                          {{ formatCategory(alert.category) }}
                        </span>
                      </div>
                      <p class="alert-item-message mb-1">{{ alert.message }}</p>
                      <div class="alert-item-meta">
                        <small class="text-muted">
                          <i class="ki ki-calendar mr-1"></i>
                          {{ formatTimeAgo(alert.created_at) }}
                          <span v-if="alert.item_name" class="ml-2">
                            <i class="ki ki-package mr-1"></i>
                            {{ alert.item_name }}
                          </span>
                          <span v-if="alert.store_type" class="ml-2">
                            <i class="ki ki-shop mr-1"></i>
                            {{ formatStoreType(alert.store_type) }}
                          </span>
                        </small>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-light ml-2"
                    @click.stop="toggleAlertExpansion(alert.id)"
                  >
                    <i :class="expandedAlerts.includes(alert.id) ? 'ki ki-up' : 'ki ki-down'"></i>
                  </button>
                </div>
              </div>

              <!-- Expanded Alert Details -->
              <div v-if="expandedAlerts.includes(alert.id)" class="alert-item-expanded mt-3">
                <div class="alert-details-grid">
                  <div class="detail-row" v-if="alert.current_value !== null">
                    <span class="detail-label">Current Value:</span>
                    <span class="detail-value text-danger font-weight-bold">
                      {{ formatCurrentValue(alert) }}
                    </span>
                  </div>
                  <div class="detail-row" v-if="alert.threshold_value !== null">
                    <span class="detail-label">Threshold:</span>
                    <span class="detail-value">{{ formatThresholdValue(alert) }}</span>
                  </div>
                  <div class="detail-row" v-if="alert.context">
                    <span class="detail-label">Context:</span>
                    <span class="detail-value">{{ alert.context }}</span>
                  </div>
                  <div class="detail-row" v-if="alert.acknowledged_at">
                    <span class="detail-label">Acknowledged:</span>
                    <span class="detail-value">
                      {{ formatDateTime(alert.acknowledged_at) }}
                      <small v-if="alert.acknowledged_by" class="text-muted">
                        by {{ alert.acknowledged_by }}
                      </small>
                    </span>
                  </div>
                </div>

                <!-- Alert Actions -->
                <div class="alert-item-actions mt-3">
                  <div class="btn-group btn-group-sm">
                    <button
                      v-if="!alert.acknowledged_at"
                      type="button"
                      class="btn btn-light-success"
                      @click.stop="acknowledgeAlert(alert.id)"
                      :disabled="acknowledgingIds.includes(alert.id)"
                    >
                      <span
                        v-if="acknowledgingIds.includes(alert.id)"
                        class="spinner-border spinner-border-sm mr-1"
                      ></span>
                      <i v-else class="ki ki-check mr-1"></i>
                      Acknowledge
                    </button>

                    <button
                      type="button"
                      class="btn btn-light-primary"
                      @click.stop="viewAlertDetails(alert)"
                    >
                      <i class="ki ki-eye mr-1"></i>
                      Details
                    </button>

                    <button
                      v-if="alert.severity !== 'critical'"
                      type="button"
                      class="btn btn-light-warning"
                      @click.stop="showSnoozeModal(alert)"
                    >
                      <i class="ki ki-time mr-1"></i>
                      Snooze
                    </button>

                    <button
                      type="button"
                      class="btn btn-light-success"
                      @click.stop="showResolveModal(alert)"
                    >
                      <i class="ki ki-double-check mr-1"></i>
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredAndSortedAlerts.length === 0" class="alert-sidebar-empty">
            <div class="text-center py-5">
              <i class="ki ki-check-circle text-success font-size-h1 mb-3"></i>
              <h6 class="text-muted mb-2">No alerts found</h6>
              <p class="text-muted small mb-0">
                <span v-if="hasActiveFilters">Try adjusting your filters</span>
                <span v-else>All clear! No active alerts.</span>
              </p>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMoreAlerts" class="alert-sidebar-load-more">
            <button
              type="button"
              class="btn btn-light-primary btn-sm w-100"
              @click="loadMoreAlerts"
              :disabled="loadingMore"
            >
              <span v-if="loadingMore" class="spinner-border spinner-border-sm mr-2"></span>
              Load More Alerts
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Footer -->
      <div v-if="selectedAlerts.length > 0" class="alert-sidebar-footer">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <span class="text-muted">{{ selectedAlerts.length }} selected</span>
            <button
              type="button"
              class="btn btn-link btn-sm text-primary"
              @click="selectAllVisibleAlerts"
            >
              Select All
            </button>
            <button type="button" class="btn btn-link btn-sm text-muted" @click="clearSelection">
              Clear
            </button>
          </div>
          <div class="btn-group btn-group-sm">
            <button
              type="button"
              class="btn btn-light-success"
              @click="acknowledgeSelectedAlerts"
              :disabled="isBulkAcknowledging"
            >
              <span v-if="isBulkAcknowledging" class="spinner-border spinner-border-sm mr-1"></span>
              <i v-else class="ki ki-check mr-1"></i>
              Acknowledge
            </button>
            <button
              type="button"
              class="btn btn-light-success"
              @click="resolveSelectedAlerts"
              :disabled="isBulkResolving"
            >
              <span v-if="isBulkResolving" class="spinner-border spinner-border-sm mr-1"></span>
              <i v-else class="ki ki-double-check mr-1"></i>
              Resolve
            </button>
          </div>
        </div>
      </div>

      <!-- Configuration Link -->
      <div class="alert-sidebar-config">
        <button
          type="button"
          class="btn btn-link btn-sm w-100 text-center"
          @click="openConfiguration"
        >
          <i class="ki ki-settings mr-1"></i>
          Alert Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'AlertSidebar',
  data() {
    return {
      // Filters
      currentSeverityFilter: null,
      currentCategoryFilter: null,

      // Sorting
      sortBy: 'created_at',
      sortOrder: 'desc',

      // Selection
      selectedAlerts: [],

      // Expansion
      expandedAlerts: [],

      // Loading states
      isRefreshing: false,
      isAcknowledgingAll: false,
      isBulkAcknowledging: false,
      isBulkResolving: false,
      acknowledgingIds: [],
      loadingMore: false,

      // Pagination
      displayLimit: 20,
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['showSidebar', 'alerts', 'activeAlerts', 'loading']),
    ...mapGetters('inventoryAlerts', [
      'criticalAlertsCount',
      'warningAlertsCount',
      'infoAlertsCount',
      'totalActiveAlertsCount',
      'unreadAlertsCount',
      'hasActiveFilters',
    ]),

    filteredAndSortedAlerts() {
      let filtered = [...this.activeAlerts];

      // Apply severity filter
      if (this.currentSeverityFilter) {
        filtered = filtered.filter((alert) => alert.severity === this.currentSeverityFilter);
      }

      // Apply category filter
      if (this.currentCategoryFilter) {
        filtered = filtered.filter((alert) => alert.category === this.currentCategoryFilter);
      }

      // Sort alerts
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (this.sortBy === 'severity') {
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
        } else if (this.sortBy === 'created_at') {
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
        } else {
          aValue = a[this.sortBy] || '';
          bValue = b[this.sortBy] || '';
        }

        if (this.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      return filtered.slice(0, this.displayLimit);
    },

    hasMoreAlerts() {
      let totalFiltered = [...this.activeAlerts];

      if (this.currentSeverityFilter) {
        totalFiltered = totalFiltered.filter(
          (alert) => alert.severity === this.currentSeverityFilter
        );
      }

      if (this.currentCategoryFilter) {
        totalFiltered = totalFiltered.filter(
          (alert) => alert.category === this.currentCategoryFilter
        );
      }

      return totalFiltered.length > this.displayLimit;
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', [
      'hideSidebar',
      'fetchActiveAlerts',
      'acknowledgeAlert',
      'acknowledgeMultipleAlerts',
      'resolveMultipleAlerts',
      'snoozeAlert',
    ]),

    closeSidebar() {
      this.hideSidebar();
      this.clearSelection();
      this.expandedAlerts = [];
    },

    // Filter methods
    filterBySeverity(severity) {
      this.currentSeverityFilter = this.currentSeverityFilter === severity ? null : severity;
      this.resetPagination();
    },

    clearSeverityFilter() {
      this.currentSeverityFilter = null;
      this.resetPagination();
    },

    filterByCategory(category) {
      this.currentCategoryFilter = this.currentCategoryFilter === category ? null : category;
      this.resetPagination();
    },

    clearAllFilters() {
      this.currentSeverityFilter = null;
      this.currentCategoryFilter = null;
      this.resetPagination();
    },

    getFilterLabel() {
      const parts = [];
      if (this.currentSeverityFilter) parts.push(this.currentSeverityFilter);
      if (this.currentCategoryFilter) parts.push(this.formatCategory(this.currentCategoryFilter));
      return parts.length > 0 ? parts.join(', ') : 'All Alerts';
    },

    // Sort methods
    setSortBy(field, order) {
      this.sortBy = field;
      this.sortOrder = order;
    },

    // Selection methods
    selectAllVisibleAlerts() {
      this.selectedAlerts = this.filteredAndSortedAlerts.map((alert) => alert.id);
    },

    clearSelection() {
      this.selectedAlerts = [];
    },

    // Expansion methods
    toggleAlertExpansion(alertId) {
      const index = this.expandedAlerts.indexOf(alertId);
      if (index > -1) {
        this.expandedAlerts.splice(index, 1);
      } else {
        this.expandedAlerts.push(alertId);
      }
    },

    // Alert actions
    async refreshAlerts() {
      this.isRefreshing = true;
      try {
        await this.fetchActiveAlerts();
        this.$toast.success('Alerts refreshed');
      } catch (error) {
        this.$toast.error('Failed to refresh alerts');
      } finally {
        this.isRefreshing = false;
      }
    },

    async acknowledgeAlert(alertId) {
      this.acknowledgingIds.push(alertId);
      try {
        await this.acknowledgeAlert({
          alertId,
          notes: 'Acknowledged from sidebar',
        });
        this.$toast.success('Alert acknowledged');
      } catch (error) {
        this.$toast.error('Failed to acknowledge alert');
      } finally {
        const index = this.acknowledgingIds.indexOf(alertId);
        if (index > -1) {
          this.acknowledgingIds.splice(index, 1);
        }
      }
    },

    async acknowledgeAllFiltered() {
      const unreadIds = this.filteredAndSortedAlerts
        .filter((alert) => !alert.acknowledged_at)
        .map((alert) => alert.id);

      if (unreadIds.length === 0) return;

      this.isAcknowledgingAll = true;
      try {
        await this.acknowledgeMultipleAlerts({
          alertIds: unreadIds,
          notes: 'Bulk acknowledged from sidebar',
        });
        this.$toast.success(`${unreadIds.length} alerts acknowledged`);
      } catch (error) {
        this.$toast.error('Failed to acknowledge alerts');
      } finally {
        this.isAcknowledgingAll = false;
      }
    },

    async acknowledgeSelectedAlerts() {
      if (this.selectedAlerts.length === 0) return;

      this.isBulkAcknowledging = true;
      try {
        await this.acknowledgeMultipleAlerts({
          alertIds: this.selectedAlerts,
          notes: 'Bulk acknowledged from sidebar selection',
        });
        this.$toast.success(`${this.selectedAlerts.length} alerts acknowledged`);
        this.clearSelection();
      } catch (error) {
        this.$toast.error('Failed to acknowledge selected alerts');
      } finally {
        this.isBulkAcknowledging = false;
      }
    },

    async resolveSelectedAlerts() {
      if (this.selectedAlerts.length === 0) return;

      this.isBulkResolving = true;
      try {
        await this.resolveMultipleAlerts({
          alertIds: this.selectedAlerts,
          resolution_notes: 'Bulk resolved from sidebar',
          action_taken: 'bulk_action',
        });
        this.$toast.success(`${this.selectedAlerts.length} alerts resolved`);
        this.clearSelection();
      } catch (error) {
        this.$toast.error('Failed to resolve selected alerts');
      } finally {
        this.isBulkResolving = false;
      }
    },

    viewAlertDetails(alert) {
      this.$emit('view-alert-details', alert);
    },

    showSnoozeModal(alert) {
      this.$emit('show-snooze-modal', alert);
    },

    showResolveModal(alert) {
      this.$emit('show-resolve-modal', alert);
    },

    openConfiguration() {
      this.$emit('open-configuration');
    },

    // Pagination
    loadMoreAlerts() {
      this.displayLimit += 20;
    },

    resetPagination() {
      this.displayLimit = 20;
    },

    // Helper methods
    getSidebarAlertClass(alert) {
      const classes = {
        critical: 'alert-sidebar-item-critical',
        warning: 'alert-sidebar-item-warning',
        info: 'alert-sidebar-item-info',
      };
      return classes[alert.severity] || 'alert-sidebar-item-info';
    },

    getAlertIcon(alert) {
      const icons = {
        critical: 'ki ki-warning text-danger',
        warning: 'ki ki-warning text-warning',
        info: 'ki ki-information-circle text-info',
      };
      return icons[alert.severity] || 'ki ki-information-circle text-info';
    },

    getSeverityBadgeClass(alert) {
      const classes = {
        critical: 'badge-danger',
        warning: 'badge-warning',
        info: 'badge-info',
      };
      return classes[alert.severity] || 'badge-info';
    },

    formatCategory(category) {
      const categories = {
        expiry: 'Expiry',
        stock_level: 'Stock',
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
      return 'Just now';
    },

    formatDateTime(dateString) {
      return new Date(dateString).toLocaleString();
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
  },

  watch: {
    showSidebar(newVal) {
      if (newVal) {
        // Reset state when sidebar opens
        this.clearSelection();
        this.expandedAlerts = [];
        this.resetPagination();
      }
    },
  },
};
</script>

<style scoped>
.alert-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0;
}

.alert-sidebar {
  width: 450px;
  max-width: 90vw;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.alert-sidebar-open {
  transform: translateX(0);
}

.alert-sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e5ec;
  background: #f8f9fa;
  flex-shrink: 0;
}

.alert-sidebar-summary {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e2e5ec;
  flex-shrink: 0;
}

.summary-card {
  text-align: center;
  padding: 0.75rem 0.5rem;
  border-radius: 0.42rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.summary-card:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.summary-card-critical {
  background: linear-gradient(135deg, #ffeaea, #fff5f5);
  border-color: #f44434;
}

.summary-card-critical:hover {
  background: linear-gradient(135deg, #ffcccc, #ffeaea);
}

.summary-card-warning {
  background: linear-gradient(135deg, #fff8e1, #fffbf5);
  border-color: #ffa800;
}

.summary-card-warning:hover {
  background: linear-gradient(135deg, #fff3c4, #fff8e1);
}

.summary-card-info {
  background: linear-gradient(135deg, #e0f7fa, #f5fffe);
  border-color: #1bc5bd;
}

.summary-card-info:hover {
  background: linear-gradient(135deg, #b2ebf2, #e0f7fa);
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #5e6278;
  margin-top: 0.25rem;
}

.alert-sidebar-filters {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e2e5ec;
  flex-shrink: 0;
}

.alert-sidebar-content {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.alert-sidebar-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.alert-sidebar-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f4f4f4;
  background: #fff;
  transition: all 0.2s ease;
}

.alert-sidebar-item:hover {
  background: #f8f9fa;
}

.alert-sidebar-item-unread {
  background: linear-gradient(90deg, #f0f8ff 0%, #fff 50%);
  border-left: 3px solid #3699ff;
}

.alert-sidebar-item-selected {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.alert-sidebar-item-critical {
  border-left: 3px solid #f44434;
}

.alert-sidebar-item-warning {
  border-left: 3px solid #ffa800;
}

.alert-sidebar-item-info {
  border-left: 3px solid #1bc5bd;
}

.alert-item-select {
  flex-shrink: 0;
  margin-right: 0.75rem;
  margin-top: 0.25rem;
}

.alert-item-content {
  flex-grow: 1;
  cursor: pointer;
  min-width: 0;
}

.alert-item-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-item-info {
  min-width: 0;
}

.alert-item-title {
  font-size: 0.9rem;
  line-height: 1.3;
}

.alert-item-message {
  font-size: 0.85rem;
  color: #5e6278;
  line-height: 1.4;
}

.alert-item-meta {
  font-size: 0.75rem;
}

.alert-item-expanded {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.42rem;
  margin-top: 0.75rem;
}

.alert-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5e6278;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.85rem;
  font-weight: 500;
}

.alert-item-actions {
  border-top: 1px solid #e2e5ec;
  padding-top: 0.75rem;
}

.alert-sidebar-empty {
  padding: 2rem 1.5rem;
}

.alert-sidebar-load-more {
  padding: 0 1.5rem 1rem;
}

.alert-sidebar-footer {
  border-top: 1px solid #e2e5ec;
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}

.alert-sidebar-config {
  border-top: 1px solid #e2e5ec;
  padding: 0.5rem 1.5rem;
  background: #f8f9fa;
  flex-shrink: 0;
}

.badge-sm {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.custom-control-label {
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .alert-sidebar {
    width: 100vw;
    max-width: 100vw;
  }

  .alert-sidebar-header {
    padding: 1rem;
  }

  .alert-sidebar-summary {
    padding: 1rem;
  }

  .alert-sidebar-filters {
    padding: 1rem;
  }

  .alert-sidebar-item {
    padding: 1rem;
  }

  .alert-details-grid {
    grid-template-columns: 1fr;
  }

  .btn-group-sm .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.4rem;
  }
}

/* Scrollbar styling */
.alert-sidebar-list::-webkit-scrollbar {
  width: 6px;
}

.alert-sidebar-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.alert-sidebar-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.alert-sidebar-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
