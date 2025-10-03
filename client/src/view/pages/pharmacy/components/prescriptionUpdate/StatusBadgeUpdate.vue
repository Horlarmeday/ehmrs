<template>
  <div class="status-badge-update" :class="statusClass">
    <div class="status-icon">
      <span v-html="statusIcon"></span>
    </div>
    <div class="status-content">
      <div class="status-text">{{ statusText }}</div>
      <div class="status-description" v-if="description">{{ description }}</div>
    </div>
    <div class="status-indicator" v-if="showIndicator">
      <div class="indicator-dot" :class="indicatorClass"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBadgeUpdate',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) =>
        [
          'Dispensed',
          'Pending',
          'Returned',
          'Not Started',
          'Complete',
          'In Progress',
          'Failed',
          'Cancelled',
          'Approved',
          'Rejected',
          'Paid',
          'Unpaid',
          'Partial',
          'Active',
          'Inactive',
          'Pending Dispense',
          'Partially Dispensed',
          'Fully dispensed',
          'Cleared',
          'Permitted',
        ].includes(value),
    },
    type: {
      type: String,
      default: 'dispense', // 'dispense', 'payment', 'general'
      validator: (value) => ['dispense', 'payment', 'general'].includes(value),
    },
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: (value) => ['small', 'medium', 'large'].includes(value),
    },
    description: {
      type: String,
      default: '',
    },
    showIndicator: {
      type: Boolean,
      default: false,
    },
    animated: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    statusClass() {
      const baseClass = `status-badge-${this.size}`;
      const statusClass = `status-${this.status.toLowerCase().replace(/\s+/g, '-')}`;
      const typeClass = `type-${this.type}`;
      const animationClass = this.animated ? 'animated' : '';

      return `${baseClass} ${statusClass} ${typeClass} ${animationClass}`;
    },

    statusText() {
      return this.status;
    },

    statusIcon() {
      const iconMap = {
        Dispensed: '✅',
        Pending: '⏳',
        Returned: '🔄',
        'Not Started': '⚪',
        Complete: '🎉',
        'In Progress': '🔄',
        Failed: '❌',
        Cancelled: '🚫',
        Approved: '✅',
        Rejected: '❌',
        Paid: '💚',
        Unpaid: '💳',
        Partial: '🟡',
        Active: '🟢',
        Inactive: '⚫',
        Cleared: '🟢',
        Permitted: '🟢',
      };

      return iconMap[this.status] || '❓';
    },

    indicatorClass() {
      const indicatorMap = {
        Dispensed: 'success',
        Pending: 'warning',
        Returned: 'info',
        'Not Started': 'neutral',
        Complete: 'success',
        'In Progress': 'warning',
        Failed: 'error',
        Cancelled: 'error',
        Approved: 'success',
        Rejected: 'error',
        Paid: 'success',
        Unpaid: 'warning',
        Partial: 'warning',
        Active: 'success',
        Inactive: 'neutral',
        Cleared: 'success',
        Permitted: 'success',
      };

      return indicatorMap[this.status] || 'neutral';
    },
  },
};
</script>

<style scoped>
.status-badge-update {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Size Variations */
.status-badge-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  gap: 0.25rem;
}

.status-badge-medium {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.status-badge-large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  gap: 0.75rem;
}

/* Status Colors - Dispense Type */
.status-dispensed {
  background: linear-gradient(135deg, #006400 0%, #228b22 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
}

.status-pending {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.3);
}

.status-returned {
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

.status-not-started {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(107, 114, 128, 0.3);
}

.status-complete {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
}

.status-in-progress {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.3);
}

.status-failed {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.3);
}

.status-cancelled {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(107, 114, 128, 0.3);
}

/* Payment Type Colors */
.type-payment .status-paid {
  background: linear-gradient(135deg, #006400 0%, #228b22 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
}

.type-payment .status-unpaid {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.3);
}

.type-payment .status-partial {
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

/* General Type Colors */
.type-general .status-active {
  background: linear-gradient(135deg, #006400 0%, #228b22 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
}

.type-general .status-inactive {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(107, 114, 128, 0.3);
}

/* Status Icon */
.status-icon {
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.status-badge-small .status-icon {
  width: 1.2em;
  height: 1.2em;
  font-size: 1em;
}

.status-badge-large .status-icon {
  width: 1.8em;
  height: 1.8em;
  font-size: 1.4em;
}

/* Status Content */
.status-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.status-text {
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-description {
  font-size: 0.75em;
  opacity: 0.8;
  font-weight: 500;
  line-height: 1.2;
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}

.indicator-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.indicator-dot.success {
  background: #10b981;
}

.indicator-dot.warning {
  background: #f59e0b;
}

.indicator-dot.error {
  background: #ef4444;
}

.indicator-dot.info {
  background: #3b82f6;
}

.indicator-dot.neutral {
  background: #6b7280;
}

/* Animations */
.animated:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
}

.animated.status-dispensed:hover {
  box-shadow: 0 8px 25px -5px rgba(16, 185, 129, 0.4);
}

.animated.status-pending:hover {
  box-shadow: 0 8px 25px -5px rgba(245, 158, 11, 0.4);
}

.animated.status-returned:hover {
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.4);
}

.animated.status-failed:hover {
  box-shadow: 0 8px 25px -5px rgba(239, 68, 68, 0.4);
}

/* Pulse Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .status-badge-update {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .status-badge-large {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .status-description {
    display: none;
  }
}

/* Focus States for Accessibility */
.status-badge-update:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .status-badge-update {
    border: 2px solid currentColor;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .status-badge-update {
    transition: none;
  }

  .animated:hover {
    transform: none;
  }

  .indicator-dot {
    animation: none;
  }
}
</style>
