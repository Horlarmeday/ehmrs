<template>
  <div class="stock-audit-manager">
    <!-- Header Section -->
    <div class="card card-custom gutter-b mb-8">
      <div class="card-header border-0 py-5">
        <div class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark font-size-h3">
            <i class="fas fa-clipboard-check text-primary mr-3"></i>
            Stock Audit Management
          </span>
          <span class="text-muted mt-2 font-weight-normal">
            Manage inventory audits, stock verification, and discrepancy tracking
          </span>
        </div>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'audits' }"
              @click="setActiveView('audits')"
            >
              <i class="fas fa-list mr-2"></i>Audits
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'discrepancies' }"
              @click="setActiveView('discrepancies')"
            >
              <i class="fas fa-exclamation-triangle mr-2"></i>Discrepancies
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'reports' }"
              @click="setActiveView('reports')"
            >
              <i class="fas fa-chart-bar mr-2"></i>Reports
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-8">
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-warning mr-4">
                <span class="symbol-label">
                  <i class="fas fa-clock text-warning"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.pending || 0 }}
                </div>
                <div class="text-muted font-size-sm">Pending Audits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-info">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-info mr-4">
                <span class="symbol-label">
                  <i class="fas fa-play text-info"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.inProgress || 0 }}
                </div>
                <div class="text-muted font-size-sm">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-success mr-4">
                <span class="symbol-label">
                  <i class="fas fa-check text-success"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.completed || 0 }}
                </div>
                <div class="text-muted font-size-sm">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-danger">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-danger mr-4">
                <span class="symbol-label">
                  <i class="fas fa-exclamation-triangle text-danger"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.discrepancies || 0 }}
                </div>
                <div class="text-muted font-size-sm">Discrepancies</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Views -->
    <div class="view-content">
      <!-- Audits View -->
      <div v-show="activeView === 'audits'" class="view-pane fade show active">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-clipboard-check text-primary mr-2"></i>
              Stock Audits
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-primary btn-sm font-weight-bold" @click="openCreateModal()">
                <i class="fas fa-plus mr-2"></i>Create Audit
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Filters -->
            <div class="row mb-4">
              <div class="col-md-3">
                <select v-model="filters.status" class="form-control" @change="loadAudits">
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="filters.dateFrom"
                  class="form-control"
                  placeholder="From Date"
                  @change="loadAudits"
                />
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="filters.dateTo"
                  class="form-control"
                  placeholder="To Date"
                  @change="loadAudits"
                />
              </div>
              <div class="col-md-3">
                <input
                  type="text"
                  v-model="filters.search"
                  class="form-control"
                  placeholder="Search audits..."
                  @input="loadAudits"
                />
              </div>
            </div>

            <!-- Audits Table -->
            <div class="table-responsive">
              <table class="table table-head-custom table-vertical-center">
                <thead>
                  <tr class="text-left">
                    <th class="pl-4" style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Audit #</span>
                    </th>
                    <th style="min-width: 150px">
                      <span class="text-dark-75 font-weight-bolder">Auditor</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Audit Date</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Items Count</span>
                    </th>
                    <th style="min-width: 100px">
                      <span class="text-dark-75 font-weight-bolder">Status</span>
                    </th>
                    <th style="min-width: 120px">
                      <span class="text-dark-75 font-weight-bolder">Discrepancies</span>
                    </th>
                    <th class="pr-0 text-right" style="min-width: 150px">
                      <span class="text-dark-75 font-weight-bolder">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="audits.length === 0">
                    <td colspan="7" class="text-center py-8">
                      <div class="text-muted">
                        <i class="fas fa-inbox fa-3x mb-3"></i>
                        <p class="font-size-lg">No stock audits found</p>
                        <p class="font-size-sm">Click "Create Audit" to get started</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="audit in audits" :key="audit.id" class="audit-row">
                    <td class="pl-4">
                      <span class="text-dark-75 font-weight-bolder font-size-lg">
                        SA-{{ audit.audit_number }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="symbol symbol-40 symbol-light-primary mr-4">
                          <span class="symbol-label">
                            <i class="fas fa-user text-primary"></i>
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                          >
                            {{ audit.auditor_name }}
                          </span>
                          <span class="text-muted d-block font-size-sm">{{
                            audit.auditor_role
                          }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                        {{ formatDate(audit.audit_date) }}
                      </span>
                    </td>
                    <td>
                      <span class="text-dark-75 font-weight-bolder font-size-lg">
                        {{ audit.items_count || 0 }}
                      </span>
                    </td>
                    <td>
                      <span :class="getStatusClass(audit.status)">
                        {{ audit.status }}
                      </span>
                    </td>
                    <td>
                      <span class="text-dark-75 font-weight-bolder font-size-lg">
                        {{ audit.discrepancy_count || 0 }}
                      </span>
                    </td>
                    <td class="pr-0 text-right">
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                          @click="viewAudit(audit)"
                          title="View"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                          v-if="audit.status === 'Pending'"
                          class="btn btn-icon btn-light btn-hover-info btn-sm mx-1"
                          @click="startAudit(audit)"
                          title="Start"
                        >
                          <i class="fas fa-play"></i>
                        </button>
                        <button
                          v-if="audit.status === 'In Progress'"
                          class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                          @click="completeAudit(audit)"
                          title="Complete"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button
                          v-if="audit.status === 'Completed'"
                          class="btn btn-icon btn-light btn-hover-warning btn-sm mx-1"
                          @click="approveAudit(audit)"
                          title="Approve"
                        >
                          <i class="fas fa-thumbs-up"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Discrepancies View -->
      <div v-show="activeView === 'discrepancies'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-exclamation-triangle text-warning mr-2"></i>
              Stock Discrepancies
            </h4>
            <div class="card-toolbar">
              <button
                class="btn btn-warning btn-sm font-weight-bold"
                @click="exportDiscrepancies()"
              >
                <i class="fas fa-download mr-2"></i>Export
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Similar table structure for discrepancies -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <p class="font-size-lg">Stock discrepancies</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports View -->
      <div v-show="activeView === 'reports'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-chart-bar text-success mr-2"></i>
              Audit Reports
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-success btn-sm font-weight-bold" @click="exportReport()">
                <i class="fas fa-download mr-2"></i>Export Report
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Report filters and charts -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-chart-bar fa-3x mb-3"></i>
                <p class="font-size-lg">Audit analytics</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Audit Modal -->
    <b-modal v-model="showModal" :title="modalTitle" size="lg" hide-footer class="audit-modal">
      <div class="p-4">
        <form @submit.prevent="saveAudit">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user text-primary mr-2"></i>
                  Auditor
                </label>
                <v-select
                  v-model="formData.auditor_id"
                  :options="availableAuditors"
                  label="name"
                  :reduce="auditor => auditor.id"
                  placeholder="Select auditor..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-calendar-alt text-success mr-2"></i>
                  Audit Date
                </label>
                <input
                  type="date"
                  v-model="formData.audit_date"
                  class="form-control form-control-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-warehouse text-info mr-2"></i>
                  Location
                </label>
                <select v-model="formData.location" class="form-control form-control-lg" required>
                  <option value="">Select location</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Store">Store</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-tag text-warning mr-2"></i>
                  Audit Type
                </label>
                <select v-model="formData.audit_type" class="form-control form-control-lg" required>
                  <option value="">Select type</option>
                  <option value="Full">Full Audit</option>
                  <option value="Random">Random Sample</option>
                  <option value="Cycle">Cycle Count</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-comment text-muted mr-2"></i>
              Audit Notes
            </label>
            <textarea
              v-model="formData.notes"
              class="form-control"
              rows="3"
              placeholder="Additional notes for this audit..."
            ></textarea>
          </div>

          <div class="text-right mt-4">
            <button
              type="button"
              class="btn btn-light-secondary btn-lg mr-3"
              @click="showModal = false"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary btn-lg" :disabled="isSubmitting">
              <i class="fas fa-save mr-2"></i>
              {{ isSubmitting ? 'Saving...' : 'Save Audit' }}
            </button>
          </div>
        </form>
      </div>
    </b-modal>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
  name: 'StockAuditManager',
  components: { vSelect },
  data() {
    return {
      activeView: 'audits',
      showModal: false,
      isSubmitting: false,
      editingAudit: null,
      stats: {},
      audits: [],
      filters: {
        status: '',
        dateFrom: '',
        dateTo: '',
        search: '',
      },
      formData: {
        auditor_id: null,
        audit_date: null,
        location: '',
        audit_type: '',
        notes: '',
      },
      availableAuditors: [
        { id: 1, name: 'John Doe', role: 'Pharmacist' },
        { id: 2, name: 'Jane Smith', role: 'Store Manager' },
        { id: 3, name: 'Mike Johnson', role: 'Inventory Specialist' },
      ],
    };
  },
  computed: {
    modalTitle() {
      if (this.editingAudit) {
        return 'Edit Stock Audit';
      }
      return 'Create New Stock Audit';
    },
  },
  methods: {
    setActiveView(view) {
      this.activeView = view;
      if (view === 'audits') {
        this.loadAudits();
      }
    },

    getStatusClass(status) {
      const classes = {
        Pending: 'label label-lg label-light-warning label-inline',
        'In Progress': 'label label-lg label-light-info label-inline',
        Completed: 'label label-lg label-light-success label-inline',
        Approved: 'label label-lg label-light-primary label-inline',
        Rejected: 'label label-lg label-light-danger label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    openCreateModal() {
      this.editingAudit = null;
      this.resetForm();
      this.showModal = true;
    },

    resetForm() {
      this.formData = {
        auditor_id: null,
        audit_date: null,
        location: '',
        audit_type: '',
        notes: '',
      };
    },

    async saveAudit() {
      this.isSubmitting = true;
      try {
        if (this.editingAudit) {
          await this.$store.dispatch('stockAudit/updateStockAudit', {
            id: this.editingAudit.id,
            ...this.formData,
          });
        } else {
          await this.$store.dispatch('stockAudit/createStockAudit', this.formData);
        }

        this.showModal = false;
        this.loadAudits();
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Audit saved successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to save audit',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async loadAudits() {
      try {
        await this.$store.dispatch('stockAudit/getStockAudits', this.filters);
        this.audits = this.$store.getters['stockAudit/getStockAudits'];
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load audits',
          type: 'error',
        });
      }
    },

    async startAudit(audit) {
      if (confirm('Are you sure you want to start this audit?')) {
        try {
          await this.$store.dispatch('stockAudit/startStockAudit', {
            id: audit.id,
            startData: { started_by: this.$store.state.auth.user?.id },
          });
          this.loadAudits();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Audit started successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to start audit',
            type: 'error',
          });
        }
      }
    },

    async completeAudit(audit) {
      if (confirm('Are you sure you want to complete this audit?')) {
        try {
          await this.$store.dispatch('stockAudit/completeStockAudit', {
            id: audit.id,
            completeData: { completed_by: this.$store.state.auth.user?.id },
          });
          this.loadAudits();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Audit completed successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to complete audit',
            type: 'error',
          });
        }
      }
    },

    async approveAudit(audit) {
      if (confirm('Are you sure you want to approve this audit?')) {
        try {
          await this.$store.dispatch('stockAudit/approveStockAudit', {
            id: audit.id,
            approvalData: { approved_by: this.$store.state.auth.user?.id },
          });
          this.loadAudits();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Audit approved successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to approve audit',
            type: 'error',
          });
        }
      }
    },

    viewAudit(audit) {
      // Navigate to audit details
      this.$router.push(`/stock-audit/${audit.id}`);
    },

    async exportReport() {
      try {
        await this.$store.dispatch('stockAudit/exportStockAuditReport', this.filters);
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Report exported successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to export report',
          type: 'error',
        });
      }
    },

    async exportDiscrepancies() {
      try {
        await this.$store.dispatch('stockAudit/exportStockAuditReport', {
          ...this.filters,
          type: 'discrepancies',
        });
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Discrepancies exported successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to export discrepancies',
          type: 'error',
        });
      }
    },
  },

  created() {
    this.loadAudits();
  },
};
</script>

<style scoped>
.stock-audit-manager {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem;
}

.view-content {
  margin-top: 1rem;
}

.view-pane {
  animation: fadeIn 0.3s ease-in-out;
}

.audit-row {
  transition: all 0.2s ease;
}

.audit-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-group .btn.active {
  background-color: #3699ff;
  border-color: #3699ff;
  color: white;
}

.audit-modal .modal-content {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-label {
  color: #3f4254;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #e1e3ea;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #3699ff;
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
}

.v-select {
  border: 1px solid #e1e3ea;
  border-radius: 0.5rem;
}

.v-select:focus-within {
  border-color: #3699ff;
  box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
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

.symbol-40 {
  width: 2.5rem;
  height: 2.5rem;
}

.symbol-50 {
  width: 3rem;
  height: 3rem;
}

.symbol-light-primary {
  background-color: #e1f0ff;
}

.symbol-light-success {
  background-color: #e8f5e8;
}

.symbol-light-info {
  background-color: #e1f7ff;
}

.symbol-light-warning {
  background-color: #fff4de;
}

.symbol-light-danger {
  background-color: #ffeaea;
}

.symbol-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.label {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.label-light-warning {
  background-color: #fff4de;
  color: #ffc107;
}

.label-light-info {
  background-color: #e1f7ff;
  color: #0dcaf0;
}

.label-light-success {
  background-color: #e8f5e8;
  color: #28a745;
}

.label-light-primary {
  background-color: #e1f0ff;
  color: #3699ff;
}

.label-light-danger {
  background-color: #ffeaea;
  color: #dc3545;
}

.bg-light-warning {
  background-color: #fff4de !important;
}

.bg-light-info {
  background-color: #e1f7ff !important;
}

.bg-light-success {
  background-color: #e8f5e8 !important;
}

.bg-light-danger {
  background-color: #ffeaea !important;
}
</style>
