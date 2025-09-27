<template>
  <div class="alert-widget" :class="widgetSizeClass">
    <!-- Widget Header -->
    <div class="alert-widget-header">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <i class="ki ki-notification text-primary font-size-h5 mr-2"></i>
          <h6 class="mb-0 font-weight-bold">{{ widgetTitle }}</h6>
        </div>
        <div class="d-flex align-items-center">
          <div v-if="showBadge" class="alert-widget-badge mr-2" :class="badgeClass">
            {{ badgeCount }}
          </div>
          <div class="dropdown">
            <button
              class="btn btn-sm btn-light btn-icon"
              type="button"
              data-toggle="dropdown"
              v-if="showActions"
            >
              <i class="ki ki-more-ver"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
              <a class="dropdown-item" @click="openSidebar">
                <i class="ki ki-menu mr-2"></i>View All Alerts
              </a>
              <a class="dropdown-item" @click="refreshWidget">
                <i class="ki ki-refresh mr-2"></i>Refresh
              </a>
              <a class="dropdown-item" @click="openConfiguration">
                <i class="ki ki-settings mr-2"></i>Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Content -->
    <div class="alert-widget-content">
      <!-- Summary Stats (compact mode) -->
      <div v-if="mode === 'compact'" class="alert-widget-stats">
        <div class="row no-gutters">
          <div class="col-4" @click="filterAndShow('critical')">
            <div class="stat-card stat-critical" :class="{ 'stat-active': criticalCount > 0 }">
              <div class="stat-number">{{ criticalCount }}</div>
              <div class="stat-label">Critical</div>
            </div>
          </div>
          <div class="col-4" @click="filterAndShow('warning')">
            <div class="stat-card stat-warning" :class="{ 'stat-active': warningCount > 0 }">
              <div class="stat-number">{{ warningCount }}</div>
              <div class="stat-label">Warning</div>
            </div>
          </div>
          <div class="col-4" @click="filterAndShow('info')">
            <div class="stat-card stat-info" :class="{ 'stat-active': infoCount > 0 }">
              <div class="stat-number">{{ infoCount }}</div>
              <div class="stat-label">Info</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert List (list mode) -->
      <div v-else-if="mode === 'list'" class="alert-widget-list">
        <div
          v-for="alert in displayedAlerts"
          :key="alert.id"
          class="alert-widget-item"
          :class="getWidgetAlertClass(alert)"
          @click="viewAlert(alert)"
        >
          <div class="d-flex align-items-start">
            <div class="alert-widget-item-icon mr-2">
              <i :class="getAlertIcon(alert)" class="font-size-h6"></i>
            </div>
            <div class="alert-widget-item-content flex-grow-1">
              <div class="alert-widget-item-title">
                {{ truncateText(alert.title, 40) }}
                <span class="badge badge-sm ml-1" :class="getSeverityBadgeClass(alert)">
                  {{ alert.severity }}
                </span>
              </div>
              <div class="alert-widget-item-meta">
                <small class="text-muted">
                  {{ formatTimeAgo(alert.created_at) }}
                  <span v-if="alert.item_name" class="ml-2">
                    {{ truncateText(alert.item_name, 20) }}
                  </span>
                </small>
              </div>
            </div>
            <div class="alert-widget-item-actions">
              <button
                v-if="!alert.acknowledged_at"
                type="button"
                class="btn btn-sm btn-light-success"
                @click.stop="quickAcknowledge(alert.id)"
                :disabled="acknowledgingIds.includes(alert.id)"
              >
                <span
                  v-if="acknowledgingIds.includes(alert.id)"
                  class="spinner-border spinner-border-sm"
                ></span>
                <i v-else class="ki ki-check"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="displayedAlerts.length === 0" class="alert-widget-empty">
          <div class="text-center py-3">
            <i class="ki ki-check-circle text-success font-size-h2"></i>
            <div class="text-muted mt-1">All clear!</div>
          </div>
        </div>

        <div v-if="hasMore" class="alert-widget-more">
          <button type="button" class="btn btn-link btn-sm w-100" @click="openSidebar">
            View {{ remainingCount }} more alerts
          </button>
        </div>
      </div>

      <!-- Chart Mode -->
      <div v-else-if="mode === 'chart'" class="alert-widget-chart">
        <div class="chart-container">
          <canvas ref="alertChart" :id="`alert-chart-${widgetId}`"></canvas>
        </div>
        <div class="chart-legend mt-2">
          <div class="d-flex justify-content-center">
            <div class="legend-item mr-3">
              <span class="legend-color bg-danger"></span>
              <small>Critical ({{ criticalCount }})</small>
            </div>
            <div class="legend-item mr-3">
              <span class="legend-color bg-warning"></span>
              <small>Warning ({{ warningCount }})</small>
            </div>
            <div class="legend-item">
              <span class="legend-color bg-info"></span>
              <small>Info ({{ infoCount }})</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Mode -->
      <div v-else-if="mode === 'trend'" class="alert-widget-trend">
        <div class="trend-metrics mb-3">
          <div class="row no-gutters text-center">
            <div class="col-6">
              <div class="metric-value">{{ todayCount }}</div>
              <div class="metric-label">Today</div>
            </div>
            <div class="col-6">
              <div class="metric-value">{{ weekCount }}</div>
              <div class="metric-label">This Week</div>
            </div>
          </div>
        </div>
        <div class="trend-chart">
          <canvas ref="trendChart" :id="`trend-chart-${widgetId}`"></canvas>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="alert-widget-loading">
        <div class="d-flex align-items-center justify-content-center py-4">
          <div class="spinner-border spinner-border-sm mr-2"></div>
          <span class="text-muted">Loading alerts...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="alert-widget-error">
        <div class="text-center py-3">
          <i class="ki ki-warning text-warning font-size-h2"></i>
          <div class="text-muted mt-1">Failed to load alerts</div>
          <button type="button" class="btn btn-sm btn-light mt-2" @click="refreshWidget">
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Widget Footer -->
    <div v-if="showFooter" class="alert-widget-footer">
      <div class="d-flex align-items-center justify-content-between">
        <small class="text-muted">
          Updated {{ lastUpdateTime ? formatTimeAgo(lastUpdateTime) : 'never' }}
        </small>
        <button type="button" class="btn btn-link btn-sm p-0" @click="openSidebar">
          View All <i class="ki ki-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'AlertWidget',
  props: {
    mode: {
      type: String,
      default: 'compact',
      validator: (value) => ['compact', 'list', 'chart', 'trend'].includes(value),
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value),
    },
    maxItems: {
      type: Number,
      default: 5,
    },
    showBadge: {
      type: Boolean,
      default: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    filterSeverity: {
      type: String,
      default: null,
    },
    filterCategory: {
      type: String,
      default: null,
    },
    storeType: {
      type: String,
      default: null,
    },
    autoRefresh: {
      type: Boolean,
      default: true,
    },
    refreshInterval: {
      type: Number,
      default: 60000, // 1 minute
    },
  },
  data() {
    return {
      widgetId: `widget-${Math.random().toString(36).substr(2, 9)}`,
      acknowledgingIds: [],
      refreshTimer: null,
      chartInstance: null,
      trendChartInstance: null,
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['activeAlerts', 'loading', 'error', 'lastUpdate']),
    ...mapGetters('inventoryAlerts', [
      'criticalAlertsCount',
      'warningAlertsCount',
      'infoAlertsCount',
      'totalActiveAlertsCount',
      'todaysAlerts',
      'thisWeeksAlerts',
    ]),

    widgetTitle() {
      if (this.filterSeverity) {
        return `${
          this.filterSeverity.charAt(0).toUpperCase() + this.filterSeverity.slice(1)
        } Alerts`;
      }
      if (this.filterCategory) {
        return `${this.formatCategory(this.filterCategory)} Alerts`;
      }
      if (this.storeType) {
        return `${this.formatStoreType(this.storeType)} Alerts`;
      }
      return 'Inventory Alerts';
    },

    widgetSizeClass() {
      return `alert-widget-${this.size}`;
    },

    filteredAlerts() {
      let filtered = [...this.activeAlerts];

      if (this.filterSeverity) {
        filtered = filtered.filter((alert) => alert.severity === this.filterSeverity);
      }

      if (this.filterCategory) {
        filtered = filtered.filter((alert) => alert.category === this.filterCategory);
      }

      if (this.storeType) {
        filtered = filtered.filter((alert) => alert.store_type === this.storeType);
      }

      return filtered.sort((a, b) => {
        // Sort by severity, then by creation date
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        const aSeverity = severityOrder[a.severity] || 0;
        const bSeverity = severityOrder[b.severity] || 0;

        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity;
        }

        return new Date(b.created_at) - new Date(a.created_at);
      });
    },

    displayedAlerts() {
      return this.filteredAlerts.slice(0, this.maxItems);
    },

    hasMore() {
      return this.filteredAlerts.length > this.maxItems;
    },

    remainingCount() {
      return this.filteredAlerts.length - this.maxItems;
    },

    criticalCount() {
      return this.filteredAlerts.filter((alert) => alert.severity === 'critical').length;
    },

    warningCount() {
      return this.filteredAlerts.filter((alert) => alert.severity === 'warning').length;
    },

    infoCount() {
      return this.filteredAlerts.filter((alert) => alert.severity === 'info').length;
    },

    badgeCount() {
      return this.filteredAlerts.length;
    },

    badgeClass() {
      if (this.criticalCount > 0) return 'badge-danger';
      if (this.warningCount > 0) return 'badge-warning';
      return 'badge-info';
    },

    todayCount() {
      return this.todaysAlerts.length;
    },

    weekCount() {
      return this.thisWeeksAlerts.length;
    },

    lastUpdateTime() {
      return this.lastUpdate;
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', ['fetchActiveAlerts', 'acknowledgeAlert', 'showSidebar']),

    async refreshWidget() {
      try {
        await this.fetchActiveAlerts();
        if (this.mode === 'chart') {
          this.updateChart();
        } else if (this.mode === 'trend') {
          this.updateTrendChart();
        }
      } catch (error) {
        console.error('Failed to refresh widget:', error);
      }
    },

    async quickAcknowledge(alertId) {
      this.acknowledgingIds.push(alertId);
      try {
        await this.acknowledgeAlert({
          alertId,
          notes: 'Quick acknowledged from widget',
        });
        this.$toast?.success('Alert acknowledged');
      } catch (error) {
        this.$toast?.error('Failed to acknowledge alert');
      } finally {
        const index = this.acknowledgingIds.indexOf(alertId);
        if (index > -1) {
          this.acknowledgingIds.splice(index, 1);
        }
      }
    },

    viewAlert(alert) {
      this.$emit('view-alert', alert);
    },

    filterAndShow(severity) {
      this.$emit('filter-and-show', severity);
    },

    openSidebar() {
      this.showSidebar();
      this.$emit('open-sidebar');
    },

    openConfiguration() {
      this.$emit('open-configuration');
    },

    startAutoRefresh() {
      if (this.autoRefresh && this.refreshInterval > 0) {
        this.refreshTimer = setInterval(() => {
          this.refreshWidget();
        }, this.refreshInterval);
      }
    },

    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    initChart() {
      if (this.mode !== 'chart' || !this.$refs.alertChart) return;

      const ctx = this.$refs.alertChart.getContext('2d');

      // Destroy existing chart
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Critical', 'Warning', 'Info'],
          datasets: [
            {
              data: [this.criticalCount, this.warningCount, this.infoCount],
              backgroundColor: ['#f44434', '#ffa800', '#1bc5bd'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    },

    updateChart() {
      if (this.chartInstance) {
        this.chartInstance.data.datasets[0].data = [
          this.criticalCount,
          this.warningCount,
          this.infoCount,
        ];
        this.chartInstance.update();
      }
    },

    initTrendChart() {
      if (this.mode !== 'trend' || !this.$refs.trendChart) return;

      const ctx = this.$refs.trendChart.getContext('2d');

      // Destroy existing chart
      if (this.trendChartInstance) {
        this.trendChartInstance.destroy();
      }

      // Get last 7 days data
      const last7Days = [];
      const alertCounts = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];

        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        const dayAlerts = this.activeAlerts.filter((alert) => {
          const alertDate = new Date(alert.created_at).toISOString().split('T')[0];
          return alertDate === dateKey;
        });

        alertCounts.push(dayAlerts.length);
      }

      this.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: last7Days,
          datasets: [
            {
              data: alertCounts,
              borderColor: '#3699ff',
              backgroundColor: 'rgba(54, 153, 255, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          elements: {
            point: {
              radius: 3,
              hoverRadius: 5,
            },
          },
        },
      });
    },

    // Helper methods
    getWidgetAlertClass(alert) {
      const classes = {
        critical: 'alert-widget-item-critical',
        warning: 'alert-widget-item-warning',
        info: 'alert-widget-item-info',
      };
      return classes[alert.severity] || 'alert-widget-item-info';
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

    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substr(0, length) + '...' : text;
    },
  },

  mounted() {
    this.refreshWidget();
    this.startAutoRefresh();

    // Initialize charts after next tick
    this.$nextTick(() => {
      if (this.mode === 'chart') {
        this.initChart();
      } else if (this.mode === 'trend') {
        this.initTrendChart();
      }
    });
  },

  beforeDestroy() {
    this.stopAutoRefresh();
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }
  },

  watch: {
    mode(newMode) {
      this.$nextTick(() => {
        if (newMode === 'chart') {
          this.initChart();
        } else if (newMode === 'trend') {
          this.initTrendChart();
        }
      });
    },

    activeAlerts() {
      if (this.mode === 'chart') {
        this.updateChart();
      } else if (this.mode === 'trend') {
        this.initTrendChart();
      }
    },
  },
};
</script>

<style scoped>
.alert-widget {
  background: #fff;
  border: 1px solid #e2e5ec;
  border-radius: 0.42rem;
  box-shadow: 0px 2px 10px 0px rgba(82, 63, 105, 0.05);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.alert-widget-small {
  min-height: 200px;
}

.alert-widget-medium {
  min-height: 300px;
}

.alert-widget-large {
  min-height: 400px;
}

.alert-widget-header {
  padding: 1rem;
  border-bottom: 1px solid #f4f4f4;
  background: #f8f9fa;
  flex-shrink: 0;
}

.alert-widget-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.42rem;
  min-width: 1.5rem;
  text-align: center;
}

.badge-danger {
  background: #f44434;
  color: #fff;
}

.badge-warning {
  background: #ffa800;
  color: #fff;
}

.badge-info {
  background: #1bc5bd;
  color: #fff;
}

.alert-widget-content {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
}

.alert-widget-stats {
  padding: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.25rem;
}

.stat-card:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.stat-critical.stat-active {
  background: linear-gradient(135deg, #ffeaea, #fff5f5);
  border: 1px solid #f44434;
}

.stat-warning.stat-active {
  background: linear-gradient(135deg, #fff8e1, #fffbf5);
  border: 1px solid #ffa800;
}

.stat-info.stat-active {
  background: linear-gradient(135deg, #e0f7fa, #f5fffe);
  border: 1px solid #1bc5bd;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #5e6278;
  margin-top: 0.25rem;
}

.alert-widget-list {
  padding: 0.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.alert-widget-item {
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.alert-widget-item:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alert-widget-item:last-child {
  margin-bottom: 0;
}

.alert-widget-item-critical {
  border-left: 3px solid #f44434;
  background: linear-gradient(90deg, #fef5f5 0%, #fff 20%);
}

.alert-widget-item-warning {
  border-left: 3px solid #ffa800;
  background: linear-gradient(90deg, #fffbf5 0%, #fff 20%);
}

.alert-widget-item-info {
  border-left: 3px solid #1bc5bd;
  background: linear-gradient(90deg, #f5fffe 0%, #fff 20%);
}

.alert-widget-item-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-widget-item-content {
  min-width: 0;
}

.alert-widget-item-title {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.alert-widget-item-meta {
  font-size: 0.75rem;
}

.alert-widget-item-actions {
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.alert-widget-chart {
  padding: 1rem;
  height: 200px;
}

.chart-container {
  position: relative;
  height: 150px;
}

.chart-legend {
  display: flex;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 0.25rem;
}

.alert-widget-trend {
  padding: 1rem;
}

.trend-metrics {
  background: #f8f9fa;
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #181c32;
}

.metric-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #5e6278;
  margin-top: 0.25rem;
}

.trend-chart {
  height: 120px;
  position: relative;
}

.alert-widget-empty,
.alert-widget-loading,
.alert-widget-error {
  padding: 2rem 1rem;
}

.alert-widget-more {
  padding: 0.5rem;
  border-top: 1px solid #f4f4f4;
}

.alert-widget-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #f4f4f4;
  background: #f8f9fa;
  flex-shrink: 0;
}

.badge-sm {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

.btn-icon {
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .alert-widget-header {
    padding: 0.75rem;
  }

  .alert-widget-stats {
    padding: 0.75rem;
  }

  .alert-widget-list {
    padding: 0.25rem;
  }

  .alert-widget-item {
    padding: 0.5rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.65rem;
  }
}

/* Scrollbar styling */
.alert-widget-list::-webkit-scrollbar {
  width: 4px;
}

.alert-widget-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.alert-widget-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.alert-widget-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
