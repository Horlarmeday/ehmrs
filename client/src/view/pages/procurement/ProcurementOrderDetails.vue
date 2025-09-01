<template>
  <div class="procurement-order-details">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <div class="d-flex align-items-center">
            <button @click="$router.go(-1)" class="btn btn-light btn-sm mr-3">
              <i class="flaticon2-arrow-left"></i>
              Back
            </button>
            <div>
              <h1 class="text-dark font-weight-bold mb-2">
                <i class="fas fa-shopping-cart text-primary mr-3"></i>
                Purchase Order Details
              </h1>
              <p class="text-muted font-size-lg mb-0">
                {{ order?.po_number || 'Loading order...' }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button v-if="canApprove" @click="approveOrder" class="btn btn-success btn-lg mr-3">
              <i class="fas fa-check mr-2"></i>
              Approve
            </button>
            <button v-if="canSend" @click="sendOrder" class="btn btn-info btn-lg mr-3">
              <i class="fas fa-paper-plane mr-2"></i>
              Send
            </button>
            <button v-if="canReceive" @click="receiveOrder" class="btn btn-warning btn-lg mr-3">
              <i class="fas fa-boxes mr-2"></i>
              Receive
            </button>
            <button v-if="canCancel" @click="cancelOrder" class="btn btn-danger btn-lg">
              <i class="fas fa-times mr-2"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading order details...</span>
      </div>
      <p class="text-muted mt-3">Loading order details...</p>
    </div>

    <!-- Order Details Content -->
    <div v-else-if="order" class="order-content">
      <div class="row">
        <!-- Main Information -->
        <div class="col-lg-8">
          <!-- Order Overview -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-file-invoice text-primary mr-2"></i>
                Order Overview
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Purchase Order Number</label>
                  <div class="form-control-plaintext font-weight-bold">
                    {{ order.po_number }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Status</label>
                  <div>
                    <span :class="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Order Date</label>
                  <div class="form-control-plaintext">
                    {{ formatDate(order.order_date) }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Expected Delivery Date</label>
                  <div class="form-control-plaintext">
                    {{ formatDate(order.expected_delivery_date) }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Total Amount</label>
                  <div class="form-control-plaintext font-weight-bold text-primary font-size-h6">
                    ₦{{ formatPrice(order.total_amount) }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Created By</label>
                  <div class="form-control-plaintext">
                    {{ order.creator?.firstname }} {{ order.creator?.lastname }}
                  </div>
                </div>

                <div v-if="order.notes" class="col-12 mb-3">
                  <label class="form-label text-muted">Notes</label>
                  <div class="form-control-plaintext">
                    {{ order.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-list text-primary mr-2"></i>
                Order Items ({{ order.items?.length || 0 }})
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-head-custom table-vertical-center">
                  <thead>
                    <tr class="text-left">
                      <th class="pl-4" style="min-width: 250px">
                        <span class="text-dark-75 font-weight-bolder">Item</span>
                      </th>
                      <th style="min-width: 100px">
                        <span class="text-dark-75 font-weight-bolder">Unit</span>
                      </th>
                      <th style="min-width: 100px">
                        <span class="text-dark-75 font-weight-bolder">Qty Ordered</span>
                      </th>
                      <th style="min-width: 120px">
                        <span class="text-dark-75 font-weight-bolder">Unit Price</span>
                      </th>
                      <th style="min-width: 120px">
                        <span class="text-dark-75 font-weight-bolder">Total</span>
                      </th>
                      <th v-if="hasReceivedItems" style="min-width: 100px">
                        <span class="text-dark-75 font-weight-bolder">Qty Received</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!order.items?.length">
                      <td colspan="6" class="text-center py-4">
                        <span class="text-muted">No items found</span>
                      </td>
                    </tr>
                    <tr v-for="item in order.items" :key="item.id" class="order-row">
                      <td class="pl-4">
                        <div>
                          <span class="text-dark-75 font-weight-bolder d-block">
                            {{ item.drug?.name }}
                          </span>
                          <span v-if="item.Drug?.strength" class="text-muted font-size-sm">
                            {{ item.Drug.strength }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="text-dark-75">
                          {{ item.unit?.name }}
                        </span>
                      </td>
                      <td>
                        <span class="text-dark-75 font-weight-bolder">
                          {{ item.quantity_ordered }}
                        </span>
                      </td>
                      <td>
                        <span class="text-dark-75"> ₦{{ formatPrice(item.unit_price) }} </span>
                      </td>
                      <td>
                        <span class="text-dark-75 font-weight-bolder">
                          ₦{{ formatPrice(item.total_price) }}
                        </span>
                      </td>
                      <td v-if="hasReceivedItems">
                        <span class="text-dark-75 font-weight-bolder">
                          {{ item.quantity_received || 0 }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Vendor Information -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-building text-primary mr-2"></i>
                Vendor Information
              </h5>
            </div>
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="symbol symbol-60 symbol-light-primary mr-4">
                  <span class="symbol-label">
                    <i class="fas fa-building text-primary font-size-h4"></i>
                  </span>
                </div>
                <div>
                  <div class="text-dark-75 font-weight-bolder font-size-lg mb-1">
                    {{ order.vendor?.name || 'Unknown Vendor' }}
                  </div>
                  <div v-if="order.vendor?.email" class="text-muted font-size-sm mb-1">
                    <i class="fas fa-envelope mr-1"></i>
                    {{ order.vendor.email }}
                  </div>
                  <div v-if="order.vendor?.phone" class="text-muted font-size-sm">
                    <i class="fas fa-phone mr-1"></i>
                    {{ order.vendor.phone }}
                  </div>
                </div>
              </div>
              <div v-if="order.vendor?.address" class="border-top pt-4">
                <label class="form-label text-muted">Address</label>
                <div class="text-dark-75">
                  {{ order.vendor.address }}
                </div>
              </div>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="card card-custom">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-history text-primary mr-2"></i>
                Order Timeline
              </h5>
            </div>
            <div class="card-body">
              <div class="timeline timeline-6 mt-3">
                <div class="timeline-item">
                  <div class="timeline-media">
                    <i class="fas fa-plus bg-primary"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="text-dark-75 font-weight-bolder">Created</span>
                      <span class="text-muted font-size-sm">{{
                        formatDate(order.order_date)
                      }}</span>
                    </div>
                    <div class="text-muted font-size-sm">
                      Order created by {{ order.creator?.firstname }} {{ order.creator?.lastname }}
                    </div>
                  </div>
                </div>

                <div v-if="order.approved_date" class="timeline-item">
                  <div class="timeline-media">
                    <i class="fas fa-check bg-success"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="text-dark-75 font-weight-bolder">Approved</span>
                      <span class="text-muted font-size-sm">{{
                        formatDate(order.approved_date)
                      }}</span>
                    </div>
                    <div v-if="order.approver" class="text-muted font-size-sm">
                      Approved by {{ order.approver?.firstname }} {{ order.approver?.lastname }}
                    </div>
                  </div>
                </div>

                <div v-if="order.sent_date" class="timeline-item">
                  <div class="timeline-media">
                    <i class="fas fa-paper-plane bg-info"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="text-dark-75 font-weight-bolder">Sent</span>
                      <span class="text-muted font-size-sm">{{ formatDate(order.sent_date) }}</span>
                    </div>
                    <div class="text-muted font-size-sm">
                      Order sent to vendor
                    </div>
                  </div>
                </div>

                <div v-if="order.received_date" class="timeline-item">
                  <div class="timeline-media">
                    <i class="fas fa-boxes bg-warning"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="text-dark-75 font-weight-bolder">Received</span>
                      <span class="text-muted font-size-sm">{{
                        formatDate(order.received_date)
                      }}</span>
                    </div>
                    <div class="text-muted font-size-sm">
                      Items received and processed
                    </div>
                  </div>
                </div>

                <div v-if="order.cancelled_date" class="timeline-item">
                  <div class="timeline-media">
                    <i class="fas fa-times bg-danger"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="text-dark-75 font-weight-bolder">Cancelled</span>
                      <span class="text-muted font-size-sm">{{
                        formatDate(order.cancelled_date)
                      }}</span>
                    </div>
                    <div v-if="order.cancellation_reason" class="text-muted font-size-sm">
                      Reason: {{ order.cancellation_reason }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-danger mb-3">
        <i class="fas fa-exclamation-circle fa-3x"></i>
      </div>
      <p class="text-danger font-size-lg">{{ error }}</p>
      <button @click="loadOrderDetails" class="btn btn-primary">
        <i class="fas fa-redo mr-2"></i>
        Try Again
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcurementOrderDetails',
  data() {
    return {
      loading: true,
      order: null,
      error: null,
    };
  },
  computed: {
    orderId() {
      return parseInt(this.$route.params.id);
    },
    canApprove() {
      return this.order?.status === 'DRAFT';
    },
    canSend() {
      return this.order?.status === 'APPROVED';
    },
    canReceive() {
      return this.order?.status === 'SENT';
    },
    canCancel() {
      return ['DRAFT', 'APPROVED'].includes(this.order?.status);
    },
    hasReceivedItems() {
      return (
        this.order?.status === 'RECEIVED' &&
        this.order?.ProcurementOrderItems?.some(item => item.quantity_received > 0)
      );
    },
  },
  methods: {
    async loadOrderDetails() {
      this.loading = true;
      this.error = null;
      try {
        this.order = await this.$store.dispatch('procurement/getProcurementOrder', this.orderId);
        if (!this.order) {
          this.error = 'Order not found';
        }
      } catch (error) {
        this.error = error.message || 'Failed to load order details';
      } finally {
        this.loading = false;
      }
    },

    async approveOrder() {
      if (confirm('Are you sure you want to approve this order?')) {
        try {
          await this.$store.dispatch('procurement/approveProcurementOrder', {
            id: this.order.id,
            approvalData: { approved_by: this.$store.state.auth.user?.id },
          });
          await this.loadOrderDetails();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order approved successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to approve order',
            type: 'error',
          });
        }
      }
    },

    async sendOrder() {
      const currentDate = new Date().toISOString().split('T')[0];
      const expectedDeliveryDate = prompt(
        'Expected delivery date (YYYY-MM-DD):',
        this.order.expected_delivery_date?.split('T')[0] || currentDate
      );

      if (
        expectedDeliveryDate &&
        confirm('Are you sure you want to send this order to the vendor?')
      ) {
        try {
          await this.$store.dispatch('procurement/sendProcurementOrder', {
            id: this.order.id,
            sendData: {
              sent_by: this.$store.state.auth.user?.id,
              sent_date: new Date().toISOString(),
              expected_delivery_date: new Date(expectedDeliveryDate).toISOString(),
            },
          });
          await this.loadOrderDetails();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order sent successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to send order',
            type: 'error',
          });
        }
      }
    },

    async receiveOrder() {
      // Redirect to main page for receiving since the modal is there
      this.$router.push({
        path: '/store/pharmacy/procurement',
        query: { receiveOrder: this.order.id },
      });
    },

    async cancelOrder() {
      const cancellationReason = prompt('Please provide a reason for cancellation:');

      if (
        cancellationReason &&
        cancellationReason.trim() &&
        confirm('Are you sure you want to cancel this order?')
      ) {
        try {
          await this.$store.dispatch('procurement/cancelProcurementOrder', {
            id: this.order.id,
            cancelData: {
              cancelled_by: this.$store.state.auth.user?.id,
              cancellation_reason: cancellationReason.trim(),
            },
          });
          await this.loadOrderDetails();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Order cancelled successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to cancel order',
            type: 'error',
          });
        }
      } else if (cancellationReason !== null) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Cancellation reason is required',
          type: 'error',
        });
      }
    },

    getStatusClass(status) {
      const statusClasses = {
        DRAFT: 'label label-lg label-light-warning label-inline',
        APPROVED: 'label label-lg label-light-success label-inline',
        SENT: 'label label-lg label-light-info label-inline',
        RECEIVED: 'label label-lg label-light-primary label-inline',
        CANCELLED: 'label label-lg label-light-danger label-inline',
      };
      return statusClasses[status] || 'label label-lg label-light-secondary label-inline';
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    formatPrice(price) {
      if (!price) return '0.00';
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    },
  },

  async created() {
    if (this.orderId) {
      await this.loadOrderDetails();
    } else {
      this.error = 'Invalid order ID';
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.procurement-order-details {
  padding: 1.5rem;
}

.header-section {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.order-content {
  animation: fadeIn 0.3s ease-in-out;
}

.order-row {
  transition: all 0.2s ease;
}

.order-row:hover {
  background-color: #f8f9fa;
}

.timeline {
  position: relative;
  padding-left: 1rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 0.9375rem;
  top: 2.5rem;
  width: 2px;
  height: calc(100% - 1.5rem);
  background-color: #e1e3ea;
}

.timeline-media {
  position: absolute;
  left: 0;
  top: 0;
  width: 1.875rem;
  height: 1.875rem;
}

.timeline-media i {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
}

.timeline-content {
  margin-left: 2.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.symbol-60 {
  width: 3.75rem;
  height: 3.75rem;
}

.label {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.42rem;
}

.label-light-warning {
  background-color: #fff4de;
  color: #f1bc00;
}

.label-light-success {
  background-color: #e8f5e8;
  color: #0bb783;
}

.label-light-info {
  background-color: #e1f7ff;
  color: #2196f3;
}

.label-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
}

.label-light-danger {
  background-color: #ffeaea;
  color: #dc3545;
}

.label-light-secondary {
  background-color: #f1f1f4;
  color: #7e8299;
}
</style>
