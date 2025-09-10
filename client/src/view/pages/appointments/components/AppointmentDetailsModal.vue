<template>
  <b-modal
    id="appointmentDetailsModal"
    title="Appointment Details"
    size="lg"
    :hide-footer="true"
    v-model="activeModal"
    @hide="handleClose"
  >
    <div v-if="appointment" class="appointment-details">
      <!-- Patient Information -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-user mr-2"></i>
                Patient Information
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Name:</strong> {{ appointment.patient?.fullname || 'N/A' }}</p>
                  <p>
                    <strong>Hospital ID:</strong> {{ appointment.patient?.hospital_id || 'N/A' }}
                  </p>
                  <p><strong>Phone:</strong> {{ appointment.patient?.phone || 'N/A' }}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Email:</strong> {{ appointment.patient?.email || 'N/A' }}</p>
                  <p><strong>Gender:</strong> {{ appointment.patient?.gender || 'N/A' }}</p>
                  <p><strong>Age:</strong> {{ getPatientAge(appointment.patient) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Appointment Information -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-calendar-alt mr-2"></i>
                Appointment Details
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p>
                    <strong>Date:</strong>
                    {{ appointment.appointment_date | dayjs('MMM DD, YYYY') }}
                  </p>
                  <p><strong>Time:</strong> {{ formatTime(appointment.appointment_time) }}</p>
                  <p><strong>Duration:</strong> {{ appointment.duration_minutes || 30 }} minutes</p>
                  <p>
                    <strong>Type:</strong>
                    <span
                      class="badge badge-pill ml-1"
                      :class="getTypeClass(appointment.appointment_type)"
                    >
                      {{ getTypeText(appointment.appointment_type) }}
                    </span>
                  </p>
                </div>
                <div class="col-md-6">
                  <p>
                    <strong>Status:</strong>
                    <span class="badge badge-pill ml-1" :class="getStatusClass(appointment.status)">
                      {{ appointment.status }}
                    </span>
                  </p>
                  <p>
                    <strong>Priority:</strong>
                    <span
                      class="badge badge-pill ml-1"
                      :class="getPriorityClass(appointment.priority)"
                    >
                      {{ appointment.priority || 'NORMAL' }}
                    </span>
                  </p>
                  <p><strong>Department:</strong> {{ appointment.department || 'N/A' }}</p>
                  <p><strong>Doctor:</strong> {{ appointment.doctor?.fullname || 'Unassigned' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reason and Notes -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-sticky-note mr-2"></i>
                Reason & Notes
              </h6>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <strong>Reason for Visit:</strong>
                <p class="mt-2">{{ appointment.reason_for_visit || 'N/A' }}</p>
              </div>
              <div v-if="appointment.notes">
                <strong>Additional Notes:</strong>
                <p class="mt-2">{{ appointment.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-clock mr-2"></i>
                Timestamps
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p>
                    <strong>Created:</strong>
                    {{ appointment.createdAt | dayjs('MMM DD, YYYY h:mm A') }}
                  </p>
                  <p v-if="appointment.updatedAt">
                    <strong>Last Updated:</strong>
                    {{ appointment.updatedAt | dayjs('MMM DD, YYYY h:mm A') }}
                  </p>
                </div>
                <div class="col-md-6">
                  <p v-if="appointment.confirmed_at">
                    <strong>Confirmed:</strong>
                    {{ appointment.confirmed_at | dayjs('MMM DD, YYYY h:mm A') }}
                  </p>
                  <p v-if="appointment.checked_in_at">
                    <strong>Checked In:</strong>
                    {{ appointment.checked_in_at | dayjs('MMM DD, YYYY h:mm A') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="text-center mt-4">
        <b-button variant="secondary" @click="handleClose" class="mr-2">
          Close
        </b-button>
        <b-button variant="primary" @click="editAppointment" v-if="canEdit">
          <i class="fas fa-edit mr-1"></i>
          Edit Appointment
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'AppointmentDetailsModal',
  props: {
    appointment: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    activeModal: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('close', value);
      },
    },

    canEdit() {
      if (!this.appointment) return false;
      const editableStatuses = ['Scheduled', 'Confirmed'];
      return editableStatuses.includes(this.appointment.status);
    },
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },

    editAppointment() {
      this.$emit('edit', this.appointment);
      this.handleClose();
    },

    getPatientAge(patient) {
      if (!patient || !patient.date_of_birth) return 'N/A';
      const today = new Date();
      const birthDate = new Date(patient.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age + ' years';
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
};
</script>

<style scoped>
.appointment-details .card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.appointment-details .card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.badge-pink {
  color: #fff;
  background-color: #e83e8c;
}

.badge-purple {
  color: #fff;
  background-color: #6f42c1;
}
</style>
