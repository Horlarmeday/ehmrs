<template>
  <div class="book-appointment">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Book New Appointment</h2>
        <p class="text-muted mb-0">Schedule a new appointment for a patient</p>
      </div>
      <div>
        <router-link to="/appointments/list" class="btn btn-light-secondary mr-2">
          <i class="fas fa-arrow-left mr-2"></i>Back to List
        </router-link>
      </div>
    </div>

    <!-- Wizard Progress -->
    <div class="card card-custom gutter-b">
      <div class="card-body">
        <div class="wizard" id="appointment-wizard">
          <div class="wizard-nav">
            <div class="wizard-steps">
              <div
                class="wizard-step"
                :class="{ current: currentStep === 1, done: currentStep > 1 }"
                data-wizard-type="step"
                data-wizard-state="current"
              >
                <div class="wizard-number">1</div>
                <div class="wizard-label">
                  <div class="wizard-title">Patient Selection</div>
                  <div class="wizard-desc">Choose or search patient</div>
                </div>
              </div>

              <div
                class="wizard-step"
                :class="{ current: currentStep === 2, done: currentStep > 2 }"
                data-wizard-type="step"
              >
                <div class="wizard-number">2</div>
                <div class="wizard-label">
                  <div class="wizard-title">Doctor & Schedule</div>
                  <div class="wizard-desc">Select doctor and time</div>
                </div>
              </div>

              <div
                class="wizard-step"
                :class="{ current: currentStep === 3, done: currentStep > 3 }"
                data-wizard-type="step"
              >
                <div class="wizard-number">3</div>
                <div class="wizard-label">
                  <div class="wizard-title">Appointment Details</div>
                  <div class="wizard-desc">Type, reason, and notes</div>
                </div>
              </div>

              <div
                class="wizard-step"
                :class="{ current: currentStep === 4, done: currentStep > 4 }"
                data-wizard-type="step"
              >
                <div class="wizard-number">4</div>
                <div class="wizard-label">
                  <div class="wizard-title">Confirmation</div>
                  <div class="wizard-desc">Review and confirm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wizard Content -->
    <div class="row">
      <div class="col-12">
        <div class="card card-custom">
          <div class="card-body">
            <!-- Step 1: Patient Selection -->
            <div v-if="currentStep === 1" class="step-content">
              <div class="text-center mb-5">
                <i class="fas fa-user-search fa-3x text-primary mb-3"></i>
                <h4>Select Patient</h4>
                <p class="text-muted">Search and select the patient for this appointment</p>
              </div>

              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <!-- Selected Patient Display -->
                  <div v-if="selectedPatient" class="card border-primary mb-4">
                    <div class="card-header bg-light-primary">
                      <h6 class="mb-0"><i class="fas fa-user mr-2"></i>Selected Patient</h6>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6">
                          <p><strong>Name:</strong> {{ selectedPatient.fullname }}</p>
                          <p><strong>Hospital ID:</strong> {{ selectedPatient.hospital_id }}</p>
                          <p><strong>Phone:</strong> {{ selectedPatient.phone || 'N/A' }}</p>
                        </div>
                        <div class="col-md-6">
                          <p><strong>Gender:</strong> {{ selectedPatient.gender }}</p>
                          <p><strong>Age:</strong> {{ getPatientAge(selectedPatient) }}</p>
                          <p>
                            <strong>Insurance:</strong> {{ getPatientInsurance(selectedPatient) }}
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <b-button variant="outline-secondary" @click="clearPatient">
                          <i class="fas fa-times mr-1"></i>Change Patient
                        </b-button>
                      </div>
                    </div>
                  </div>

                  <!-- Patient Search -->
                  <div v-else>
                    <b-button
                      variant="primary"
                      size="lg"
                      @click="showPatientSearch"
                      class="btn-block mb-3"
                    >
                      <i class="fas fa-search mr-2"></i>
                      Search Patient
                    </b-button>

                    <div class="text-center">
                      <p class="text-muted mb-3">or</p>
                      <router-link to="/patient/create" class="btn btn-outline-primary">
                        <i class="fas fa-user-plus mr-2"></i>Create New Patient
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Doctor & Schedule -->
            <div v-if="currentStep === 2" class="step-content">
              <div class="text-center mb-5">
                <i class="fas fa-calendar-check fa-3x text-primary mb-3"></i>
                <h4>Select Doctor & Schedule</h4>
                <p class="text-muted">Choose the doctor and appointment time</p>
              </div>

              <div class="row">
                <!-- Doctor Selection -->
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="font-weight-bold"
                      >Doctor <span class="text-danger">*</span></label
                    >
                    <v-select
                      v-model="appointmentData.doctor_id"
                      :options="doctors"
                      label="fullname"
                      :reduce="(doctor) => doctor.id"
                      placeholder="Select Doctor"
                      :loading="loadingDoctors"
                      @search="searchDoctors"
                      @input="onDoctorChange"
                    >
                      <template #option="option">
                        <div>
                          <div class="font-weight-bold">{{ option.fullname }}</div>
                          <small class="text-muted"
                            >{{ option.department }} - {{ option.role }}</small
                          >
                        </div>
                      </template>
                      <template #no-options>
                        <div class="text-muted">Type to search for doctors...</div>
                      </template>
                    </v-select>
                  </div>
                </div>

                <!-- Date Selection -->
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="font-weight-bold"
                      >Appointment Date <span class="text-danger">*</span></label
                    >
                    <b-form-input
                      type="date"
                      v-model="appointmentData.appointment_date"
                      :min="minDate"
                      :max="maxDate"
                      @change="onDateChange"
                    />
                  </div>
                </div>
              </div>

              <!-- Time Selection -->
              <div class="row" v-if="appointmentData.doctor_id && appointmentData.appointment_date">
                <div class="col-12">
                  <TimeSlotPicker
                    v-model="selectedTimeSlot"
                    :selected-date="appointmentData.appointment_date"
                    :doctor-id="appointmentData.doctor_id"
                    :duration="parseInt(appointmentData.duration_minutes) || 30"
                    @slot-selected="onTimeSlotSelected"
                    @slot-cleared="onTimeSlotCleared"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Appointment Details -->
            <div v-if="currentStep === 3" class="step-content">
              <div class="text-center mb-5">
                <i class="fas fa-clipboard-list fa-3x text-primary mb-3"></i>
                <h4>Appointment Details</h4>
                <p class="text-muted">Provide appointment type, reason, and additional details</p>
              </div>

              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <div class="row">
                    <!-- Appointment Type -->
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="font-weight-bold"
                          >Appointment Type <span class="text-danger">*</span></label
                        >
                        <b-form-select
                          v-model="appointmentData.type"
                          :options="appointmentTypeOptions"
                        >
                          <template #first>
                            <option value="">Select Type</option>
                          </template>
                        </b-form-select>
                      </div>
                    </div>

                    <!-- Priority -->
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="font-weight-bold">Priority</label>
                        <b-form-select
                          v-model="appointmentData.priority"
                          :options="priorityOptions"
                        >
                          <template #first>
                            <option value="">Select Priority</option>
                          </template>
                        </b-form-select>
                      </div>
                    </div>
                  </div>

                  <!-- Duration -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="font-weight-bold">Duration (minutes)</label>
                        <b-form-select
                          v-model="appointmentData.duration_minutes"
                          :options="durationOptions"
                        >
                          <template #first>
                            <option value="">Select Duration</option>
                          </template>
                        </b-form-select>
                      </div>
                    </div>

                    <!-- Department -->
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="font-weight-bold">Department</label>
                        <b-form-input
                          v-model="appointmentData.department"
                          placeholder="Enter department"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Reason for Visit -->
                  <div class="form-group">
                    <label class="font-weight-bold"
                      >Reason for Visit <span class="text-danger">*</span></label
                    >
                    <b-form-textarea
                      v-model="appointmentData.reason_for_visit"
                      rows="3"
                      placeholder="Enter the reason for this appointment..."
                    />
                  </div>

                  <!-- Notes -->
                  <div class="form-group">
                    <label class="font-weight-bold">Additional Notes</label>
                    <b-form-textarea
                      v-model="appointmentData.notes"
                      rows="2"
                      placeholder="Any additional notes or special instructions (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Confirmation -->
            <div v-if="currentStep === 4" class="step-content">
              <div class="text-center mb-5">
                <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h4>Confirm Appointment</h4>
                <p class="text-muted">Review the appointment details before booking</p>
              </div>

              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <!-- Appointment Summary -->
                  <div class="card border-success">
                    <div class="card-header bg-light-success">
                      <h6 class="mb-0">
                        <i class="fas fa-calendar-check mr-2"></i>Appointment Summary
                      </h6>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6">
                          <h6 class="text-primary">Patient Information</h6>
                          <p><strong>Name:</strong> {{ selectedPatient?.fullname }}</p>
                          <p><strong>Hospital ID:</strong> {{ selectedPatient?.hospital_id }}</p>
                          <p><strong>Phone:</strong> {{ selectedPatient?.phone || 'N/A' }}</p>

                          <h6 class="text-primary mt-4">Appointment Details</h6>
                          <p>
                            <strong>Type:</strong>
                            {{ getTypeText(appointmentData.appointment_type) }}
                          </p>
                          <p>
                            <strong>Priority:</strong> {{ appointmentData.priority || 'Normal' }}
                          </p>
                          <p>
                            <strong>Duration:</strong>
                            {{ appointmentData.duration_minutes || 30 }} minutes
                          </p>
                        </div>
                        <div class="col-md-6">
                          <h6 class="text-primary">Schedule Information</h6>
                          <p><strong>Doctor:</strong> {{ getSelectedDoctorName() }}</p>
                          <p>
                            <strong>Department:</strong> {{ appointmentData.department || 'N/A' }}
                          </p>
                          <p>
                            <strong>Date:</strong>
                            {{ appointmentData.appointment_date | dayjs('MMM DD, YYYY') }}
                          </p>
                          <p>
                            <strong>Time:</strong>
                            {{ formatTime(appointmentData.appointment_time) }}
                          </p>

                          <h6 class="text-primary mt-4">Reason & Notes</h6>
                          <p><strong>Reason:</strong> {{ appointmentData.reason_for_visit }}</p>
                          <p v-if="appointmentData.notes">
                            <strong>Notes:</strong> {{ appointmentData.notes }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="d-flex justify-content-between mt-5">
              <b-button variant="secondary" @click="previousStep" :disabled="currentStep === 1">
                <i class="fas fa-arrow-left mr-2"></i>Previous
              </b-button>

              <b-button
                variant="primary"
                @click="nextStep"
                :disabled="!canProceedToNextStep"
                v-if="currentStep < 4"
              >
                Next <i class="fas fa-arrow-right ml-2"></i>
              </b-button>

              <b-button
                variant="success"
                @click="confirmAppointment"
                :disabled="submitting"
                v-if="currentStep === 4"
              >
                <span v-if="submitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i>Booking...
                </span>
                <span v-else> <i class="fas fa-check mr-2"></i>Confirm Appointment </span>
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Patient Search Modal -->
    <PatientSearchModal @patient-selected="onPatientSelected" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import vSelect from 'vue-select';
import PatientSearchModal from '../components/PatientSearchModal.vue';
import TimeSlotPicker from '../../../components/appointments/TimeSlotPicker.vue';

export default {
  name: 'BookAppointment',
  components: {
    vSelect,
    PatientSearchModal,
    TimeSlotPicker,
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      loadingDoctors: false,
      loadingSlots: false,
      selectedPatient: null,
      selectedTimeSlot: null,
      doctors: [],
      availableSlots: [],
      appointmentData: {
        patient_id: '',
        doctor_id: '',
        type: 'CONSULTATION', // Use 'type' instead of 'appointment_type' for consistency
        priority: 'NORMAL',
        department: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 30,
        reason_for_visit: '',
        notes: '',
        professional: '', // Will be auto-populated from doctor data
      },
      searchTimeout: null,
    };
  },
  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0];
    },

    maxDate() {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      return maxDate.toISOString().split('T')[0];
    },

    appointmentTypeOptions() {
      return [
        { value: 'CONSULTATION', text: 'Consultation' },
        { value: 'FOLLOW_UP', text: 'Follow-up' },
        { value: 'PROCEDURE', text: 'Procedure' },
        { value: 'VACCINATION', text: 'Vaccination' },
        { value: 'DIALYSIS', text: 'Dialysis' },
        { value: 'ANTENATAL', text: 'Antenatal Care' },
        { value: 'SURGERY', text: 'Surgery Consultation' },
        { value: 'EMERGENCY', text: 'Emergency' },
      ];
    },

    priorityOptions() {
      return [
        { value: 'LOW', text: 'Low Priority' },
        { value: 'NORMAL', text: 'Normal Priority' },
        { value: 'HIGH', text: 'High Priority' },
        { value: 'URGENT', text: 'Urgent' },
      ];
    },

    durationOptions() {
      return [
        { value: 15, text: '15 minutes' },
        { value: 30, text: '30 minutes' },
        { value: 45, text: '45 minutes' },
        { value: 60, text: '1 hour' },
        { value: 90, text: '1.5 hours' },
        { value: 120, text: '2 hours' },
      ];
    },

    canProceedToNextStep() {
      switch (this.currentStep) {
        case 1:
          return !!this.selectedPatient;
        case 2:
          return (
            this.appointmentData.doctor_id &&
            this.appointmentData.appointment_date &&
            this.appointmentData.appointment_time
          );
        case 3:
          return this.appointmentData.type && this.appointmentData.reason_for_visit;
        default:
          return true;
      }
    },
  },
  methods: {
    ...mapActions('appointments', {
      openPatientModal: 'openPatientModal',
      closePatientModal: 'closePatientModal',
      fetchAvailableSlots: 'fetchAvailableSlots',
      createAppointment: 'createAppointment',
    }),

    showPatientSearch() {
      this.openPatientModal();
    },

    onPatientSelected(patient) {
      this.selectedPatient = patient;
      this.appointmentData.patient_id = patient.id;
      this.closePatientModal();
    },

    clearPatient() {
      this.selectedPatient = null;
      this.appointmentData.patient_id = '';
    },

    async loadDoctors() {
      this.loadingDoctors = true;
      try {
        const response = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 100,
          filter: { department: 'Medical Practioners' },
        });
        this.doctors = response.data.data.docs || [];
      } catch (error) {
        console.error('Failed to load doctors:', error);
      } finally {
        this.loadingDoctors = false;
      }
    },

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

    onDoctorChange() {
      this.appointmentData.appointment_time = '';
      if (this.appointmentData.doctor_id && this.appointmentData.appointment_date) {
        this.loadAvailableSlots();
      }
    },

    onDateChange() {
      this.appointmentData.appointment_time = '';
      if (this.appointmentData.doctor_id && this.appointmentData.appointment_date) {
        this.loadAvailableSlots();
      }
    },

    async loadAvailableSlots() {
      this.loadingSlots = true;
      try {
        await this.fetchAvailableSlots({
          doctor_id: this.appointmentData.doctor_id,
          date: this.appointmentData.appointment_date,
          duration_minutes: this.appointmentData.duration_minutes || 30,
        });
        this.availableSlots = this.$store.getters['appointments/availableSlots'];
      } catch (error) {
        console.error('Failed to load available slots:', error);
        this.availableSlots = [];
      } finally {
        this.loadingSlots = false;
      }
    },

    selectTimeSlot(time) {
      this.appointmentData.appointment_time = time;
    },

    onTimeSlotSelected(slot) {
      this.appointmentData.appointment_time = slot.time;
    },

    onTimeSlotCleared() {
      this.appointmentData.appointment_time = '';
      this.selectedTimeSlot = null;
    },

    nextStep() {
      if (this.canProceedToNextStep && this.currentStep < 4) {
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    async confirmAppointment() {
      this.submitting = true;
      try {
        // Get selected doctor data
        const selectedDoctor = this.doctors.find((d) => d.id === this.appointmentData.doctor_id);

        const formData = {
          ...this.appointmentData,
          patient_id: this.selectedPatient.id,
          status: 'Scheduled',
          // Auto-populate missing fields
          professional: selectedDoctor?.role || 'Doctor',
          department:
            this.appointmentData.department || selectedDoctor?.department || 'General Medicine',
          scheduled_by: this.$store.state.auth.user?.id || 1, // Use current user ID
        };

        await this.createAppointment(formData);

        this.$bvToast.toast('Appointment booked successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });

        // Reset form and redirect
        this.resetForm();
        this.$router.push('/appointments/list');
      } catch (error) {
        this.$bvToast.toast(error.response?.data?.message || 'Failed to book appointment', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.submitting = false;
      }
    },

    // Utility methods
    getPatientAge(patient) {
      if (!patient?.date_of_birth) return 'N/A';
      const today = new Date();
      const birthDate = new Date(patient.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age + ' years';
    },

    getPatientInsurance(patient) {
      if (!patient?.insurances || patient.insurances.length === 0) {
        return 'No Insurance';
      }
      return patient.insurances[0].insurance.name;
    },

    getSelectedDoctorName() {
      const doctor = this.doctors.find((d) => d.id === this.appointmentData.doctor_id);
      return doctor ? doctor.fullname : 'N/A';
    },

    getTypeText(type) {
      const option = this.appointmentTypeOptions.find((opt) => opt.value === type);
      return option ? option.text : type;
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

    resetForm() {
      this.currentStep = 1;
      this.selectedPatient = null;
      this.selectedTimeSlot = null;
      this.appointmentData = {
        patient_id: '',
        doctor_id: '',
        type: 'CONSULTATION',
        priority: 'NORMAL',
        department: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 30,
        reason_for_visit: '',
        notes: '',
        professional: '',
      };
    },
  },

  async created() {
    // Defer loading doctors; they will load on search or when needed
  },

  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.wizard-step {
  transition: all 0.3s ease;
}

.wizard-step.current .wizard-number,
.wizard-step.done .wizard-number {
  background-color: #3699ff;
  color: white;
}

.wizard-step.done .wizard-number {
  background-color: #1bc5bd;
}

.time-slots-grid .time-slot {
  transition: all 0.2s ease;
}

.time-slots-grid .time-slot:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.time-slots-grid .time-slot.active {
  background-color: #3699ff;
  border-color: #3699ff;
  color: white;
}

.step-content {
  min-height: 400px;
}

@media (max-width: 768px) {
  .wizard-steps {
    flex-direction: column;
  }

  .wizard-step {
    margin-bottom: 1rem;
  }

  .time-slots-grid .col-6 {
    margin-bottom: 0.5rem;
  }
}
</style>
