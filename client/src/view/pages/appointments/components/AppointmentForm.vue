<template>
  <b-modal
    id="appointmentFormModal"
    :title="isEditing ? 'Edit Appointment' : 'Create New Appointment'"
    size="xl"
    :hide-header-close="true"
    :hide-footer="true"
    v-model="activePrompt"
    @hide="handleClose"
    @close="handleClose"
    ref="appointmentFormModal"
  >
    <div class="appointment-form">
      <!-- Form Header -->
      <div class="form-header mb-4">
        <div class="d-flex align-items-center">
          <div class="form-icon mr-3">
            <i class="fas fa-calendar-plus fa-2x text-primary"></i>
          </div>
          <div>
            <h5 class="mb-1">{{ isEditing ? 'Edit Appointment' : 'Schedule New Appointment' }}</h5>
            <p class="text-muted mb-0">
              {{
                isEditing ? 'Update appointment details' : 'Create a new appointment for a patient'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <b-form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <!-- Patient Selection -->
          <div class="col-md-6">
            <b-form-group
              label="Patient"
              label-for="patient"
              :state="getFieldState('patient_id')"
              :invalid-feedback="getFieldError('patient_id')"
              required
            >
              <div class="patient-selector">
                <div v-if="selectedPatient" class="selected-patient-card">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="patient-info">
                      <div class="patient-name">
                        <strong>{{ selectedPatient.fullname }}</strong>
                        <span
                          class="badge badge-sm ml-2"
                          :class="getPatientInsuranceClass(selectedPatient.insurances)"
                        >
                          {{ getPatientInsuranceText(selectedPatient.insurances) }}
                        </span>
                      </div>
                      <small class="text-muted">
                        ID: {{ selectedPatient.hospital_id }} | Phone:
                        {{ selectedPatient.phone || 'N/A' }}
                      </small>
                    </div>
                    <b-button
                      size="sm"
                      variant="outline-secondary"
                      @click="clearPatient"
                      :disabled="submitting"
                    >
                      Change
                    </b-button>
                  </div>
                </div>
                <div v-else>
                  <b-button
                    variant="outline-primary"
                    @click="showPatientSearchModal"
                    :disabled="submitting"
                    block
                  >
                    <i class="fas fa-search mr-2"></i>
                    Select Patient
                  </b-button>
                  <small class="form-text text-muted">
                    Search and select a patient for this appointment
                  </small>
                </div>
              </div>
            </b-form-group>
          </div>

          <!-- Doctor Selection -->
          <div class="col-md-6">
            <b-form-group
              label="Doctor"
              label-for="doctor"
              :state="getFieldState('doctor_id')"
              :invalid-feedback="getFieldError('doctor_id')"
              required
            >
              <v-select
                v-model="form.doctor_id"
                :options="doctors"
                label="fullname"
                :reduce="(doctor) => doctor.id"
                placeholder="Select Doctor"
                :loading="loadingDoctors"
                :disabled="submitting"
                @search="searchDoctors"
                @input="validateField('doctor_id')"
              >
                <template #option="option">
                  <div class="doctor-option">
                    <div class="doctor-name">{{ option.fullname }}</div>
                    <small class="text-muted"
                      >{{ option.role || 'Doctor' }} - {{ option.department }}</small
                    >
                  </div>
                </template>
                <template #no-options>
                  <div class="text-muted">Type to search for doctors...</div>
                </template>
              </v-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Appointment Type -->
          <div class="col-md-4">
            <b-form-group
              label="Appointment Type"
              label-for="appointment-type"
              :state="getFieldState('appointment_type')"
              :invalid-feedback="getFieldError('appointment_type')"
              required
            >
              <b-form-select
                id="appointment-type"
                v-model="form.appointment_type"
                :options="appointmentTypeOptions"
                :state="getFieldState('appointment_type')"
                :disabled="submitting"
                @change="validateField('appointment_type')"
                required
              >
                <template #first>
                  <option value="">Select Type</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>

          <!-- Priority -->
          <div class="col-md-4">
            <b-form-group
              label="Priority"
              label-for="priority"
              :state="getFieldState('priority')"
              :invalid-feedback="getFieldError('priority')"
            >
              <b-form-select
                id="priority"
                v-model="form.priority"
                :options="priorityOptions"
                :state="getFieldState('priority')"
                :disabled="submitting"
                @change="validateField('priority')"
              >
                <template #first>
                  <option value="">Select Priority</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>

          <!-- Department -->
          <div class="col-md-4">
            <b-form-group
              label="Department"
              label-for="department"
              :state="getFieldState('department')"
              :invalid-feedback="getFieldError('department')"
            >
              <v-select
                v-model="form.department"
                :options="departments"
                label="name"
                :reduce="(dept) => dept.name"
                placeholder="Select Department"
                :loading="loadingDepartments"
                :disabled="submitting"
                @search="searchDepartments"
                @input="validateField('department')"
              >
                <template #no-options>
                  <div class="text-muted">Type to search for departments...</div>
                </template>
              </v-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Appointment Date -->
          <div class="col-md-4">
            <b-form-group
              label="Appointment Date"
              label-for="appointment-date"
              :state="getFieldState('appointment_date')"
              :invalid-feedback="getFieldError('appointment_date')"
              required
            >
              <b-form-input
                id="appointment-date"
                v-model="form.appointment_date"
                type="date"
                :min="minDate"
                :max="maxDate"
                :state="getFieldState('appointment_date')"
                :disabled="submitting"
                @change="validateField('appointment_date')"
                @input="onDateChange"
                required
              ></b-form-input>
            </b-form-group>
          </div>

          <!-- Appointment Time -->
          <div class="col-md-4">
            <b-form-group
              label="Appointment Time"
              label-for="appointment-time"
              :state="getFieldState('appointment_time')"
              :invalid-feedback="getFieldError('appointment_time')"
              required
            >
              <b-form-input
                id="appointment-time"
                v-model="form.appointment_time"
                type="time"
                :state="getFieldState('appointment_time')"
                :disabled="submitting || !form.appointment_date || !form.doctor_id"
                @change="validateField('appointment_time')"
                required
              ></b-form-input>
              <small class="form-text text-muted">
                {{ timeSlotStatus }}
              </small>
            </b-form-group>
          </div>

          <!-- Duration -->
          <div class="col-md-4">
            <b-form-group
              label="Duration (minutes)"
              label-for="duration"
              :state="getFieldState('duration_minutes')"
              :invalid-feedback="getFieldError('duration_minutes')"
            >
              <b-form-select
                id="duration"
                v-model="form.duration_minutes"
                :options="durationOptions"
                :state="getFieldState('duration_minutes')"
                :disabled="submitting"
                @change="validateField('duration_minutes')"
              >
                <template #first>
                  <option value="">Select Duration</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>
        </div>

        <div class="row">
          <!-- Reason for Visit -->
          <div class="col-md-8">
            <b-form-group
              label="Reason for Visit"
              label-for="reason-for-visit"
              :state="getFieldState('reason_for_visit')"
              :invalid-feedback="getFieldError('reason_for_visit')"
              required
            >
              <b-form-textarea
                id="reason-for-visit"
                v-model="form.reason_for_visit"
                rows="3"
                placeholder="Enter the reason for this appointment..."
                :state="getFieldState('reason_for_visit')"
                :disabled="submitting"
                @blur="validateField('reason_for_visit')"
                required
              ></b-form-textarea>
            </b-form-group>
          </div>

          <!-- Status -->
          <div class="col-md-4">
            <b-form-group
              label="Status"
              label-for="status"
              :state="getFieldState('status')"
              :invalid-feedback="getFieldError('status')"
            >
              <b-form-select
                id="status"
                v-model="form.status"
                :options="statusOptions"
                :state="getFieldState('status')"
                :disabled="submitting"
                @change="validateField('status')"
              >
                <template #first>
                  <option value="">Select Status</option>
                </template>
              </b-form-select>
              <small class="form-text text-muted"> Default: Scheduled </small>
            </b-form-group>
          </div>
        </div>

        <!-- Notes -->
        <div class="row">
          <div class="col-12">
            <b-form-group
              label="Additional Notes"
              label-for="notes"
              :state="getFieldState('notes')"
              :invalid-feedback="getFieldError('notes')"
            >
              <b-form-textarea
                id="notes"
                v-model="form.notes"
                rows="2"
                placeholder="Any additional notes or instructions (optional)"
                :state="getFieldState('notes')"
                :disabled="submitting"
                @blur="validateField('notes')"
              ></b-form-textarea>
            </b-form-group>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions mt-4 pt-3 border-top">
          <div class="d-flex justify-content-between align-items-center">
            <div class="form-info">
              <small class="text-muted">
                <i class="fas fa-info-circle mr-1"></i>
                All fields marked with * are required
              </small>
            </div>
            <div class="form-buttons">
              <b-button
                variant="outline-secondary"
                @click="handleClose"
                :disabled="submitting"
                class="mr-2"
              >
                Cancel
              </b-button>
              <b-button type="submit" variant="primary" :disabled="submitting || !isFormValid">
                <span v-if="submitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  {{ isEditing ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>
                  <i class="fas fa-save mr-2"></i>
                  {{ isEditing ? 'Update Appointment' : 'Create Appointment' }}
                </span>
              </b-button>
            </div>
          </div>
        </div>
      </b-form>

      <!-- Validation Summary -->
      <div v-if="validationErrors.length > 0" class="validation-summary mt-3">
        <div class="alert alert-danger">
          <h6 class="alert-heading">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Please fix the following errors:
          </h6>
          <ul class="mb-0">
            <li v-for="error in validationErrors" :key="error" class="text-danger">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Patient Search Modal -->
    <PatientSearchModal @patient-selected="onPatientSelected" />
  </b-modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import vSelect from 'vue-select';
import PatientSearchModal from './PatientSearchModal.vue';

export default {
  name: 'AppointmentForm',
  components: {
    vSelect,
    PatientSearchModal,
  },
  props: {
    appointment: {
      type: Object,
      default: null,
    },
    displayPrompt: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      submitting: false,
      loadingDoctors: false,
      loadingDepartments: false,
      selectedPatient: null,
      doctors: [],
      departments: [],
      availableSlots: [],
      checkingSlots: false,
      form: {
        patient_id: '',
        doctor_id: '',
        appointment_type: 'CONSULTATION',
        priority: 'NORMAL',
        department: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 30,
        reason_for_visit: '',
        status: 'Scheduled',
        notes: '',
      },
      validation: {
        patient_id: { valid: null, error: '' },
        doctor_id: { valid: null, error: '' },
        appointment_type: { valid: null, error: '' },
        priority: { valid: null, error: '' },
        department: { valid: null, error: '' },
        appointment_date: { valid: null, error: '' },
        appointment_time: { valid: null, error: '' },
        duration_minutes: { valid: null, error: '' },
        reason_for_visit: { valid: null, error: '' },
        status: { valid: null, error: '' },
        notes: { valid: null, error: '' },
      },
      searchTimeout: null,
    };
  },
  computed: {
    ...mapState('appointments', ['showPatientModal']),

    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },

    isEditing() {
      return !!this.appointment;
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

    statusOptions() {
      return [
        { value: 'Scheduled', text: 'Scheduled' },
        { value: 'Confirmed', text: 'Confirmed' },
        { value: 'Rescheduled', text: 'Rescheduled' },
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

    minDate() {
      return new Date().toISOString().split('T')[0];
    },

    maxDate() {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      return maxDate.toISOString().split('T')[0];
    },

    validationErrors() {
      const errors = [];
      Object.keys(this.validation).forEach((field) => {
        if (this.validation[field]?.error) {
          errors.push(this.validation[field].error);
        }
      });
      return errors;
    },

    isFormValid() {
      const requiredFields = [
        'patient_id',
        'doctor_id',
        'appointment_type',
        'appointment_date',
        'appointment_time',
        'reason_for_visit',
      ];

      return requiredFields.every((field) => {
        const value = this.form[field];
        const validation = this.validation[field];

        if (validation?.valid === false) {
          return false;
        }

        if (field === 'patient_id') {
          return this.selectedPatient && this.selectedPatient.id;
        }

        return value && value.toString().trim().length > 0;
      });
    },

    timeSlotStatus() {
      if (!this.form.appointment_date || !this.form.doctor_id) {
        return 'Select date and doctor first';
      }
      if (this.checkingSlots) {
        return 'Checking availability...';
      }
      if (this.form.appointment_time) {
        // You can add slot availability checking logic here
        return 'Time slot selected';
      }
      return 'Select a time slot';
    },
  },
  watch: {
    displayPrompt(val) {
      if (val) {
        this.initializeForm();
        this.loadDoctors();
        this.loadDepartments();
      }
    },

    appointment: {
      handler(newVal) {
        if (newVal) {
          this.initializeForm();
        }
      },
      immediate: true,
    },

    'form.doctor_id'(newVal) {
      if (newVal && this.form.appointment_date) {
        this.checkAvailableSlots();
      }
    },

    'form.appointment_date'(newVal) {
      if (newVal && this.form.doctor_id) {
        this.checkAvailableSlots();
      }
    },
  },
  methods: {
    ...mapActions('appointments', ['showPatientModal', 'hidePatientModal']),

    initializeForm() {
      if (this.appointment) {
        // Edit mode
        this.form = {
          patient_id: this.appointment.patient_id || '',
          doctor_id: this.appointment.doctor_id || '',
          appointment_type: this.appointment.appointment_type || 'CONSULTATION',
          priority: this.appointment.priority || 'NORMAL',
          department: this.appointment.department || '',
          appointment_date: this.appointment.appointment_date || '',
          appointment_time: this.appointment.appointment_time || '',
          duration_minutes: this.appointment.duration_minutes || 30,
          reason_for_visit: this.appointment.reason_for_visit || '',
          status: this.appointment.status || 'Scheduled',
          notes: this.appointment.notes || '',
        };

        if (this.appointment.patient) {
          this.selectedPatient = this.appointment.patient;
        }
      } else {
        // Create mode
        this.form = {
          patient_id: '',
          doctor_id: '',
          appointment_type: 'CONSULTATION',
          priority: 'NORMAL',
          department: '',
          appointment_date: '',
          appointment_time: '',
          duration_minutes: 30,
          reason_for_visit: '',
          status: 'Scheduled',
          notes: '',
        };
        this.selectedPatient = null;
      }

      // Reset validation
      Object.keys(this.validation).forEach((field) => {
        this.validation[field] = { valid: null, error: '' };
      });
    },

    validateField(fieldName) {
      const value = this.form[fieldName];
      let valid = true;
      let error = '';

      switch (fieldName) {
        case 'patient_id':
          if (!this.selectedPatient || !this.selectedPatient.id) {
            valid = false;
            error = 'Patient is required';
          }
          break;

        case 'doctor_id':
          if (!value) {
            valid = false;
            error = 'Doctor is required';
          }
          break;

        case 'appointment_type':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Appointment type is required';
          }
          break;

        case 'appointment_date':
          if (!value) {
            valid = false;
            error = 'Appointment date is required';
          } else {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
              valid = false;
              error = 'Appointment date cannot be in the past';
            }
          }
          break;

        case 'appointment_time':
          if (!value) {
            valid = false;
            error = 'Appointment time is required';
          }
          break;

        case 'reason_for_visit':
          if (!value || value.trim().length === 0) {
            valid = false;
            error = 'Reason for visit is required';
          } else if (value.trim().length < 5) {
            valid = false;
            error = 'Reason for visit must be at least 5 characters';
          }
          break;
      }

      this.validation[fieldName] = { valid, error };
      return valid;
    },

    validateAllFields() {
      let allValid = true;
      const requiredFields = [
        'patient_id',
        'doctor_id',
        'appointment_type',
        'appointment_date',
        'appointment_time',
        'reason_for_visit',
      ];

      requiredFields.forEach((field) => {
        if (!this.validateField(field)) {
          allValid = false;
        }
      });

      return allValid;
    },

    getFieldState(fieldName) {
      return this.validation[fieldName]?.valid;
    },

    getFieldError(fieldName) {
      return this.validation[fieldName]?.error || '';
    },

    showPatientSearchModal() {
      this.showPatientModal();
    },

    onPatientSelected(patient) {
      this.selectedPatient = patient;
      this.form.patient_id = patient.id;
      this.validateField('patient_id');
      this.hidePatientModal();
    },

    clearPatient() {
      this.selectedPatient = null;
      this.form.patient_id = '';
      this.validateField('patient_id');
    },

    getPatientInsuranceClass(insurances) {
      if (!insurances || insurances.length === 0) {
        return 'badge-warning';
      }
      const insurance = insurances[0].insurance;
      if (insurance.name.toLowerCase().includes('nhis')) {
        return 'badge-success';
      }
      if (insurance.name.toLowerCase().includes('hmo')) {
        return 'badge-info';
      }
      return 'badge-secondary';
    },

    getPatientInsuranceText(insurances) {
      if (!insurances || insurances.length === 0) {
        return 'No Insurance';
      }
      return insurances[0].insurance.name;
    },

    async loadDoctors() {
      this.loadingDoctors = true;
      try {
        const response = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 100,
          filter: 'doctor',
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
              filter: 'doctor',
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

    async loadDepartments() {
      this.loadingDepartments = true;
      try {
        // Assuming departments are available in model store
        const response = await this.$store.dispatch('model/fetchDepartments');
        this.departments = response.data?.data || [];
      } catch (error) {
        console.error('Failed to load departments:', error);
        // Fallback departments
        this.departments = [
          { id: 1, name: 'General Medicine' },
          { id: 2, name: 'Pediatrics' },
          { id: 3, name: 'Surgery' },
          { id: 4, name: 'Obstetrics & Gynecology' },
          { id: 5, name: 'Cardiology' },
          { id: 6, name: 'Orthopedics' },
          { id: 7, name: 'Dermatology' },
          { id: 8, name: 'Psychiatry' },
        ];
      } finally {
        this.loadingDepartments = false;
      }
    },

    searchDepartments(search) {
      // Simple local search for departments
      if (search.length > 0) {
        const filtered = this.departments.filter((dept) =>
          dept.name.toLowerCase().includes(search.toLowerCase())
        );
        this.departments = filtered;
      } else {
        this.loadDepartments();
      }
    },

    onDateChange() {
      this.validateField('appointment_date');
      if (this.form.appointment_date && this.form.doctor_id) {
        this.checkAvailableSlots();
      }
    },

    async checkAvailableSlots() {
      if (!this.form.doctor_id || !this.form.appointment_date) return;

      this.checkingSlots = true;
      try {
        await this.$store.dispatch('appointments/fetchAvailableSlots', {
          doctor_id: this.form.doctor_id,
          date: this.form.appointment_date,
          duration_minutes: this.form.duration_minutes,
        });
        this.availableSlots = this.$store.getters['appointments/availableSlots'];
      } catch (error) {
        console.error('Failed to check available slots:', error);
      } finally {
        this.checkingSlots = false;
      }
    },

    async handleSubmit() {
      if (!this.validateAllFields()) {
        this.$bvToast.toast('Please fix the validation errors', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      try {
        this.submitting = true;

        const formData = {
          ...this.form,
          patient_id: this.selectedPatient.id,
          reason_for_visit: this.form.reason_for_visit.trim(),
          notes: this.form.notes?.trim() || '',
        };

        let response;
        if (this.isEditing) {
          response = await this.$store.dispatch('appointments/updateAppointment', {
            id: this.appointment.id,
            data: formData,
          });
        } else {
          response = await this.$store.dispatch('appointments/createAppointment', formData);
        }

        if (response && response.data) {
          this.$emit('saved', response.data.data);
          this.$bvToast.toast(
            `Appointment ${this.isEditing ? 'updated' : 'created'} successfully`,
            {
              title: 'Success',
              variant: 'success',
              solid: true,
            }
          );
          this.handleClose();
        }
      } catch (error) {
        console.error('Failed to save appointment:', error);
        this.$bvToast.toast(
          error.response?.data?.message ||
            `Failed to ${this.isEditing ? 'update' : 'create'} appointment`,
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      } finally {
        this.submitting = false;
      }
    },

    handleClose() {
      if (this.submitting) return;
      this.$emit('closeModal');
    },
  },

  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.appointment-form {
  padding: 0.5rem;
}

.form-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.form-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.patient-selector {
  min-height: 58px;
}

.selected-patient-card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.patient-info {
  flex: 1;
}

.patient-name {
  margin-bottom: 0.25rem;
}

.doctor-option {
  padding: 0.25rem 0;
}

.doctor-name {
  font-weight: 500;
}

.form-actions {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.form-buttons {
  display: flex;
  gap: 0.5rem;
}

.validation-summary {
  margin-top: 1rem;
}

.validation-summary ul {
  padding-left: 1.5rem;
}

.validation-summary li {
  margin-bottom: 0.25rem;
}

/* v-select custom styles */
.v-select {
  min-height: 38px;
}

.v-select.vs--disabled {
  background-color: #e9ecef;
  opacity: 0.6;
}

.v-select .vs__dropdown-toggle {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  min-height: 38px;
}

.v-select.vs--single.vs--open .vs__selected {
  position: absolute;
  opacity: 0.4;
}

.v-select .vs__search {
  font-size: 1rem;
  line-height: 1.5;
}

.v-select .vs__actions {
  padding: 0.375rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .form-buttons {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .appointment-form {
    padding: 0.25rem;
  }

  .form-header {
    text-align: center;
  }

  .form-icon {
    margin: 0 auto 1rem auto;
  }

  .selected-patient-card {
    padding: 0.75rem;
  }
}
</style>
