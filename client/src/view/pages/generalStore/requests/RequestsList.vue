<template>
  <div class="requests-list">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-file text-primary mr-3"></i>
            Request Management
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Manage item requests, approvals, and fulfillment workflows
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <div class="d-flex justify-content-end">
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showCreateModal = true"
              class="btn btn-primary btn-lg mr-3"
            >
              <i class="flaticon2-plus mr-2"></i>
              New Request
            </button>
            <button @click="refreshData" class="btn btn-light btn-lg" :disabled="loading">
              <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section mb-6">
      <div class="card card-custom">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <label class="form-label">Search</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">
                    <i class="flaticon2-search"></i>
                  </span>
                </div>
                <input
                  v-model="searchTerm"
                  type="text"
                  class="form-control"
                  @input="handleSearch"
                />
              </div>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="form-label">Status</label>
              <select v-model="filters.status" class="form-control" @change="handleFilterChange">
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
              </select>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="form-label">Priority</label>
              <select v-model="filters.priority" class="form-control" @change="handleFilterChange">
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div class="col-lg-2 col-md-6 mb-3">
              <label class="form-label">Department</label>
              <select
                v-model="filters.department"
                class="form-control"
                @change="handleFilterChange"
              >
                <option value="">All Departments</option>
                <option v-for="dept in departments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <div class="col-lg-3 col-md-6 mb-3">
              <label class="form-label">Date Range</label>
              <div class="input-group">
                <input
                  v-model="filters.start_date"
                  type="date"
                  class="form-control"
                  @change="handleFilterChange"
                />
                <div class="input-group-append">
                  <span class="input-group-text">to</span>
                </div>
                <input
                  v-model="filters.end_date"
                  type="date"
                  class="form-control"
                  @change="handleFilterChange"
                />
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center">
                <div class="active-filters">
                  <span v-if="hasActiveFilters" class="text-muted mr-2">Active filters:</span>
                  <span
                    v-for="(value, key) in activeFilters"
                    :key="key"
                    class="badge badge-light mr-2"
                  >
                    {{ key }}: {{ value }}
                    <button
                      @click="clearFilter(key)"
                      class="close ml-1"
                      style="font-size: 0.75rem;"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <button @click="clearAllFilters" class="btn btn-outline-secondary btn-sm">
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="requests-table mb-6">
      <div class="card card-custom">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="flaticon2-file text-primary mr-2"></i>
              Requests
              <span class="badge badge-primary ml-2">{{ requestsTotal }}</span>
            </h5>
            <div class="view-controls">
              <button
                @click="viewMode = 'table'"
                class="btn btn-sm"
                :class="viewMode === 'table' ? 'btn-primary' : 'btn-light'"
              >
                <i class="flaticon2-list mr-1"></i>
                Table
              </button>
              <button
                @click="viewMode = 'cards'"
                class="btn btn-sm"
                :class="viewMode === 'cards' ? 'btn-primary' : 'btn-light'"
              >
                <i class="flaticon2-grid mr-1"></i>
                Cards
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading requests...</span>
            </div>
            <p class="text-muted mt-3">Loading requests...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="requests.length === 0" class="text-center py-8">
            <i class="flaticon2-file text-muted icon-2x mb-2"></i>
            <p class="text-muted mb-0">No requests found</p>
            <button
              v-if="ALLOWED_ROLES.includes(user.role)"
              @click="showCreateModal = true"
              class="btn btn-primary btn-sm mt-2"
            >
              <i class="flaticon2-plus mr-1"></i>
              Create First Request
            </button>
          </div>

          <!-- Table View -->
          <div v-else-if="viewMode === 'table'" class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Request</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total Cost</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in requests" :key="request.id" class="request-row">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="request-icon-sm mr-3">
                        <i class="flaticon2-file text-primary"></i>
                      </div>
                      <div>
                        <h6 class="font-weight-bold mb-1">{{ request.request_number }}</h6>
                        <small class="text-muted">{{ request.notes || 'No notes' }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-light-info">{{ request.requesting_department }}</span>
                  </td>
                  <td>
                    <span :class="getPriorityBadgeClass(request.priority)">
                      {{ request.priority }}
                    </span>
                  </td>
                  <td>
                    <span :class="getStatusBadgeClass(request.status)">
                      {{ request.status }}
                    </span>
                  </td>
                  <td>
                    <span class="font-weight-bold">{{ request.items_count || 0 }} items</span>
                  </td>
                  <td>
                    <span class="font-weight-bold text-success"
                      >${{ formatCurrency(request.total_cost) }}</span
                    >
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="user-avatar-sm mr-2">
                        <i class="flaticon2-user text-muted"></i>
                      </div>
                      <span>{{ request.requester?.name || 'Unknown' }}</span>
                    </div>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(request.request_date) }}</small>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button @click="viewRequest(request)" class="btn btn-sm btn-outline-primary">
                        <i class="flaticon2-eye"></i>
                      </button>
                      <button
                        v-if="canEditRequest(request)"
                        @click="editRequest(request)"
                        class="btn btn-sm btn-outline-warning"
                      >
                        <i class="flaticon2-edit"></i>
                      </button>
                      <button
                        v-if="canApproveRequest(request)"
                        @click="approveRequest(request)"
                        class="btn btn-sm btn-outline-success"
                      >
                        <i class="flaticon2-check"></i>
                      </button>
                      <button
                        v-if="canRejectRequest(request)"
                        @click="rejectRequest(request)"
                        class="btn btn-sm btn-outline-danger"
                      >
                        <i class="flaticon2-close"></i>
                      </button>
                      <button
                        v-if="canFulfillRequest(request)"
                        @click="fulfillRequest(request)"
                        class="btn btn-sm btn-outline-info"
                      >
                        <i class="flaticon2-box"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards View -->
          <div v-else class="requests-grid">
            <div class="row">
              <div v-for="request in requests" :key="request.id" class="col-lg-6 col-xl-4 mb-4">
                <div class="request-card card card-custom h-100">
                  <div class="card-header">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="font-weight-bold mb-1">{{ request.request_number }}</h6>
                        <small class="text-muted">{{ request.requesting_department }}</small>
                      </div>
                      <div class="text-right">
                        <span :class="getPriorityBadgeClass(request.priority)" class="mb-1 d-block">
                          {{ request.priority }}
                        </span>
                        <span :class="getStatusBadgeClass(request.status)">
                          {{ request.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="text-muted mb-3">
                      {{ request.notes || 'No additional notes provided' }}
                    </p>

                    <div class="request-meta mb-3">
                      <div class="meta-item d-flex justify-content-between mb-2">
                        <span class="text-muted">Items:</span>
                        <span class="font-weight-bold">{{ request.items_count || 0 }}</span>
                      </div>
                      <div class="meta-item d-flex justify-content-between mb-2">
                        <span class="text-muted">Total Cost:</span>
                        <span class="font-weight-bold text-success"
                          >${{ formatCurrency(request.total_cost) }}</span
                        >
                      </div>
                      <div class="meta-item d-flex justify-content-between mb-2">
                        <span class="text-muted">Requested By:</span>
                        <span class="font-weight-bold">{{
                          request.requester?.name || 'Unknown'
                        }}</span>
                      </div>
                      <div class="meta-item d-flex justify-content-between">
                        <span class="text-muted">Date:</span>
                        <span class="font-weight-bold">{{ formatDate(request.request_date) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="d-flex justify-content-between">
                      <button @click="viewRequest(request)" class="btn btn-sm btn-outline-primary">
                        <i class="flaticon2-eye mr-1"></i>
                        View
                      </button>
                      <div class="action-buttons">
                        <button
                          v-if="canEditRequest(request)"
                          @click="editRequest(request)"
                          class="btn btn-sm btn-outline-warning mr-1"
                          title="Edit Request"
                        >
                          <i class="flaticon2-edit"></i>
                        </button>
                        <button
                          v-if="canApproveRequest(request)"
                          @click="approveRequest(request)"
                          class="btn btn-sm btn-outline-success mr-1"
                          title="Approve Request"
                        >
                          <i class="flaticon2-check"></i>
                        </button>
                        <button
                          v-if="canRejectRequest(request)"
                          @click="rejectRequest(request)"
                          class="btn btn-sm btn-outline-danger mr-1"
                          title="Reject Request"
                        >
                          <i class="flaticon2-close"></i>
                        </button>
                        <button
                          v-if="canFulfillRequest(request)"
                          @click="fulfillRequest(request)"
                          class="btn btn-sm btn-outline-info"
                          title="Fulfill Request"
                        >
                          <i class="flaticon2-box"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="requestsTotal > pagination.limit" class="pagination-section">
      <div class="card card-custom">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div class="pagination-info">
              <span class="text-muted">
                Showing {{ paginationStart }} to {{ paginationEnd }} of {{ requestsTotal }} requests
              </span>
            </div>
            <nav>
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                  <button @click="changePage(pagination.page - 1)" class="page-link">
                    <i class="flaticon2-arrow-left"></i>
                  </button>
                </li>
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.page }"
                >
                  <button @click="changePage(page)" class="page-link">{{ page }}</button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: pagination.page === pagination.total_pages }"
                >
                  <button @click="changePage(pagination.page + 1)" class="page-link">
                    <i class="flaticon2-arrow-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">
            <i class="flaticon2-plus text-primary mr-2"></i>
            Create New Request
          </h4>
          <button @click="showCreateModal = false" class="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <CreateRequestForm
            @request-created="handleRequestCreated"
            @cancel="showCreateModal = false"
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
import CreateRequestForm from './CreateRequest.vue';

export default {
  name: 'RequestsList',
  components: {
    CreateRequestForm,
  },
  data() {
    return {
      loading: false,
      showCreateModal: false,
      viewMode: 'table',
      user: parseJwt(localStorage.getItem('user_token')),
      ALLOWED_ROLES: [
        'Super Admin',
        'General Store Manager',
        'General Store Staff',
        'Department Staff',
      ],
      requests: [],
      requestsTotal: 0,
      pagination: {
        page: 1,
        limit: 20,
        total_pages: 0,
      },
      filters: {
        search: '',
        status: '',
        priority: '',
        department: '',
        start_date: '',
        end_date: '',
      },
      departments: [
        'Emergency',
        'Surgery',
        'ICU',
        'Pediatrics',
        'Maternity',
        'Laboratory',
        'Radiology',
        'Pharmacy',
        'Administration',
        'IT',
        'Maintenance',
        'Other',
      ],
    };
  },
  computed: {
    hasActiveFilters() {
      return Object.values(this.filters).some(value => value !== '');
    },

    activeFilters() {
      const active = {};
      Object.entries(this.filters).forEach(([key, value]) => {
        if (value !== '') {
          active[key] = value;
        }
      });
      return active;
    },

    paginationStart() {
      return (this.pagination.page - 1) * this.pagination.limit + 1;
    },

    paginationEnd() {
      return Math.min(this.pagination.page * this.pagination.limit, this.requestsTotal);
    },

    visiblePages() {
      const pages = [];
      const current = this.pagination.page;
      const total = this.pagination.total_pages;

      let start = Math.max(1, current - 2);
      let end = Math.min(total, current + 2);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  async created() {
    await this.loadRequests();
  },
  methods: {
    async loadRequests() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.filters,
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });

        await this.$store.dispatch('generalStore/fetchRequests', params);

        this.requests = this.$store.state.generalStore.requests;
        this.requestsTotal = this.$store.state.generalStore.requestsTotal;
        this.pagination.total_pages = this.$store.state.generalStore.requestsPages;
      } catch (error) {
        console.error('Error loading requests:', error);
        this.$toast.error('Failed to load requests');
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      // Debounce search
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.loadRequests();
      }, 500);
    },

    handleFilterChange() {
      this.pagination.page = 1;
      this.loadRequests();
    },

    clearFilter(key) {
      this.filters[key] = '';
      this.handleFilterChange();
    },

    clearAllFilters() {
      this.filters = {
        search: '',
        status: '',
        priority: '',
        department: '',
        start_date: '',
        end_date: '',
      };
      this.handleFilterChange();
    },

    changePage(page) {
      if (page >= 1 && page <= this.pagination.total_pages) {
        this.pagination.page = page;
        this.loadRequests();
      }
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

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    canEditRequest(request) {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return request.status === 'PENDING' && request.requested_by === this.user.id;
    },

    canApproveRequest(request) {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return request.status === 'PENDING' && this.user.role !== 'Department Staff';
    },

    canRejectRequest(request) {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return request.status === 'PENDING' && this.user.role !== 'Department Staff';
    },

    canFulfillRequest(request) {
      if (!this.ALLOWED_ROLES.includes(this.user.role)) return false;
      return request.status === 'APPROVED' && this.user.role !== 'Department Staff';
    },

    viewRequest(request) {
      this.$router.push(`/general-store/requests/${request.id}`);
    },

    editRequest(request) {
      this.$router.push(`/general-store/requests/${request.id}/edit`);
    },

    async approveRequest(request) {
      try {
        const notes = await this.showApprovalModal(request);
        if (notes !== null) {
          await this.$store.dispatch('generalStore/approveRequest', {
            requestId: request.id,
            notes,
          });
          this.$toast.success('Request approved successfully');
          await this.loadRequests();
        }
      } catch (error) {
        this.$logError('Failed to approve request', error, { requestId: request.id });
        this.$toast.error('Failed to approve request');
      }
    },

    async rejectRequest(request) {
      try {
        const { notes, reason } = await this.showRejectionModal(request);
        if (notes !== null) {
          await this.$store.dispatch('generalStore/rejectRequest', {
            requestId: request.id,
            notes,
            reason,
          });
          this.$toast.success('Request rejected successfully');
          await this.loadRequests();
        }
      } catch (error) {
        this.$logError('Failed to reject request', error, { requestId: request.id });
        this.$toast.error('Failed to reject request');
      }
    },

    async fulfillRequest(request) {
      try {
        const { notes, fulfillmentItems } = await this.showFulfillmentModal(request);
        if (notes !== null) {
          await this.$store.dispatch('generalStore/fulfillRequest', {
            requestId: request.id,
            notes,
            fulfillmentItems,
          });
          this.$toast.success('Request fulfilled successfully');
          await this.loadRequests();
        }
      } catch (error) {
        this.$logError('Failed to fulfill request', error, { requestId: request.id });
        this.$toast.error('Failed to fulfill request');
      }
    },

    async showApprovalModal(request) {
      return new Promise((resolve) => {
        this.$bvModal.msgBoxPrompt('Enter approval notes (optional):', {
          title: `Approve Request #${request.request_number}`,
          size: 'md',
          okTitle: 'Approve',
          cancelTitle: 'Cancel',
          okVariant: 'success',
          cancelVariant: 'secondary',
          hideHeaderClose: false,
          centered: true,
        }).then((value) => {
          resolve(value || '');
        }).catch(() => {
          resolve(null);
        });
      });
    },

    async showRejectionModal(request) {
      return new Promise((resolve) => {
        this.$bvModal.msgBoxPrompt('Enter rejection reason:', {
          title: `Reject Request #${request.request_number}`,
          size: 'md',
          okTitle: 'Reject',
          cancelTitle: 'Cancel',
          okVariant: 'danger',
          cancelVariant: 'secondary',
          hideHeaderClose: false,
          centered: true,
          placeholder: 'Please provide a reason for rejection...',
        }).then((reason) => {
          if (reason) {
            this.$bvModal.msgBoxPrompt('Enter additional notes (optional):', {
              title: 'Additional Notes',
              size: 'md',
              okTitle: 'Confirm Rejection',
              cancelTitle: 'Cancel',
              okVariant: 'danger',
              cancelVariant: 'secondary',
              hideHeaderClose: false,
              centered: true,
            }).then((notes) => {
              resolve({ reason, notes: notes || '' });
            }).catch(() => {
              resolve(null);
            });
          } else {
            resolve(null);
          }
        }).catch(() => {
          resolve(null);
        });
      });
    },

    async showFulfillmentModal(request) {
      return new Promise((resolve) => {
        // Create a simple fulfillment modal
        const fulfillmentItems = request.items.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
        }));

        this.$bvModal.msgBoxPrompt('Enter fulfillment notes (optional):', {
          title: `Fulfill Request #${request.request_number}`,
          size: 'md',
          okTitle: 'Fulfill',
          cancelTitle: 'Cancel',
          okVariant: 'success',
          cancelVariant: 'secondary',
          hideHeaderClose: false,
          centered: true,
          placeholder: 'Enter any notes about the fulfillment...',
        }).then((notes) => {
          resolve({ 
            notes: notes || '', 
            fulfillmentItems 
          });
        }).catch(() => {
          resolve(null);
        });
      });
    },

    handleRequestCreated() {
      this.showCreateModal = false;
      this.loadRequests();
      this.$toast.success('Request created successfully');
    },

    async refreshData() {
      await this.loadRequests();
    },
  },
};
</script>

<style scoped>
.requests-list {
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

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
}

.active-filters .badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.request-row {
  transition: background-color 0.2s ease;
}

.request-row:hover {
  background-color: #f8f9fa;
}

.request-icon-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #6610f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-avatar-sm {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c757d, #495057);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.requests-grid .request-card {
  transition: all 0.3s ease;
  border: 1px solid #e1f0ff;
}

.requests-grid .request-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.1);
}

.request-meta .meta-item {
  padding: 0.25rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.request-meta .meta-item:last-child {
  border-bottom: none;
}

.action-buttons .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.pagination-section {
  margin-top: 2rem;
}

.pagination-info {
  font-size: 0.875rem;
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
  max-width: 1000px;
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

  .view-controls {
    margin-top: 1rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
