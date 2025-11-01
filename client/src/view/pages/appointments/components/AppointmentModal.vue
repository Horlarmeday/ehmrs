<template>
  <b-modal
    id="appointmentModal"
    :title="isEditing ? 'Edit Appointment' : 'Create New Appointment'"
    size="xl"
    :hide-header-close="true"
    :hide-footer="true"
    v-model="activePrompt"
    @hide="handleClose"
    @close="handleClose"
  >
    <div class="appointment-form">
      <b-form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6">
            <b-form-group
              label="Patient"
              label-for="patient"
              :state="getFieldState('patient_id')"
              :invalid-feedback="getFieldError('patient_id')"
              required
            >
              <v-select
                v-model="form.patient_id"
                :options="patients"
                label="fullname"
                :reduce="(patient) => patient.id"
                placeholder="Select Patient"
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
          <div class="col-md-4">
            <b-form-group
              label="Appointment Type"
              label-for="appointment-type"
              :state="getFieldState('type')"
              :invalid-feedback="getFieldError('type')"
              required
            >
              <b-form-select
                id="appointment-type"
                v-model="form.type"
                :options="appointmentTypeOptions"
                :state="getFieldState('type')"
                :disabled="submitting"
                @change="validateField('type')"
                required
              >
                <template #first>
                  <option value="">Select Type</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>

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
                :disabled="submitting"
                @change="validateField('priority')"
              >
                <template #first>
                  <option value="">Select Priority</option>
                </template>
              </b-form-select>
            </b-form-group>
          </div>

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
                :disabled="submitting"
                @change="onDateChange"
                required
              />
            </b-form-group>
          </div>

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
                :disabled="submitting || !form.appointment_date || !form.doctor_id"
                @change="validateField('appointment_time')"
                required
              />
              <small class="form-text text-muted">{{ timeSlotStatus }}</small>
            </b-form-group>
          </div>

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
                :disabled="submitting"
                @blur="validateField('reason_for_visit')"
                required
              />
            </b-form-group>
          </div>

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
                :disabled="submitting"
                @change="validateField('status')"
              >
                <template #first>
                  <option value="">Select Status</option>
                </template>
              </b-form-select>
              <small class="form-text text-muted">Default: Scheduled</small>
            </b-form-group>
          </div>
        </div>

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
                placeholder="Any additional notes (optional)"
                :disabled="submitting"
                @blur="validateField('notes')"
              />
            </b-form-group>
          </div>
        </div>

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
                >Cancel</b-button
              >
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

      <div v-if="validationErrors.length > 0" class="validation-summary mt-3">
        <div class="alert alert-danger">
          <h6 class="alert-heading">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Please fix the following errors:
          </h6>
          <ul class="mb-0">
            <li v-for="error in validationErrors" :key="error" class="text-danger">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { mapActions } from 'vuex';
import vSelect from 'vue-select';
import { departments as employeeDepartments } from '@/view/pages/employees/create/employeeRoles.js';

export default {
  name: 'AppointmentModal',
  components: { vSelect },
  props: {
    appointment: { type: Object, default: null },
    displayPrompt: { type: Boolean, required: true },
  },
  data() {
    return {
      submitting: false,
      loadingDoctors: false,
      loadingDepartments: false,
      checkingSlots: false,
      selectedPatient: null,
      loadingPatients: false,
      doctors: [],
      patients: [],
      departments: [],
      form: {
        patient_id: '',
        doctor_id: '',
        type: 'CONSULTATION',
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
        type: { valid: null, error: '' },
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
        if (this.validation[field]?.error) errors.push(this.validation[field].error);
      });
      return errors;
    },
    isFormValid() {
      const required = [
        'patient_id',
        'doctor_id',
        'type',
        'appointment_date',
        'appointment_time',
        'reason_for_visit',
      ];
      return required.every((field) => {
        if (field === 'patient_id') return this.selectedPatient && this.selectedPatient.id;
        const val = this.form[field];
        const v = this.validation[field];
        if (v?.valid === false) return false;
        return val && val.toString().trim().length > 0;
      });
    },
    timeSlotStatus() {
      if (!this.form.appointment_date || !this.form.doctor_id)
        return 'Select date and doctor first';
      if (this.checkingSlots) return 'Checking availability...';
      if (this.form.appointment_time) return 'Time slot selected';
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
        if (newVal) this.initializeForm();
      },
      immediate: true,
    },
    'form.doctor_id'(newVal) {
      if (newVal && this.form.appointment_date) this.checkAvailableSlots();
    },
    'form.appointment_date'(newVal) {
      if (newVal && this.form.doctor_id) this.checkAvailableSlots();
    },
  },
  methods: {
    ...mapActions('appointments', [
      'fetchAvailableSlots',
      'createAppointment',
      'updateAppointment',
    ]),
    initializeForm() {
      if (this.appointment) {
        this.form = {
          patient_id: this.appointment.patient_id || '',
          doctor_id: this.appointment.doctor_id || '',
          type: this.appointment.type || 'CONSULTATION',
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
          // Ensure selected patient appears in options
          const exists = this.patients.some((p) => p.id === this.appointment.patient.id);
          if (!exists) this.patients = [this.appointment.patient, ...this.patients];
        }
      } else {
        this.form = {
          patient_id: '',
          doctor_id: '',
          type: 'CONSULTATION',
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
      Object.keys(this.validation).forEach((f) => {
        this.validation[f] = { valid: null, error: '' };
      });
    },
    onPatientInput(value) {
      if (!value) {
        this.selectedPatient = null;
        this.form.patient_id = '';
      } else {
        const found = this.patients.find((p) => p.id === value);
        if (found) this.selectedPatient = found;
      }
      this.validateField('patient_id');
    },
    validateField(field) {
      const value = this.form[field];
      let valid = true;
      let error = '';
      switch (field) {
        case 'patient_id':
          if (!this.selectedPatient?.id) {
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
        case 'type':
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
            const sd = new Date(value);
            const t = new Date();
            t.setHours(0, 0, 0, 0);
            if (sd < t) {
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
        default:
          break;
      }
      this.validation[field] = { valid, error };
      return valid;
    },
    getFieldState(field) {
      return this.validation[field]?.valid;
    },
    getFieldError(field) {
      return this.validation[field]?.error || '';
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
          // Keep selected patient in list if present
          if (this.selectedPatient) {
            const exists = this.patients.some((p) => p.id === this.selectedPatient.id);
            if (!exists) this.patients = [this.selectedPatient, ...this.patients];
          }
        } catch (error) {
          // surface via UI if needed
        } finally {
          this.loadingPatients = false;
          loading(false);
        }
      }, 300);
    },
    async loadDoctors() {
      this.loadingDoctors = true;
      try {
        const res = await this.$store.dispatch('employee/fetchEmployees', {
          currentPage: 1,
          itemsPerPage: 100,
          filter: { department: 'Medical Practitioners' },
        });
        this.doctors = res.data.data.docs || [];
      } catch (e) {
        /* no-op */
      } finally {
        this.loadingDoctors = false;
      }
    },
    searchDoctors(search, loading) {
      if (!search || search.length <= 2) return;
      loading(true);
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
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
          // no-op: surface via UI if needed
        } finally {
          loading(false);
        }
      }, 300);
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
    onDateChange() {
      this.validateField('appointment_date');
      if (this.form.appointment_date && this.form.doctor_id) this.checkAvailableSlots();
    },
    async checkAvailableSlots() {
      if (!this.form.doctor_id || !this.form.appointment_date) return;
      this.checkingSlots = true;
      try {
        await this.fetchAvailableSlots({
          doctor_id: this.form.doctor_id,
          date: this.form.appointment_date,
          duration_minutes: this.form.duration_minutes,
        });
      } catch (e) {
        /* no-op */
      } finally {
        this.checkingSlots = false;
      }
    },
    async handleSubmit() {
      const required = [
        'patient_id',
        'doctor_id',
        'type',
        'appointment_date',
        'appointment_time',
        'reason_for_visit',
      ];
      if (!required.every((f) => this.validateField(f))) {
        this.$bvToast.toast('Please fix the validation errors', {
          title: 'Validation Error',
          variant: 'warning',
          solid: true,
        });
        return;
      }
      try {
        this.submitting = true;
        const selectedDoctor = this.doctors.find((d) => d.id === this.form.doctor_id);
        const payload = {
          ...this.form,
          patient_id: this.selectedPatient.id,
          professional: selectedDoctor?.role || 'Doctor',
          department: this.form.department || selectedDoctor?.department || 'General Medicine',
          scheduled_by: this.$store.state.auth.user?.id || 1,
          notes: this.form.notes?.trim() || '',
          reason_for_visit: this.form.reason_for_visit.trim(),
        };
        let response;
        if (this.isEditing) {
          response = await this.updateAppointment({ id: this.appointment.id, data: payload });
        } else {
          response = await this.createAppointment(payload);
        }
        if (response && response.data) {
          this.$emit('saved', response.data.data);
          this.$bvToast.toast(
            `Appointment ${this.isEditing ? 'updated' : 'created'} successfully`,
            { title: 'Success', variant: 'success', solid: true }
          );
          this.handleClose();
        }
      } catch (error) {
        this.$bvToast.toast(
          error.response?.data?.message ||
            `Failed to ${this.isEditing ? 'update' : 'create'} appointment`,
          { title: 'Error', variant: 'danger', solid: true }
        );
      } finally {
        this.submitting = false;
      }
    },
    handleClose() {
      if (!this.submitting) this.$emit('closeModal');
    },
  },
  beforeDestroy() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  },
};
</script>

<style scoped>
.appointment-form {
  padding: 0.5rem;
}
.selected-patient-card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
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
</style>
