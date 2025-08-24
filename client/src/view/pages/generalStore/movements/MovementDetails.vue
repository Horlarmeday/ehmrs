<template>
  <div class="movement-details">
    <div class="row">
      <div class="col-12">
        <!-- Header Card -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col">
                <h3 class="card-title">
                  <span :class="getMovementTypeIcon(movement.type)"></span>
                  {{ formatMovementType(movement.type) }} - {{ movement.reference_number }}
                </h3>
                <p class="card-text text-muted">
                  {{ movement.notes || 'No additional notes' }}
                </p>
              </div>
              <div class="col-auto">
                <div class="btn-group" role="group">
                  <router-link :to="{ name: 'general-store-movements' }" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to List
                  </router-link>
                  <button
                    v-if="movement.status === 'pending'"
                    @click="approveMovement"
                    class="btn btn-success"
                    :disabled="processing"
                  >
                    <i class="fas fa-check"></i> Approve
                  </button>
                  <button
                    v-if="movement.status === 'pending'"
                    @click="rejectMovement"
                    class="btn btn-danger"
                    :disabled="processing"
                  >
                    <i class="fas fa-times"></i> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="row">
          <!-- Movement Information -->
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-info-circle mr-2"></i>
                  Movement Information
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Movement Type:</label>
                      <span class="info-value">
                        <span :class="getMovementTypeClass(movement.type)">
                          {{ formatMovementType(movement.type) }}
                        </span>
                      </span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Reference Number:</label>
                      <span class="info-value">
                        <span class="badge badge-secondary">{{ movement.reference_number }}</span>
                      </span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Reference Type:</label>
                      <span class="info-value">{{
                        formatReferenceType(movement.reference_type)
                      }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Status:</label>
                      <span class="info-value">
                        <span :class="getStatusClass(movement.status)">
                          {{ movement.status }}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Movement Date:</label>
                      <span class="info-value">{{ formatDateTime(movement.movement_date) }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Created Date:</label>
                      <span class="info-value">{{ formatDateTime(movement.created_at) }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Created By:</label>
                      <span class="info-value">{{ movement.staff_name }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Requires Approval:</label>
                      <span class="info-value">
                        <i
                          :class="
                            movement.requires_approval
                              ? 'fas fa-lock text-warning'
                              : 'fas fa-unlock text-success'
                          "
                        ></i>
                        {{ movement.requires_approval ? 'Yes' : 'No' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Location Information for Transfers -->
                <div v-if="showLocationInfo" class="row mt-3">
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Source Location:</label>
                      <span class="info-value">{{ formatLocation(movement.source_location) }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Destination Location:</label>
                      <span class="info-value">{{
                        formatLocation(movement.destination_location)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="info-item mt-3">
                  <label class="info-label">Reason:</label>
                  <span class="info-value">{{ formatReason(movement.reason) }}</span>
                </div>

                <div class="info-item mt-3">
                  <label class="info-label">Notes:</label>
                  <p class="info-value">{{ movement.notes || 'No notes provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Item Information -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-box mr-2"></i>
                  Item Information
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Item Name:</label>
                      <span class="info-value">{{ movement.item_name }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Item Code:</label>
                      <span class="info-value">{{ movement.item_code }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Category:</label>
                      <span class="info-value">{{ movement.category_name }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label class="info-label">Quantity:</label>
                      <span class="info-value">
                        <span :class="getQuantityClass(movement.type, movement.quantity)">
                          {{ movement.type === 'out' ? '-' : '+' }}{{ movement.quantity }}
                        </span>
                        {{ movement.unit }}
                      </span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Unit Price:</label>
                      <span class="info-value">{{ formatCurrency(movement.unit_price) }}</span>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Total Value:</label>
                      <span class="info-value">{{ formatCurrency(movement.total_value) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Stock Impact Summary -->
                <div class="row mt-3">
                  <div class="col-12">
                    <div class="card bg-light">
                      <div class="card-body">
                        <h6 class="card-title">Stock Impact Summary</h6>
                        <div class="row">
                          <div class="col-md-3">
                            <strong>Previous Stock:</strong> {{ movement.previous_stock || 0 }}
                          </div>
                          <div class="col-md-3">
                            <strong>Movement:</strong>
                            <span :class="getQuantityClass(movement.type, movement.quantity)">
                              {{ movement.type === 'out' ? '-' : '+' }}{{ movement.quantity }}
                            </span>
                          </div>
                          <div class="col-md-3">
                            <strong>New Stock:</strong> {{ movement.new_stock || 0 }}
                          </div>
                          <div class="col-md-3">
                            <strong>Stock Value:</strong> {{ formatCurrency(movement.stock_value) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-md-4">
            <!-- Status Timeline -->
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-history mr-2"></i>
                  Status Timeline
                </h5>
              </div>
              <div class="card-body">
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-marker active"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">Movement Created</div>
                      <div class="timeline-time">{{ formatDateTime(movement.created_at) }}</div>
                      <div class="timeline-description">
                        Movement recorded by {{ movement.staff_name }}
                      </div>
                    </div>
                  </div>

                  <div v-if="movement.status !== 'pending'" class="timeline-item">
                    <div class="timeline-marker active"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">Movement {{ movement.status }}</div>
                      <div class="timeline-time">{{ formatDateTime(movement.updated_at) }}</div>
                      <div class="timeline-description">
                        {{ movement.status === 'approved' ? 'Approved and processed' : 'Rejected' }}
                      </div>
                    </div>
                  </div>

                  <div v-if="movement.status === 'pending'" class="timeline-item">
                    <div class="timeline-marker pending"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">Pending Approval</div>
                      <div class="timeline-description">
                        Awaiting approval from authorized staff
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-bolt mr-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <router-link
                    :to="{ name: 'general-store-edit-movement', params: { id: movement.id } }"
                    v-if="movement.status === 'pending'"
                    class="btn btn-warning btn-sm"
                  >
                    <i class="fas fa-edit mr-2"></i>
                    Edit Movement
                  </router-link>
                  <button @click="printMovementDetails" class="btn btn-outline-info btn-sm">
                    <i class="fas fa-print mr-2"></i>
                    Print Details
                  </button>
                  <button @click="exportMovementData" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-download mr-2"></i>
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            <!-- Related Movements -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-link mr-2"></i>
                  Related Movements
                </h5>
              </div>
              <div class="card-body">
                <div v-if="relatedMovements.length === 0" class="text-center py-3">
                  <p class="text-muted">No related movements found</p>
                </div>
                <div v-else>
                  <div
                    v-for="related in relatedMovements"
                    :key="related.id"
                    class="related-movement"
                  >
                    <div class="related-header">
                      <span :class="getMovementTypeClass(related.type)">
                        {{ formatMovementType(related.type) }}
                      </span>
                      <small class="text-muted">{{ formatDate(related.created_at) }}</small>
                    </div>
                    <div class="related-details">
                      {{ related.quantity }} {{ related.unit }} - {{ related.reference_number }}
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
</template>

<script>
export default {
  name: 'MovementDetails',
  data() {
    return {
      processing: false,
    };
  },
  computed: {
    movement() {
      return this.$store.state.generalStore.currentMovement || {};
    },
    relatedMovements() {
      return this.$store.state.generalStore.relatedMovements || [];
    },
    loading() {
      return this.$store.state.generalStore.loading;
    },
    error() {
      return this.$store.state.generalStore.error;
    },
    showLocationInfo() {
      return ['transfer', 'adjustment'].includes(this.movement.type);
    },
  },
  async mounted() {
    await this.loadMovementDetails();
    await this.loadRelatedMovements();
  },
  methods: {
    async loadMovementDetails() {
      try {
        await this.$store.dispatch('generalStore/fetchMovementById', this.$route.params.id);
      } catch (error) {
        console.error('Error loading movement details:', error);
        this.$toast.error('Failed to load movement details');
      }
    },
    async loadRelatedMovements() {
      try {
        // Load related movements for the current item
        if (this.movement.item_id) {
          await this.$store.dispatch('generalStore/fetchRelatedMovements', {
            item_id: this.movement.item_id,
            limit: 5,
            exclude_id: this.movement.id,
          });
        }
      } catch (error) {
        console.error('Error loading related movements:', error);
      }
    },
    getMovementTypeIcon(type) {
      const icons = {
        in: 'fas fa-arrow-down text-success',
        out: 'fas fa-arrow-up text-danger',
        transfer: 'fas fa-exchange-alt text-info',
        adjustment: 'fas fa-sliders-h text-warning',
        return: 'fas fa-undo text-secondary',
      };
      return icons[type] || 'fas fa-box text-muted';
    },
    getMovementTypeClass(type) {
      const classes = {
        in: 'badge badge-success',
        out: 'badge badge-danger',
        transfer: 'badge badge-info',
        adjustment: 'badge badge-warning',
        return: 'badge badge-secondary',
      };
      return classes[type] || 'badge badge-secondary';
    },
    formatMovementType(type) {
      const types = {
        in: 'Stock In',
        out: 'Stock Out',
        transfer: 'Transfer',
        adjustment: 'Adjustment',
        return: 'Return',
      };
      return types[type] || type;
    },
    formatReferenceType(type) {
      if (!type) return 'Not specified';
      return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getStatusClass(status) {
      const classes = {
        pending: 'badge badge-warning',
        approved: 'badge badge-success',
        rejected: 'badge badge-danger',
        completed: 'badge badge-info',
      };
      return classes[status] || 'badge badge-secondary';
    },
    formatLocation(location) {
      if (!location) return 'Not specified';
      return location.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    formatReason(reason) {
      if (!reason) return 'Not specified';
      return reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getQuantityClass(type) {
      if (type === 'out') return 'text-danger';
      if (type === 'in') return 'text-success';
      return 'text-info';
    },
    formatCurrency(amount) {
      if (!amount) return '₦0.00';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount);
    },
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    },
    async approveMovement() {
      this.processing = true;
      try {
        // TODO: Add approveMovement action to Vuex store
        // await this.$store.dispatch('generalStore/approveMovement', this.movement.id);
        this.$toast.success('Movement approved successfully');
        await this.loadMovementDetails();
      } catch (error) {
        console.error('Error approving movement:', error);
        this.$toast.error('Failed to approve movement');
      } finally {
        this.processing = false;
      }
    },
    async rejectMovement() {
      this.processing = true;
      try {
        // TODO: Add rejectMovement action to Vuex store
        // await this.$store.dispatch('generalStore/rejectMovement', this.movement.id);
        this.$toast.success('Movement rejected successfully');
        await this.loadMovementDetails();
      } catch (error) {
        console.error('Error rejecting movement:', error);
        this.$toast.error('Failed to reject movement');
      } finally {
        this.processing = false;
      }
    },
    printMovementDetails() {
      window.print();
    },
    exportMovementData() {
      // Implementation for exporting movement data
      this.$toast.info('Export functionality coming soon');
    },
  },
};
</script>

<style scoped>
.movement-details {
  padding: 20px;
}

.card {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

.info-item {
  margin-bottom: 15px;
}

.info-label {
  font-weight: 600;
  color: #6c757d;
  display: block;
  margin-bottom: 5px;
}

.info-value {
  color: #495057;
  font-size: 1.1em;
}

.badge {
  font-size: 0.75em;
}

.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
  padding-left: 30px;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-marker.active {
  background-color: #28a745;
  box-shadow: 0 0 0 2px #28a745;
}

.timeline-marker.pending {
  background-color: #ffc107;
  box-shadow: 0 0 0 2px #ffc107;
}

.timeline-content {
  padding-left: 15px;
}

.timeline-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.timeline-time {
  font-size: 0.8em;
  color: #6c757d;
  margin-bottom: 5px;
}

.timeline-description {
  font-size: 0.9em;
  color: #6c757d;
}

.related-movement {
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.related-movement:last-child {
  border-bottom: none;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.related-details {
  font-size: 0.9em;
  color: #6c757d;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.btn-group .btn {
  margin-right: 5px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

@media print {
  .btn-group,
  .card-header .col-auto {
    display: none !important;
  }
}
</style>
