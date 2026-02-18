<template>
  <div class="payment-details">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <b-button variant="outline-secondary" size="sm" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </b-button>
        <h1 class="page-title">Payment Details</h1>
      </div>
      <div class="header-actions">
        <b-button variant="outline-primary" size="sm" @click="printReceipt">
          <i class="fas fa-print"></i> Print
        </b-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <b-spinner variant="primary"></b-spinner>
      <p>Loading payment details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle text-danger"></i>
      <p>{{ error }}</p>
      <b-button variant="outline-primary" size="sm" @click="loadPaymentDetails"> Retry </b-button>
    </div>

    <!-- Payment Details -->
    <div v-else-if="payment" class="payment-content">
      <!-- Payment Summary Card -->
      <div class="summary-card">
        <div class="summary-header">
          <div class="payment-amount">
            <span class="currency">₦</span>
            <span class="amount">{{ formatCurrency(payment.amount) }}</span>
          </div>
          <div class="payment-status">
            <b-badge :variant="getStatusVariant(payment.status)">
              {{ payment.status }}
            </b-badge>
          </div>
        </div>
        <div class="payment-method">
          <b-badge :variant="getMethodVariant(payment.payment_method)" class="method-badge">
            {{ formatPaymentMethod(payment.payment_method) }}
          </b-badge>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="details-grid">
        <!-- Payment Information -->
        <div class="detail-card">
          <h6 class="card-title">
            <i class="fas fa-credit-card text-primary"></i>
            Payment Information
          </h6>
          <div class="detail-list">
            <div class="detail-item">
              <span class="label">Reference:</span>
              <span class="value">{{ payment.payment_reference }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(payment.processed_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Processed By:</span>
              <span class="value">{{ getProcessedBy(payment) }}</span>
            </div>
            <div class="detail-item" v-if="payment.notes">
              <span class="label">Notes:</span>
              <span class="value">{{ payment.notes }}</span>
            </div>
          </div>
        </div>

        <!-- Patient Information -->
        <div class="detail-card">
          <h6 class="card-title">
            <i class="fas fa-user text-info"></i>
            Patient Information
          </h6>
          <div class="detail-list">
            <div class="detail-item">
              <span class="label">Name:</span>
              <span class="value">{{ getPatientName(payment) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Number:</span>
              <span class="value">{{ getPatientNumber(payment) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Phone:</span>
              <span class="value">{{ getPatientPhone(payment) }}</span>
            </div>
          </div>
        </div>

        <!-- Bill Information -->
        <div class="detail-card">
          <h6 class="card-title">
            <i class="fas fa-file-invoice text-warning"></i>
            Bill Information
          </h6>
          <div class="detail-list">
            <div class="detail-item">
              <span class="label">Bill Number:</span>
              <span class="value">{{ getBillNumber(payment) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Bill Amount:</span>
              <span class="value">{{ formatCurrency(getBillAmount(payment)) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Visit Date:</span>
              <span class="value">{{ getVisitDate(payment) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentDetails',
  data() {
    return {
      loading: true,
      error: null,
      payment: null,
    };
  },
  async mounted() {
    await this.loadPaymentDetails();
  },
  methods: {
    async loadPaymentDetails() {
      try {
        this.loading = true;
        this.error = null;

        const paymentId = this.$route.params.id;
        const result = await this.$store.dispatch('accounting/getClinicalPaymentById', paymentId);

        if (result.success) {
          this.payment = result.data;
        } else {
          this.error = result.error || 'Failed to load payment details';
        }
      } catch (error) {
        console.error('Failed to load payment details:', error);
        this.error = 'Failed to load payment details';
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    async printReceipt() {
      try {
        // Print receipt using the accounting store action
        const result = await this.$store.dispatch(
          'accounting/printPaymentReceipt',
          this.$route.params.id
        );

        if (result.success) {
          this.$bvToast.toast('Receipt opened for printing', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          throw new Error(result.error || 'Failed to print receipt');
        }
      } catch (error) {
        console.error('Receipt print error:', error);
        this.$bvToast.toast(`Failed to print receipt: ${error.message}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    formatCurrency(amount) {
      if (!amount) return '0.00';
      return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    getStatusVariant(status) {
      const variants = {
        PAID: 'success',
        PENDING: 'warning',
        PARTIAL: 'info',
        CANCELLED: 'danger',
        FAILED: 'danger',
        REFUNDED: 'secondary',
        CONFIRMED: 'primary',
        SETTLED: 'success',
      };
      return variants[status] || 'secondary';
    },

    getMethodVariant(method) {
      const variants = {
        CASH: 'success',
        CARD: 'primary',
        BANK_TRANSFER: 'info',
        MOBILE_MONEY: 'warning',
        DEPOSIT: 'secondary',
        INSURANCE: 'dark',
        WAIVER: 'light',
        OTHER: 'secondary',
      };
      return variants[method] || 'secondary';
    },

    formatPaymentMethod(method) {
      return method?.replace('_', ' ') || 'Unknown';
    },

    getProcessedBy(payment) {
      return payment.processedByStaff?.fullname || 'Unknown';
    },

    getPatientName(payment) {
      if (payment.patient?.fullname) return payment.patient.fullname;
      if (payment.patient?.firstname && payment.patient?.lastname) {
        return `${payment.patient.firstname} ${payment.patient.lastname}`;
      }
      return 'N/A';
    },

    getPatientNumber(payment) {
      return payment.patient?.hospital_id || 'N/A';
    },

    getPatientPhone(payment) {
      return payment.patient?.phone || 'N/A';
    },

    getBillNumber(payment) {
      return payment.bill?.bill_number || 'N/A';
    },

    getBillAmount(payment) {
      return payment.bill?.final_amount || 0;
    },

    getVisitDate(payment) {
      if (payment.bill?.visit?.date_visit_start) {
        return this.formatDate(payment.bill.visit.date_visit_start);
      }
      return 'N/A';
    },
  },
};
</script>

<style scoped>
.payment-details {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-state p,
.error-state p {
  margin-top: 1rem;
  color: #6c757d;
}

.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-card {
  background: linear-gradient(135deg, #00acc1 0%, #0097a7 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 172, 193, 0.3);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.payment-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.currency {
  font-size: 1.5rem;
  font-weight: 500;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.payment-status {
  margin-left: auto;
}

.payment-method {
  margin-top: 0.5rem;
}

.method-badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f8f9fa;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
}

.detail-item .value {
  font-weight: 500;
  color: #2c3e50;
  text-align: right;
  max-width: 65%;
  word-break: break-word;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .payment-details {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .payment-amount {
    justify-content: center;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-item .label {
    min-width: auto;
    font-size: 0.8rem;
  }

  .detail-item .value {
    text-align: left;
    max-width: 100%;
    font-size: 0.9rem;
  }
}
</style>
