<template>
  <div class="bill-table">
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="thead-light">
          <tr>
            <th>Bill #</th>
            <th>Patient</th>
            <th>Date Created</th>
            <th>Total Amount</th>
            <!-- <th>Billing Status</th> -->
            <th>Payment Status</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bill in bills" :key="bill.id">
            <td>
              <strong>{{ bill.bill_number }}</strong>
            </td>
            <td>
              <div class="patient-info">
                <div class="patient-name">
                  {{ bill.patient?.firstname }} {{ bill.patient?.lastname }}
                </div>
                <small class="patient-number">{{ bill.patient?.hospital_id }}</small>
              </div>
            </td>
            <td>{{ formatDate(bill.createdAt) }}</td>
            <td>
              <span class="amount">{{ formatCurrency(bill.final_amount) }}</span>
            </td>
            <!-- <td>
              <b-badge :variant="getBillingStatusVariant(bill.billing_status)">
                {{ bill.billing_status }}
              </b-badge>
            </td> -->
            <td>
              <b-badge :variant="getPaymentStatusVariant(bill.payment_status)">
                {{ bill.payment_status }}
              </b-badge>
            </td>
            <td>{{ bill.createdByStaff?.firstname }} {{ bill.createdByStaff?.lastname }}</td>
            <td>
              <div class="action-buttons">
                <b-button
                  variant="outline-info"
                  size="sm"
                  @click="$emit('manage-items', bill)"
                  title="Manage Items"
                >
                  <i class="fas fa-list-alt"></i>
                </b-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="bills.length === 0 && !loading" class="empty-state">
      <div class="text-center py-5">
        <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No bills found</h5>
        <p class="text-muted">Try adjusting your filters or create a new bill.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="text-center py-5">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2 text-muted">Loading bills...</p>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
export default {
  name: 'BillTable',
  props: {
    bills: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return dayjs(dateString).format('DD/MM/YYYY, h:mma');
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    getBillingStatusVariant(status) {
      const variants = {
        DRAFT: 'secondary',
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'danger',
      };
      return variants[status] || 'secondary';
    },

    getPaymentStatusVariant(status) {
      const variants = {
        PENDING: 'warning',
        PARTIAL: 'info',
        PAID: 'success',
        CANCELLED: 'danger',
      };
      return variants[status] || 'secondary';
    },
  },
};
</script>

<style scoped>
.bill-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
}

.patient-number {
  color: #6c757d;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-buttons .btn {
  min-width: 32px;
}

.empty-state,
.loading-state {
  padding: 3rem 1rem;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-buttons .btn {
    min-width: 28px;
    padding: 0.25rem 0.5rem;
  }
}
</style>
