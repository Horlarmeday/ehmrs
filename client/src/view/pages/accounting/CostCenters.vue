<template>
  <div class="cost-centers">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-building text-warning mr-3"></i>
          Cost Centers
        </h1>
        <p class="page-subtitle">
          Manage cost centers with budget allocation and performance tracking
        </p>
      </div>
      <div class="header-actions">
        <b-button variant="warning" @click="showCreateModal">
          <i class="fas fa-plus mr-2"></i>New Cost Center
        </b-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-warning text-white">
            <div class="summary-icon">
              <i class="fas fa-building"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ summaryData.totalCostCenters || 0 }}</h3>
              <p class="summary-label">Total Cost Centers</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-success text-white">
            <div class="summary-icon">
              <i class="fas fa-coins"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalBudget || 0) }}</h3>
              <p class="summary-label">Total Budget</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-info text-white">
            <div class="summary-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ formatCurrency(summaryData.totalExpenses || 0) }}</h3>
              <p class="summary-label">Total Expenses</p>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="summary-card bg-primary text-white">
            <div class="summary-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="summary-content">
              <h3 class="summary-value">{{ budgetUtilizationPercentage }}%</h3>
              <p class="summary-label">Budget Utilization</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cost Centers Table -->
    <div class="cost-centers-section">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-table mr-2"></i>
            Cost Centers Management
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="thead-light">
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th class="text-right">Budget</th>
                  <th class="text-right">Expenses</th>
                  <th class="text-right">Variance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="center in costCenters" :key="center.id">
                  <td>
                    <strong>{{ center.code }}</strong>
                  </td>
                  <td>{{ center.name }}</td>
                  <td>{{ center.department }}</td>
                  <td>{{ center.manager }}</td>
                  <td class="text-right">{{ formatCurrency(center.budget) }}</td>
                  <td class="text-right">{{ formatCurrency(center.expenses) }}</td>
                  <td class="text-right">
                    <span :class="getVarianceClass(center.variance)">
                      {{ formatCurrency(center.variance) }}
                    </span>
                  </td>
                  <td>
                    <b-badge :variant="getStatusVariant(center.status)">
                      {{ center.status }}
                    </b-badge>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <b-button variant="outline-info" size="sm" @click="viewCenter(center.id)">
                        <i class="fas fa-eye"></i>
                      </b-button>
                      <b-button variant="outline-warning" size="sm" @click="editCenter(center.id)">
                        <i class="fas fa-edit"></i>
                      </b-button>
                      <b-button variant="outline-danger" size="sm" @click="deleteCenter(center.id)">
                        <i class="fas fa-trash"></i>
                      </b-button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Edit Cost Center' : 'Create Cost Center'"
      size="lg"
      @ok="saveCostCenter"
      @hidden="resetForm"
    >
      <b-form @submit.prevent="saveCostCenter">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Code" label-for="center-code" required>
              <b-form-input
                id="center-code"
                v-model="centerForm.code"
                placeholder="Enter cost center code"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Name" label-for="center-name" required>
              <b-form-input
                id="center-name"
                v-model="centerForm.name"
                placeholder="Enter cost center name"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Department" label-for="center-department" required>
              <b-form-select
                id="center-department"
                v-model="centerForm.department"
                :options="departmentOptions"
                required
              ></b-form-select>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Manager" label-for="center-manager" required>
              <b-form-input
                id="center-manager"
                v-model="centerForm.manager"
                placeholder="Enter manager name"
                required
              ></b-form-input>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Budget" label-for="center-budget" required>
              <b-form-input
                id="center-budget"
                v-model="centerForm.budget"
                type="number"
                step="0.01"
                placeholder="Enter budget amount"
                required
              ></b-form-input>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Description" label-for="center-description">
              <b-form-textarea
                id="center-description"
                v-model="centerForm.description"
                placeholder="Enter description"
                rows="3"
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Status" label-for="center-status">
              <b-form-checkbox id="center-status" v-model="centerForm.is_active" switch>
                Active Cost Center
              </b-form-checkbox>
            </b-form-group>
          </div>
        </div>
      </b-form>
      <template #modal-footer>
        <b-button variant="secondary" @click="showModal = false">
          Cancel
        </b-button>
        <b-button variant="primary" @click="saveCostCenter" :disabled="saving">
          <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
          <span v-else>
            {{ isEditing ? 'Update Cost Center' : 'Create Cost Center' }}
          </span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'CostCenters',
  data() {
    return {
      // Modal
      showModal: false,
      isEditing: false,
      saving: false,

      // Form
      centerForm: {
        code: '',
        name: '',
        department: '',
        manager: '',
        budget: '',
        description: '',
        is_active: true,
      },

      // Options
      departmentOptions: [
        { value: '', text: 'Select Department' },
        { value: 'ADMINISTRATION', text: 'Administration' },
        { value: 'CLINICAL', text: 'Clinical Services' },
        { value: 'LABORATORY', text: 'Laboratory' },
        { value: 'PHARMACY', text: 'Pharmacy' },
        { value: 'RADIOLOGY', text: 'Radiology' },
        { value: 'NURSING', text: 'Nursing' },
        { value: 'EMERGENCY', text: 'Emergency' },
        { value: 'SURGERY', text: 'Surgery' },
        { value: 'FINANCE', text: 'Finance' },
        { value: 'IT', text: 'Information Technology' },
      ],
    };
  },
  computed: {
    costCenters() {
      return this.$store.getters['accounting/getCostCenters'] || [];
    },
    summaryData() {
      return this.$store.getters['accounting/getCostCentersSummary'] || {};
    },
    budgetUtilizationPercentage() {
      if (this.summaryData.totalBudget === 0) return 0;
      return ((this.summaryData.totalExpenses / this.summaryData.totalBudget) * 100).toFixed(2);
    },
  },
  async mounted() {
    await this.loadCostCenters();
  },
  methods: {
    async loadCostCenters() {
      try {
        await this.$store.dispatch('accounting/fetchCostCenters');
      } catch (error) {
        console.error('Failed to load cost centers:', error);
      }
    },

    // Modal actions
    showCreateModal() {
      this.isEditing = false;
      this.showModal = true;
    },

    editCenter(id) {
      const center = this.costCenters.find(c => c.id === id);
      if (center) {
        this.centerForm = { ...center };
        this.isEditing = true;
        this.showModal = true;
      }
    },

    async saveCostCenter() {
      try {
        this.saving = true;
        if (this.isEditing) {
          await this.$store.dispatch('accounting/updateCostCenter', {
            id: this.centerForm.id,
            data: this.centerForm,
          });
        } else {
          await this.$store.dispatch('accounting/createCostCenter', this.centerForm);
        }

        this.showModal = false;
        this.resetForm();
        await this.loadCostCenters();
        this.$bvToast.toast(`Cost center ${this.isEditing ? 'updated' : 'created'} successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Failed to save cost center:', error);
        this.$bvToast.toast('Failed to save cost center', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      this.centerForm = {
        code: '',
        name: '',
        department: '',
        manager: '',
        budget: '',
        description: '',
        is_active: true,
      };
      this.isEditing = false;
    },

    // Utility methods
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount || 0);
    },

    getStatusVariant(status) {
      const variants = {
        ACTIVE: 'success',
        INACTIVE: 'danger',
        SUSPENDED: 'warning',
      };
      return variants[status] || 'secondary';
    },

    getVarianceClass(variance) {
      if (variance === 0) return 'text-muted';
      return variance > 0 ? 'text-success' : 'text-danger';
    },

    // Action methods
    viewCenter(id) {
      this.$bvToast.toast(`View functionality coming soon ${id}`, {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    async deleteCenter(id) {
      try {
        await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this cost center?', {
          title: 'Confirm Deletion',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Delete',
          cancelTitle: 'Cancel',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        });

        await this.$store.dispatch('accounting/deleteCostCenter', id);
        await this.loadCostCenters();
        this.$bvToast.toast('Cost center deleted successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete cost center:', error);
          this.$bvToast.toast('Failed to delete cost center', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.cost-centers {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.summary-label {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

.cost-centers-section {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .cost-centers {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
