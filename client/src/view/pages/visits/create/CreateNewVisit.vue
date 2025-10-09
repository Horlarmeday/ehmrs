<template>
  <div class="card card-custom gutter-b">
    <!--begin::Header-->
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">
          <i class="fas fa-user-md mr-2 text-primary"></i>
          Start New Visit
        </span>
        <span class="text-muted mt-2">Create a new patient visit record</span>
      </h3>
    </div>

    <div class="card-body">
      <!-- Basic Visit Information Section -->
      <div class="mb-8">
        <div class="row">
          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-tags mr-1 text-primary"></i>
              Visit Category
            </label>
            <select
              class="form-control form-control-lg"
              v-model="category"
              v-validate="'required'"
              data-vv-validate-on="blur"
              name="category"
            >
              <option value="">Select Category</option>
              <option :value="category" v-for="(category, i) in categories" :key="i">
                {{ category }}
              </option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('category') }}</span>
          </div>

          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-building mr-1 text-primary"></i>
              Department
            </label>
            <select
              class="form-control form-control-lg"
              v-model="department"
              name="department"
              v-validate="'required'"
              data-vv-validate-on="blur"
              @change="getRoles"
            >
              <option value="">Select Department</option>
              <option
                v-for="department in departments"
                :key="department.id"
                :value="{ id: department.id, text: department.department }"
              >
                {{ department.department }}
              </option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('department') }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-6 mb-4" v-if="category !== 'Dialysis'">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-user-md mr-1 text-primary"></i>
              Professional
            </label>
            <select class="form-control form-control-lg" v-model="professional" name="professional">
              <option value="">Select Professional</option>
              <option
                v-for="professional in professionals"
                :key="professional.id"
                :value="{ id: professional.id, text: professional.role }"
              >
                {{ professional.role }}
              </option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('professional') }}</span>
          </div>

          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-calendar-alt mr-1 text-primary"></i>
              Visit Date
            </label>
            <b-form-datepicker
              v-model="date_of_visit"
              class="form-control form-control-lg"
              name="date_of_visit"
              v-validate="'required'"
              data-vv-validate-on="blur"
              required
            />
            <span class="form-text text-danger">{{ errors.first('date_of_visit') }}</span>
          </div>
          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-exclamation-triangle mr-1 text-primary"></i>
              Priority Level
            </label>
            <select
              class="form-control form-control-lg"
              v-model="priority"
              v-validate="'required'"
              data-vv-validate-on="blur"
              name="priority"
            >
              <option value="">Select Priority</option>
              <option :value="prior" v-for="(prior, i) in priorities" :key="i">{{ prior }}</option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('priority') }}</span>
          </div>
        </div>
      </div>

      <!-- Services and Additional Information Section -->
      <div class="mb-8">
        <div class="d-flex align-items-center mb-4">
          <div class="symbol symbol-40 symbol-light-success mr-3">
            <span class="symbol-label">
              <i class="fas fa-cogs text-success"></i>
            </span>
          </div>
          <h4 class="text-dark font-weight-bolder mb-0">Services & Additional Information</h4>
        </div>

        <div class="row">
          <div class="col-lg-12 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-concierge-bell mr-1 text-primary"></i>
              Associated Services
            </label>
            <v-select
              multiple
              name="service"
              @search="onHandleSearch"
              v-model="service_id"
              label="name"
              :options="services"
              :reduce="(services) => services.id"
              placeholder="Search and select services..."
              class="form-control-lg"
            />
            <small class="form-text text-muted">Select one or more services for this visit</small>
          </div>
        </div>

        <!-- Laboratory Tests for specific categories -->
        <div v-if="category === 'Dialysis' || category === 'Outpatient'" class="row">
          <div class="col-lg-12 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-flask mr-1 text-primary"></i>
              Laboratory Tests
            </label>
            <v-select
              multiple
              name="test"
              @search="searchTests"
              v-model="test_id"
              label="name"
              :options="tests"
              :reduce="(tests) => tests.id"
              placeholder="Search and select laboratory tests..."
              class="form-control-lg"
            />
            <small class="form-text text-muted">Select laboratory tests to be performed</small>
          </div>
        </div>
      </div>

      <!-- Emergency-Specific Section -->
      <div v-if="category === 'Emergency'" class="mb-8">
        <div class="d-flex align-items-center mb-4">
          <div class="symbol symbol-40 symbol-light-danger mr-3">
            <span class="symbol-label">
              <i class="fas fa-ambulance text-danger"></i>
            </span>
          </div>
          <h4 class="text-dark font-weight-bolder mb-0">Emergency Details</h4>
        </div>

        <div class="row">
          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-tachometer-alt mr-1 text-danger"></i>
              Emergency Priority
            </label>
            <select
              class="form-control form-control-lg"
              v-model="emergencyPriority"
              name="emergencyPriority"
              v-validate="'required'"
              data-vv-validate-on="blur"
            >
              <option value="">Select Emergency Priority</option>
              <option value="Red">🔴 Red - Immediate</option>
              <option value="Orange">🟠 Orange - Very Urgent</option>
              <option value="Yellow">🟡 Yellow - Urgent</option>
              <option value="Green">🟢 Green - Less Urgent</option>
              <option value="Blue">🔵 Blue - Non-Urgent</option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('emergencyPriority') }}</span>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-comment-medical mr-1 text-danger"></i>
              Chief Complaint
            </label>
            <textarea
              v-model="chiefComplaint"
              class="form-control form-control-lg"
              rows="4"
              placeholder="Describe the main complaint or reason for emergency visit..."
              name="chiefComplaint"
              v-validate="'required'"
              data-vv-validate-on="blur"
            ></textarea>
            <span class="text-danger text-sm">{{ errors.first('chiefComplaint') }}</span>
          </div>

          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-stethoscope mr-1 text-danger"></i>
              Initial Assessment
            </label>
            <textarea
              v-model="initialAssessment"
              class="form-control form-control-lg"
              rows="4"
              placeholder="Initial medical assessment and vital signs..."
              name="initialAssessment"
            ></textarea>
            <small class="form-text text-muted">Optional: Initial medical assessment</small>
          </div>
        </div>
      </div>

      <!-- Dialysis-Specific Section -->
      <div v-if="category === 'Dialysis'" class="mb-8">
        <div class="d-flex align-items-center mb-4">
          <div class="symbol symbol-40 symbol-light-info mr-3">
            <span class="symbol-label">
              <i class="fas fa-kidneys text-info"></i>
            </span>
          </div>
          <h4 class="text-dark font-weight-bolder mb-0">Dialysis Details</h4>
        </div>

        <div class="row">
          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-tint mr-1 text-info"></i>
              Dialysis Type
            </label>
            <select
              class="form-control form-control-lg"
              v-model="dialysisType"
              name="dialysisType"
              v-validate="'required'"
              data-vv-validate-on="blur"
            >
              <option value="">Select Dialysis Type</option>
              <option value="Hemodialysis">Hemodialysis</option>
              <option value="Peritoneal">Peritoneal Dialysis</option>
              <option value="CRRT">Continuous Renal Replacement Therapy</option>
            </select>
            <span class="text-danger text-sm">{{ errors.first('dialysisType') }}</span>
          </div>

          <div class="col-lg-6 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-exclamation-circle mr-1 text-info"></i>
              Priority Level
            </label>
            <select
              v-model="dialysisPriority"
              class="form-control form-control-lg"
              name="dialysisPriority"
            >
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
            <small class="form-text text-muted">Reception can set basic priority level</small>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-12 mb-4">
            <label class="font-weight-bold text-dark">
              <i class="fas fa-notes-medical mr-1 text-info"></i>
              Clinical Notes
            </label>
            <textarea
              v-model="dialysisNotes"
              class="form-control form-control-lg"
              rows="3"
              placeholder="Any general notes from reception (e.g., patient request, special instructions)..."
              name="dialysisNotes"
            ></textarea>
            <small class="form-text text-muted">Optional: Any special instructions or notes</small>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex justify-content-end pt-6 border-top">
        <button
          ref="kt_visit_submit"
          @click="getLastActiveVisit"
          class="btn btn-primary btn-lg px-8"
          :disabled="submitting"
        >
          <i class="fas fa-save mr-2"></i>
          <span v-if="!submitting">Create Visit</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm mr-2" role="status"></span>
            Creating...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { departments, getRolesById } from '@/view/pages/employees/create/employeeRoles';
import { debounce, getTestTypeToFetch } from '@/common/common';

import vSelect from 'vue-select';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export default {
  name: 'CreateVisit',
  components: { vSelect },
  data() {
    return {
      priorities: ['Not Urgent', 'Urgent', 'Emergency'],
      visitTypes: ['New visit'],
      category: '',
      professional: '',
      professionals: null,
      department: '',
      type: 'New visit',
      date_of_visit: new Date(),
      time_of_visit: new Date().toLocaleTimeString(),
      service_id: '',
      priority: '',
      gender: '',
      currentPage: 1,
      itemsPerPage: 20,
      IMMUNIZATION: 'Immunization',
      emergencyPriority: '',
      chiefComplaint: '',
      initialAssessment: '',
      dialysisNotes: '',
      dialysisPriority: 'Routine',
      dialysisType: '',
      test_id: '',
      submitting: false,
    };
  },
  computed: {
    services() {
      return this.$store.state.model.services;
    },

    tests() {
      return this.$store.state.laboratory.tests;
    },

    categories() {
      const data = ['Outpatient', 'Emergency', 'Immunization', 'Dialysis', 'Dental'];
      if (this?.gender === 'Female') {
        data.push('Antenatal');
        data.push('Maternity');
      }
      return data;
    },
    // Validate emergency fields
    emergencyFieldsValid() {
      if (this.category !== 'Emergency') return true;
      return this.emergencyPriority && this.chiefComplaint;
    },

    // Validate dialysis fields
    dialysisFieldsValid() {
      if (this.category !== 'Dialysis') return true;
      return this.dialysisType && this.dialysisPriority;
    },

    departments() {
      return departments.filter((department) => {
        if (this.category === 'Dialysis') {
          return department.id === 2 || department.id === 9;
        }
        return department;
      });
    },
  },
  methods: {
    getRoles() {
      this.professionals = getRolesById(this.department.id);
    },

    addSpinner(submitButton) {
      this.submitting = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.submitting = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    handleResponse(category) {
      Swal.fire({
        title: 'Error!',
        html: `Patient has an active <b>${category}</b> visit ongoing, please send to Customer Care`,
        icon: 'error',
        confirmButtonClass: 'btn btn-primary',
        heightAuto: false,
      });
    },

    displayPrompt(obj, category) {
      Swal.fire({
        title: 'Are you sure, you want to override?',
        text: `Patient has an active ${category} visit ongoing, this action cannot be reversed`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Override!',
        cancelButtonText: 'No, cancel!',
        showLoaderOnConfirm: true,
      });
    },

    getLastActiveVisit() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          // Additional validation for specialized fields
          if (!this.emergencyFieldsValid || !this.dialysisFieldsValid) {
            this.$notify({
              group: 'foo',
              title: 'Validation Error',
              text: 'Please fill in all required fields for the selected visit category',
              type: 'error',
            });
            return;
          }

          const date = `${dayjs(this.date_of_visit).format('YYYY-MM-DD')} ${this.time_of_visit}`;
          const obj = {
            category: this.category,
            type: this.type,
            date_of_visit: new Date(date),
            service_id: this.service_id,
            priority: this.priority,
            department: this.department.text,
            professional: this.professional.text,
            patient_id: this.$route.params.id,
            emergency_priority: this.emergencyPriority,
            chief_complaint: this.chiefComplaint,
            initial_assessment: this.initialAssessment,
            dialysis_notes: this.dialysisNotes,
            dialysis_priority: this.dialysisPriority,
            scheduled_time: this.time_of_visit,
            dialysis_type: this.dialysisType,
            test_id: this.test_id,
          };
          const submitButton = this.$refs['kt_visit_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('visit/getLastActiveVisit', obj)
            .then((response) => {
              if (response.status === 200) {
                const category = response.data.data.category || 'Nil';
                this.removeSpinner(submitButton);
                this.handleResponse(category);
                return true;
              }
              this.initializeRequest(submitButton);
            })
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    onHandleSearch(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debounceSearch(loading, search, this);
      }
    },

    debounceSearch: debounce((loading, search, vm) => {
      vm.$store
        .dispatch('model/fetchServices', {
          currentPage: 1,
          itemsPerPage: vm.itemsPerPage,
          search,
          selectedIds: vm.service_id || [], // Pass selected service IDs
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    createVisit(obj) {
      const submitButton = this.$refs['kt_visit_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('visit/addVisit', obj)
        .then(() => {
          // Specialized records are now created on the server side
          this.initializeRequest(submitButton);
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Visit created successfully with specialized records. Patient should proceed to the respective department for consultation.',
            type: 'success',
          });
        })
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.category = '';
      this.professional = '';
      this.time_of_visit = '';
      this.date_of_visit = '';
      this.service_id = '';
      this.type = '';
      this.department = '';
      this.priority = '';
      this.emergencyPriority = '';
      this.chiefComplaint = '';
      this.initialAssessment = '';
      this.dialysisNotes = '';
      this.dialysisPriority = 'Routine';
    },

    searchTests(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(search, this, loading);
      }
    },

    search: debounce((search, vm, loading) => {
      const testType = getTestTypeToFetch(vm.insuranceName, vm.isSwitchOn);

      vm.$store
        .dispatch('laboratory/fetchTests', {
          currentPage: 1,
          itemsPerPage: 100,
          search,
          selectedIds: vm.test_id || [], // Pass selected test IDs
          ...(testType && { filter: testType }),
          vSelect: true,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    fetchTests() {
      this.$store.dispatch('laboratory/fetchTests', {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },
    fetchServices() {
      this.$store.dispatch('model/fetchServices', {
        currentPage: 1,
        itemsPerPage: 100,
      });
    },
  },
  created() {
    this.fetchTests();
    this.fetchServices();
    this.$store.dispatch('patient/fetchPatientProfile', this.$route.params.id).then((response) => {
      const res = response.data.data;
      this.gender = res.gender;
      const {
        id,
        firstname,
        lastname,
        hospital_id,
        photo,
        gender,
        fullname,
        date_of_birth,
        has_insurance,
      } = res;
      const patient = {
        id,
        firstname,
        lastname,
        hospital_id,
        photo,
        gender,
        fullname,
        date_of_birth,
        has_insurance,
      };
      this.$store.dispatch('patient/setCurrentPatient', { ...res.insurance, ...patient });
    });
  },
};
</script>

<style scoped></style>
