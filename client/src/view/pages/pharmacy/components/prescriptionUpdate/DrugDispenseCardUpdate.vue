<template>
  <div class="drug-dispense-card-update" :class="{ 'is-expanded': isExpanded }">
    <!-- Drug Header -->
    <div class="drug-header">
      <div class="drug-title-section">
        <h4 class="drug-name">💊 {{ prescription.drug_name }}</h4>
        <p class="drug-details">
          {{ prescription.dosage_form }} • {{ prescription.prescribed_strength }}
          {{ prescription.strength }}
        </p>
      </div>
      <div class="drug-status">
        <StatusBadgeUpdate
          :status="dispenseStatusText"
          type="dispense"
          size="medium"
          :description="statusDescription"
        />
        <StatusBadgeUpdate
          :status="paymentStatusText"
          type="payment"
          size="small"
          :description="paymentStatusDescription"
          class="payment-badge"
        />
      </div>
      <button
        class="expand-toggle-btn"
        @click="isExpanded = !isExpanded"
        v-b-tooltip.hover
        :title="isExpanded ? 'Collapse details' : 'Expand details'"
      >
        <span class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</span>
      </button>
    </div>

    <!-- Compact Metrics (Always Visible) -->
    <div class="compact-metrics">
      <div class="metric-compact">
        <div class="metric-icon-compact">📦</div>
        <div class="metric-content-compact">
          <div class="metric-label-compact">PRESCRIBED</div>
          <div class="metric-value-compact">{{ prescription.quantity_prescribed }}</div>
        </div>
      </div>
      <div class="metric-compact">
        <div class="metric-icon-compact">✅</div>
        <div class="metric-content-compact">
          <div class="metric-label-compact">DISPENSED</div>
          <div class="metric-value-compact">{{ dispensedQuantity }}</div>
        </div>
      </div>
      <div class="metric-compact">
        <div class="metric-icon-compact">🔄</div>
        <div class="metric-content-compact">
          <div class="metric-label-compact">REMAINING</div>
          <div class="metric-value-compact">{{ remainingQuantity }}</div>
        </div>
      </div>
      <div class="metric-compact">
        <div class="metric-icon-compact">🏷️</div>
        <div class="metric-content-compact">
          <div class="metric-label-compact">DRUG TYPE</div>
          <div class="metric-value-compact">{{ prescription.drug_type }}</div>
        </div>
      </div>
    </div>

    <!-- Primary Action Button (Always Visible) -->
    <div class="primary-action-section">
      <button
        class="primary-action-btn"
        :disabled="
          prescription.shouldDisableDispense ||
          (prescription.payment_status === PENDING && DISABLED)
        "
        @click="handleDispense"
      >
        <span class="btn-icon">💊</span>
        <span class="btn-text">DISPENSE MEDICATION</span>
        <span class="btn-badge" v-if="remainingQuantity > 0"
          >{{ remainingQuantity }} {{ prescription.dosage_form }}</span
        >
      </button>
    </div>

    <!-- Expandable Content -->
    <div v-show="isExpanded" class="expandable-content">
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">📈 PROGRESS</span>
          <span class="progress-percentage">{{ progressPercentage }}% Complete</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }">
            <div class="progress-bar-fill"></div>
          </div>
          <div class="progress-text">{{ dispensedText }}</div>
        </div>
      </div>

      <!-- Drug Information Grid -->
      <div class="drug-info-grid">
        <div class="info-card">
          <div class="info-icon">📦</div>
          <div class="info-content">
            <div class="info-label">PRESCRIBED</div>
            <div class="info-value">{{ prescription.quantity_prescribed }}</div>
            <div class="info-unit">{{ prescription.dosage_form }}</div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">✅</div>
          <div class="info-content">
            <div class="info-label">DISPENSED</div>
            <div class="info-value">{{ dispensedQuantity }}</div>
            <div class="info-unit">{{ prescription.dosage_form }}</div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">🔄</div>
          <div class="info-content">
            <div class="info-label">REMAINING</div>
            <div class="info-value">{{ remainingQuantity }}</div>
            <div class="info-unit">{{ prescription.dosage_form }}</div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">💰</div>
          <div class="info-content">
            <div class="info-label">PRESCRIBED BY</div>
            <div class="info-value">{{ prescription?.staff?.fullname || 'Unknown' }}</div>
            <div class="info-unit">Examiner</div>
          </div>
        </div>
      </div>

      <!-- Additional Drug Details -->
      <div class="drug-details-grid">
        <div class="detail-card">
          <div class="detail-icon">⏰</div>
          <div class="detail-content">
            <div class="detail-label">DURATION</div>
            <div class="detail-value">
              {{ prescription.duration }} {{ prescription.duration_unit }}
            </div>
            <div class="detail-description">treatment period</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">🍽️</div>
          <div class="detail-content">
            <div class="detail-label">FREQUENCY</div>
            <div class="detail-value">{{ prescription.frequency }}</div>
            <div class="detail-description">daily intake</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">🚀</div>
          <div class="detail-content">
            <div class="detail-label">ROUTE</div>
            <div class="detail-value">{{ prescription.route }}</div>
            <div class="detail-description">administration</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">📅</div>
          <div class="detail-content">
            <div class="detail-label">PRESCRIBED</div>
            <div class="detail-value">
              {{ formatDate(prescription.date_prescribed) }}
            </div>
            <div class="detail-description">date prescribed</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">🏷️</div>
          <div class="detail-content">
            <div class="detail-label">DRUG TYPE</div>
            <div class="detail-value">{{ prescription.drug_type }}</div>
            <div class="detail-description">category</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">📅</div>
          <div class="detail-content">
            <div class="detail-label">DISPENSED</div>
            <div class="detail-value">
              {{ prescription.date_dispensed | dayjs('MMM D, YYYY, h:mma') }}
            </div>
            <div class="detail-description">date dispensed</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">👨‍⚕️</div>
          <div class="detail-content">
            <div class="detail-label">DISPENSER</div>
            <div class="detail-value">
              {{ prescription.dispenser?.fullname || 'Not assigned' }}
            </div>
            <div class="detail-description">dispensed by</div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">💎</div>
          <div class="detail-content">
            <div class="detail-label">TOTAL COST</div>
            <div class="detail-value">₦{{ prescription.total_price }}</div>
            <div class="detail-description">per ₦{{ unitPrice }} unit cost</div>
          </div>
        </div>
      </div>

      <!-- Additional Action Buttons -->
      <div
        v-if="
          allowedSubRoles.includes(currentUser.sub_role) || allowedRoles.includes(currentUser.role)
        "
        class="action-section"
        :class="{ disabled: prescription.payment_status === PENDING }"
      >
        <div class="action-header">
          <span class="action-title">🎯 ADDITIONAL ACTIONS</span>
        </div>
        <div class="action-buttons">
          <button
            class="action-btn secondary"
            :disabled="prescription.disabledReturn"
            @click="handleReturn"
          >
            <span class="btn-icon">🔄</span>
            <span class="btn-text">RETURN UNUSED</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Dispense Form (Collapsible) -->
    <div v-if="showDispenseForm" class="dispense-form-section">
      <div class="form-header">
        <h5 class="form-title">💊 Dispense Medication</h5>
        <button class="close-btn" @click="showDispenseForm = false">×</button>
      </div>
      <div class="form-content">
        <div class="form-group">
          <label class="form-label">Quantity to Dispense</label>
          <div class="input-group">
            <input
              type="number"
              v-model="dispenseQuantity"
              :max="prescription.quantity_remaining_to_dispense"
              :min="1"
              class="form-input"
              placeholder="Enter quantity"
            />
            <span class="input-unit">{{ prescription.dosage_form }}</span>
          </div>
          <div class="form-help">
            Maximum: {{ prescription.quantity_remaining_to_dispense }}
            {{ prescription.dosage_form }}
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showDispenseForm = false">Cancel</button>
          <button class="btn-confirm" @click="confirmDispense">Confirm Dispense</button>
        </div>
      </div>
    </div>

    <!-- Return Form (Collapsible) -->
    <div v-if="showReturnForm" class="return-form-section">
      <div class="form-header">
        <h5 class="form-title">🔄 Return Medication</h5>
        <button class="close-btn" @click="showReturnForm = false">×</button>
      </div>
      <div class="form-content">
        <div class="form-group">
          <label class="form-label">Quantity to Return</label>
          <div class="input-group">
            <input
              type="number"
              v-model="returnQuantity"
              :max="prescription.quantity_remaining_to_return"
              :min="1"
              class="form-input"
              placeholder="Enter quantity"
            />
            <span class="input-unit">{{ prescription.dosage_form }}</span>
          </div>
          <div class="form-help">
            Maximum: {{ prescription.quantity_remaining_to_return }}
            {{ prescription.dosage_form }}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Reason for Return</label>
          <input
            type="text"
            v-model="returnReason"
            class="form-input"
            placeholder="Enter reason for return"
          />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showReturnForm = false">Cancel</button>
          <button class="btn-confirm" @click="confirmReturn">Confirm Return</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatusBadgeUpdate from './StatusBadgeUpdate.vue';
import { parseJwt } from '@/common/common';

export default {
  name: 'DrugDispenseCardUpdate',
  components: {
    StatusBadgeUpdate,
  },
  props: {
    prescription: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isExpanded: false,
      showDispenseForm: false,
      showReturnForm: false,
      dispenseQuantity: this.prescription.quantity_remaining_to_dispense,
      returnQuantity: this.prescription.quantity_remaining_to_return,
      returnReason: '',
      PENDING: 'Pending',
      allowedSubRoles: ['HOD'],
      DISABLED: 'disabledCard',
      allowedRoles: ['Super Admin'],
      currentUser: parseJwt(localStorage.getItem('user_token')),
    };
  },
  computed: {
    dispenseStatusText() {
      if (this.prescription.dispense_status === 'Dispensed') {
        return 'Dispensed';
      } else if (this.prescription.dispense_status === 'Partial') {
        return 'Partially Dispensed';
      } else {
        return 'Pending Dispense';
      }
    },

    statusDescription() {
      if (this.prescription.dispense_status === 'Dispensed') {
        return 'Fully dispensed';
      } else if (this.prescription.dispense_status === 'Partial') {
        return `${this.dispensedQuantity}/${this.prescription.quantity_prescribed} dispensed`;
      } else {
        return 'Ready to dispense';
      }
    },

    progressPercentage() {
      const total = this.prescription.quantity_prescribed;
      const dispensed = this.dispensedQuantity;
      return Math.round((dispensed / total) * 100);
    },

    dispensedQuantity() {
      return (
        this.prescription.quantity_prescribed - this.prescription.quantity_remaining_to_dispense
      );
    },

    remainingQuantity() {
      return this.prescription.quantity_remaining_to_dispense;
    },

    unitPrice() {
      return (this.prescription.total_price / this.prescription.quantity_prescribed).toFixed(2);
    },

    dispensedText() {
      return `${this.dispensedQuantity}/${this.prescription.quantity_prescribed} dispensed`;
    },

    paymentStatusText() {
      switch (this.prescription.payment_status) {
        case 'Paid':
          return 'Paid';
        case 'Pending':
          return 'Pending';
        case 'Failed':
          return 'Failed';
        case 'Permitted':
          return 'Permitted';
        case 'Cleared':
          return 'Cleared';
        default:
          return 'Unknown';
      }
    },

    paymentStatusDescription() {
      switch (this.prescription.payment_status) {
        case 'Paid':
          return 'Payment completed';
        case 'Pending':
          return 'Awaiting payment';
        case 'Failed':
          return 'Payment failed';
        case 'Permitted':
          return 'Payment Deferred';
        case 'Cleared':
          return 'Payment Cleared';
        default:
          return 'Payment status unknown';
      }
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Not dispensed';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    handleDispense() {
      if (this.prescription.shouldDisableDispense) return;
      this.showDispenseForm = true;
      this.dispenseQuantity = this.prescription.quantity_remaining_to_dispense;
    },

    handleReturn() {
      if (this.prescription.disabledReturn) return;
      this.showReturnForm = true;
      this.returnQuantity = this.prescription.quantity_remaining_to_return;
    },

    confirmDispense() {
      if (
        this.dispenseQuantity > 0 &&
        this.dispenseQuantity <= this.prescription.quantity_remaining_to_dispense
      ) {
        // Emit dispense event to parent
        this.$emit('dispense-drug', {
          prescription: this.prescription,
          index: this.index,
          quantity: this.dispenseQuantity,
        });
        this.showDispenseForm = false;
      }
    },

    confirmReturn() {
      if (
        this.returnQuantity > 0 &&
        this.returnQuantity <= this.prescription.quantity_remaining_to_return &&
        this.returnReason.trim()
      ) {
        // Emit return event to parent
        this.$emit('return-drug', {
          prescription: this.prescription,
          index: this.index,
          quantity: this.returnQuantity,
          reason: this.returnReason,
        });
        this.showReturnForm = false;
        this.returnReason = '';
      }
    },
  },
};
</script>

<style scoped>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}
.drug-dispense-card-update {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drug-dispense-card-update:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.drug-dispense-card-update.is-expanded:hover {
  transform: translateY(-2px);
}

/* Drug Header */
.drug-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.drug-title-section {
  flex: 1;
}

.drug-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.drug-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.drug-status {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.payment-badge {
  margin-top: 0.25rem;
}

/* Expand Toggle Button */
.expand-toggle-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.expand-toggle-btn:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-color: #9ca3af;
  transform: scale(1.05);
}

.expand-toggle-btn:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  transition: transform 0.3s ease;
}

/* Compact Metrics */
.compact-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 0.75rem;
  border: 1px solid #cbd5e1;
  align-items: center;
}

.metric-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.metric-compact:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.metric-icon-compact {
  font-size: 1.25rem;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-content-compact {
  flex: 1;
  min-width: 0;
}

.metric-label-compact {
  font-size: 0.625rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.125rem;
}

.metric-value-compact {
  font-size: 1.125rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

/* Primary Action Section */
.primary-action-section {
  margin-bottom: 1.5rem;
}

.primary-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.primary-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.primary-action-btn:hover::before {
  left: 100%;
}

.primary-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.2);
}

.primary-action-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.4);
}

.primary-action-btn:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.3);
}

.primary-action-btn .btn-icon {
  font-size: 1.25rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.primary-action-btn .btn-text {
  font-weight: 700;
  font-size: 1rem;
}

.primary-action-btn .btn-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Expandable Content */
.expandable-content {
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Progress Section */
.progress-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 0.75rem;
  border: 1px solid #cbd5e1;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
}

.progress-bar-container {
  position: relative;
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 0.5rem;
  position: relative;
  transition: width 0.6s ease;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 0.5rem;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* Drug Information Grid */
.drug-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.info-card:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
}

.info-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.2;
  margin-bottom: 0.125rem;
}

.info-unit {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Drug Details Grid */
.drug-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.detail-card:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-color: #d97706;
}

.detail-icon {
  font-size: 1.25rem;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  margin-bottom: 0.125rem;
}

.detail-description {
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
}

/* Action Section */
.action-section {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
}

.action-section.disabled {
  opacity: 0.5;
  pointer-events: none;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: #d1d5db;
}

.action-header {
  margin-bottom: 1rem;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
}

.action-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
}

.action-btn.tertiary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(107, 114, 128, 0.3);
}

.action-btn.tertiary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(107, 114, 128, 0.4);
}

.action-btn.quaternary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
}

.action-btn.quaternary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.4);
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  flex: 1;
  text-align: center;
}

/* Dispense Form */
.dispense-form-section,
.return-form-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.form-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
}

.input-unit {
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  border-left: 1px solid #e5e7eb;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: auto;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .drug-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .compact-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .primary-action-btn {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }

  .primary-action-btn .btn-text {
    font-size: 0.875rem;
  }

  .primary-action-btn .btn-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }

  .drug-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .drug-details-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .compact-metrics {
    grid-template-columns: 1fr;
  }

  .primary-action-btn {
    padding: 0.75rem 0.875rem;
    font-size: 0.875rem;
    gap: 0.5rem;
  }

  .primary-action-btn .btn-text {
    font-size: 0.875rem;
  }

  .primary-action-btn .btn-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }

  .drug-info-grid {
    grid-template-columns: 1fr;
  }

  .drug-details-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
