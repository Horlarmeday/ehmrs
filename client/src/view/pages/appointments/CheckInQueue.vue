<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Check-in Queue</h2>
        <p class="text-muted mb-0">Manage patient check-ins and visit creation</p>
      </div>
      <div class="d-flex align-items-center">
        <div class="mr-3">
          <small class="text-muted">Last updated:</small>
          <span class="font-weight-bold ml-1">{{ lastUpdated }}</span>
        </div>
        <b-button variant="outline-primary" size="sm" @click="refreshQueue" :disabled="loading">
          <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
          Refresh
        </b-button>
      </div>
    </div>

    <!-- Queue Stats -->
    <div class="row mb-4">
      <div class="col-xl-3 col-lg-6 mb-3">
        <div class="card bg-light-primary">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas fa-users fa-2x text-primary"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">{{ queueStats.total }}</div>
                <div class="text-muted font-weight-bold">Total in Queue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 mb-3">
        <div class="card bg-light-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas fa-check-circle fa-2x text-success"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">
                  {{ queueStats.readyForCheckIn }}
                </div>
                <div class="text-muted font-weight-bold">Ready for Check-in</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 mb-3">
        <div class="card bg-light-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas fa-clock fa-2x text-warning"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">
                  {{ queueStats.overdue }}
                </div>
                <div class="text-muted font-weight-bold">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-lg-6 mb-3">
        <div class="card bg-light-info">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="mr-3">
                <i class="fas fa-percentage fa-2x text-info"></i>
              </div>
              <div>
                <div class="text-dark font-size-h2 font-weight-bolder">{{ checkInRate }}%</div>
                <div class="text-muted font-weight-bold">Check-in Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter and Actions Bar -->
    <div class="card card-custom gutter-b">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-filter mr-2"></i>
          Queue Filters
        </h3>
        <div class="card-toolbar">
          <div class="btn-group" role="group">
            <b-button
              variant="outline-success"
              size="sm"
              @click="bulkCheckInSelected"
              :disabled="selectedAppointments.length === 0 || submitting"
            >
              <i class="fas fa-sign-in-alt mr-1"></i>
              Check-in Selected ({{ selectedAppointments.length }})
            </b-button>
            <b-dropdown variant="outline-primary" size="sm" text="Actions" right>
              <b-dropdown-item @click="selectAll">
                <i class="fas fa-check-square mr-2"></i>Select All
              </b-dropdown-item>
              <b-dropdown-item @click="clearSelection">
                <i class="fas fa-times mr-2"></i>Clear Selection
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item
                @click="markAllAsNoShow"
                :disabled="selectedAppointments.length === 0"
              >
                <i class="fas fa-user-times mr-2"></i>Mark Selected as No Show
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="row">
          <!-- Doctor Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="form-group">
              <label>Doctor</label>
              <v-select
                v-model="filters.doctor_id"
                :options="doctors"
                label="fullname"
                :reduce="(doctor) => doctor.id"
                placeholder="All Doctors"
                clearable
                @input="applyFilters"
                @search="searchDoctors"
              >
                <template #no-options>
                  <div class="text-muted">Type to search doctors...</div>
                </template>
              </v-select>
            </div>
          </div>

          <!-- Time Range Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="form-group">
              <label>Time Range</label>
              <b-form-select
                v-model="filters.timeRange"
                :options="timeRangeOptions"
                @change="applyFilters"
                class="form-control"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="form-group">
              <label>Status</label>
              <b-form-select
                v-model="filters.status"
                :options="statusOptions"
                @change="applyFilters"
                class="form-control"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Queue List -->
    <div class="card card-custom">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-list mr-2"></i>
          Check-in Queue
          <span class="badge badge-primary badge-pill ml-2">{{ checkInQueue.length }}</span>
        </h3>
        <div class="card-toolbar">
          <div class="mr-3">
            <b-form-checkbox v-model="showOnlyOverdue" @change="applyFilters" switch>
              Show only overdue
            </b-form-checkbox>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading check-in queue...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="checkInQueue.length === 0" class="card-body text-center py-5">
        <i class="fas fa-clipboard-check fa-4x text-muted mb-4"></i>
        <h5 class="text-muted">No appointments in queue</h5>
        <p class="text-muted">
          All patients have been checked in or there are no appointments scheduled
        </p>
      </div>

      <!-- Queue Items -->
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-head-custom table-vertical-center mb-0">
            <thead>
              <tr class="text-uppercase">
                <th style="width: 50px" class="text-center">
                  <b-form-checkbox v-model="selectAllChecked" @change="toggleSelectAll" />
                </th>
                <th style="min-width: 180px">Patient</th>
                <th style="min-width: 120px">Doctor</th>
                <th style="min-width: 100px">Scheduled Time</th>
                <th style="min-width: 80px">Status</th>
                <th style="min-width: 100px">Wait Time</th>
                <th style="min-width: 150px">Type</th>
                <th style="min-width: 120px" class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="appointment in filteredQueue"
                :key="appointment.id"
                :class="getRowClass(appointment)"
              >
                <!-- Checkbox -->
                <td class="text-center">
                  <b-form-checkbox v-model="selectedAppointments" :value="appointment.id" />
                </td>

                <!-- Patient Info -->
                <td>
                  <div class="d-flex align-items-center">
                    <div class="patient-avatar mr-3">
                      <div class="symbol symbol-35">
                        <span class="symbol-label font-size-sm font-weight-bold">
                          {{ getPatientInitials(appointment.patient) }}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div class="text-dark-75 font-weight-bolder">
                        {{ appointment.patient?.fullname || 'Unknown Patient' }}
                      </div>
                      <div class="text-muted font-size-sm">
                        ID: {{ appointment.patient?.hospital_id || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Doctor -->
                <td>
                  <div class="text-dark-75 font-weight-bolder">
                    {{ appointment.doctor?.fullname || 'Unassigned' }}
                  </div>
                  <div class="text-muted font-size-sm">
                    {{ appointment.doctor?.role || 'Doctor' }}
                  </div>
                </td>

                <!-- Scheduled Time -->
                <td>
                  <div class="text-dark-75 font-weight-bolder">
                    {{ formatTime(appointment.appointment_time) }}
                  </div>
                  <div class="text-muted font-size-sm">
                    {{ appointment.appointment_date | dayjs('MMM DD') }}
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <span class="badge badge-pill" :class="getStatusClass(appointment.status)">
                    {{ appointment.status }}
                  </span>
                </td>

                <!-- Wait Time -->
                <td>
                  <div class="d-flex align-items-center">
                    <span :class="getWaitTimeClass(appointment)" class="font-weight-bold">
                      {{ getWaitTime(appointment) }}
                    </span>
                  </div>
                </td>

                <!-- Appointment Type -->
                <td>
                  <span
                    class="badge badge-pill"
                    :class="getTypeClass(appointment.appointment_type)"
                  >
                    {{ getTypeText(appointment.appointment_type) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <!-- Check-in Button -->
                    <b-button
                      variant="success"
                      size="sm"
                      @click="checkInSingle(appointment)"
                      :disabled="submitting"
                      v-b-tooltip.hover
                      title="Check In Patient"
                    >
                      <i class="fas fa-sign-in-alt"></i>
                      <span v-if="submitting && currentProcessing === appointment.id">
                        <i class="fas fa-spinner fa-spin"></i>
                      </span>
                    </b-button>

                    <!-- More Actions -->
                    <b-dropdown size="sm" variant="outline-primary" no-caret right>
                      <template v-slot:button-content>
                        <i class="fas fa-ellipsis-v"></i>
                      </template>

                      <!-- View Details -->
                      <b-dropdown-item @click="viewAppointment(appointment)">
                        <i class="fas fa-eye mr-2 text-primary"></i>View Details
                      </b-dropdown-item>

                      <!-- Edit Appointment -->
                      <b-dropdown-item @click="editAppointment(appointment)">
                        <i class="fas fa-edit mr-2 text-info"></i>Edit Appointment
                      </b-dropdown-item>

                      <!-- Reschedule -->
                      <b-dropdown-item @click="rescheduleAppointment(appointment)">
                        <i class="fas fa-calendar-alt mr-2 text-warning"></i>Reschedule
                      </b-dropdown-item>

                      <b-dropdown-divider></b-dropdown-divider>

                      <!-- Mark No Show -->
                      <b-dropdown-item @click="markNoShow(appointment)" class="text-danger">
                        <i class="fas fa-user-times mr-2 text-danger"></i>Mark No Show
                      </b-dropdown-item>
                    </b-dropdown>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <AppointmentDetailsModal
      :appointment="selectedAppointment"
      :show="showDetails"
      @close="hideDetailsModal"
      @edit="onEditFromDetails"
    />

    <!-- Appointment Form Modal -->
    <AppointmentModal
      :displayPrompt="showForm"
      :appointment="selectedAppointment"
      @closeModal="hideAppointmentForm"
      @saved="onAppointmentSaved"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import vSelect from 'vue-select';
import AppointmentDetailsModal from './components/AppointmentDetailsModal.vue';
import AppointmentModal from './components/AppointmentModal.vue';
import Swal from 'sweetalert2';

export default {
  name: 'CheckInQueue',
  components: {
    vSelect,
    AppointmentDetailsModal,
    AppointmentModal,
  },
  data() {
    return {
      loading: false,
      submitting: false,
      currentProcessing: null,
      selectedAppointments: [],
      selectAllChecked: false,
      showOnlyOverdue: false,
      selectedAppointment: null,
      showDetails: false,
      showForm: false,
      lastUpdated: '',
      doctors: [],
      searchTimeout: null,
      refreshInterval: null,
      filters: {
        doctor_id: '',
        timeRange: 'all',
        status: 'all',
      },
    };
  },
  computed: {
    ...mapState('appointments', ['checkInQueue', 'error']),
    ...mapGetters('appointments', ['checkInQueueStats']),

    queueStats() {
      return (
        this.checkInQueueStats || {
          total: 0,
          readyForCheckIn: 0,
          overdue: 0,
        }
      );
    },

    checkInRate() {
      const total = this.queueStats.total;
      const checkedIn = total - this.queueStats.readyForCheckIn;
      return total > 0 ? Math.round((checkedIn / total) * 100) : 100;
    },

    filteredQueue() {
      let filtered = [...this.checkInQueue];

      // Filter by doctor
      if (this.filters.doctor_id) {
        filtered = filtered.filter((apt) => apt.doctor_id === this.filters.doctor_id);
      }

      // Filter by status
      if (this.filters.status !== 'all') {
        filtered = filtered.filter((apt) => apt.status === this.filters.status);
      }

      // Filter by time range
      if (this.filters.timeRange !== 'all') {
        const now = new Date();
        filtered = filtered.filter((apt) => {
          const appointmentTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
          const diffMinutes = (now - appointmentTime) / (1000 * 60);

          switch (this.filters.timeRange) {
            case 'overdue':
              return diffMinutes > 15;
            case 'current':
              return diffMinutes >= -15 && diffMinutes <= 15;
            case 'upcoming':
              return diffMinutes < -15;
            default:
              return true;
          }
        });
      }

      // Show only overdue
      if (this.showOnlyOverdue) {
        const now = new Date();
        filtered = filtered.filter((apt) => {
          const appointmentTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
          const diffMinutes = (now - appointmentTime) / (1000 * 60);
          return diffMinutes > 15;
        });
      }

      // Sort by appointment time
      filtered.sort((a, b) => {
        const timeA = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const timeB = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return timeA - timeB;
      });

      return filtered;
    },

    timeRangeOptions() {
      return [
        { value: 'all', text: 'All Times' },
        { value: 'overdue', text: 'Overdue (>15 min)' },
        { value: 'current', text: 'Current (±15 min)' },
        { value: 'upcoming', text: 'Upcoming' },
      ];
    },

    statusOptions() {
      return [
        { value: 'all', text: 'All Statuses' },
        { value: 'Scheduled', text: 'Scheduled' },
        { value: 'Confirmed', text: 'Confirmed' },
      ];
    },
  },
  methods: {
    ...mapActions('appointments', [
      'fetchCheckInQueue',
      'checkInAppointment',
      'bulkCheckIn',
      'markNoShow',
    ]),

    async refreshQueue() {
      this.loading = true;
      try {
        await this.fetchCheckInQueue();
        this.lastUpdated = this.$dayjs().format('h:mm A');
      } catch (error) {
        this.$bvToast.toast('Failed to refresh queue', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },

    applyFilters() {
      // Filters are applied via computed property
      this.clearSelection();
    },

    async checkInSingle(appointment) {
      this.submitting = true;
      this.currentProcessing = appointment.id;

      try {
        await this.checkInAppointment({
          appointmentId: appointment.id,
          checkInData: {
            check_in_time: new Date(),
            notes: 'Checked in from queue',
          },
        });

        this.$bvToast.toast(`${appointment.patient?.fullname} checked in successfully`, {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        this.refreshQueue();
      } catch (error) {
        this.$bvToast.toast(`Failed to check in ${appointment.patient?.fullname}`, {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
        this.currentProcessing = null;
      }
    },

    async bulkCheckInSelected() {
      if (this.selectedAppointments.length === 0) return;

      const result = await Swal.fire({
        title: 'Bulk Check-in',
        html: `Check in ${this.selectedAppointments.length} patient(s)?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Check In',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) return;

      this.submitting = true;
      try {
        const response = await this.bulkCheckIn(this.selectedAppointments);
        const { successful, failed } = response;

        let message = `Successfully checked in ${successful.length} patient(s)`;
        if (failed.length > 0) {
          message += `. ${failed.length} failed.`;
        }

        this.$bvToast.toast(message, {
          title: 'Bulk Check-in Complete',
          variant: successful.length > 0 ? 'success' : 'warning',
          solid: true,
        });

        this.clearSelection();
        this.refreshQueue();
      } catch (error) {
        this.$bvToast.toast('Bulk check-in failed', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },

    selectAll() {
      this.selectedAppointments = this.filteredQueue.map((apt) => apt.id);
    },

    clearSelection() {
      this.selectedAppointments = [];
      this.selectAllChecked = false;
    },

    toggleSelectAll() {
      if (this.selectAllChecked) {
        this.selectAll();
      } else {
        this.clearSelection();
      }
    },

    async markAllAsNoShow() {
      if (this.selectedAppointments.length === 0) return;

      const result = await Swal.fire({
        title: 'Mark as No Show',
        html: `Mark ${this.selectedAppointments.length} patient(s) as no show?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Mark No Show',
        cancelButtonText: 'Cancel',
        input: 'textarea',
        inputPlaceholder: 'Optional reason...',
      });

      if (!result.isConfirmed) return;

      this.submitting = true;
      try {
        const promises = this.selectedAppointments.map((id) => this.markNoShow(id));
        await Promise.all(promises);

        this.$bvToast.toast(`Marked ${this.selectedAppointments.length} patient(s) as no show`, {
          title: 'Success',
          variant: 'warning',
          solid: true,
        });

        this.clearSelection();
        this.refreshQueue();
      } catch (error) {
        this.$bvToast.toast('Failed to mark as no show', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },

    // Appointment actions
    viewAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showDetails = true;
    },

    editAppointment(appointment) {
      this.selectedAppointment = appointment;
      this.showForm = true;
    },

    rescheduleAppointment(appointment) {
      // For now, just open edit form
      this.editAppointment(appointment);
    },

    async markNoShow(appointment) {
      const result = await Swal.fire({
        title: 'Mark as No Show',
        html: `Mark <strong>${appointment.patient?.fullname}</strong> as no show?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Mark No Show',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) return;

      try {
        await this.$store.dispatch('appointments/markNoShow', appointment.id);
        this.$bvToast.toast('Marked as no show', {
          title: 'Success',
          variant: 'warning',
          solid: true,
        });
        this.refreshQueue();
      } catch (error) {
        this.$bvToast.toast('Failed to mark as no show', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },

    // Modal handlers
    hideDetailsModal() {
      this.showDetails = false;
      this.selectedAppointment = null;
    },

    hideAppointmentForm() {
      this.showForm = false;
      this.selectedAppointment = null;
    },

    onEditFromDetails(appointment) {
      this.selectedAppointment = appointment;
      this.showForm = true;
    },

    onAppointmentSaved() {
      this.refreshQueue();
    },

    // Utility methods
    getRowClass(appointment) {
      const now = new Date();
      const appointmentTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );
      const diffMinutes = (now - appointmentTime) / (1000 * 60);

      if (diffMinutes > 30) {
        return 'table-danger'; // Very overdue
      } else if (diffMinutes > 15) {
        return 'table-warning'; // Overdue
      } else if (diffMinutes >= -15) {
        return 'table-success'; // On time or current
      }
      return ''; // Upcoming
    },

    getWaitTime(appointment) {
      const now = new Date();
      const appointmentTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );
      const diffMinutes = Math.floor((now - appointmentTime) / (1000 * 60));

      if (diffMinutes > 0) {
        return `+${diffMinutes}m`;
      } else if (diffMinutes < 0) {
        return `${Math.abs(diffMinutes)}m`;
      } else {
        return 'Now';
      }
    },

    getWaitTimeClass(appointment) {
      const now = new Date();
      const appointmentTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      );
      const diffMinutes = (now - appointmentTime) / (1000 * 60);

      if (diffMinutes > 30) return 'text-danger';
      if (diffMinutes > 15) return 'text-warning';
      if (diffMinutes >= -15) return 'text-success';
      return 'text-muted';
    },

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

    formatTime(timeString) {
      if (!timeString) return 'N/A';
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = minutes || '00';

        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

        return `${displayHour}:${minute} ${period}`;
      } catch (error) {
        return timeString;
      }
    },

    // Doctor search
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
  },

  async created() {
    // Load initial data
    await this.refreshQueue();

    // Load doctors
    try {
      const response = await this.$store.dispatch('employee/fetchEmployees', {
        currentPage: 1,
        itemsPerPage: 100,
        filter: { department: 'Medical Practioners' },
      });
      this.doctors = response.data.data.docs || [];
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }

    // Set up auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshQueue();
    }, 30000);
  },

  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.patient-avatar .symbol-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.table-responsive {
  border-radius: 0.375rem;
}

.btn-group {
  white-space: nowrap;
}

.badge-pink {
  color: #fff;
  background-color: #e83e8c;
}

.badge-purple {
  color: #fff;
  background-color: #6f42c1;
}

/* Row highlighting */
.table-danger {
  background-color: rgba(220, 53, 69, 0.1);
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.1);
}

.table-success {
  background-color: rgba(40, 167, 69, 0.1);
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
