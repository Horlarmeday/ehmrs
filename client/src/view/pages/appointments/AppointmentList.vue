<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Appointments</h2>
        <p class="text-muted mb-0">Manage patient appointments and schedules</p>
      </div>
      <div>
        <b-button variant="primary" @click="showAppointmentForm">
          <i class="fas fa-plus mr-2"></i>
          New Appointment
        </b-button>
      </div>
    </div>

    <!-- Search and Filters Card -->
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-filter mr-2"></i>
          Search & Filter Appointments
        </h3>
        <div class="card-toolbar">
          <b-button
            variant="outline-secondary"
            size="sm"
            @click="clearFilters"
            v-if="hasActiveFilters"
          >
            <i class="fas fa-times mr-1"></i>
            Clear Filters
          </b-button>
        </div>
      </div>

      <div class="card-body">
        <div class="row">
          <!-- Search Input -->
          <div class="col-lg-4 col-md-6">
            <div class="form-group">
              <label>Search Appointments</label>
              <div class="input-group input-group-solid">
                <input
                  type="text"
                  class="form-control"
                  v-model="searchTerm"
                  @keypress.enter="performSearch"
                  placeholder="Patient name, doctor, or reason..."
                />
                <div class="input-group-append">
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="performSearch"
                    :disabled="loading"
                  >
                    <i class="fas fa-search" v-if="!loading"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Filter -->
          <div class="col-lg-3 col-md-6">
            <div class="form-group">
              <label>Appointment Date</label>
              <b-form-input
                type="date"
                v-model="filters.appointment_date"
                @change="applyFilters"
                class="form-control"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-lg-3 col-md-6">
            <div class="form-group">
              <label>Status</label>
              <b-form-select
                v-model="filters.status"
                :options="statusFilterOptions"
                @change="applyFilters"
                class="form-control"
              >
                <template #first>
                  <option value="">All Statuses</option>
                </template>
              </b-form-select>
            </div>
          </div>

          <!-- Type Filter -->
          <div class="col-lg-2 col-md-6">
            <div class="form-group">
              <label>Type</label>
              <b-form-select
                v-model="filters.type"
                :options="typeFilterOptions"
                @change="applyFilters"
                class="form-control"
              >
                <template #first>
                  <option value="">All Types</option>
                </template>
              </b-form-select>
            </div>
          </div>
        </div>

        <!-- Advanced Filters Toggle -->
        <div class="row">
          <div class="col-12">
            <b-button
              variant="link"
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="p-0 text-primary"
            >
              <i
                :class="showAdvancedFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
                class="mr-1"
              ></i>
              {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters
            </b-button>
          </div>
        </div>

        <!-- Advanced Filters -->
        <b-collapse v-model="showAdvancedFilters">
          <div class="row mt-3">
            <div class="col-lg-3 col-md-6">
              <div class="form-group">
                <label>Doctor</label>
                <v-select
                  v-model="filters.doctor_id"
                  :options="doctors"
                  label="fullname"
                  :reduce="(doctor) => doctor.id"
                  placeholder="Select Doctor"
                  @search="searchDoctors"
                  @input="applyFilters"
                >
                  <template #no-options>
                    <div class="text-muted">Type to search doctors...</div>
                  </template>
                </v-select>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="form-group">
                <label>Priority</label>
                <b-form-select
                  v-model="filters.priority"
                  :options="priorityFilterOptions"
                  @change="applyFilters"
                  class="form-control"
                >
                  <template #first>
                    <option value="">All Priorities</option>
                  </template>
                </b-form-select>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="form-group">
                <label>Date Range From</label>
                <b-form-input
                  type="date"
                  v-model="filters.start"
                  @change="applyFilters"
                  class="form-control"
                />
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="form-group">
                <label>Date Range To</label>
                <b-form-input
                  type="date"
                  v-model="filters.end"
                  @change="applyFilters"
                  class="form-control"
                />
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </div>

    <!-- Appointments List Card -->
    <div class="card card-custom">
      <!-- Card Header with Stats -->
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-calendar-alt mr-2"></i>
          Appointments List
          <span class="badge badge-primary badge-pill ml-2">{{ total }}</span>
        </h3>
        <div class="card-toolbar">
          <div class="btn-group mr-3" role="group">
            <b-dropdown variant="outline-primary" size="sm" text="Actions" right>
              <b-dropdown-item @click="exportAppointments">
                <i class="fas fa-download mr-2"></i>Export
              </b-dropdown-item>
              <b-dropdown-item @click="refreshAppointments">
                <i class="fas fa-sync mr-2"></i>Refresh
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading appointments...</p>
      </div>

      <!-- No Results State -->
      <div v-else-if="appointments.length === 0" class="card-body text-center py-5">
        <div class="empty-state">
          <i class="fas fa-calendar-times fa-4x text-muted mb-4"></i>
          <h5 class="text-muted">No appointments found</h5>
          <p class="text-muted">
            {{
              hasActiveFilters
                ? 'Try adjusting your search criteria'
                : 'Create your first appointment to get started'
            }}
          </p>
          <b-button variant="primary" @click="showAppointmentForm" v-if="!hasActiveFilters">
            <i class="fas fa-plus mr-2"></i>Create New Appointment
          </b-button>
        </div>
      </div>

      <!-- Appointments Table -->
      <div v-else class="card-body pt-0 pb-3">
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center table-head-bg">
            <thead>
              <tr class="text-uppercase">
                <th style="min-width: 150px">Patient</th>
                <th style="min-width: 120px">Doctor</th>
                <th style="min-width: 100px">Date & Time</th>
                <th style="min-width: 120px">Type</th>
                <th style="min-width: 200px">Reason</th>
                <th style="min-width: 100px">Status</th>
                <th style="min-width: 80px">Priority</th>
                <th style="min-width: 120px" class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in appointments" :key="appointment.id">
                <!-- Patient Info -->
                <td>
                  <div class="d-flex align-items-center">
                    <div class="patient-avatar mr-3">
                      <div class="symbol symbol-40">
                        <span class="symbol-label font-size-h5 font-weight-bold">
                          {{ getPatientInitials(appointment.patient) }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div class="text-dark-75 font-weight-bolder mb-1">
                        {{ appointment.patient?.fullname || 'Unknown Patient' }}
                      </div>
                      <div class="text-muted font-size-sm">
                        ID: {{ appointment.patient?.hospital_id || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Doctor Info -->
                <td>
                  <div class="text-dark-75 font-weight-bolder mb-1">
                    {{ appointment.doctor?.fullname || 'Unassigned' }}
                  </div>
                  <div class="text-muted font-size-sm">
                    {{ appointment.doctor?.role || 'Doctor' }}
                  </div>
                </td>

                <!-- Date & Time -->
                <td>
                  <div class="text-dark-75 font-weight-bolder mb-1">
                    {{ appointment.appointment_date | dayjs('MMM DD, YYYY') }}
                  </div>
                  <div class="text-muted font-size-sm">
                    {{ formatTime(appointment.appointment_time) }}
                  </div>
                </td>

                <!-- Appointment Type -->
                <td>
                  <span class="badge badge-pill" :class="getTypeClass(appointment.type)">
                    {{ getTypeText(appointment.type) }}
                  </span>
                </td>

                <!-- Reason -->
                <td>
                  <div class="text-dark-75">
                    {{ truncateText(appointment.reason_for_visit, 50) }}
                  </div>
                  <div
                    v-if="appointment.reason_for_visit?.length > 50"
                    class="text-muted font-size-sm"
                  >
                    <b-button
                      variant="link"
                      size="sm"
                      class="p-0"
                      @click="showFullReason(appointment)"
                    >
                      Read more
                    </b-button>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <span class="badge badge-pill" :class="getStatusClass(appointment.status)">
                    {{ appointment.status }}
                  </span>
                </td>

                <!-- Priority -->
                <td>
                  <span class="badge badge-pill" :class="getPriorityClass(appointment.priority)">
                    {{ appointment.priority || 'NORMAL' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <!-- Quick Actions -->
                    <b-button
                      v-if="
                        appointment.status === 'Scheduled' || appointment.status === 'Confirmed'
                      "
                      variant="success"
                      size="sm"
                      @click="checkInAppointment(appointment)"
                      v-b-tooltip.hover
                      title="Check In"
                    >
                      <i class="fas fa-sign-in-alt"></i>
                    </b-button>

                    <!-- More Actions Dropdown -->
                    <b-dropdown
                      size="sm"
                      variant="outline-primary"
                      toggle-class="btn-sm"
                      no-caret
                      right
                    >
                      <template v-slot:button-content>
                        <i class="fas fa-ellipsis-v"></i>
                      </template>

                      <!-- View Details -->
                      <b-dropdown-item @click="viewAppointment(appointment)">
                        <i class="fas fa-eye mr-2 text-primary"></i>View Details
                      </b-dropdown-item>

                      <!-- Edit Appointment -->
                      <b-dropdown-item
                        @click="editAppointment(appointment)"
                        v-if="canEditAppointment(appointment)"
                      >
                        <i class="fas fa-edit mr-2 text-info"></i>Edit
                      </b-dropdown-item>

                      <!-- Reschedule -->
                      <b-dropdown-item
                        @click="rescheduleAppointment(appointment)"
                        v-if="canRescheduleAppointment(appointment)"
                      >
                        <i class="fas fa-calendar-alt mr-2 text-warning"></i>Reschedule
                      </b-dropdown-item>

                      <!-- Confirm -->
                      <b-dropdown-item
                        @click="confirmAppointment(appointment)"
                        v-if="appointment.status === 'Scheduled'"
                      >
                        <i class="fas fa-check mr-2 text-success"></i>Confirm
                      </b-dropdown-item>

                      <b-dropdown-divider></b-dropdown-divider>

                      <!-- Cancel -->
                      <b-dropdown-item
                        @click="cancelAppointment(appointment)"
                        v-if="canCancelAppointment(appointment)"
                        class="text-danger"
                      >
                        <i class="fas fa-times mr-2 text-danger"></i>Cancel
                      </b-dropdown-item>

                      <!-- Mark No Show -->
                      <b-dropdown-item
                        @click="markNoShow(appointment)"
                        v-if="canMarkNoShow(appointment)"
                        class="text-danger"
                      >
                        <i class="fas fa-user-times mr-2 text-danger"></i>Mark No Show
                      </b-dropdown-item>
                    </b-dropdown>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <pagination
          :total-pages="pages"
          :total="total"
          :per-page="itemsPerPage"
          :current-page="currentPage"
          @pagechanged="onPageChange"
          @changepagecount="handlePageCount"
        />
      </div>
    </div>

    <!-- Appointment Form Modal -->
    <AppointmentModal
      :displayPrompt="showForm"
      :appointment="selectedAppointment"
      @closeModal="hideAppointmentForm"
      @saved="onAppointmentSaved"
    />

    <!-- Appointment Details Modal -->
    <AppointmentDetailsModal
      :appointment="selectedAppointment"
      :show="showDetails"
      @close="hideDetailsModal"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import vSelect from 'vue-select';
import Pagination from '@/utils/Pagination.vue';
import AppointmentModal from './components/AppointmentModal.vue';
import AppointmentDetailsModal from './components/AppointmentDetailsModal.vue';
import { setUrlQueryParams } from '@/common/common';
import Swal from 'sweetalert2';
import {
  APPOINTMENT_TYPES,
  APPOINTMENT_PRIORITIES,
  APPOINTMENT_STATUSES,
} from '@/view/pages/appointments/constants.js';

export default {
  name: 'AppointmentList',
  components: {
    vSelect,
    Pagination,
    AppointmentModal,
    AppointmentDetailsModal,
  },
  data() {
    return {
      searchTerm: '',
      showAdvancedFilters: false,
      showForm: false,
      showDetails: false,
      selectedAppointment: null,
      currentPage: 1,
      itemsPerPage: 10,
      filters: {
        appointment_date: '',
        status: '',
        type: '',
        doctor_id: '',
        priority: '',
        start: '',
        end: '',
      },
      doctors: [],
      searchTimeout: null,
    };
  },
  computed: {
    ...mapState('appointments', ['appointments', 'loading', 'total', 'pages', 'error']),
    ...mapGetters('appointments', ['filteredAppointments', 'appointmentStats']),

    hasActiveFilters() {
      return Object.values(this.filters).some((value) => value !== '') || this.searchTerm !== '';
    },

    statusFilterOptions() {
      return APPOINTMENT_STATUSES;
    },

    typeFilterOptions() {
      return APPOINTMENT_TYPES;
    },

    priorityFilterOptions() {
      return APPOINTMENT_PRIORITIES.map((p) => ({
        value: p.value,
        text: p.text.replace(' Priority', ''),
      }));
    },
  },
  methods: {
    ...mapActions('appointments', [
      'fetchAppointments',
      'confirmAppointment',
      'cancelAppointment',
      'checkInAppointment',
      'markNoShow',
      'setSearchTerm',
      'setFilters',
      'clearFilters',
    ]),

    performSearch() {
      this.currentPage = 1;
      this.applyFiltersAndSearch();
    },

    applyFilters() {
      this.currentPage = 1;
      this.applyFiltersAndSearch();
    },

    applyFiltersAndSearch() {
      const params = {
        currentPage: this.currentPage,
        pageLimit: this.itemsPerPage,
        search: this.searchTerm,
        ...this.filters,
      };

      // Remove empty values
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      setUrlQueryParams(params);
      this.fetchAppointmentsList(params);
    },

    clearFilters() {
      this.searchTerm = '';
      this.filters = {
        appointment_date: '',
        status: '',
        type: '', // Use 'type' instead of 'appointment_type'
        doctor_id: '',
        priority: '',
        start: '', // Use 'start' instead of 'date_from'
        end: '', // Use 'end' instead of 'date_to'
      };
      this.currentPage = 1;
      this.applyFiltersAndSearch();
    },

    onPageChange(page) {
      this.currentPage = page;
      this.applyFiltersAndSearch();
    },

    handlePageCount(count) {
      this.itemsPerPage = count;
      this.currentPage = 1;
      this.applyFiltersAndSearch();
    },

    fetchAppointmentsList(params) {
      this.fetchAppointments(params);
    },

    showAppointmentForm() {
      this.selectedAppointment = null;
      this.showForm = true;
    },

    hideAppointmentForm() {
      this.showForm = false;
      this.selectedAppointment = null;
    },

    editAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showForm = true;
    },

    viewAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showDetails = true;
    },

    hideDetailsModal() {
      this.showDetails = false;
      this.selectedAppointment = null;
    },

    onAppointmentSaved() {
      this.refreshAppointments();
    },

    refreshAppointments() {
      this.applyFiltersAndSearch();
    },

    // Action Methods
    confirmAppointment(appointment) {
      this.confirmAppointmentAction(appointment);
    },

    cancelAppointment(appointment) {
      this.cancelAppointmentAction(appointment);
    },

    checkInAppointment(appointment) {
      this.checkInAppointmentAction(appointment);
    },

    markNoShow(appointment) {
      this.markNoShowAction(appointment);
    },

    rescheduleAppointment(appointment) {
      // For now, open the edit form - can be enhanced later
      this.editAppointment(appointment);
    },

    showFullReason(appointment) {
      Swal.fire({
        title: 'Reason for Visit',
        text: appointment.reason_for_visit,
        icon: 'info',
        confirmButtonText: 'Close',
      });
    },

    async confirmAppointmentAction(appointment) {
      try {
        await this.$store.dispatch('appointments/confirmAppointment', appointment.id);
        this.$bvToast.toast('Appointment confirmed successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        this.refreshAppointments();
      } catch (error) {
        this.$bvToast.toast('Failed to confirm appointment', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    cancelAppointmentAction(appointment) {
      Swal.fire({
        title: 'Cancel Appointment',
        html: `Are you sure you want to cancel the appointment for <strong>${appointment.patient?.fullname}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No, Keep',
        input: 'textarea',
        inputPlaceholder: 'Cancellation reason (optional)',
        showLoaderOnConfirm: true,
        preConfirm: async (reason) => {
          try {
            await this.$store.dispatch('appointments/cancelAppointment', {
              id: appointment.id,
              reason,
            });
            return true;
          } catch (error) {
            Swal.showValidationMessage('Failed to cancel appointment');
            return false;
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.$bvToast.toast('Appointment cancelled successfully', {
            title: 'Success',
            variant: 'success',
            solid: true,
          });
          this.refreshAppointments();
        }
      });
    },

    async checkInAppointmentAction(appointment) {
      try {
        await this.$store.dispatch('appointments/checkInAppointment', {
          appointmentId: appointment.id,
          checkInData: { check_in_time: new Date() },
        });
        this.$bvToast.toast('Patient checked in successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
        this.refreshAppointments();
      } catch (error) {
        this.$bvToast.toast('Failed to check in patient', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    markNoShowAction(appointment) {
      Swal.fire({
        title: 'Mark as No Show',
        html: `Mark <strong>${appointment.patient?.fullname}</strong> as no show?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Mark No Show',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await this.$store.dispatch('appointments/markNoShow', appointment.id);
            return true;
          } catch (error) {
            Swal.showValidationMessage('Failed to mark as no show');
            return false;
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.$bvToast.toast('Appointment marked as no show', {
            title: 'Success',
            variant: 'warning',
            solid: true,
          });
          this.refreshAppointments();
        }
      });
    },

    // Utility Methods
    getPatientInitials(patient) {
      if (!patient || !patient.fullname) return 'NA';
      return patient.fullname
        .split(' ')
        .map((name) => name.charAt(0))
        .join('')
        .toUpperCase();
    },

    getStatusClass(status) {
      const classes = {
        Scheduled: 'badge-warning',
        Confirmed: 'badge-info',
        Completed: 'badge-success',
        Cancelled: 'badge-danger',
        'No Show': 'badge-secondary',
        Rescheduled: 'badge-primary',
      };
      return classes[status] || 'badge-secondary';
    },

    getTypeClass(type) {
      const classes = {
        CONSULTATION: 'badge-primary',
        FOLLOW_UP: 'badge-info',
        PROCEDURE: 'badge-warning',
        VACCINATION: 'badge-success',
        DIALYSIS: 'badge-danger',
        ANTENATAL: 'badge-pink',
        SURGERY: 'badge-purple',
        EMERGENCY: 'badge-danger',
      };
      return classes[type] || 'badge-secondary';
    },

    getTypeText(type) {
      const texts = {
        CONSULTATION: 'Consultation',
        FOLLOW_UP: 'Follow-up',
        PROCEDURE: 'Procedure',
        VACCINATION: 'Vaccination',
        DIALYSIS: 'Dialysis',
        ANTENATAL: 'Antenatal',
        SURGERY: 'Surgery',
        EMERGENCY: 'Emergency',
      };
      return texts[type] || type;
    },

    getPriorityClass(priority) {
      const classes = {
        LOW: 'badge-light',
        NORMAL: 'badge-info',
        HIGH: 'badge-warning',
        URGENT: 'badge-danger',
      };
      return classes[priority] || 'badge-info';
    },

    truncateText(text, length) {
      if (!text) return 'N/A';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    // Permission Methods
    canEditAppointment(appointment) {
      const editableStatuses = ['Scheduled', 'Confirmed'];
      return editableStatuses.includes(appointment.status);
    },

    canRescheduleAppointment(appointment) {
      const reschedulableStatuses = ['Scheduled', 'Confirmed'];
      return reschedulableStatuses.includes(appointment.status);
    },

    canCancelAppointment(appointment) {
      const cancellableStatuses = ['Scheduled', 'Confirmed', 'Rescheduled'];
      return cancellableStatuses.includes(appointment.status);
    },

    canMarkNoShow(appointment) {
      return appointment.status === 'Scheduled' || appointment.status === 'Confirmed';
    },

    // Doctor Search
    searchDoctors(search, loading) {
      if (search.length > 2) {
        loading(true);
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(async () => {
          try {
            const response = await this.$store.dispatch('employee/fetchEmployees', {
              currentPage: 1,
              itemsPerPage: 50,
              filter: { department: 'Medical Practioners' },
              search,
            });
            this.doctors = response.data.data.docs || [];
          } catch (error) {
            console.error('Failed to search doctors:', error);
          } finally {
            loading(false);
          }
        }, 300);
      }
    },

    exportAppointments() {
      // Implement export functionality
      this.$bvToast.toast('Export functionality coming soon', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },

    formatTime(timeString) {
      if (!timeString) return 'N/A';
      try {
        // Parse time string (assuming format HH:MM or HH:MM:SS)
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = minutes || '00';

        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

        return `${displayHour}:${minute} ${period}`;
      } catch (error) {
        return timeString; // Return original if parsing fails
      }
    },
  },

  created() {
    // Initialize from query parameters
    const query = this.$route.query;
    this.currentPage = parseInt(query.currentPage) || 1;
    this.itemsPerPage = parseInt(query.itemsPerPage) || 10;
    this.searchTerm = query.search || '';

    // Apply filters from query
    Object.keys(this.filters).forEach((key) => {
      if (query[key]) {
        this.filters[key] = query[key];
      }
    });

    // Load appointments
    this.applyFiltersAndSearch();
  },

  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.empty-state {
  padding: 3rem 1rem;
}

.patient-avatar .symbol-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-group {
  white-space: nowrap;
}

.card-title .badge {
  font-size: 0.75rem;
}

.badge-pink {
  color: #fff;
  background-color: #e83e8c;
}

.badge-purple {
  color: #fff;
  background-color: #6f42c1;
}

/* v-select styling */
.v-select {
  min-height: 38px;
}

.v-select .vs__dropdown-toggle {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  min-height: 38px;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    margin-bottom: 0.25rem;
  }
}
</style>
