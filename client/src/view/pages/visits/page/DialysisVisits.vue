<template>
  <div class="dialysis-visits">
    <!-- Header Section -->
    <div class="card card-custom gutter-b mb-8">
      <div class="card-header border-0 py-5">
        <div class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark font-size-h3">
            <i class="fas fa-kidney text-primary mr-3"></i>
            Dialysis Visits Management
          </span>
          <span class="text-muted mt-2 font-weight-normal">
            Manage dialysis visits, patient scheduling, and treatment coordination
          </span>
        </div>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'visits' }"
              @click="setActiveView('visits')"
            >
              <i class="fas fa-calendar-check mr-2"></i>All Visits
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'today' }"
              @click="setActiveView('today')"
            >
              <i class="fas fa-calendar-day mr-2"></i>Today's Visits
            </button>
            <button
              class="btn btn-light-primary btn-sm font-weight-bold"
              :class="{ active: activeView === 'scheduled' }"
              @click="setActiveView('scheduled')"
            >
              <i class="fas fa-clock mr-2"></i>Scheduled
            </button>
          </div>
          <button class="btn btn-success btn-sm font-weight-bold ml-3" @click="openCreateModal">
            <i class="fas fa-plus mr-2"></i>New Dialysis Visit
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-8">
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-success mr-4">
                <span class="symbol-label">
                  <i class="fas fa-users text-success"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h3">
                  {{ stats.totalVisits }}
                </div>
                <div class="text-muted font-size-sm">Total Dialysis Visits</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-primary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-primary mr-4">
                <span class="symbol-label">
                  <i class="fas fa-calendar-day text-primary"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h3">
                  {{ stats.todayVisits }}
                </div>
                <div class="text-muted font-size-sm">Today's Visits</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-warning mr-4">
                <span class="symbol-label">
                  <i class="fas fa-clock text-warning"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h3">
                  {{ stats.scheduledVisits }}
                </div>
                <div class="text-muted font-size-sm">Scheduled Visits</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card card-custom bg-light-info">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="symbol symbol-50 symbol-light-info mr-4">
                <span class="symbol-label">
                  <i class="fas fa-procedures text-info"></i>
                </span>
              </div>
              <div>
                <div class="text-dark-75 font-weight-bolder font-size-h3">
                  {{ stats.activeTreatments }}
                </div>
                <div class="text-muted font-size-sm">Active Treatments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Views -->
    <div class="view-content">
      <!-- Reusable Table Component -->
      <div class="card card-custom gutter-b">
        <div class="card-header border-0 py-4">
          <h4 class="card-title font-weight-bolder text-dark">
            <i :class="tableConfig.icon + ' mr-2'"></i>
            {{ tableConfig.title }}
          </h4>
          <div class="card-toolbar" v-if="tableConfig.showFilter">
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <select v-model="visitFilter" class="form-control form-control-sm">
                  <option value="all">All Visits</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Ended">Ended</option>
                </select>
              </div>
              <button class="btn btn-light-primary btn-sm" @click="refreshVisits">
                <i class="fas fa-sync-alt mr-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
        <div class="card-body py-0">
          <div class="table-responsive">
            <table class="table table-head-custom table-vertical-center">
              <thead>
                <tr class="text-left">
                  <th class="pl-4" style="min-width: 200px">
                    <span class="text-dark-75 font-weight-bolder">Patient</span>
                  </th>
                  <th v-if="tableConfig.columns.includes('date')" style="min-width: 120px">
                    <span class="text-dark-75 font-weight-bolder">Visit Date</span>
                  </th>
                  <th v-if="tableConfig.columns.includes('time')" style="min-width: 120px">
                    <span class="text-dark-75 font-weight-bolder">Time</span>
                  </th>
                  <th v-if="tableConfig.columns.includes('status')" style="min-width: 100px">
                    <span class="text-dark-75 font-weight-bolder">Status</span>
                  </th>
                  <th v-if="tableConfig.columns.includes('priority')" style="min-width: 120px">
                    <span class="text-dark-75 font-weight-bolder">Priority</span>
                  </th>
                  <th class="pr-0 text-right" style="min-width: 120px">
                    <span class="text-dark-75 font-weight-bolder">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="tableConfig.data.length === 0">
                  <td :colspan="tableConfig.columns.length + 1" class="text-center py-8">
                    <div class="text-muted">
                      <i :class="getEmptyStateIcon() + ' fa-3x mb-3'"></i>
                      <p class="font-size-lg">{{ getEmptyStateMessage() }}</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="visit in tableConfig.data" :key="visit.id" class="visit-row">
                  <!-- Patient Cell -->
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
                          {{ visit.patient?.fullname || 'Unknown Patient' }}
                        </span>
                        <span class="text-muted d-block font-size-sm">
                          {{ visit.patient?.hospital_id || visit.patient_id }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Date Cell -->
                  <td v-if="tableConfig.columns.includes('date')">
                    <span class="text-dark-75 font-weight-bolder font-size-lg">
                      {{ formatDate(visit.date_visit_start || visit.scheduled_date) }}
                    </span>
                  </td>

                  <!-- Time Cell -->
                  <td v-if="tableConfig.columns.includes('time')">
                    <span class="text-dark-75 font-weight-bolder font-size-lg">
                      {{ formatTime(visit.date_visit_start || visit.scheduled_time) }}
                    </span>
                  </td>

                  <!-- Status Cell -->
                  <td v-if="tableConfig.columns.includes('status')">
                    <span :class="getStatusClass(visit.status)">
                      {{ visit.status || 'Unknown' }}
                    </span>
                  </td>

                  <!-- Priority Cell -->
                  <td v-if="tableConfig.columns.includes('priority')">
                    <span :class="getPriorityClass(visit.priority)">
                      {{ visit.priority || 'Routine' }}
                    </span>
                  </td>

                  <!-- Actions Cell -->
                  <td class="pr-0 text-right">
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                        @click="viewVisit(visit)"
                        title="View Details"
                      >
                        <i class="fas fa-eye"></i>
                      </button>

                      <!-- Edit Button (show for all views except today) -->
                      <!-- <button
                        v-if="activeView !== 'today'"
                        class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                        @click="editVisit(visit)"
                        title="Edit"
                      >
                        <i class="fas fa-edit"></i>
                      </button> -->

                      <!-- Treatment Button (show for ongoing visits) -->
                      <!-- <button
                        v-if="visit.status === 'Ongoing'"
                        class="btn btn-icon btn-light btn-hover-info btn-sm mx-1"
                        @click="startTreatment(visit)"
                        title="Manage Treatment"
                      >
                        <i class="fas fa-procedures"></i>
                      </button> -->

                      <!-- Cancel Button (only for scheduled view) -->
                      <button
                        v-if="activeView === 'scheduled'"
                        class="btn btn-icon btn-light btn-hover-danger btn-sm mx-1"
                        @click="cancelVisit(visit)"
                        title="Cancel"
                      >
                        <i class="fas fa-times"></i>
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

    <!-- Create/Edit Modal -->
    <b-modal v-model="showModal" :title="modalTitle" size="lg" hide-footer class="dialysis-modal">
      <div class="p-4">
        <form @submit.prevent="saveVisit">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user text-primary mr-2"></i>
                  Patient
                </label>
                <v-select
                  v-model="formData.patient_id"
                  :options="storePatients"
                  label="fullname"
                  :reduce="patient => patient.id"
                  placeholder="Select patient..."
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-calendar-alt text-success mr-2"></i>
                  Visit Date
                </label>
                <input
                  type="date"
                  v-model="formData.visit_date"
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
                  <i class="fas fa-exclamation-triangle text-warning mr-2"></i>
                  Priority Level
                </label>
                <select v-model="formData.priority" class="form-control form-control-lg" required>
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-comment text-muted mr-2"></i>
                  Reception Notes
                </label>
                <textarea
                  v-model="formData.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Any notes from reception (e.g., patient request, special instructions)..."
                ></textarea>
              </div>
            </div>
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
              {{ isSubmitting ? 'Saving...' : 'Save Visit' }}
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
  name: 'DialysisVisits',
  components: {
    vSelect,
  },
  data() {
    return {
      activeView: 'visits',
      showModal: false,
      isSubmitting: false,
      editingVisit: null,
      visitFilter: 'all',
      formData: {
        patient_id: null,
        visit_date: null,
        priority: 'Routine',
        notes: '',
      },
      stats: {
        totalVisits: 0,
        todayVisits: 0,
        scheduledVisits: 0,
        activeTreatments: 0,
      },
    };
  },
  computed: {
    modalTitle() {
      if (this.editingVisit) {
        return 'Edit Dialysis Visit';
      }
      return 'New Dialysis Visit';
    },
    // Get visits from store using the proper category visits pattern
    visits() {
      return this.$store.state.visit.categoryVisits;
    },
    // Filter visits based on current view
    filteredVisits() {
      if (this.visitFilter === 'all') return this.visits;
      return this.visits.filter(visit => visit.status === this.visitFilter);
    },
    // Today's visits
    todayVisits() {
      const today = new Date().toISOString().split('T')[0];
      return this.visits.filter(visit => {
        const visitDate = visit.date_visit_start || visit.visit_date;
        return new Date(visitDate).toISOString().split('T')[0] === today;
      });
    },
    // Scheduled visits (actually ongoing visits that are "scheduled" for today)
    scheduledVisits() {
      return this.visits.filter(visit => visit.status === 'Ongoing');
    },
    // Get patients from store
    storePatients() {
      return this.$store.state.patient.patients || [];
    },
    // Table configuration for different views
    tableConfig() {
      const configs = {
        visits: {
          title: 'All Dialysis Visits',
          icon: 'fas fa-calendar-check text-success',
          data: this.filteredVisits,
          columns: ['patient', 'date', 'status', 'priority', 'actions'],
          showFilter: true,
        },
        today: {
          title: "Today's Dialysis Visits",
          icon: 'fas fa-calendar-day text-primary',
          data: this.todayVisits,
          columns: ['patient', 'time', 'status', 'priority', 'actions'],
          showFilter: false,
        },
        scheduled: {
          title: 'Scheduled Dialysis Visits',
          icon: 'fas fa-clock text-warning',
          data: this.scheduledVisits,
          columns: ['patient', 'date', 'priority', 'actions'],
          showFilter: false,
        },
      };
      return configs[this.activeView] || configs.visits;
    },
  },
  methods: {
    setActiveView(view) {
      this.activeView = view;
      this.loadViewData();
    },

    getStatusClass(status) {
      const classes = {
        Ongoing: 'label label-lg label-light-warning label-inline',
        Ended: 'label label-lg label-light-success label-inline',
      };
      return classes[status] || 'label label-lg label-light-dark label-inline';
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },

    formatTime(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getPriorityClass(priority) {
      const classes = {
        Routine: 'label label-lg label-light-success label-inline',
        Urgent: 'label label-lg label-light-warning label-inline',
        Emergency: 'label label-lg label-light-danger label-inline',
      };
      return classes[priority] || 'label label-lg label-light-dark label-inline';
    },

    openCreateModal() {
      this.editingVisit = null;
      this.resetForm();
      this.showModal = true;
    },

    editVisit(visit) {
      this.editingVisit = visit;
      this.formData = {
        patient_id: visit.patient_id,
        visit_date: new Date(visit.date_visit_start || visit.visit_date)
          .toISOString()
          .split('T')[0],
        priority: visit.priority || 'Routine',
        notes: visit.notes || '',
      };
      this.showModal = true;
    },

    resetForm() {
      this.formData = {
        patient_id: null,
        visit_date: new Date().toISOString().split('T')[0],
        priority: 'Routine',
        notes: '',
      };
    },

    async saveVisit() {
      this.isSubmitting = true;
      try {
        // Create visit data following the established pattern
        const visitData = {
          category: 'Dialysis',
          type: 'New visit',
          date_of_visit: new Date(this.formData.visit_date + ' ' + '00:00:00'), // Assuming time is 00:00:00 for new visits
          priority: this.formData.priority,
          department: 'Nephrology',
          professional: 'Nephrologist',
          patient_id: this.formData.patient_id,
          service_id: null,
          // Additional dialysis-specific data
          notes: this.formData.notes,
        };

        if (this.editingVisit) {
          // Update existing visit
          await this.$store.dispatch('visit/updateVisit', {
            id: this.editingVisit.id,
            data: visitData,
          });
        } else {
          // Create new visit
          await this.$store.dispatch('visit/addVisit', visitData);
        }

        this.showModal = false;
        this.loadViewData();
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: `Dialysis visit ${this.editingVisit ? 'updated' : 'created'} successfully`,
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || `Failed to ${this.editingVisit ? 'update' : 'create'} visit`,
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    viewVisit(visit) {
      // Navigate to dialysis consultation page
      this.$router.push(`/visit/dialysis-consultation/${visit.id}`);
    },

    startTreatment(visit) {
      // Navigate to dialysis treatment management page
      this.$router.push(`/consultation/${visit.id}?tab=treatmentData`);
    },

    async cancelVisit(visit) {
      if (confirm('Are you sure you want to cancel this visit?')) {
        try {
          await this.$store.dispatch('visit/updateVisit', {
            id: visit.id,
            data: { status: 'Cancelled' },
          });
          this.loadViewData();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Visit cancelled successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to cancel visit',
            type: 'error',
          });
        }
      }
    },

    refreshVisits() {
      this.loadViewData();
    },

    loadViewData() {
      // Load dialysis category visits using the proper service
      this.$store.dispatch('visit/fetchCategoryVisits', {
        filter: { category: 'Dialysis' },
        currentPage: 1,
        itemsPerPage: 50, // Reasonable page size for listing
      });
    },

    loadPatients() {
      // Load patients for the modal
      this.$store.dispatch('patient/fetchPatients', {
        currentPage: 1,
        itemsPerPage: 100, // Reasonable limit for patient selection
        search: '',
      });
    },

    loadStats() {
      // Calculate stats from loaded visits
      this.stats = {
        totalVisits: this.visits.length,
        todayVisits: this.todayVisits.length,
        scheduledVisits: this.visits.filter(v => v.status === 'Ongoing').length,
        activeTreatments: this.visits.filter(v => v.status === 'Ongoing').length,
      };
    },

    getEmptyStateMessage() {
      if (this.activeView === 'today') {
        return 'No visits scheduled for today';
      } else if (this.activeView === 'scheduled') {
        return 'No scheduled visits';
      }
      return 'No dialysis visits found';
    },

    getEmptyStateIcon() {
      if (this.activeView === 'today') {
        return 'fas fa-calendar-day';
      } else if (this.activeView === 'scheduled') {
        return 'fas fa-clock';
      }
      return 'fas fa-inbox';
    },
  },

  created() {
    this.loadPatients();
    this.loadViewData();
  },

  watch: {
    visits: {
      handler() {
        this.loadStats();
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.dialysis-visits {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem;
}

.view-content {
  margin-top: 1rem;
}

.visit-row {
  transition: all 0.2s ease;
}

.visit-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
