<template>
  <div class="alert-badge-container" v-if="shouldShowBadge">
    <div
      :class="[
        'alert-badge',
        badgeClass,
        { 'alert-badge-critical-pulse': hasCriticalAlerts },
        { 'alert-badge-animated': isAnimated },
      ]"
      @click="handleBadgeClick"
      :title="badgeTooltip"
    >
      <!-- Icon -->
      <i :class="badgeIcon" class="alert-badge-icon"></i>

      <!-- Count -->
      <span class="alert-badge-count">{{ displayCount }}</span>

      <!-- Critical indicator -->
      <div v-if="hasCriticalAlerts" class="alert-badge-critical-dot"></div>
    </div>

    <!-- Dropdown content for hover/click -->
    <div v-if="showDropdown" class="alert-badge-dropdown">
      <div class="alert-badge-dropdown-header">
        <div class="d-flex align-items-center justify-content-between">
          <span class="font-weight-bold">Inventory Alerts</span>
          <button type="button" class="btn btn-link btn-sm p-0" @click="closeDropdown">
            <i class="ki ki-close"></i>
          </button>
        </div>
      </div>

      <div class="alert-badge-dropdown-content">
        <!-- Quick Stats -->
        <div class="alert-badge-stats">
          <div class="row no-gutters">
            <div class="col-4 text-center">
              <div class="stat-number text-danger">{{ criticalCount }}</div>
              <div class="stat-label">Critical</div>
            </div>
            <div class="col-4 text-center">
              <div class="stat-number text-warning">{{ warningCount }}</div>
              <div class="stat-label">Warning</div>
            </div>
            <div class="col-4 text-center">
              <div class="stat-number text-info">{{ infoCount }}</div>
              <div class="stat-label">Info</div>
            </div>
          </div>
        </div>

        <!-- Recent Alerts -->
        <div class="alert-badge-recent">
          <div class="recent-header">
            <small class="text-muted font-weight-bold">Recent Alerts</small>
          </div>
          <div class="recent-list">
            <div
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="recent-alert-item"
              @click="viewAlert(alert)"
            >
              <div class="d-flex align-items-start">
                <i :class="getAlertIcon(alert)" class="recent-alert-icon mr-2"></i>
                <div class="recent-alert-content flex-grow-1">
                  <div class="recent-alert-title">{{ truncateText(alert.title, 35) }}</div>
                  <div class="recent-alert-meta">
                    <small class="text-muted">
                      {{ formatTimeAgo(alert.created_at) }}
                      <span v-if="alert.item_name" class="ml-1">
                        • {{ truncateText(alert.item_name, 15) }}
                      </span>
                    </small>
                  </div>
                </div>
                <span class="badge badge-sm" :class="getSeverityBadgeClass(alert)">
                  {{ alert.severity }}
                </span>
              </div>
            </div>

            <div v-if="recentAlerts.length === 0" class="recent-empty">
              <small class="text-muted">No recent alerts</small>
            </div>
          </div>
        </div>
      </div>

      <div class="alert-badge-dropdown-footer">
        <div class="d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-link btn-sm"
            @click="acknowledgeAll"
            v-if="unreadCount > 1"
          >
            <i class="ki ki-check mr-1"></i>
            Acknowledge All
          </button>
          <div></div>
          <button type="button" class="btn btn-primary btn-sm" @click="viewAllAlerts">
            View All
            <i class="ki ki-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="showDropdown" class="alert-badge-backdrop" @click="closeDropdown"></div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'AlertBadge',
  props: {
    // Badge behavior
    clickAction: {
      type: String,
      default: 'dropdown', // 'dropdown', 'sidebar', 'modal'
      validator: (value) => ['dropdown', 'sidebar', 'modal'].includes(value),
    },

    // Badge appearance
    size: {
      type: String,
      default: 'normal',
      validator: (value) => ['small', 'normal', 'large'].includes(value),
    },

    // Badge positioning (for absolute positioning)
    position: {
      type: String,
      default: 'relative',
      validator: (value) => ['relative', 'absolute'].includes(value),
    },

    // Show only unread alerts
    unreadOnly: {
      type: Boolean,
      default: false,
    },

    // Maximum count to display (99+)
    maxCount: {
      type: Number,
      default: 99,
    },

    // Auto-hide when no alerts
    autoHide: {
      type: Boolean,
      default: true,
    },

    // Animation on new alerts
    animate: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      showDropdown: false,
      isAnimated: false,
      animationTimeout: null,
      lastAlertCount: 0,
    };
  },
  computed: {
    ...mapState('inventoryAlerts', ['activeAlerts']),
    ...mapGetters('inventoryAlerts', [
      'criticalAlertsCount',
      'warningAlertsCount',
      'infoAlertsCount',
      'unreadAlertsCount',
      'totalActiveAlertsCount',
      'hasCriticalAlerts',
    ]),

    shouldShowBadge() {
      if (this.autoHide) {
        return this.alertCount > 0;
      }
      return true;
    },

    alertCount() {
      return this.unreadOnly ? this.unreadAlertsCount : this.totalActiveAlertsCount;
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

    displayCount() {
      const count = this.alertCount;
      if (count > this.maxCount) {
        return `${this.maxCount}+`;
      }
      return count.toString();
    },

    badgeClass() {
      const classes = [`alert-badge-${this.size}`];

      if (this.position === 'absolute') {
        classes.push('alert-badge-absolute');
      }

      if (this.hasCriticalAlerts) {
        classes.push('alert-badge-critical');
      } else if (this.warningCount > 0) {
        classes.push('alert-badge-warning');
      } else {
        classes.push('alert-badge-info');
      }

      return classes;
    },

    badgeIcon() {
      if (this.hasCriticalAlerts) {
        return 'ki ki-warning';
      } else if (this.warningCount > 0) {
        return 'ki ki-notification';
      }
      return 'ki ki-notification-circle';
    },

    badgeTooltip() {
      if (this.alertCount === 0) {
        return 'No active alerts';
      }

      const parts = [];
      if (this.criticalCount > 0) parts.push(`${this.criticalCount} critical`);
      if (this.warningCount > 0) parts.push(`${this.warningCount} warning`);
      if (this.infoCount > 0) parts.push(`${this.infoCount} info`);

      return `${this.alertCount} alerts: ${parts.join(', ')}`;
    },

    recentAlerts() {
      return this.activeAlerts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    },
  },
  methods: {
    ...mapActions('inventoryAlerts', [
      'showSidebar',
      'acknowledgeMultipleAlerts',
      'fetchActiveAlerts',
    ]),

    handleBadgeClick() {
      if (this.clickAction === 'dropdown') {
        this.toggleDropdown();
      } else if (this.clickAction === 'sidebar') {
        this.viewAllAlerts();
      } else if (this.clickAction === 'modal') {
        this.$emit('open-modal');
      }
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        this.fetchActiveAlerts(); // Refresh data when opening
      }
    },

    closeDropdown() {
      this.showDropdown = false;
    },

    viewAllAlerts() {
      this.closeDropdown();
      this.showSidebar();
      this.$emit('view-all');
    },

    viewAlert(alert) {
      this.closeDropdown();
      this.$emit('view-alert', alert);
    },

    async acknowledgeAll() {
      const unreadAlertIds = this.activeAlerts
        .filter((alert) => !alert.acknowledged_at)
        .map((alert) => alert.id);

      if (unreadAlertIds.length === 0) return;

      try {
        await this.acknowledgeMultipleAlerts({
          alertIds: unreadAlertIds,
          notes: 'Bulk acknowledged from navigation badge',
        });

        this.$toast?.success(`${unreadAlertIds.length} alerts acknowledged`);
        this.closeDropdown();
      } catch (error) {
        this.$toast?.error('Failed to acknowledge alerts');
      }
    },

    triggerAnimation() {
      if (!this.animate) return;

      this.isAnimated = true;

      if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
      }

      this.animationTimeout = setTimeout(() => {
        this.isAnimated = false;
      }, 1500);
    },

    // Helper methods
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

    formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return 'now';
    },

    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substr(0, length) + '...' : text;
    },
  },

  watch: {
    totalActiveAlertsCount(newCount, oldCount) {
      if (newCount > oldCount && oldCount > 0) {
        this.triggerAnimation();
      }
      this.lastAlertCount = newCount;
    },
  },

  beforeDestroy() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  },
};
</script>

<style scoped>
.alert-badge-container {
  position: relative;
  display: inline-block;
}

.alert-badge {
  background: #f44434;
  color: #fff;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  min-width: 24px;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alert-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.alert-badge-small {
  padding: 2px 6px;
  font-size: 0.65rem;
  border-radius: 10px;
  min-width: 20px;
}

.alert-badge-normal {
  padding: 4px 8px;
  font-size: 0.7rem;
  border-radius: 12px;
  min-width: 24px;
}

.alert-badge-large {
  padding: 6px 10px;
  font-size: 0.75rem;
  border-radius: 14px;
  min-width: 28px;
}

.alert-badge-absolute {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
}

.alert-badge-critical {
  background: #f44434;
}

.alert-badge-warning {
  background: #ffa800;
}

.alert-badge-info {
  background: #1bc5bd;
}

.alert-badge-critical-pulse {
  animation: pulse-critical 2s infinite;
}

@keyframes pulse-critical {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 52, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 52, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 52, 0);
  }
}

.alert-badge-animated {
  animation: badge-bounce 1.5s ease-out;
}

@keyframes badge-bounce {
  0% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.2);
  }
  20% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  40% {
    transform: scale(1);
  }
}

.alert-badge-icon {
  margin-right: 4px;
  font-size: 0.8em;
}

.alert-badge-small .alert-badge-icon {
  margin-right: 2px;
  font-size: 0.7em;
}

.alert-badge-large .alert-badge-icon {
  margin-right: 6px;
  font-size: 0.9em;
}

.alert-badge-count {
  line-height: 1;
}

.alert-badge-critical-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 2px solid #f44434;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.alert-badge-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
  background: transparent;
}

.alert-badge-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background: #fff;
  border: 1px solid #e2e5ec;
  border-radius: 0.42rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  overflow: hidden;
}

.alert-badge-dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid #f4f4f4;
  background: #f8f9fa;
}

.alert-badge-dropdown-content {
  max-height: 400px;
  overflow-y: auto;
}

.alert-badge-stats {
  padding: 1rem;
  background: #fff;
  border-bottom: 1px solid #f4f4f4;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #5e6278;
  margin-top: 0.25rem;
}

.alert-badge-recent {
  background: #fff;
}

.recent-header {
  padding: 0.75rem 1rem 0.25rem;
}

.recent-list {
  max-height: 200px;
  overflow-y: auto;
}

.recent-alert-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.recent-alert-item:hover {
  background: #f8f9fa;
}

.recent-alert-item:last-child {
  border-bottom: none;
}

.recent-alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.recent-alert-content {
  min-width: 0;
}

.recent-alert-title {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 2px;
}

.recent-alert-meta {
  font-size: 0.75rem;
  line-height: 1.2;
}

.recent-empty {
  padding: 1rem;
  text-align: center;
}

.alert-badge-dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #f4f4f4;
  background: #f8f9fa;
}

.badge-sm {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .alert-badge-dropdown {
    width: 280px;
    right: -50px;
  }
}

/* Dropdown arrow */
.alert-badge-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 16px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #e2e5ec;
}

.alert-badge-dropdown::after {
  content: '';
  position: absolute;
  top: -7px;
  right: 16px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #fff;
}

/* Scrollbar styling */
.recent-list::-webkit-scrollbar,
.alert-badge-dropdown-content::-webkit-scrollbar {
  width: 4px;
}

.recent-list::-webkit-scrollbar-track,
.alert-badge-dropdown-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.recent-list::-webkit-scrollbar-thumb,
.alert-badge-dropdown-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.recent-list::-webkit-scrollbar-thumb:hover,
.alert-badge-dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
