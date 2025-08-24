<template>
  <div class="dialysis-schedule">
    <div class="card card-custom gutter-b">
      <div class="card-header border-0 py-4">
        <h4 class="card-title font-weight-bolder text-dark">
          <i class="fas fa-clock text-warning mr-2"></i>
          Dialysis Schedule
        </h4>
        <div class="card-toolbar">
          <div class="d-flex align-items-center">
            <div class="mr-3">
              <input
                type="date"
                v-model="selectedDate"
                class="form-control form-control-sm"
                @change="loadSchedule"
              />
            </div>
            <button class="btn btn-warning btn-sm font-weight-bold" @click="openScheduleModal">
              <i class="fas fa-plus mr-2"></i>Schedule Appointment
            </button>
          </div>
        </div>
      </div>
      <div class="card-body py-0">
        <div class="schedule-grid">
          <div class="time-slots">
            <div
              v-for="slot in timeSlots"
              :key="slot.time"
              class="time-slot"
              :class="{ 'has-appointment': hasAppointment(slot.time) }"
            >
              <div class="time-header">
                <span class="time-label">{{ slot.time }}</span>
                <span class="slot-status" :class="getSlotStatusClass(slot.time)">
                  {{ getSlotStatus(slot.time) }}
                </span>
              </div>
              <div class="appointment-info" v-if="getAppointment(slot.time)">
                <div class="patient-info">
                  <i class="fas fa-user text-primary mr-2"></i>
                  <span class="patient-name">{{ getAppointment(slot.time).patient_name }}</span>
                </div>
                <div class="treatment-info">
                  <span class="treatment-type">{{ getAppointment(slot.time).treatment_type }}</span>
                  <span class="duration">{{ getAppointment(slot.time).duration }} min</span>
                </div>
                <div class="appointment-actions">
                  <button
                    class="btn btn-icon btn-light btn-hover-primary btn-sm mx-1"
                    @click="viewAppointment(getAppointment(slot.time))"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    class="btn btn-icon btn-light btn-hover-success btn-sm mx-1"
                    @click="editAppointment(getAppointment(slot.time))"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="btn btn-icon btn-light btn-hover-danger btn-sm mx-1"
                    @click="cancelAppointment(getAppointment(slot.time))"
                    title="Cancel"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="empty-slot" v-else>
                <button class="btn btn-light btn-sm" @click="bookSlot(slot.time)">
                  <i class="fas fa-plus mr-2"></i>Book Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <b-modal v-model="showModal" :title="modalTitle" size="lg" hide-footer class="schedule-modal">
      <div class="p-4">
        <form @submit.prevent="saveSchedule">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user text-primary mr-2"></i>
                  Patient
                </label>
                <v-select
                  v-model="formData.patient_id"
                  :options="availablePatients"
                  label="name"
                  :reduce="patient => patient.id"
                  placeholder="Select patient..."
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-procedures text-info mr-2"></i>
                  Dialysis Type
                </label>
                <select
                  v-model="formData.dialysis_type"
                  class="form-control form-control-lg"
                  required
                >
                  <option value="">Select dialysis type</option>
                  <option value="Hemodialysis">Hemodialysis</option>
                  <option value="Peritoneal Dialysis">Peritoneal Dialysis</option>
                  <option value="CRRT">CRRT</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row">
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
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-clock text-warning mr-2"></i>
                  Time Slot
                </label>
                <select v-model="formData.time_slot" class="form-control form-control-lg" required>
                  <option value="">Select time slot</option>
                  <option
                    v-for="slot in availableTimeSlots"
                    :key="slot.time"
                    :value="slot.time"
                    :disabled="!slot.available"
                  >
                    {{ slot.time }} {{ slot.available ? '(Available)' : '(Booked)' }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-hourglass-half text-primary mr-2"></i>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  v-model="formData.duration"
                  class="form-control form-control-lg"
                  placeholder="240"
                  min="30"
                  max="480"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label font-weight-bold">
                  <i class="fas fa-user-md text-success mr-2"></i>
                  Doctor
                </label>
                <v-select
                  v-model="formData.doctor_id"
                  :options="availableDoctors"
                  label="name"
                  :reduce="doctor => doctor.id"
                  placeholder="Select doctor..."
                  class="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label class="form-label font-weight-bold">
                <i class="fas fa-user-nurse text-info mr-2"></i>
                Nurse (Optional)
              </label>
              <v-select
                v-model="formData.nurse_id"
                :options="availableStaff"
                label="name"
                :reduce="staff => staff.id"
                placeholder="Select nurse..."
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-weight-bold">
              <i class="fas fa-comment text-muted mr-2"></i>
              Notes
            </label>
            <textarea
              v-model="formData.notes"
              class="form-control"
              rows="3"
              placeholder="Special instructions or notes..."
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
              {{ isSubmitting ? 'Saving...' : 'Schedule Appointment' }}
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
  name: 'DialysisSchedule',
  components: { vSelect },
  props: {
    appointments: {
      type: Array,
      default: () => [],
    },
    availablePatients: {
      type: Array,
      default: () => [],
    },
    availableDoctors: {
      type: Array,
      default: () => [],
    },
    availableStaff: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showModal: false,
      isSubmitting: false,
      editingAppointment: null,
      selectedDate: new Date().toISOString().split('T')[0],
      formData: {
        patient_id: null,
        dialysis_type: '',
        visit_date: null,
        time_slot: '',
        duration: 240,
        doctor_id: null,
        nurse_id: null,
        notes: '',
      },
      timeSlots: [
        { time: '08:00', available: true },
        { time: '10:00', available: true },
        { time: '12:00', available: true },
        { time: '14:00', available: true },
        { time: '16:00', available: true },
        { time: '18:00', available: true },
      ],
    };
  },
  computed: {
    modalTitle() {
      if (this.editingAppointment) {
        return 'Edit Appointment';
      }
      return 'Schedule Appointment';
    },
    availableTimeSlots() {
      return this.timeSlots.map(slot => ({
        ...slot,
        available: !this.hasAppointment(slot.time),
      }));
    },
  },
  methods: {
    hasAppointment(time) {
      return this.appointments.some(
        app => app.time_slot === time && app.appointment_date === this.selectedDate
      );
    },

    getAppointment(time) {
      return this.appointments.find(
        app => app.time_slot === time && app.appointment_date === this.selectedDate
      );
    },

    getSlotStatus(time) {
      if (this.hasAppointment(time)) {
        return 'Booked';
      }
      return 'Available';
    },

    getSlotStatusClass(time) {
      if (this.hasAppointment(time)) {
        return 'status-booked';
      }
      return 'status-available';
    },

    openScheduleModal() {
      this.editingAppointment = null;
      this.resetForm();
      this.formData.appointment_date = this.selectedDate;
      this.showModal = true;
    },

    bookSlot(time) {
      this.openScheduleModal();
      this.formData.time_slot = time;
    },

    editAppointment(appointment) {
      this.editingAppointment = appointment;
      this.formData = { ...appointment };
      this.showModal = true;
    },

    resetForm() {
      this.formData = {
        patient_id: null,
        dialysis_type: '',
        visit_date: this.selectedDate,
        time_slot: '',
        duration: 240,
        doctor_id: null,
        nurse_id: null,
        notes: '',
      };
    },

    async saveSchedule() {
      this.isSubmitting = true;
      try {
        if (this.editingAppointment) {
          await this.$store.dispatch('dialysis/updateVisit', {
            id: this.editingAppointment.id,
            ...this.formData,
          });
        } else {
          await this.$store.dispatch('dialysis/createVisit', this.formData);
        }

        this.showModal = false;
        this.$emit('appointment-saved');
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Dialysis visit scheduled successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.message || 'Failed to schedule dialysis visit',
          type: 'error',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    viewAppointment(appointment) {
      this.$emit('view-appointment', appointment);
    },

    async cancelAppointment(appointment) {
      if (confirm('Are you sure you want to cancel this appointment?')) {
        try {
          await this.$store.dispatch('dialysis/cancelAppointment', appointment.id);
          this.$emit('appointment-cancelled');
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Appointment cancelled successfully',
            type: 'success',
          });
        } catch (error) {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: error.message || 'Failed to cancel appointment',
            type: 'error',
          });
        }
      }
    },

    loadSchedule() {
      this.$emit('date-changed', this.selectedDate);
    },
  },

  created() {
    this.loadSchedule();
  },
};
</script>

<style scoped>
.schedule-grid {
  padding: 1rem;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.time-slot {
  border: 1px solid #e1e3ea;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.time-slot:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.time-slot.has-appointment {
  border-color: #3699ff;
  background-color: #f8f9ff;
}

.time-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e1e3ea;
}

.time-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3f4254;
}

.slot-status {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.status-available {
  background-color: #e8fff3;
  color: #198754;
}

.status-booked {
  background-color: #e1f0ff;
  color: #3699ff;
}

.appointment-info {
  padding: 0.5rem 0;
}

.patient-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.patient-name {
  font-weight: 600;
  color: #3f4254;
}

.treatment-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.treatment-type {
  color: #3699ff;
  font-weight: 500;
}

.duration {
  color: #6c757d;
}

.appointment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

.empty-slot {
  text-align: center;
  padding: 1rem 0;
}

.schedule-modal .modal-content {
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
</style>
