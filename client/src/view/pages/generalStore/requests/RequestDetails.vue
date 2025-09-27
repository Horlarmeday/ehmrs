<template>
  <div class="request-details">
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
                <i class="flaticon2-file text-primary mr-3"></i>
                Request Details
              </h1>
              <p class="text-muted font-size-lg mb-0">
                {{ request?.request_number || 'Loading request...' }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button v-if="canEditRequest" @click="editRequest" class="btn btn-warning btn-lg mr-3">
              <i class="flaticon2-edit mr-2"></i>
              Edit Request
            </button>
            <button
              v-if="canApproveRequest"
              @click="showApprovalModal = true"
              class="btn btn-success btn-lg mr-3"
            >
              <i class="flaticon2-check mr-2"></i>
              Approve
            </button>
            <button
              v-if="canRejectRequest"
              @click="showRejectionModal = true"
              class="btn btn-danger btn-lg mr-3"
            >
              <i class="flaticon2-close mr-2"></i>
              Reject
            </button>
            <button
              v-if="canFulfillRequest"
              @click="showFulfillmentModal = true"
              class="btn btn-info btn-lg"
            >
              <i class="flaticon2-box mr-2"></i>
              Fulfill
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading request details...</span>
      </div>
      <p class="text-muted mt-3">Loading request details...</p>
    </div>

    <!-- Request Details Content -->
    <div v-else-if="request" class="request-content">
      <div class="row">
        <!-- Main Information -->
        <div class="col-lg-8">
          <!-- Request Overview -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-file text-primary mr-2"></i>
                Request Overview
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Request Number</label>
                  <div class="form-control-plaintext font-weight-bold">
                    {{ request.request_number }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Status</label>
                  <div>
                    <span :class="getStatusBadgeClass(request.status)">
                      {{ request.status }}
                    </span>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Department</label>
                  <div class="form-control-plaintext">
                    {{ request.requesting_department }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Priority</label>
                  <div>
                    <span :class="getPriorityBadgeClass(request.priority)">
                      {{ request.priority }}
                    </span>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Request Date</label>
                  <div class="form-control-plaintext">
                    {{ formatDate(request.request_date) }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Required Date</label>
                  <div class="form-control-plaintext">
                    {{ formatDate(request.required_date) }}
                  </div>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label text-muted">Notes</label>
                  <div class="form-control-plaintext">
                    {{ request.notes || 'No additional notes provided' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Requested Items -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-box text-primary mr-2"></i>
                Requested Items
                <span class="badge badge-primary ml-2">{{ request.items?.length || 0 }}</span>
              </h5>
            </div>
            <div class="card-body">
              <div v-if="!request.items || request.items.length === 0" class="text-center py-4">
                <i class="flaticon2-box text-muted icon-2x mb-2"></i>
                <p class="text-muted mb-0">No items in this request</p>
              </div>
              <div v-else>
                <div v-for="(item, index) in request.items" :key="index" class="item-row mb-4">
                  <div class="card card-custom">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label text-muted">Item</label>
                          <div class="form-control-plaintext font-weight-bold">
                            {{ item.item?.name || 'Unknown Item' }}
                          </div>
                          <small class="text-muted">{{ item.item?.item_code || 'No code' }}</small>
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="form-label text-muted">Quantity Requested</label>
                          <div class="form-control-plaintext">
                            {{ item.quantity_requested }}
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="form-label text-muted">Unit Cost</label>
                          <div class="form-control-plaintext">
                            ${{ formatCurrency(item.unit_cost) }}
                          </div>
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="form-label text-muted">Total Cost</label>
                          <div class="form-control-plaintext font-weight-bold text-success">
                            ${{ formatCurrency(item.total_cost) }}
                          </div>
                        </div>

                        <div class="col-12 mb-3">
                          <label class="form-label text-muted">Item Notes</label>
                          <div class="form-control-plaintext">
                            {{ item.notes || 'No specific notes for this item' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Request History -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-clock text-primary mr-2"></i>
                Request History
              </h5>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div v-for="(event, index) in requestHistory" :key="index" class="timeline-item">
                  <div class="timeline-marker" :class="getTimelineMarkerClass(event.type)">
                    <i :class="getTimelineIcon(event.type)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h6 class="font-weight-bold mb-1">{{ event.title }}</h6>
                      <small class="text-muted">{{ formatDateTime(event.timestamp) }}</small>
                    </div>
                    <p class="timeline-body mb-0">{{ event.description }}</p>
                    <div v-if="event.notes" class="timeline-notes mt-2">
                      <small class="text-muted"> <strong>Notes:</strong> {{ event.notes }} </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Information -->
        <div class="col-lg-4">
          <!-- Request Summary -->
          <div class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-eye text-primary mr-2"></i>
                Request Summary
              </h5>
            </div>
            <div class="card-body">
              <div class="request-summary text-center">
                <div class="summary-icon mb-3">
                  <div class="icon-circle" :class="getStatusIconClass()">
                    <i :class="getStatusIcon()"></i>
                  </div>
                </div>

                <h6 class="font-weight-bold text-dark mb-2">{{ request.status }}</h6>
                <p class="text-muted mb-3">
                  {{ getStatusDescription() }}
                </p>

                <div class="summary-stats">
                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Total Items:</span>
                    <span class="font-weight-bold text-primary">{{
                      request.items?.length || 0
                    }}</span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Total Cost:</span>
                    <span class="font-weight-bold text-success"
                      >${{ formatCurrency(request.total_cost) }}</span
                    >
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Days Until Required:</span>
                    <span class="font-weight-bold" :class="getDaysUntilRequiredClass()">
                      {{ getDaysUntilRequired() }}
                    </span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-2">
                    <span class="text-muted">Requested By:</span>
                    <span class="font-weight-bold">{{ request.requester?.name || 'Unknown' }}</span>
                  </div>

                  <div class="stat-item d-flex justify-content-between mb-3">
                    <span class="text-muted">Created:</span>
                    <span class="font-weight-bold">{{ formatDate(request.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approval Information -->
          <div v-if="request.approved_by || request.rejected_by" class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-check text-success mr-2"></i>
                {{ request.approved_by ? 'Approval' : 'Rejection' }} Information
              </h5>
            </div>
            <div class="card-body">
              <div class="approval-info">
                <div class="info-item d-flex justify-content-between mb-2">
                  <span class="text-muted"
                    >{{ request.approved_by ? 'Approved' : 'Rejected' }} By:</span
                  >
                  <span class="font-weight-bold">
                    {{ request.approved_by?.name || request.rejected_by?.name }}
                  </span>
                </div>

                <div class="info-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Date:</span>
                  <span class="font-weight-bold">
                    {{ formatDate(request.approved_at || request.rejected_at) }}
                  </span>
                </div>

                <div v-if="request.approval_notes || request.rejection_reason" class="info-item">
                  <span class="text-muted">Notes:</span>
                  <div class="mt-1">
                    <small class="text-muted">
                      {{ request.approval_notes || request.rejection_reason }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fulfillment Information -->
          <div v-if="request.fulfilled_by" class="card card-custom mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-box text-info mr-2"></i>
                Fulfillment Information
              </h5>
            </div>
            <div class="card-body">
              <div class="fulfillment-info">
                <div class="info-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Fulfilled By:</span>
                  <span class="font-weight-bold">{{ request.fulfilled_by?.name }}</span>
                </div>

                <div class="info-item d-flex justify-content-between mb-2">
                  <span class="text-muted">Date:</span>
                  <span class="font-weight-bold">{{ formatDate(request.fulfilled_at) }}</span>
                </div>

                <div v-if="request.fulfillment_notes" class="info-item">
                  <span class="text-muted">Notes:</span>
                  <div class="mt-1">
                    <small class="text-muted">{{ request.fulfillment_notes }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card card-custom">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="flaticon2-gear text-primary mr-2"></i>
                Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <button @click="printRequest" class="btn btn-outline-secondary btn-block mb-2">
                  <i class="flaticon2-download mr-2"></i>
                  Print Request
                </button>

                <button @click="exportRequest" class="btn btn-outline-info btn-block mb-2">
                  <i class="flaticon2-file mr-2"></i>
                  Export PDF
                </button>

                <button @click="copyRequest" class="btn btn-outline-primary btn-block">
                  <i class="flaticon2-copy mr-2"></i>
                  Copy Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="modal-overlay" @click="showApprovalModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-check text-success mr-2"></i>
            Approve Request
          </h4>
          <button @click="showApprovalModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <RequestApprovalForm
            :request="request"
            @request-approved="handleRequestApproved"
            @cancel="showApprovalModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectionModal" class="modal-overlay" @click="showRejectionModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-close text-danger mr-2"></i>
            Reject Request
          </h4>
          <button @click="showRejectionModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <RequestRejectionForm
            :request="request"
            @request-rejected="handleRequestRejected"
            @cancel="showRejectionModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Fulfillment Modal -->
    <div v-if="showFulfillmentModal" class="modal-overlay" @click="showFulfillmentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-box text-info mr-2"></i>
            Fulfill Request
          </h4>
          <button @click="showFulfillmentModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <RequestFulfillmentForm
            :request="request"
            @request-fulfilled="handleRequestFulfilled"
            @cancel="showFulfillmentModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJwt } from '@/common/common';
import RequestApprovalForm from './RequestApproval.vue';
import RequestRejectionForm from './RequestRejection.vue';
import RequestFulfillmentForm from './RequestFulfillment.vue';

export default {
  name: 'RequestDetails',
  components: {
    RequestApprovalForm,
    RequestRejectionForm,
    RequestFulfillmentForm,
  },
  data() {
    return {
      loading: false,
      showApprovalModal: false,
      showRejectionModal: false,
      showFulfillmentModal: false,
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: [
        'Super Admin',
        'General Store Manager',
        'General Store Staff',
        'Department Staff',
      ],
      request: null,
      requestHistory: [],
    };
  },
  computed: {
    canEditRequest() {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return this.request?.status === 'PENDING' && this.request?.requested_by === this.user.id;
    },

    canApproveRequest() {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return this.request?.status === 'PENDING' && this.user.role !== 'Department Staff';
    },

    canRejectRequest() {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return this.request?.status === 'PENDING' && this.user.role !== 'Department Staff';
    },

    canFulfillRequest() {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return this.request?.status === 'APPROVED' && this.user.role !== 'Department Staff';
    },
  },
  async created() {
    await this.loadRequestDetails();
  },
  methods: {
    async loadRequestDetails() {
      this.loading = true;
      try {
        const requestId = this.$route.params.id;
        await this.$store.dispatch('generalStore/fetchRequestById', requestId);
        this.request = this.$store.state.generalStore.currentRequest;
        this.generateRequestHistory();
      } catch (error) {
        this.$toast.error('Failed to load request details');
      } finally {
        this.loading = false;
      }
    },

    generateRequestHistory() {
      if (!this.request) return;

      this.requestHistory = [
        {
          type: 'created',
          title: 'Request Created',
          description: `Request created by ${this.request.requester?.name || 'Unknown'}`,
          timestamp: this.request.created_at,
          notes: this.request.notes,
        },
      ];

      if (this.request.approved_by) {
        this.requestHistory.push({
          type: 'approved',
          title: 'Request Approved',
          description: `Request approved by ${this.request.approved_by.name}`,
          timestamp: this.request.approved_at,
          notes: this.request.approval_notes,
        });
      }

      if (this.request.rejected_by) {
        this.requestHistory.push({
          type: 'rejected',
          title: 'Request Rejected',
          description: `Request rejected by ${this.request.rejected_by.name}`,
          timestamp: this.request.rejected_at,
          notes: this.request.rejection_reason,
        });
      }

      if (this.request.fulfilled_by) {
        this.requestHistory.push({
          type: 'fulfilled',
          title: 'Request Fulfilled',
          description: `Request fulfilled by ${this.request.fulfilled_by.name}`,
          timestamp: this.request.fulfilled_at,
          notes: this.request.fulfillment_notes,
        });
      }

      // Sort by timestamp
      this.requestHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    getStatusBadgeClass(status) {
      const classes = {
        PENDING: 'badge badge-warning',
        APPROVED: 'badge badge-success',
        REJECTED: 'badge badge-danger',
        FULFILLED: 'badge badge-info',
        PARTIALLY_FULFILLED: 'badge badge-light-info',
      };
      return classes[status] || 'badge badge-light';
    },

    getPriorityBadgeClass(priority) {
      const classes = {
        LOW: 'badge badge-light-secondary',
        MEDIUM: 'badge badge-light-info',
        HIGH: 'badge badge-light-warning',
        URGENT: 'badge badge-light-danger',
      };
      return classes[priority] || 'badge badge-light-secondary';
    },

    getStatusIconClass() {
      const classes = {
        PENDING: 'icon-circle-warning',
        APPROVED: 'icon-circle-success',
        REJECTED: 'icon-circle-danger',
        FULFILLED: 'icon-circle-info',
        PARTIALLY_FULFILLED: 'icon-circle-light-info',
      };
      return classes[this.request?.status] || 'icon-circle-secondary';
    },

    getStatusIcon() {
      const icons = {
        PENDING: 'flaticon2-clock',
        APPROVED: 'flaticon2-check',
        REJECTED: 'flaticon2-close',
        FULFILLED: 'flaticon2-box',
        PARTIALLY_FULFILLED: 'flaticon2-box',
      };
      return icons[this.request?.status] || 'flaticon2-file';
    },

    getStatusDescription() {
      const descriptions = {
        PENDING: 'Awaiting approval from store management',
        APPROVED: 'Request has been approved and is ready for fulfillment',
        REJECTED: 'Request has been rejected and cannot proceed',
        FULFILLED: 'All requested items have been provided',
        PARTIALLY_FULFILLED: 'Some items have been provided, others are pending',
      };
      return descriptions[this.request?.status] || 'Status unknown';
    },

    getTimelineMarkerClass(type) {
      const classes = {
        created: 'timeline-marker-primary',
        approved: 'timeline-marker-success',
        rejected: 'timeline-marker-danger',
        fulfilled: 'timeline-marker-info',
      };
      return classes[type] || 'timeline-marker-secondary';
    },

    getTimelineIcon(type) {
      const icons = {
        created: 'flaticon2-plus',
        approved: 'flaticon2-check',
        rejected: 'flaticon2-close',
        fulfilled: 'flaticon2-box',
      };
      return icons[type] || 'flaticon2-file';
    },

    getDaysUntilRequired() {
      if (!this.request?.required_date) return 'Unknown';

      const requiredDate = new Date(this.request.required_date);
      const today = new Date();
      const diffTime = requiredDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      return `${diffDays} days`;
    },

    getDaysUntilRequiredClass() {
      if (!this.request?.required_date) return 'text-muted';

      const requiredDate = new Date(this.request.required_date);
      const today = new Date();
      const diffTime = requiredDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'text-danger';
      if (diffDays <= 2) return 'text-warning';
      return 'text-success';
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    },

    editRequest() {
      this.$router.push(`/general-store/requests/${this.request.id}/edit`);
    },

    handleRequestApproved() {
      this.showApprovalModal = false;
      this.loadRequestDetails();
      this.$toast.success('Request approved successfully');
    },

    handleRequestRejected() {
      this.showRejectionModal = false;
      this.loadRequestDetails();
      this.$toast.success('Request rejected successfully');
    },

    handleRequestFulfilled() {
      this.showFulfillmentModal = false;
      this.loadRequestDetails();
      this.$toast.success('Request fulfilled successfully');
    },

    async printRequest() {
      try {
        const requestData = [
          {
            id: this.request.id,
            request_number: this.request.request_number,
            department: this.request.department,
            requester_name: this.request.requester_name,
            purpose: this.request.purpose,
            status: this.request.status,
            priority: this.request.priority,
            notes: this.request.notes,
            created_at: this.request.created_at,
            items_count: this.request.items?.length || 0,
          },
        ];

        const reportConfig = {
          title: `Request Details - ${this.request.request_number}`,
          subtitle: `Department: ${this.request.department}`,
          orientation: 'portrait',
          format: 'a4',
        };
        await this.$printReport(requestData, reportConfig);
      } catch (error) {
        this.$logError('Failed to print request details', error, { requestId: this.request.id });
        this.$toast.error('Failed to print request details');
      }
    },

    async exportRequest() {
      try {
        const requestData = [
          {
            id: this.request.id,
            request_number: this.request.request_number,
            department: this.request.department,
            requester_name: this.request.requester_name,
            purpose: this.request.purpose,
            status: this.request.status,
            priority: this.request.priority,
            notes: this.request.notes,
            created_at: this.request.created_at,
            items_count: this.request.items?.length || 0,
          },
        ];

        const reportName = `Request_${this.request.request_number}_${
          new Date().toISOString().split('T')[0]
        }`;
        await this.$exportData(requestData, reportName, 'xlsx', {
          formatters: {
            created_at: (value) => new Date(value).toLocaleDateString(),
          },
        });
      } catch (error) {
        this.$logError('Failed to export request details', error, { requestId: this.request.id });
        this.$toast.error('Failed to export request details');
      }
    },

    async copyRequest() {
      try {
        const requestData = {
          department: this.request.department,
          requester_name: this.request.requester_name,
          purpose: this.request.purpose,
          priority: this.request.priority,
          notes: this.request.notes,
          items:
            this.request.items?.map((item) => ({
              item_id: item.item_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes,
            })) || [],
        };

        // Store in session storage for the create request page
        sessionStorage.setItem('copiedRequest', JSON.stringify(requestData));

        // Navigate to create request page
        this.$router.push('/general-store/requests/create?copied=true');
        this.$toast.success('Request data copied successfully');
      } catch (error) {
        this.$logError('Failed to copy request', error, { requestId: this.request.id });
        this.$toast.error('Failed to copy request');
      }
    },
  },
};
</script>

<style scoped>
.request-details {
  position: relative;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
}

.header-section h1 {
  color: white !important;
}

.header-section p {
  color: rgba(255, 255, 255, 0.8) !important;
}

.card-custom {
  border: 1px solid #e1f0ff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card-custom:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1f0ff;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.form-control-plaintext {
  padding: 0.375rem 0;
  margin-bottom: 0;
  color: #495057;
  background-color: transparent;
  border: solid transparent;
  border-width: 1px 0;
}

.item-row .card {
  border: 1px solid #e1f0ff;
  transition: all 0.3s ease;
}

.item-row .card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.1);
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -1.5rem;
  top: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
}

.timeline-marker-primary {
  background: linear-gradient(135deg, #007bff, #6610f2);
}

.timeline-marker-success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.timeline-marker-danger {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.timeline-marker-info {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.timeline-marker-secondary {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.timeline-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #007bff;
}

.timeline-header h6 {
  margin-bottom: 0.25rem;
}

.timeline-body {
  color: #6c757d;
}

.timeline-notes {
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.request-summary {
  padding: 1rem 0;
}

.summary-icon .icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.icon-circle-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.icon-circle-success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.icon-circle-danger {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.icon-circle-info {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.icon-circle-secondary {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.summary-icon .icon-circle i {
  font-size: 2rem;
}

.summary-stats .stat-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.summary-stats .stat-item:last-child {
  border-bottom: none;
}

.approval-info .info-item,
.fulfillment-info .info-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.approval-info .info-item:last-child,
.fulfillment-info .info-item:last-child {
  border-bottom: none;
}

.quick-actions .btn {
  margin-bottom: 0.5rem;
}

.quick-actions .btn:last-child {
  margin-bottom: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #495057;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close:hover {
  color: #343a40;
}

.modal-body {
  padding: 1.5rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section {
    padding: 1rem;
    text-align: center;
  }

  .header-section .text-right {
    text-align: center !important;
    margin-top: 1rem;
  }

  .timeline {
    padding-left: 1rem;
  }

  .timeline-marker {
    left: -1rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
