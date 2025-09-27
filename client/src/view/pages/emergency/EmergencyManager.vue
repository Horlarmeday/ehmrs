<template>
  <div class="emergency-manager">
    <!-- Header Section -->
    <div class="card card-custom gutter-b mb-8">
      <div class="card-header border-0 py-5">
        <div class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark font-size-h3">
            <i class="fas fa-ambulance text-danger mr-3"></i>
            Emergency Management
          </span>
          <span class="text-muted mt-2 font-weight-normal">
            Manage emergency triage, bed allocation, and patient care coordination
          </span>
        </div>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'dashboard' }"
              @click="setActiveView('dashboard')"
            >
              <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'triage' }"
              @click="setActiveView('triage')"
            >
              <i class="fas fa-user-injured mr-2"></i>Triage
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'beds' }"
              @click="setActiveView('beds')"
            >
              <i class="fas fa-bed mr-2"></i>Bed Management
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'patients' }"
              @click="setActiveView('patients')"
            >
              <i class="fas fa-users mr-2"></i>Patients
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'procedures' }"
              @click="setActiveView('procedures')"
            >
              <i class="fas fa-procedures mr-2"></i>Procedures
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency Statistics Cards -->
    <div class="row mb-8">
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
                  {{ stats.redPriority || 0 }}
                </div>
                <div class="text-muted font-size-sm">Red Priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6">
        <div class="card card-custom bg-light-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-warning mr-4">
                <span class="symbol-label">
                  <i class="fas fa-exclamation text-warning"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.orangePriority || 0 }}
                </div>
                <div class="text-muted font-size-sm">Orange Priority</div>
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
                  <i class="fas fa-info text-info"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h4">
                  {{ stats.yellowPriority || 0 }}
                </div>
                <div class="text-muted font-size-sm">Yellow Priority</div>
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
                  {{ stats.availableBeds || 0 }}
                </div>
                <div class="text-muted font-size-sm">Available Beds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Views -->
    <div class="view-content">
      <!-- Dashboard View -->
      <div v-show="activeView === 'dashboard'" class="view-pane fade show active">
        <div class="row">
          <!-- Active Emergencies -->
          <div class="col-lg-8">
            <div class="card card-custom gutter-b">
              <div class="card-header border-0 py-4">
                <h4 class="card-title font-weight-bolder text-dark">
                  <i class="fas fa-exclamation-triangle text-danger mr-2"></i>
                  Active Emergencies
                </h4>
                <div class="card-toolbar">
                  <button
                    class="btn btn-danger btn-sm font-weight-bold"
                    @click="openEmergencyModal()"
                  >
                    <i class="fas fa-plus mr-2"></i>New Emergency
                  </button>
                </div>
              </div>
              <div class="card-body py-0">
                <div class="table-responsive">
                  <table class="table table-head-custom table-vertical-center">
                    <thead>
                      <tr class="text-left">
                        <th class="pl-4" style="min-width: 120px">
                          <span class="text-dark-75 font-weight-bolder">Patient</span>
                        </th>
                        <th style="min-width: 100px">
                          <span class="text-dark-75 font-weight-bolder">Priority</span>
                        </th>
                        <th style="min-width: 120px">
                          <span class="text-dark-75 font-weight-bolder">Arrival Time</span>
                        </th>
                        <th style="min-width: 120px">
                          <span class="text-dark-75 font-weight-bolder">Bed</span>
                        </th>
                        <th style="min-width: 100px">
                          <span class="text-dark-75 font-weight-bolder">Status</span>
                        </th>
                        <th class="pr-0 text-right" style="min-width: 120px">
                          <span class="text-dark-75 font-weight-bolder">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="activeEmergencies.length === 0">
                        <td colspan="6" class="text-center py-8">
                          <div class="text-muted">
                            <i class="fas fa-ambulance fa-3x mb-3"></i>
                            <p class="font-size-lg">No active emergencies</p>
                            <p class="font-size-sm">Click "New Emergency" to register a patient</p>
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-for="emergency in activeEmergencies"
                        :key="emergency.id"
                        class="emergency-row"
                      >
                        <td class="pl-4">
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
                                {{ emergency.patient_name }}
                              </span>
                              <span class="text-muted d-block font-size-sm">{{
                                emergency.patient_id
                              }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span :class="getPriorityClass(emergency.priority)">
                            {{ emergency.priority }}
                          </span>
                        </td>
                        <td>
                          <span class="text-dark-75 font-weight-bolder d-block font-size-lg">
                            {{ formatTime(emergency.arrival_time) }}
                          </span>
                        </td>
                        <td>
                          <span class="text-dark-75 font-weight-bolder font-size-lg">
                            {{ emergency.bed_number || 'Unassigned' }}
                          </span>
                        </td>
                        <td>
                          <span :class="getStatusClass(emergency.status)">
                            {{ emergency.status }}
                          </span>
                        </td>
                        <td class="pr-0 text-right">
                          <div class="btn-group" role="group">
                            <button
                              class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                              @click="viewEmergency(emergency)"
                              title="View"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            <button
                              class="btn btn-icon btn-light btn-hover-info btn-sm mx-1"
                              @click="assignBed(emergency)"
                              title="Assign Bed"
                            >
                              <i class="fas fa-bed"></i>
                            </button>
                            <button
                              class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                              @click="updateStatus(emergency)"
                              title="Update Status"
                            >
                              <i class="fas fa-edit"></i>
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

          <!-- Bed Status -->
          <div class="col-lg-4">
            <div class="card card-custom gutter-b">
              <div class="card-header border-0 py-4">
                <h4 class="card-title font-weight-bolder text-dark">
                  <i class="fas fa-bed text-info mr-2"></i>
                  Bed Status
                </h4>
              </div>
              <div class="card-body py-0">
                <div class="bed-grid">
                  <div
                    v-for="bed in emergencyBeds"
                    :key="bed.id"
                    class="bed-item"
                    :class="getBedStatusClass(bed.status)"
                    @click="selectBed(bed)"
                  >
                    <div class="bed-number">{{ bed.bed_number }}</div>
                    <div class="bed-status">{{ bed.status }}</div>
                    <div v-if="bed.patient_name" class="bed-patient">{{ bed.patient_name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Triage View -->
      <div v-show="activeView === 'triage'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-user-injured text-warning mr-2"></i>
              Emergency Triage
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-warning btn-sm font-weight-bold" @click="openTriageModal()">
                <i class="fas fa-plus mr-2"></i>New Triage
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Triage table structure -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-user-injured fa-3x mb-3"></i>
                <p class="font-size-lg">Emergency triage management</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bed Management View -->
      <div v-show="activeView === 'beds'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-bed text-info mr-2"></i>
              Emergency Bed Management
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-info btn-sm font-weight-bold" @click="openBedModal()">
                <i class="fas fa-plus mr-2"></i>Add Bed
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Bed management table structure -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-bed fa-3x mb-3"></i>
                <p class="font-size-lg">Emergency bed management</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patients View -->
      <div v-show="activeView === 'patients'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-users text-primary mr-2"></i>
              Emergency Patients
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-primary btn-sm font-weight-bold" @click="exportPatients()">
                <i class="fas fa-download mr-2"></i>Export
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Patients table structure -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-users fa-3x mb-3"></i>
                <p class="font-size-lg">Emergency patient management</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Procedures View -->
      <div v-show="activeView === 'procedures'" class="view-pane fade">
        <div class="card card-custom gutter-b">
          <div class="card-header border-0 py-4">
            <h4 class="card-title font-weight-bolder text-dark">
              <i class="fas fa-procedures text-success mr-2"></i>
              Emergency Procedures
            </h4>
            <div class="card-toolbar">
              <button class="btn btn-success btn-sm font-weight-bold" @click="openProcedureModal()">
                <i class="fas fa-plus mr-2"></i>Add Procedure
              </button>
            </div>
          </div>
          <div class="card-body py-0">
            <!-- Procedures table structure -->
            <div class="text-center py-8">
              <div class="text-muted">
                <i class="fas fa-procedures fa-3x mb-3"></i>
                <p class="font-size-lg">Emergency procedures</p>
                <p class="font-size-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Emergency Modal -->
    <b-modal
      v-model="showEmergencyModal"
      title="New Emergency Patient"
      size="xl"
      hide-footer
      class="emergency-modal"
    >
      <emergency-visit-creator
        :available-patients="storePatients"
        :available-doctors="storeDoctors"
        @visit-created="onEmergencyVisitCreated"
        @close="showEmergencyModal = false"
      />
    </b-modal>
  </div>
</template>

<script>
import EmergencyVisitCreator from './EmergencyVisitCreator.vue';

export default {
  name: 'EmergencyManager',
  components: { EmergencyVisitCreator },
  data() {
    return {
      activeView: 'dashboard',
      showEmergencyModal: false,
      isSubmitting: false,
      stats: {},
      activeEmergencies: [],
      emergencyBeds: [],
      emergencyForm: {
        patient_name: '',
        patient_id: '',
        priority: '',
        contact_number: '',
        chief_complaint: '',
        initial_assessment: '',
      },
    };
  },
  computed: {
    // Get patients and employees from store
    storePatients() {
      return this.$store.state.patient.patients || [];
    },
    storeEmployees() {
      return this.$store.state.employee.employees || [];
    },
    storeDoctors() {
      return this.storeEmployees.filter(
        (emp) =>
          emp.department === 'Medical Practitioners' ||
          emp.role === 'General Practitioners' ||
          emp.role === 'Doctor'
      );
    },
  },
  methods: {
    setActiveView(view) {
      this.activeView = view;
      if (view === 'dashboard') {
        this.loadDashboardData();
      }
    },

    getPriorityClass(priority) {
      const classes = {
        Red: 'label label-lg label-light-danger label-inline',
        Orange: 'label label-lg label-light-warning label-inline',
        Yellow: 'label label-lg label-light-info label-inline',
        Green: 'label label-lg label-light-success label-inline',
        Blue: 'label label-lg label-light-primary label-inline',
      };
      return classes[priority] || 'label label-lg label-light-dark label-inline';
    },

    getStatusClass(status) {
      const classes = {
        Active: 'label label-lg label-light-danger label-inline',
        Stable: 'label label-lg label-light-success label-inline',
        Discharged: 'label label-lg label-light-primary label-inline',
        Transferred: 'label label-lg label-light-info label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    getBedStatusClass(status) {
      const classes = {
        Available: 'bed-available',
        Occupied: 'bed-occupied',
        Maintenance: 'bed-maintenance',
        Reserved: 'bed-reserved',
      };
      return classes[status] || 'bed-unknown';
    },

    formatTime(time) {
      return new Date(time).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    openEmergencyModal() {
      this.resetEmergencyForm();
      this.showEmergencyModal = true;
    },

    resetEmergencyForm() {
      this.emergencyForm = {
        patient_name: '',
        patient_id: '',
        priority: '',
        contact_number: '',
        chief_complaint: '',
        initial_assessment: '',
      };
    },

    async saveEmergency() {
      this.isSubmitting = true;
      try {
        await this.$store.dispatch('emergency/createEmergencyVisit', this.emergencyForm);

        this.showEmergencyModal = false;
        this.loadDashboardData();
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Emergency patient registered successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to register emergency patient',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async loadDashboardData() {
      try {
        await this.$store.dispatch('emergency/getEmergencyVisits', { status: 'Active' });
        await this.$store.dispatch('emergency/getEmergencyBeds');
        await this.$store.dispatch('emergency/getEmergencyStatistics');

        this.activeEmergencies = this.$store.getters['emergency/getActiveEmergencyVisits'];
        this.emergencyBeds = this.$store.getters['emergency/getEmergencyBeds'];
        this.stats = this.$store.getters['emergency/getEmergencyStatistics'] || {};
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to load dashboard data',
          type: 'error',
        });
      }
    },

    async loadAvailableData() {
      try {
        // Load patients and employees for the visit creator
        await this.$store.dispatch('patient/fetchPatients', {
          currentPage: 1,
          itemsPerPage: 1000,
          search: '',
          filter: {},
        });

        await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 1000,
          search: '',
          filter: {},
        });
      } catch (error) {
        console.error('Error loading available data:', error);
      }
    },

    viewEmergency(emergency) {
      // Navigate to emergency details
      this.$router.push(`/emergency/${emergency.id}`);
    },

    assignBed(emergency) {
      // Bed assignment logic
      console.log('Assign bed for:', emergency);
    },

    updateStatus(emergency) {
      // Status update logic
      console.log('Update status for:', emergency);
    },

    selectBed(bed) {
      // Bed selection logic
      console.log('Selected bed:', bed);
    },

    openTriageModal() {
      // Open triage modal
      console.log('Open triage modal');
    },

    openBedModal() {
      // Open bed management modal
      console.log('Open bed modal');
    },

    openProcedureModal() {
      // Open procedure modal
      console.log('Open procedure modal');
    },

    async exportPatients() {
      try {
        // Export logic
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Patient data exported successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to export patient data',
          type: 'error',
        });
      }
    },
    onEmergencyVisitCreated(newVisit) {
      this.showEmergencyModal = false;
      this.loadDashboardData();
      this.$notify({
        group: 'foo',
        title: 'Success',
        text: `Emergency visit for ${newVisit.patient_name} created successfully.`,
        type: 'success',
      });
    },
  },

  created() {
    this.loadAvailableData();
    this.loadDashboardData();
  },
};
</script>

<style scoped>
.emergency-manager {
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

.emergency-row {
  transition: all 0.2s ease;
}

.emergency-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-group .btn.active {
  background-color: #3699ff;
  border-color: #3699ff;
  color: white;
}

.emergency-modal .modal-content {
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

.label-light-danger {
  background-color: #ffeaea;
  color: #dc3545;
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

.bg-light-danger {
  background-color: #ffeaea !important;
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

.bed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.bed-item {
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.bed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bed-available {
  background-color: #e8f5e8;
  border-color: #28a745;
  color: #155724;
}

.bed-occupied {
  background-color: #ffeaea;
  border-color: #dc3545;
  color: #721c24;
}

.bed-maintenance {
  background-color: #fff4de;
  border-color: #ffc107;
  color: #856404;
}

.bed-reserved {
  background-color: #e1f0ff;
  border-color: #3699ff;
  color: #1e3a8a;
}

.bed-number {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.bed-status {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.bed-patient {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
