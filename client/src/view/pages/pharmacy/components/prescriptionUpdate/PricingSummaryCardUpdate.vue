<template>
  <div class="pricing-summary-card-update">
    <!-- Header -->
    <div class="pricing-header">
      <h3 class="pricing-title">💎 FINANCIAL SUMMARY</h3>
    </div>

    <!-- Prescription Drugs Section -->
    <div class="pricing-section" v-if="totalDrugsPrice > 0">
      <div class="section-header">
        <h4 class="section-title">💊 PRESCRIPTION DRUGS</h4>
      </div>

      <div class="pricing-breakdown">
        <div class="breakdown-item nhis-coverage" v-if="!isEmpty(prescription?.insurance)">
          <div class="breakdown-header">
            <div class="breakdown-icon">🏥</div>
            <div class="breakdown-label">NHIS (90%)</div>
          </div>
          <div class="breakdown-amount">₦{{ formatCurrency(nhisNinetyPercent) }}</div>
          <div class="breakdown-description">covered by insurance</div>
        </div>

        <div class="breakdown-item patient-payment" v-if="!isEmpty(prescription?.insurance)">
          <div class="breakdown-header">
            <div class="breakdown-icon">💳</div>
            <div class="breakdown-label">CASH (10%)</div>
          </div>
          <div class="breakdown-amount">₦{{ formatCurrency(nhisTenPercent) }}</div>
          <div class="breakdown-description">patient pays</div>
        </div>
        <div class="breakdown-item patient-payment" v-if="isEmpty(prescription?.insurance)">
          <div class="breakdown-header">
            <div class="breakdown-icon">💳</div>
            <div class="breakdown-label">CASH</div>
          </div>
          <div class="breakdown-amount">₦{{ formatCurrency(totalDrugsPrice) }}</div>
        </div>
      </div>

      <div class="section-total">
        <div class="total-label">Drugs Subtotal:</div>
        <div class="total-amount">₦{{ formatCurrency(totalDrugsPrice) }}</div>
      </div>
    </div>

    <!-- Additional Items Section -->
    <div class="pricing-section" v-if="totalItemsPrice > 0">
      <div class="section-header">
        <h4 class="section-title">📦 ADDITIONAL ITEMS</h4>
      </div>

      <div class="pricing-breakdown">
        <div class="breakdown-item cash-payment">
          <div class="breakdown-header">
            <div class="breakdown-icon">💳</div>
            <div class="breakdown-label">Full Cash Payment</div>
          </div>
          <div class="breakdown-amount">₦{{ formatCurrency(totalItemsPrice) }}</div>
        </div>
      </div>

      <div class="section-total">
        <div class="total-label">Items Subtotal:</div>
        <div class="total-amount">₦{{ formatCurrency(totalItemsPrice) }}</div>
      </div>
    </div>

    <!-- Grand Total Section -->
    <div class="grand-total-section">
      <div class="grand-total-header">
        <h4 class="grand-total-title">🌟 GRAND TOTAL</h4>
      </div>

      <div class="grand-total-amount">
        <div class="total-main">₦{{ formatCurrency(grandTotal) }}</div>
        <!--        <div class="total-breakdown">-->
        <!--          <div class="breakdown-line">-->
        <!--            <span class="breakdown-label">🏥 NHIS Coverage:</span>-->
        <!--            <span class="breakdown-value">₦{{ formatCurrency(nhis90Percent) }}</span>-->
        <!--          </div>-->
        <!--          <div class="breakdown-line">-->
        <!--            <span class="breakdown-label">💳 Patient Payment:</span>-->
        <!--            <span class="breakdown-value">₦{{ formatCurrency(patientPayment) }}</span>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
    </div>

    <!-- Payment Status Section -->
    <!-- <div class="payment-status-section">
        <div class="status-header">
          <h4 class="status-title">💳 PAYMENT STATUS</h4>
        </div>
  
        <div class="status-items">
          <div class="status-item" :class="nhisStatusClass">
            <div class="status-icon">✅</div>
            <div class="status-content">
              <div class="status-label">NHIS Pre-approved</div>
              <div class="status-description">Insurance coverage confirmed</div>
            </div>
          </div>
  
          <div class="status-item" :class="patientPaymentStatusClass">
            <div class="status-icon">{{ patientPaymentIcon }}</div>
            <div class="status-content">
              <div class="status-label">{{ patientPaymentStatusText }}</div>
              <div class="status-description">{{ patientPaymentDescription }}</div>
            </div>
          </div>
        </div>
      </div> -->
  </div>
</template>

<script>
import { isEmpty } from '@/common/common';
export default {
  name: 'PricingSummaryCardUpdate',
  props: {
    totalDrugsPrice: {
      type: Number,
      default: 0,
    },
    totalItemsPrice: {
      type: Number,
      default: 0,
    },
    nhisTenPercent: {
      type: Number,
      default: 0,
    },
    nhisNinetyPercent: {
      type: Number,
      default: 0,
    },
    prescription: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    grandTotal() {
      return this.totalDrugsPrice + this.totalItemsPrice;
    },

    patientPayment() {
      return this.nhisTenPercent + this.totalItemsPrice;
    },

    nhisStatusClass() {
      return this.prescription?.insurance ? 'status-success' : 'status-warning';
    },

    patientPaymentStatusClass() {
      // This would be based on actual payment status from prescription
      return 'status-pending';
    },

    patientPaymentStatusText() {
      return 'Awaiting patient payment';
    },

    patientPaymentDescription() {
      return 'Payment required to complete dispense';
    },

    patientPaymentIcon() {
      return '⏳';
    },
  },
  methods: {
    isEmpty,
    formatCurrency(amount) {
      if (typeof amount !== 'number') return '0.00';
      return amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    handlePrintReceipt() {
      this.$emit('print-receipt', {
        totalDrugsPrice: this.totalDrugsPrice,
        totalItemsPrice: this.totalItemsPrice,
        nhis10Percent: this.nhisTenPercent,
        nhis90Percent: this.nhisNinetyPercent,
        grandTotal: this.grandTotal,
        patientPayment: this.patientPayment,
      });
    },

    handleViewBreakdown() {
      this.$emit('view-breakdown', {
        totalDrugsPrice: this.totalDrugsPrice,
        totalItemsPrice: this.totalItemsPrice,
        nhis10Percent: this.nhisTenPercent,
        nhis90Percent: this.nhisNinetyPercent,
        grandTotal: this.grandTotal,
        patientPayment: this.patientPayment,
      });
    },
  },
};
</script>

<style scoped>
.pricing-summary-card-update {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

/* Header */
.pricing-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.pricing-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  letter-spacing: 0.025em;
}

/* Pricing Section */
.pricing-section {
  margin-bottom: 1.5rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pricing-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.breakdown-item {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.breakdown-item:hover {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: #d1d5db;
}

.breakdown-item.nhis-coverage {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.breakdown-item.patient-payment {
  background: linear-gradient(135deg, #f5f5dc 0%, #e6e6fa 100%);
  border-color: #f59e0b;
}

.breakdown-item.cash-payment {
  background: linear-gradient(135deg, #e6e6fa 0%, #f5f5dc 100%);
  border-color: #3b82f6;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.breakdown-icon {
  font-size: 1.25rem;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.nhis-coverage .breakdown-icon {
  background: linear-gradient(135deg, #006400 0%, #228b22 100%);
}

.patient-payment .breakdown-icon {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
}

.cash-payment .breakdown-icon {
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
}

.breakdown-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.breakdown-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  text-align: right;
  min-width: 100px;
}

.breakdown-description {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
  min-width: 100px;
}

.section-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
}

.total-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.total-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

/* Grand Total Section */
.grand-total-section {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.grand-total-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.grand-total-header {
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.grand-total-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

.grand-total-amount {
  position: relative;
  z-index: 1;
  text-align: center;
}

.total-main {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.total-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  opacity: 0.9;
}

.breakdown-line .breakdown-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.breakdown-line .breakdown-value {
  color: white;
  font-weight: 600;
}

/* Payment Status Section */
.payment-status-section {
  margin-bottom: 1.5rem;
}

.status-header {
  margin-bottom: 1rem;
}

.status-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.status-item {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.status-item.status-success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.status-item.status-warning {
  background: linear-gradient(135deg, #f5f5dc 0%, #e6e6fa 100%);
  border-color: #f59e0b;
}

.status-item.status-pending {
  background: linear-gradient(135deg, #e6e6fa 0%, #f5f5dc 100%);
  border-color: #3b82f6;
}

.status-icon {
  font-size: 1.25rem;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.status-success .status-icon {
  background: linear-gradient(135deg, #006400 0%, #228b22 100%);
}

.status-warning .status-icon {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
}

.status-pending .status-icon {
  background: linear-gradient(135deg, #000080 0%, #191970 100%);
}

.status-content {
  flex: 1;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.status-description {
  font-size: 0.75rem;
  color: #6b7280;
}

.payment-methods {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
}

.methods-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.methods-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.method-item {
  font-weight: 500;
}

.method-separator {
  color: #9ca3af;
}

/* Action Buttons */
.pricing-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
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

.action-btn.primary {
  background: linear-gradient(135deg, #8b0000 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(31, 41, 55, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #a0522d 0%, #8b0000 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(31, 41, 55, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .pricing-summary-card-update {
    position: relative;
    top: auto;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .pricing-summary-card-update {
    padding: 1rem;
  }

  .breakdown-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .breakdown-amount,
  .breakdown-description {
    text-align: center;
    min-width: auto;
  }

  .total-breakdown {
    font-size: 0.75rem;
  }

  .total-main {
    font-size: 1.5rem;
  }

  .pricing-actions {
    flex-direction: row;
  }

  .action-btn {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .pricing-actions {
    flex-direction: column;
  }

  .methods-list {
    flex-wrap: wrap;
  }
}
</style>
