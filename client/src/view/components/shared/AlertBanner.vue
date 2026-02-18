<template>
  <div v-if="shouldShowBanner" class="alert-banner-container">
    <!-- Main Alert Banner -->
    <div
      :class="[
        'alert-banner',
        severityClass,
        { 'alert-banner-expanded': isExpanded },
        { 'alert-banner-critical-pulse': hasCriticalAlerts },
      ]"
    >
      <!-- Banner Header -->
      <div class="alert-banner-header" @click="toggleExpanded">
        <div class="d-flex align-items-center">
          <!-- Severity Icon -->
          <div class="alert-banner-icon mr-3">
            <i :class="primarySeverityIcon" class="font-size-h4"></i>
          </div>

          <!-- Alert Summary -->
          <div class="alert-banner-content flex-grow-1">
            <div class="alert-banner-title">
              <span class="font-weight-bold">{{ bannerTitle }}</span>
              <span class="badge badge-pill ml-2" :class="primarySeverityBadgeClass">
                {{ activeAlertCount }}
              </span>
            </div>
            <div class="alert-banner-subtitle text-muted">
              {{ bannerSubtitle }}
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="alert-banner-stats d-none d-md-flex mr-4">
            <div v-if="criticalCount > 0" class="stat-item mr-3">
              <span class="stat-label">Critical:</span>
              <span class="stat-value text-danger font-weight-bold">{{ criticalCount }}</span>
            </div>
            <div v-if="warningCount > 0" class="stat-item mr-3">
              <span class="stat-label">Warning:</span>
              <span class="stat-value text-warning font-weight-bold">{{ warningCount }}</span>
            </div>
            <div v-if="infoCount > 0" class="stat-item mr-3">
              <span class="stat-label">Info:</span>
              <span class="stat-value text-info font-weight-bold">{{ infoCount }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="alert-banner-actions d-flex align-items-center">
            <!-- Quick Acknowledge All -->
            <button
              v-if="unreadCount > 1"
              type="button"
              class="btn btn-sm btn-light-success mr-2"
              :disabled="isAcknowledgingAll"
              @click="acknowledgeAllVisible"
            >
              <span v-if="isAcknowledgingAll" class="spinner-border spinner-border-sm mr-1"></span>
              <i v-else class="ki ki-check mr-1"></i>
              Ack All
            </button>

            <!-- View All Button -->
            <button type="button" class="btn btn-sm btn-light-primary mr-2" @click="openSidebar">
              <i class="ki ki-menu mr-1"></i>
              View All
            </button>

            <!-- Expand/Collapse -->
            <button type="button" class="btn btn-sm btn-light mr-2" @click="toggleExpanded">
              <i :class="isExpanded ? 'ki ki-up' : 'ki ki-down'"></i>
            </button>

            <!-- Close Banner -->
            <button
              type="button"
              class="btn btn-sm btn-light"
              @click="closeBanner"
              :disabled="hasCriticalAlerts"
            >
              <i class="ki ki-close"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Expanded Alert List -->
      <div v-if="isExpanded" class="alert-banner-expanded-content">
        <div class="alert-list">
          <div
            v-for="alert in displayedAlerts"
            :key="alert.id"
            :class="[
              'alert-item',
              getAlertItemClass(alert),
              { 'alert-item-unread': !alert.acknowledged_at },
            ]"
          >
            <div class="d-flex align-items-start">
              <!-- Alert Icon -->
              <div class="alert-item-icon mr-3">
                <i :class="getAlertIcon(alert)" class="font-size-h6"></i>
              </div>

              <!-- Alert Content -->
              <div class="alert-item-content flex-grow-1">
                <div
                  class="alert-item-header d-flex align-items-center justify-content-between mb-1"
                >
                  <div class="d-flex align-items-center">
                    <span class="alert-item-title font-weight-bold mr-2">{{ alert.title }}</span>
                    <span class="badge badge-sm" :class="getSeverityBadgeClass(alert)">
                      {{ alert.severity }}
                    </span>
                    <span class="badge badge-sm badge-light-info ml-1">
                      {{ formatCategory(alert.category) }}
                    </span>
                  </div>
                  <small class="text-muted">{{ formatTimeAgo(alert.created_at) }}</small>
                </div>
                <p class="alert-item-message mb-2">{{ alert.message }}</p>
                <div v-if="alert.item_name" class="alert-item-meta">
                  <small class="text-muted">
                    <i class="ki ki-package mr-1"></i>
                    {{ alert.item_name }}
                    <span v-if="alert.current_value !== null" class="ml-2">
                      ({{ formatCurrentValue(alert) }})
                    </span>
                  </small>
                </div>
              </div>

              <!-- Alert Actions -->
              <div class="alert-item-actions d-flex align-items-center ml-3">
                <button
                  v-if="!alert.acknowledged_at"
                  type="button"
                  class="btn btn-sm btn-light-success mr-1"
                  @click="acknowledgeAlert(alert.id)"
                  :disabled="acknowledgingIds.includes(alert.id)"
                >
                  <span
                    v-if="acknowledgingIds.includes(alert.id)"
                    class="spinner-border spinner-border-sm"
                  ></span>
                  <i v-else class="ki ki-check"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-light-primary mr-1"
                  @click="viewAlertDetails(alert)"
                >
                  <i class="ki ki-eye"></i>
                </button>
                <button
                  v-if="alert.severity !== 'critical'"
                  type="button"
                  class="btn btn-sm btn-light-warning"
                  @click="snoozeAlert(alert.id)"
                >
                  <i class="ki ki-time"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreAlerts" class="text-center py-3">
            <button
              type="button"
              class="btn btn-light-primary btn-sm"
              @click="loadMoreAlerts"
              :disabled="loadingMore"
            >
              <span v-if="loadingMore" class="spinner-border spinner-border-sm mr-2"></span>
              Load More Alerts
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto-dismiss Timer (for non-critical alerts) -->
    <div v-if="showAutoDismiss && autoDismissEnabled" class="alert-banner-timer">
      <div class="timer-progress" :style="{ width: timerProgress + '%' }"></div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'AlertBanner',
  data() {
    return {
      isExpanded: false,
      displayLimit: 5,
      isAcknowledgingAll: false,
      acknowledgingIds: [],
      loadingMore: false,

      // Auto-dismiss timer
      autoDismissEnabled: false,
      autoDismissTimeout: null,
      timerProgress: 100,
      timerDuration: 10000, // 10 seconds
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['activeAlerts', 'configuration']),
    ...mapGetters('inventoryAlerts', [
      'criticalAlertsCount',
      'warningAlertsCount',
      'infoAlertsCount',
      'unreadAlertsCount',
      'hasCriticalAlerts',
      'hasUnreadAlerts',
      'totalActiveAlertsCount',
    ]),

    shouldShowBanner() {
      return (
        this.configuration.banner_enabled &&
        this.totalActiveAlertsCount > 0 &&
        (this.hasCriticalAlerts || this.hasUnreadAlerts)
      );
    },

    activeAlertCount() {
      return this.totalActiveAlertsCount;
    },

    criticalCount() {
      return this.criticalAlertsCount;
    },

    warningCount() {
      return this.warningAlertsCount;
    },

    infoCount() {
      return this.infoAlertsCount;
    },

    unreadCount() {
      return this.unreadAlertsCount;
    },

    bannerTitle() {
      if (this.hasCriticalAlerts) {
        return this.criticalCount > 1 ? `${this.criticalCount} Critical Alerts` : 'Critical Alert';
      } else if (this.hasUnreadAlerts) {
        return this.unreadCount > 1 ? `${this.unreadCount} New Alerts` : 'New Alert';
      }
      return 'Active Alerts';
    },

    bannerSubtitle() {
      const parts = [];
      if (this.criticalCount > 0) parts.push(`${this.criticalCount} critical`);
      if (this.warningCount > 0) parts.push(`${this.warningCount} warning`);
      if (this.infoCount > 0) parts.push(`${this.infoCount} info`);

      return parts.join(', ') + ' - Click to expand';
    },

    severityClass() {
      if (this.hasCriticalAlerts) {
        return 'alert-banner-critical';
      } else if (this.warningCount > 0) {
        return 'alert-banner-warning';
      }
      return 'alert-banner-info';
    },

    primarySeverityIcon() {
      if (this.hasCriticalAlerts) {
        return 'ki ki-warning text-danger';
      } else if (this.warningCount > 0) {
        return 'ki ki-warning text-warning';
      }
      return 'ki ki-information-circle text-info';
    },

    primarySeverityBadgeClass() {
      if (this.hasCriticalAlerts) {
        return 'badge-danger';
      } else if (this.warningCount > 0) {
        return 'badge-warning';
      }
      return 'badge-info';
    },

    displayedAlerts() {
      return [...this.activeAlerts]
        .sort((a, b) => {
          // Sort by severity, then by creation date
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          const aSeverity = severityOrder[a.severity] || 0;
          const bSeverity = severityOrder[b.severity] || 0;

          if (aSeverity !== bSeverity) {
            return bSeverity - aSeverity;
          }

          return new Date(b.created_at) - new Date(a.created_at);
        })
        .slice(0, this.displayLimit);
    },

    hasMoreAlerts() {
      return this.activeAlerts.length > this.displayLimit;
    },

    showAutoDismiss() {
      return !this.hasCriticalAlerts && this.autoDismissEnabled;
    },
  },
  watch: {
    shouldShowBanner(newVal) {
      if (newVal && !this.hasCriticalAlerts) {
        this.startAutoDismissTimer();
      } else {
        this.clearAutoDismissTimer();
      }
    },

    hasCriticalAlerts(newVal) {
      if (!newVal && this.shouldShowBanner) {
        this.startAutoDismissTimer();
      } else {
        this.clearAutoDismissTimer();
      }
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', [
      'acknowledgeAlert',
      'acknowledgeMultipleAlerts',
      'snoozeAlert',
      'showSidebar',
      'fetchActiveAlerts',
    ]),

    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.clearAutoDismissTimer();
      }
    },

    async acknowledgeAllVisible() {
      const unreadAlertIds = this.displayedAlerts
        .filter((alert) => !alert.acknowledged_at)
        .map((alert) => alert.id);

      if (unreadAlertIds.length === 0) return;

      this.isAcknowledgingAll = true;
      try {
        await this.acknowledgeMultipleAlerts({
          alertIds: unreadAlertIds,
          notes: 'Bulk acknowledged from banner',
        });

        this.$toast.success(`${unreadAlertIds.length} alerts acknowledged`);
      } catch (error) {
        this.$toast.error('Failed to acknowledge alerts');
      } finally {
        this.isAcknowledgingAll = false;
      }
    },

    async acknowledgeAlert(alertId) {
      this.acknowledgingIds.push(alertId);
      try {
        await this.acknowledgeAlert({
          alertId,
          notes: 'Acknowledged from banner',
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

    async snoozeAlert(alertId) {
      const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      try {
        await this.snoozeAlert({
          alertId,
          snooze_until: snoozeUntil.toISOString(),
          reason: 'Snoozed from banner',
        });

        this.$toast.success('Alert snoozed for 1 hour');
      } catch (error) {
        this.$toast.error('Failed to snooze alert');
      }
    },

    viewAlertDetails(alert) {
      // Emit event to parent or use router to navigate to alert details
      this.$emit('view-alert-details', alert);
    },

    openSidebar() {
      this.showSidebar();
    },

    closeBanner() {
      if (this.hasCriticalAlerts) return;

      // Hide banner temporarily (will reappear on new alerts)
      this.clearAutoDismissTimer();
      this.$emit('banner-closed');
    },

    loadMoreAlerts() {
      this.displayLimit += 5;
    },

    // Helper methods
    getAlertItemClass(alert) {
      const classes = {
        critical: 'alert-item-critical',
        warning: 'alert-item-warning',
        info: 'alert-item-info',
      };
      return classes[alert.severity] || 'alert-item-info';
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

    formatCurrentValue(alert) {
      if (alert.category === 'stock_level') {
        return `${alert.current_value} units`;
      } else if (alert.category === 'expiry') {
        return `${alert.current_value} days`;
      }
      return alert.current_value;
    },

    // Auto-dismiss timer methods
    startAutoDismissTimer() {
      if (this.hasCriticalAlerts || this.isExpanded) return;

      this.autoDismissEnabled = true;
      this.timerProgress = 100;

      const interval = 100; // Update every 100ms
      const step = (interval / this.timerDuration) * 100;

      const timer = setInterval(() => {
        this.timerProgress -= step;

        if (this.timerProgress <= 0) {
          clearInterval(timer);
          this.autoDismissEnabled = false;
          this.closeBanner();
        }
      }, interval);

      this.autoDismissTimeout = timer;
    },

    clearAutoDismissTimer() {
      if (this.autoDismissTimeout) {
        clearInterval(this.autoDismissTimeout);
        this.autoDismissTimeout = null;
      }
      this.autoDismissEnabled = false;
      this.timerProgress = 100;
    },
  },

  mounted() {
    if (this.shouldShowBanner && !this.hasCriticalAlerts) {
      this.startAutoDismissTimer();
    }
  },

  beforeDestroy() {
    this.clearAutoDismissTimer();
  },
};
</script>

<style scoped>
.alert-banner-container {
  position: relative;
  z-index: 1000;
  width: 100%;
}

.alert-banner {
  background: #fff;
  border: 1px solid #e2e5ec;
  border-radius: 0.42rem;
  box-shadow: 0px 2px 10px 0px rgba(82, 63, 105, 0.08);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.alert-banner-critical {
  border-left: 4px solid #f4434;
  background: linear-gradient(90deg, #fef5f5 0%, #fff 20%);
}

.alert-banner-warning {
  border-left: 4px solid #ffa800;
  background: linear-gradient(90deg, #fffbf5 0%, #fff 20%);
}

.alert-banner-info {
  border-left: 4px solid #1bc5bd;
  background: linear-gradient(90deg, #f5fffe 0%, #fff 20%);
}

.alert-banner-critical-pulse {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% {
    border-left-color: #f44434;
  }
  50% {
    border-left-color: #ff6b6b;
  }
  100% {
    border-left-color: #f44434;
  }
}

.alert-banner-header {
  padding: 1rem 1.5rem;
  cursor: pointer;
  user-select: none;
}

.alert-banner-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

.alert-banner-icon {
  flex-shrink: 0;
}

.alert-banner-content {
  min-width: 0;
}

.alert-banner-title {
  font-size: 1.1rem;
  line-height: 1.4;
}

.alert-banner-subtitle {
  font-size: 0.9rem;
  line-height: 1.3;
}

.alert-banner-stats {
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.stat-label {
  margin-right: 0.25rem;
}

.alert-banner-actions {
  flex-shrink: 0;
}

.alert-banner-expanded-content {
  border-top: 1px solid #e2e5ec;
  background: #f8f9fa;
}

.alert-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e5ec;
  background: #fff;
  transition: background-color 0.2s ease;
}

.alert-item:hover {
  background: #f8f9fa;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item-unread {
  background: linear-gradient(90deg, #f0f8ff 0%, #fff 50%);
  position: relative;
}

.alert-item-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #00acc1;
}

.alert-item-critical {
  border-left: 3px solid #f44434;
}

.alert-item-warning {
  border-left: 3px solid #ffa800;
}

.alert-item-info {
  border-left: 3px solid #1bc5bd;
}

.alert-item-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-item-content {
  min-width: 0;
}

.alert-item-title {
  font-size: 0.95rem;
}

.alert-item-message {
  font-size: 0.9rem;
  color: #5e6278;
  line-height: 1.4;
}

.alert-item-meta {
  font-size: 0.8rem;
}

.alert-item-actions {
  flex-shrink: 0;
}

.alert-banner-timer {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 0.42rem 0.42rem;
  overflow: hidden;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #1bc5bd, #00acc1);
  transition: width 0.1s linear;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .alert-banner-header {
    padding: 0.75rem 1rem;
  }

  .alert-item {
    padding: 0.75rem 1rem;
  }

  .alert-banner-stats {
    display: none !important;
  }

  .alert-banner-actions .btn {
    padding: 0.25rem 0.4rem;
    font-size: 0.8rem;
  }

  .alert-banner-actions .btn .ki {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .alert-item-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .alert-item-actions .btn {
    margin-bottom: 0.25rem;
    margin-right: 0 !important;
  }

  .alert-item-actions .btn:last-child {
    margin-bottom: 0;
  }
}
</style>
