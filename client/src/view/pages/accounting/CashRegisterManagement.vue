<template>
  <div class="cash-register-management">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Cash Register Management</h2>
      <b-button variant="primary" @click="showCreateModal = true">
        <i class="fas fa-plus mr-2"></i>Create Cash Register
      </b-button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label>Status</label>
            <b-form-select v-model="filters.status" :options="statusOptions" clearable />
          </div>
          <div class="col-md-3">
            <label>Location</label>
            <b-form-input v-model="filters.location" placeholder="Search by location" />
          </div>
          <div class="col-md-3">
            <label>&nbsp;</label>
            <div>
              <b-button variant="outline-secondary" @click="clearFilters">
                <i class="fas fa-times mr-2"></i>Clear
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Registers Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Current Balance</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="register in cashRegisters" :key="register.id">
                <td>
                  <strong>{{ register.register_code }}</strong>
                </td>
                <td>{{ register.register_name }}</td>
                <td>{{ register.location || 'N/A' }}</td>
                <td>
                  <b-badge :variant="getStatusVariant(register.status)">
                    {{ register.status }}
                  </b-badge>
                </td>
                <td>
                  <span class="font-weight-bold text-success">
                    ₦{{ formatCurrency(register.current_balance) }}
                  </span>
                </td>
                <td>
                  <span v-if="register.assignedStaff">
                    {{ register.assignedStaff.firstname }} {{ register.assignedStaff.lastname }}
                  </span>
                  <span v-else class="text-muted">Not assigned</span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <b-button
                      v-if="register.status === 'CLOSED'"
                      size="sm"
                      variant="success"
                      @click="openRegister(register)"
                      title="Open Register"
                    >
                      <i class="fas fa-door-open"></i>
                    </b-button>
                    <b-button
                      v-if="register.status === 'OPEN'"
                      size="sm"
                      variant="warning"
                      @click="closeRegister(register)"
                      title="Close Register"
                    >
                      <i class="fas fa-door-closed"></i>
                    </b-button>
                    <b-button
                      size="sm"
                      variant="info"
                      @click="viewSummary(register)"
                      title="View Summary"
                    >
                      <i class="fas fa-chart-bar"></i>
                    </b-button>
                    <b-button
                      size="sm"
                      variant="primary"
                      @click="editRegister(register)"
                      title="Edit Register"
                    >
                      <i class="fas fa-edit"></i>
                    </b-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.total > 0"
          class="d-flex justify-content-between align-items-center mt-3"
        >
          <div>
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} entries
          </div>
          <b-pagination
            v-model="pagination.currentPage"
            :total-rows="pagination.total"
            :per-page="pagination.perPage"
            @change="loadCashRegisters"
          />
        </div>

        <!-- Empty State -->
        <div v-if="cashRegisters.length === 0 && !loading" class="text-center py-5">
          <i class="fas fa-cash-register fa-3x text-muted mb-3"></i>
          <h4 class="text-muted">No Cash Registers Found</h4>
          <p class="text-muted">Create your first cash register to get started.</p>
          <b-button variant="primary" @click="showCreateModal = true">
            Create Cash Register
          </b-button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <b-modal
      v-model="showCreateModal"
      :title="editingRegister ? 'Edit Cash Register' : 'Create Cash Register'"
      size="lg"
      @ok="saveRegister"
      @cancel="resetForm"
    >
      <b-form @submit.prevent="saveRegister">
        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Register Code" label-for="register_code">
              <b-form-input
                id="register_code"
                v-model="registerForm.register_code"
                :disabled="editingRegister"
                required
                placeholder="e.g., REG001"
              />
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Register Name" label-for="register_name">
              <b-form-input
                id="register_name"
                v-model="registerForm.register_name"
                required
                placeholder="e.g., Main Cash Register"
              />
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Location" label-for="location">
              <b-form-input
                id="location"
                v-model="registerForm.location"
                placeholder="e.g., Reception, Pharmacy"
              />
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Assigned Staff" label-for="assigned_staff_id">
              <v-select
                v-model="registerForm.assigned_staff_id"
                :options="staffOptions"
                label="text"
                :reduce="(staff) => staff.value"
                placeholder="Search for staff member..."
                @search="searchStaff"
                required
              >
                <template #no-options> Type to search for staff members... </template>
              </v-select>
              <small class="form-text text-muted">
                <i class="fas fa-search mr-1"></i>Type to search by name, employee ID, or department
              </small>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <b-form-group label="Minimum Balance" label-for="minimum_balance">
              <b-form-input
                id="minimum_balance"
                v-model="registerForm.minimum_balance"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group label="Maximum Balance" label-for="maximum_balance">
              <b-form-input
                id="maximum_balance"
                v-model="registerForm.maximum_balance"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </b-form-group>
          </div>
        </div>

        <b-form-group label="Description" label-for="description">
          <b-form-textarea
            id="description"
            v-model="registerForm.description"
            rows="3"
            placeholder="Optional description of the register's purpose"
          />
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="resetForm">Cancel</b-button>
        <b-button variant="primary" @click="saveRegister" :disabled="saving">
          <span v-if="saving"> <i class="fas fa-spinner fa-spin mr-2"></i>Saving... </span>
          <span v-else>{{ editingRegister ? 'Update' : 'Create' }}</span>
        </b-button>
      </template>
    </b-modal>

    <!-- Open Register Modal -->
    <b-modal v-model="showOpenModal" title="Open Cash Register" @ok="confirmOpenRegister">
      <b-form-group label="Opening Amount" label-for="opening_amount">
        <b-form-input
          id="opening_amount"
          v-model="openingAmount"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="Enter opening cash amount"
        />
      </b-form-group>
    </b-modal>

    <!-- Close Register Modal -->
    <b-modal v-model="showCloseModal" title="Close Cash Register" @ok="confirmCloseRegister">
      <b-form-group label="Closing Amount" label-for="closing_amount">
        <b-form-input
          id="closing_amount"
          v-model="closingAmount"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="Enter closing cash amount"
        />
      </b-form-group>
    </b-modal>

    <!-- Summary Modal -->
    <b-modal v-model="showSummaryModal" title="Cash Register Summary" size="lg" scrollable>
      <div v-if="selectedRegisterSummary">
        <div class="row">
          <div class="col-md-6">
            <h5>Register Information</h5>
            <table class="table table-sm">
              <tr>
                <td><strong>Code:</strong></td>
                <td>{{ selectedRegisterSummary.register_code }}</td>
              </tr>
              <tr>
                <td><strong>Name:</strong></td>
                <td>{{ selectedRegisterSummary.register_name }}</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td>
                  <b-badge :variant="getStatusVariant(selectedRegisterSummary.status)">
                    {{ selectedRegisterSummary.status }}
                  </b-badge>
                </td>
              </tr>
              <tr>
                <td><strong>Current Balance:</strong></td>
                <td class="font-weight-bold text-success">
                  ₦{{ formatCurrency(selectedRegisterSummary.current_balance) }}
                </td>
              </tr>
            </table>
          </div>
          <div class="col-md-6">
            <h5>Today's Summary</h5>
            <table class="table table-sm">
              <tr>
                <td><strong>Opening Balance:</strong></td>
                <td>₦{{ formatCurrency(selectedRegisterSummary.opening_balance) }}</td>
              </tr>
              <tr>
                <td><strong>Cash Received:</strong></td>
                <td class="text-success">
                  ₦{{ formatCurrency(selectedRegisterSummary.total_cash_received) }}
                </td>
              </tr>
              <tr>
                <td><strong>Cash Disbursed:</strong></td>
                <td class="text-danger">
                  ₦{{ formatCurrency(selectedRegisterSummary.total_cash_disbursed) }}
                </td>
              </tr>
              <tr>
                <td><strong>Change Given:</strong></td>
                <td class="text-info">
                  ₦{{ formatCurrency(selectedRegisterSummary.total_change_given) }}
                </td>
              </tr>
              <tr>
                <td><strong>Transactions:</strong></td>
                <td>{{ selectedRegisterSummary.transaction_count }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';

export default {
  name: 'CashRegisterManagement',
  components: { vSelect },
  data() {
    return {
      loading: false,
      saving: false,
      cashRegisters: [],
      filters: {
        status: '',
        location: '',
      },
      pagination: {
        currentPage: 1,
        perPage: 10,
        total: 0,
        from: 0,
        to: 0,
      },
      showCreateModal: false,
      showOpenModal: false,
      showCloseModal: false,
      showSummaryModal: false,
      editingRegister: null,
      selectedRegister: null,
      selectedRegisterSummary: null,
      openingAmount: 0,
      closingAmount: 0,
      registerForm: {
        register_code: '',
        register_name: '',
        location: '',
        assigned_staff_id: null,
        minimum_balance: 0,
        maximum_balance: 1000000,
        description: '',
      },
      statusOptions: [
        { value: 'OPEN', text: 'Open' },
        { value: 'CLOSED', text: 'Closed' },
        { value: 'RECONCILED', text: 'Reconciled' },
      ],
      staffOptions: [],
    };
  },
  async mounted() {
    await this.loadCashRegisters();
    await this.loadStaffOptions();
  },
  methods: {
    async loadCashRegisters() {
      try {
        this.loading = true;
        const response = await this.$store.dispatch('accounting/getCashRegisters', {
          page: this.pagination.currentPage,
          limit: this.pagination.perPage,
          filters: this.filters,
        });

        this.cashRegisters = response.data || [];
        this.pagination.total = response.pagination?.total || 0;
        this.pagination.from = (this.pagination.currentPage - 1) * this.pagination.perPage + 1;
        this.pagination.to = Math.min(
          this.pagination.currentPage * this.pagination.perPage,
          this.pagination.total
        );
      } catch (error) {
        console.error('Error loading cash registers:', error);
        this.$bvToast.toast('Failed to load cash registers', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    async loadStaffOptions() {
      try {
        // Load initial staff options for assignment
        const response = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 200,
        });

        this.staffOptions = (response.data.data.docs || []).map((staff) => ({
          value: staff.id,
          text: `${staff.firstname} ${staff.lastname}`,
        }));
      } catch (error) {
        console.error('Error loading staff options:', error);
      }
    },

    searchStaff(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debouncedStaffSearch(search, this, loading);
      }
    },

    debouncedStaffSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('employee/fetchEmployees', {
          search,
          currentPage: 1,
          itemsPerPage: 200,
        })
        .then((response) => {
          vm.staffOptions = (response.data.data.docs || []).map((staff) => ({
            value: staff.id,
            text: `${staff.firstname} ${staff.lastname}`,
          }));
          loading(false);
        })
        .catch(() => loading(false));
    }, 500),

    clearFilters() {
      this.filters = {
        status: '',
        location: '',
      };
      this.pagination.currentPage = 1;
      this.loadCashRegisters();
    },

    editRegister(register) {
      this.editingRegister = register;
      this.registerForm = { ...register };
      this.showCreateModal = true;
    },

    resetForm() {
      this.editingRegister = null;
      this.registerForm = {
        register_code: '',
        register_name: '',
        location: '',
        assigned_staff_id: null,
        minimum_balance: 0,
        maximum_balance: 1000000,
        description: '',
      };
      this.showCreateModal = false;
    },

    async saveRegister() {
      try {
        this.saving = true;

        if (this.editingRegister) {
          await this.$store.dispatch('accounting/updateCashRegister', {
            id: this.editingRegister.id,
            data: this.registerForm,
          });
          this.$bvToast.toast('Cash register updated successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        } else {
          await this.$store.dispatch('accounting/createCashRegister', this.registerForm);
          this.$bvToast.toast('Cash register created successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
        }

        this.resetForm();
        await this.loadCashRegisters();
      } catch (error) {
        console.error('Error saving cash register:', error);
        this.$bvToast.toast(error.message || 'Failed to save cash register', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },

    openRegister(register) {
      this.selectedRegister = register;
      this.openingAmount = 0;
      this.showOpenModal = true;
    },

    async confirmOpenRegister() {
      try {
        await this.$store.dispatch('accounting/openCashRegister', {
          id: this.selectedRegister.id,
          opening_amount: this.openingAmount,
        });

        this.$bvToast.toast('Cash register opened successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.showOpenModal = false;
        await this.loadCashRegisters();
      } catch (error) {
        console.error('Error opening cash register:', error);
        this.$bvToast.toast(error.message || 'Failed to open cash register', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    closeRegister(register) {
      this.selectedRegister = register;
      this.closingAmount = register.current_balance;
      this.showCloseModal = true;
    },

    async confirmCloseRegister() {
      try {
        await this.$store.dispatch('accounting/closeCashRegister', {
          id: this.selectedRegister.id,
          closing_amount: this.closingAmount,
        });

        this.$bvToast.toast('Cash register closed successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.showCloseModal = false;
        await this.loadCashRegisters();
      } catch (error) {
        console.error('Error closing cash register:', error);
        this.$bvToast.toast(error.message || 'Failed to close cash register', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    async viewSummary(register) {
      try {
        const summary = await this.$store.dispatch(
          'accounting/getCashRegisterSummary',
          register.id
        );
        this.selectedRegisterSummary = summary.data;
        this.showSummaryModal = true;
      } catch (error) {
        console.error('Error loading register summary:', error);
        this.$bvToast.toast('Failed to load register summary', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    getStatusVariant(status) {
      switch (status) {
        case 'OPEN':
          return 'success';
        case 'CLOSED':
          return 'warning';
        case 'RECONCILED':
          return 'info';
        default:
          return 'secondary';
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG').format(amount || 0);
    },
  },
};
</script>

<style scoped>
.cash-register-management {
  padding: 20px;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

/* v-select styling to match Bootstrap-Vue */
.v-select {
  background-color: #fff;
}

.v-select .vs__dropdown-toggle {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  min-height: 38px;
}

.v-select .vs__dropdown-toggle:focus-within {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.v-select .vs__selected-options {
  padding: 0.375rem 0.75rem;
}

.v-select .vs__actions {
  padding: 0.375rem 0.75rem;
}

.v-select .vs__dropdown-menu {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.v-select .vs__dropdown-option {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #f8f9fa;
}

.v-select .vs__dropdown-option:hover {
  background-color: #f8f9fa;
}

.v-select .vs__dropdown-option--highlight {
  background-color: #007bff;
  color: white;
}
</style>
