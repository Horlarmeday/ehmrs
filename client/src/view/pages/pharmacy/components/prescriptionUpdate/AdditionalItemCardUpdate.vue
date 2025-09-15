<template>
  <div class="additional-item-card-update">
    <!-- Item Header -->
    <div class="item-header">
      <div class="item-title-section">
        <h4 class="item-name">📦 {{ item.item_name }}</h4>
        <p class="item-details">{{ item.unit }} • {{ item.drug_type }}</p>
      </div>
      <div class="item-status">
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
    </div>

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

    <!-- Item Information Grid -->
    <div class="item-info-grid">
      <div class="info-card">
        <div class="info-icon">📦</div>
        <div class="info-content">
          <div class="info-label">PRESCRIBED</div>
          <div class="info-value">{{ item.quantity_to_dispense }}</div>
          <div class="info-unit">{{ item.unit }}</div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon">✅</div>
        <div class="info-content">
          <div class="info-label">DISPENSED</div>
          <div class="info-value">{{ dispensedQuantity }}</div>
          <div class="info-unit">{{ item.unit }}</div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon">💰</div>
        <div class="info-content">
          <div class="info-label">UNIT PRICE</div>
          <div class="info-value">₦{{ unitPrice }}</div>
          <div class="info-unit">per {{ item.unit }}</div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon">💎</div>
        <div class="info-content">
          <div class="info-label">TOTAL</div>
          <div class="info-value">₦{{ item.total_price }}</div>
          <div class="info-unit">total cost</div>
        </div>
      </div>
    </div>

    <!-- Item Details -->
    <div class="item-details-section">
      <div class="detail-card">
        <div class="detail-icon">🏷️</div>
        <div class="detail-content">
          <div class="detail-label">ITEM TYPE</div>
          <div class="detail-value">{{ item.drug_type }}</div>
          <div class="detail-description">category</div>
        </div>
      </div>

      <div class="detail-card">
        <div class="detail-icon">📅</div>
        <div class="detail-content">
          <div class="detail-label">PRESCRIBED</div>
          <div class="detail-value">{{ formatDate(item.date_prescribed) }}</div>
          <div class="detail-description">date ordered</div>
        </div>
      </div>

      <div class="detail-card">
        <div class="detail-icon">📅</div>
        <div class="detail-content">
          <div class="detail-label">DISPENSED</div>
          <div class="detail-value">{{ formatDateDispensed(item.date_dispensed) }}</div>
          <div class="detail-description">date dispensed</div>
        </div>
      </div>

      <div class="detail-card">
        <div class="detail-icon">👨‍⚕️</div>
        <div class="detail-content">
          <div class="detail-label">PRESCRIBER</div>
          <div class="detail-value">{{ item.staff?.fullname || 'Unknown' }}</div>
          <div class="detail-description">ordered by</div>
        </div>
      </div>

      <div class="detail-card">
        <div class="detail-icon">👨‍⚕️</div>
        <div class="detail-content">
          <div class="detail-label">DISPENSER</div>
          <div class="detail-value">{{ item.dispenser?.fullname || 'Not assigned' }}</div>
          <div class="detail-description">dispensed by</div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-section" :class="{ disabled: item.payment_status === PENDING }">
      <div class="action-header">
        <span class="action-title">🎯 QUICK ACTIONS</span>
      </div>
      <div class="action-buttons">
        <button
          class="action-btn primary"
          :disabled="item.shouldDisableDispense"
          @click="handleDispense"
        >
          <span class="btn-icon">📦</span>
          <span class="btn-text">DISPENSE ITEM</span>
        </button>

        <button class="action-btn secondary" :disabled="item.disabledReturn" @click="handleReturn">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">RETURN UNUSED</span>
        </button>
      </div>
    </div>

    <!-- Dispense Form (Collapsible) -->
    <div v-if="showDispenseForm" class="dispense-form-section">
      <div class="form-header">
        <h5 class="form-title">📦 Dispense Item</h5>
        <button class="close-btn" @click="showDispenseForm = false">×</button>
      </div>
      <div class="form-content">
        <div class="form-group">
          <label class="form-label">Quantity to Dispense</label>
          <div class="input-group">
            <input
              type="number"
              v-model="dispenseQuantity"
              :max="item.quantity_remaining_to_dispense"
              :min="1"
              class="form-input"
              placeholder="Enter quantity"
            />
            <span class="input-unit">{{ item.unit }}</span>
          </div>
          <div class="form-help">
            Maximum: {{ item.quantity_remaining_to_dispense }} {{ item.unit }}
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
        <h5 class="form-title">🔄 Return Item</h5>
        <button class="close-btn" @click="showReturnForm = false">×</button>
      </div>
      <div class="form-content">
        <div class="form-group">
          <label class="form-label">Quantity to Return</label>
          <div class="input-group">
            <input
              type="number"
              v-model="returnQuantity"
              :max="item.quantity_remaining_to_return"
              :min="1"
              class="form-input"
              placeholder="Enter quantity"
            />
            <span class="input-unit">{{ item.unit }}</span>
          </div>
          <div class="form-help">
            Maximum: {{ item.quantity_remaining_to_return }} {{ item.unit }}
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

export default {
  name: 'AdditionalItemCardUpdate',
  components: {
    StatusBadgeUpdate,
  },
  props: {
    item: {
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
      showDispenseForm: false,
      showReturnForm: false,
      dispenseQuantity: 1,
      returnQuantity: 1,
      returnReason: '',
      PENDING: 'Pending',
    };
  },
  computed: {
    dispenseStatusText() {
      if (this.item.dispense_status === 'Dispensed') {
        return 'Fully dispensed';
      } else if (this.item.dispense_status === 'Partial') {
        return 'Partially Dispensed';
      } else {
        return 'Pending Dispense';
      }
    },

    statusDescription() {
      if (this.item.dispense_status === 'Dispensed') {
        return 'Fully dispensed';
      } else if (this.item.dispense_status === 'Partial') {
        return `${this.dispensedQuantity}/${this.item.quantity_to_dispense} dispensed`;
      } else {
        return 'Ready to dispense';
      }
    },

    progressPercentage() {
      const total = this.item.quantity_to_dispense;
      const dispensed = this.dispensedQuantity;
      return Math.round((dispensed / total) * 100);
    },

    dispensedQuantity() {
      return this.item.quantity_to_dispense - this.item.quantity_remaining_to_dispense;
    },

    unitPrice() {
      return (this.item.total_price / this.item.quantity_to_dispense).toFixed(2);
    },

    dispensedText() {
      return `${this.dispensedQuantity}/${this.item.quantity_to_dispense} dispensed`;
    },

    paymentStatusText() {
      switch (this.item.payment_status) {
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
      switch (this.item.payment_status) {
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
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    formatDateDispensed(dateString) {
      if (!dateString) return 'Not dispensed';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    handleDispense() {
      if (this.item.shouldDisableDispense) return;
      this.showDispenseForm = true;
      this.dispenseQuantity = Math.min(1, this.item.quantity_remaining_to_dispense);
    },

    handleReturn() {
      if (this.item.disabledReturn) return;
      this.showReturnForm = true;
      this.returnQuantity = Math.min(1, this.item.quantity_remaining_to_return);
    },

    confirmDispense() {
      if (
        this.dispenseQuantity > 0 &&
        this.dispenseQuantity <= this.item.quantity_remaining_to_dispense
      ) {
        // Emit dispense event to parent
        this.$emit('dispense-item', {
          item: this.item,
          index: this.index,
          quantity: this.dispenseQuantity,
        });
        this.showDispenseForm = false;
      }
    },

    confirmReturn() {
      if (
        this.returnQuantity > 0 &&
        this.returnQuantity <= this.item.quantity_remaining_to_return &&
        this.returnReason.trim()
      ) {
        // Emit return event to parent
        this.$emit('return-item', {
          item: this.item,
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
.additional-item-card-update {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.additional-item-card-update:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Item Header */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.item-title-section {
  flex: 1;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.item-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.item-status {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.payment-badge {
  margin-top: 0.25rem;
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

/* Item Information Grid */
.item-info-grid {
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
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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

/* Item Details Section */
.item-details-section {
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
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.4);
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
}

.action-btn.quaternary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
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
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .item-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .item-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .item-details-section {
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
  .item-info-grid {
    grid-template-columns: 1fr;
  }

  .item-details-section {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
