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

    <!-- Wizard Progress - Modern Card-Based Design -->
    <div class="wizard-progress-container mb-4">
      <div class="row">
        <div class="col-12">
          <div class="wizard-steps-cards">
            <!-- Step 1: Patient Selection -->
            <div
              class="wizard-step-card"
              :class="{
                active: currentStep === 1,
                completed: currentStep > 1,
                clickable: currentStep > 1,
              }"
              @click="goToStep(1)"
            >
              <div class="step-card-icon">
                <i class="fas fa-user" v-if="currentStep <= 1"></i>
                <i class="fas fa-check-circle" v-else></i>
              </div>
              <div class="step-card-content">
                <div class="step-card-title">Patient Selection</div>
                <div class="step-card-desc">Choose or search patient</div>
              </div>
              <div class="step-card-number">1</div>
            </div>

            <!-- Connector Line -->
            <div class="step-connector" :class="{ completed: currentStep > 1 }"></div>

            <!-- Step 2: Doctor & Schedule -->
            <div
              class="wizard-step-card"
              :class="{
                active: currentStep === 2,
                completed: currentStep > 2,
                clickable: currentStep > 2,
              }"
              @click="goToStep(2)"
            >
              <div class="step-card-icon">
                <i class="fas fa-calendar-check" v-if="currentStep <= 2"></i>
                <i class="fas fa-check-circle" v-else></i>
              </div>
              <div class="step-card-content">
                <div class="step-card-title">Doctor & Schedule</div>
                <div class="step-card-desc">Select doctor and time</div>
              </div>
              <div class="step-card-number">2</div>
            </div>

            <!-- Connector Line -->
            <div class="step-connector" :class="{ completed: currentStep > 2 }"></div>

            <!-- Step 3: Appointment Details -->
            <div
              class="wizard-step-card"
              :class="{
                active: currentStep === 3,
                completed: currentStep > 3,
                clickable: currentStep > 3,
              }"
              @click="goToStep(3)"
            >
              <div class="step-card-icon">
                <i class="fas fa-clipboard-list" v-if="currentStep <= 3"></i>
                <i class="fas fa-check-circle" v-else></i>
              </div>
              <div class="step-card-content">
                <div class="step-card-title">Appointment Details</div>
                <div class="step-card-desc">Type, reason, and notes</div>
              </div>
              <div class="step-card-number">3</div>
            </div>

            <!-- Connector Line -->
            <div class="step-connector" :class="{ completed: currentStep > 3 }"></div>

            <!-- Step 4: Confirmation -->
            <div
              class="wizard-step-card"
              :class="{
                active: currentStep === 4,
                completed: false,
                clickable: currentStep > 4,
              }"
            >
              <div class="step-card-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="step-card-content">
                <div class="step-card-title">Confirmation</div>
                <div class="step-card-desc">Review and confirm</div>
              </div>
              <div class="step-card-number">4</div>
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
              <div class="step-header text-center mb-5">
                <div class="step-icon-wrapper mb-3">
                  <i class="fas fa-user-search fa-3x text-primary"></i>
                </div>
                <h4 class="font-weight-bold mb-2">Select Patient</h4>
                <p class="text-muted mb-0">Search and select the patient for this appointment</p>
              </div>

              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <!-- Selected Patient Display -->
                  <div
                    v-if="selectedPatient"
                    class="card border-primary mb-4 selected-patient-card"
                  >
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
                      <div class="text-right mt-3">
                        <b-button variant="outline-secondary" @click="clearPatient">
                          <i class="fas fa-times mr-1"></i>Change Patient
                        </b-button>
                      </div>
                    </div>
                  </div>

                  <!-- Patient Search -->
                  <div v-else>
                    <div class="form-group">
                      <label class="font-weight-bold"
                        >Patient <span class="text-danger">*</span></label
                      >
                      <v-select
                        v-model="appointmentData.patient_id"
                        :options="patients"
                        label="fullname"
                        :reduce="(patient) => patient.id"
                        placeholder="Search and select patient..."
                        :loading="loadingPatients"
                        :disabled="submitting"
                        @search="searchPatients"
                        @input="onPatientInput"
                        :clearable="true"
                      >
                        <template #option="option">
                          <div class="d-flex flex-column">
                            <div class="patient-name font-weight-bold">{{ option.fullname }}</div>
                            <small class="text-muted">
                              ID: {{ option.hospital_id || 'N/A' }} · {{ option.phone || 'N/A' }}
                            </small>
                          </div>
                        </template>
                        <template #no-options>
                          <div class="text-muted">Type to search for patients...</div>
                        </template>
                      </v-select>
                    </div>

                    <div class="text-center mt-3">
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
              <div class="step-header text-center mb-5">
                <div class="step-icon-wrapper mb-3">
                  <i class="fas fa-calendar-check fa-3x text-primary"></i>
                </div>
                <h4 class="font-weight-bold mb-2">Select Doctor & Schedule</h4>
                <p class="text-muted mb-0">Choose the doctor and appointment time</p>
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
              <div class="step-header text-center mb-5">
                <div class="step-icon-wrapper mb-3">
                  <i class="fas fa-clipboard-list fa-3x text-primary"></i>
                </div>
                <h4 class="font-weight-bold mb-2">Appointment Details</h4>
                <p class="text-muted mb-0">
                  Provide appointment type, reason, and additional details
                </p>
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
                        <b-form-group label-for="department">
                          <v-select
                            v-model="appointmentData.department"
                            :options="departments"
                            label="name"
                            :reduce="(dept) => dept.name"
                            placeholder="Select Department"
                            :loading="loadingDepartments"
                            :disabled="submitting"
                          >
                            <template #no-options>
                              <div class="text-muted">Type to search for departments...</div>
                            </template>
                          </v-select>
                        </b-form-group>
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
              <div class="step-header text-center mb-5">
                <div class="step-icon-wrapper mb-3">
                  <i class="fas fa-check-circle fa-3x text-success"></i>
                </div>
                <h4 class="font-weight-bold mb-2">Confirm Appointment</h4>
                <p class="text-muted mb-0">Review the appointment details before booking</p>
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
                            {{ getTypeText(appointmentData.type) }}
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
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import vSelect from 'vue-select';
import TimeSlotPicker from '../../../components/appointments/TimeSlotPicker.vue';
import {
  APPOINTMENT_TYPES,
  APPOINTMENT_PRIORITIES,
  APPOINTMENT_DURATIONS,
} from '@/view/pages/appointments/constants.js';
import { parseJwt } from '@/common/common';
import { departments as employeeDepartments } from '@/view/pages/employees/create/employeeRoles.js';

export default {
  name: 'BookAppointment',
  components: {
    vSelect,
    TimeSlotPicker,
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      loadingDoctors: false,
      loadingSlots: false,
      loadingPatients: false,
      loadingDepartments: false,
      selectedPatient: null,
      selectedTimeSlot: null,
      doctors: [],
      departments: [],
      patients: [],
      availableSlots: [],
      appointmentData: {
        patient_id: '',
        doctor_id: '',
        type: 'Consultation', // Use 'type' instead of 'appointment_type' for consistency
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
      currentUser: parseJwt(localStorage.getItem('user_token')),
    };
  },
  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0];
    },

    maxDate() {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      return maxDate.toISOString().split('T')[0];
    },

    appointmentTypeOptions() {
      return APPOINTMENT_TYPES;
    },

    priorityOptions() {
      return APPOINTMENT_PRIORITIES;
    },

    durationOptions() {
      return APPOINTMENT_DURATIONS;
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
      fetchAvailableSlots: 'fetchAvailableSlots',
      createAppointment: 'createAppointment',
    }),

    clearPatient() {
      this.selectedPatient = null;
      this.appointmentData.patient_id = '';
    },

    async searchPatients(search, loading) {
      if (!search || search.length <= 2) return;
      loading(true);
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        this.loadingPatients = true;
        try {
          const response = await this.$store.dispatch('patient/fetchPatients', {
            currentPage: 1,
            itemsPerPage: 50,
            search: search.trim(),
          });
          this.patients = response.data?.data?.docs || [];
          if (this.selectedPatient) {
            const exists = this.patients.some((p) => p.id === this.selectedPatient.id);
            if (!exists) this.patients = [this.selectedPatient, ...this.patients];
          }
        } catch (error) {
          // Handle error silently or show toast if needed
        } finally {
          this.loadingPatients = false;
          loading(false);
        }
      }, 300);
    },

    onPatientInput(value) {
      if (!value) {
        this.selectedPatient = null;
        this.appointmentData.patient_id = '';
      } else {
        const found = this.patients.find((p) => p.id === value);
        if (found) {
          this.selectedPatient = found;
          this.appointmentData.patient_id = found.id;
        }
      }
    },

    async loadDoctors() {
      this.loadingDoctors = true;
      try {
        const response = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 100,
          filter: { department: 'Medical Practitioners' },
        });
        this.doctors = response.data.data.docs || [];
      } catch (error) {
        console.error('Failed to load doctors:', error);
      } finally {
        this.loadingDoctors = false;
      }
    },

    async loadDepartments() {
      this.loadingDepartments = true;
      try {
        this.departments = (employeeDepartments || []).map((d) => ({
          id: d.id,
          name: d.department,
        }));
      } catch (e) {
        this.departments = [];
      } finally {
        this.loadingDepartments = false;
      }
    },

    searchDoctors(search, loading) {
      if (!search || search.length <= 2) return;
      loading(true);
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(async () => {
        try {
          const response = await this.$store.dispatch('employee/fetchEmployees', {
            currentPage: 1,
            itemsPerPage: 50,
            filter: { department: 'Medical Practitioners' },
            search,
          });
          this.doctors = response.data?.data?.docs || [];
        } catch (error) {
          console.error('Failed to search doctors:', error);
        } finally {
          loading(false);
        }
      }, 300);
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

    goToStep(step) {
      // Only allow going back to completed steps
      if (step < this.currentStep) {
        this.currentStep = step;
      }
    },

    async confirmAppointment() {
      this.submitting = true;
      try {
        const selectedDoctor = this.doctors.find((d) => d.id === this.appointmentData.doctor_id);

        // Shared fields used by both create and update (matching AppointmentModal structure)
        const basePayload = {
          doctor_id: this.appointmentData.doctor_id,
          appointment_date: this.appointmentData.appointment_date,
          appointment_time: this.appointmentData.appointment_time,
          duration_minutes: this.appointmentData.duration_minutes,
          type: this.appointmentData.type,
          department:
            this.appointmentData.department || selectedDoctor?.department || 'General Medicine',
          professional: selectedDoctor?.role || 'Doctor',
          priority: this.appointmentData.priority,
          notes: this.appointmentData.notes?.trim() || '',
          reason_for_visit: this.appointmentData.reason_for_visit.trim(),
        };

        // Create extends base with required creation-only fields
        const createPayload = {
          ...basePayload,
          patient_id: this.selectedPatient.id,
          scheduled_by: this.currentUser.sub,
        };

        await this.createAppointment(createPayload);

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
        type: 'Consultation',
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
    this.loadDoctors();
    this.loadDepartments();
  },

  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.book-appointment {
  padding: 0;
}

/* Modern Wizard Steps - Card Based Design */
.wizard-progress-container {
  margin-bottom: 2rem;
}

.wizard-steps-cards {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.wizard-step-card {
  flex: 1;
  min-width: 200px;
  background: #ffffff;
  border: 2px solid #e4e6ef;
  border-radius: 12px;
  padding: 1.5rem 1.25rem;
  position: relative;
  transition: all 0.3s ease;
  cursor: default;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.wizard-step-card.clickable {
  cursor: pointer;
}

.wizard-step-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wizard-step-card.active {
  border-color: #3699ff;
  background: linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%);
  box-shadow: 0 4px 16px rgba(54, 153, 255, 0.2);
  transform: translateY(-2px);
}

.wizard-step-card.completed {
  border-color: #1bc5bd;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
}

.wizard-step-card.completed .step-card-icon {
  color: #1bc5bd;
}

.step-card-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #b5b5c3;
  transition: all 0.3s ease;
}

.wizard-step-card.active .step-card-icon {
  color: #3699ff;
  transform: scale(1.1);
}

.step-card-content {
  flex: 1;
}

.step-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

.wizard-step-card.active .step-card-title {
  color: #3699ff;
  font-weight: 700;
}

.step-card-desc {
  font-size: 0.8rem;
  color: #b5b5c3;
  transition: all 0.3s ease;
}

.wizard-step-card.active .step-card-desc {
  color: #7e8299;
}

.step-card-number {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e4e6ef;
  color: #7e8299;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.wizard-step-card.active .step-card-number {
  background: #3699ff;
  color: white;
  transform: scale(1.1);
}

.wizard-step-card.completed .step-card-number {
  background: #1bc5bd;
  color: white;
}

.step-connector {
  flex: 0 0 40px;
  height: 2px;
  background: #e4e6ef;
  position: relative;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
}

.step-connector.completed {
  background: #1bc5bd;
}

.step-connector::after {
  content: '';
  position: absolute;
  right: -4px;
  top: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e4e6ef;
  transition: all 0.3s ease;
}

.step-connector.completed::after {
  background: #1bc5bd;
}

/* Step Content */
.step-content {
  min-height: 400px;
  padding: 2rem 0;
}

.step-header {
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f4f6f9;
  margin-bottom: 2rem;
}

.step-icon-wrapper {
  display: inline-block;
  padding: 1rem;
  background: linear-gradient(135deg, #f7f9fc 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selected-patient-card {
  border: 2px solid #3699ff;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.selected-patient-card:hover {
  box-shadow: 0 4px 12px rgba(54, 153, 255, 0.15);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  margin-bottom: 0.5rem;
  display: block;
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

/* Responsive Design */
@media (max-width: 1200px) {
  .wizard-steps-cards {
    gap: 0.25rem;
  }

  .wizard-step-card {
    min-width: 160px;
    padding: 1.25rem 1rem;
  }

  .step-card-icon {
    font-size: 1.5rem;
  }

  .step-connector {
    flex: 0 0 20px;
  }
}

@media (max-width: 992px) {
  .wizard-steps-cards {
    flex-direction: column;
    gap: 1rem;
  }

  .wizard-step-card {
    width: 100%;
    max-width: 400px;
    flex-direction: row;
    text-align: left;
    padding: 1rem 1.5rem;
  }

  .step-card-icon {
    margin-right: 1rem;
    margin-bottom: 0;
    font-size: 1.75rem;
  }

  .step-card-content {
    flex: 1;
  }

  .step-card-number {
    position: static;
    margin-left: auto;
  }

  .step-connector {
    flex: 0 0 2px;
    width: 2px;
    height: 30px;
    margin: 0 auto;
  }

  .step-connector::after {
    right: -3px;
    top: auto;
    bottom: -4px;
  }
}

@media (max-width: 768px) {
  .wizard-step-card {
    padding: 0.875rem 1rem;
  }

  .step-card-title {
    font-size: 0.875rem;
  }

  .step-card-desc {
    font-size: 0.75rem;
  }

  .step-card-icon {
    font-size: 1.5rem;
  }
}
</style>
