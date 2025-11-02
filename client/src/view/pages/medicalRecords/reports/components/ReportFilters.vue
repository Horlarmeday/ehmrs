<template>
  <div class="report-filters">
    <b-card>
      <template #header>
        <h5 class="mb-0">
          <i class="flaticon2-filter text-primary mr-2"></i>
          Filters
        </h5>
      </template>
      <div class="row">
        <!-- Date Range -->
        <div class="col-md-12 mb-3">
          <label class="form-label">Date Range</label>
          <DateRangePicker v-model="localFilters.dateRange" @filter="onDateFilter" />
        </div>

        <!-- Report Type Specific Filters -->
        <template v-if="reportType === 'patient-registrations'">
          <div class="col-md-6 mb-3">
            <label class="form-label">Patient Type</label>
            <b-form-select
              v-model="localFilters.patient_type"
              :options="patientTypeOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Types</option>
            </b-form-select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Gender</label>
            <b-form-select
              v-model="localFilters.gender"
              :options="genderOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Genders</option>
            </b-form-select>
          </div>
        </template>

        <template v-if="reportType === 'visit-categories'">
          <div class="col-md-6 mb-3">
            <label class="form-label">Visit Category</label>
            <b-form-select
              v-model="localFilters.category"
              :options="visitCategoryOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Categories</option>
            </b-form-select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Department</label>
            <b-form-input
              v-model="localFilters.department"
              placeholder="Enter department name"
              @input="onFilterChange"
            ></b-form-input>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Status</label>
            <b-form-select
              v-model="localFilters.status"
              :options="visitStatusOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Statuses</option>
            </b-form-select>
          </div>
        </template>

        <template v-if="reportType === 'demographics'">
          <div class="col-md-6 mb-3">
            <label class="form-label">Gender</label>
            <b-form-select
              v-model="localFilters.gender"
              :options="genderOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Genders</option>
            </b-form-select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Age Group</label>
            <b-form-select
              v-model="localFilters.age_group"
              :options="ageGroupOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Age Groups</option>
            </b-form-select>
          </div>
        </template>

        <template v-if="reportType === 'admissions'">
          <div class="col-md-6 mb-3">
            <label class="form-label">Ward</label>
            <b-form-select
              v-model="localFilters.ward_id"
              :options="wardOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Wards</option>
            </b-form-select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Discharge Status</label>
            <b-form-select
              v-model="localFilters.status"
              :options="dischargeStatusOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Statuses</option>
            </b-form-select>
          </div>
        </template>

        <template v-if="reportType === 'deceased-patients'">
          <div class="col-md-6 mb-3">
            <label class="form-label">Gender</label>
            <b-form-select
              v-model="localFilters.gender"
              :options="genderOptions"
              @change="onFilterChange"
            >
              <option :value="null">All Genders</option>
            </b-form-select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Cause of Death</label>
            <b-form-input
              v-model="localFilters.cause_of_death"
              placeholder="Search cause of death"
              @input="onFilterChange"
            ></b-form-input>
          </div>
        </template>
      </div>

      <div class="d-flex justify-content-end mt-3">
        <b-button variant="secondary" @click="resetFilters" class="mr-2">
          <i class="flaticon2-reload mr-2"></i>
          Reset
        </b-button>
        <b-button variant="primary" @click="applyFilters">
          <i class="flaticon2-checking mr-2"></i>
          Apply Filters
        </b-button>
      </div>
    </b-card>
  </div>
</template>

<script>
import DateRangePicker from './DateRangePicker.vue';

export default {
  name: 'ReportFilters',
  components: {
    DateRangePicker,
  },
  props: {
    reportType: {
      type: String,
      required: true,
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localFilters: {
        dateRange: {
          start: null,
          end: null,
        },
        patient_type: null,
        gender: null,
        category: null,
        department: null,
        status: null,
        ward_id: null,
        cause_of_death: null,
        age_group: null,
        ...this.filters,
      },
      patientTypeOptions: [
        { value: 'Patient', text: 'Patient' },
        { value: 'Dependant', text: 'Dependant' },
      ],
      genderOptions: [
        { value: 'Male', text: 'Male' },
        { value: 'Female', text: 'Female' },
        { value: 'Other', text: 'Other' },
      ],
      visitCategoryOptions: [
        { value: 'Outpatient', text: 'Outpatient' },
        { value: 'Inpatient', text: 'Inpatient' },
        { value: 'Emergency', text: 'Emergency' },
        { value: 'Antenatal', text: 'Antenatal' },
        { value: 'Immunization', text: 'Immunization' },
        { value: 'Maternity', text: 'Maternity' },
        { value: 'Dialysis', text: 'Dialysis' },
      ],
      visitStatusOptions: [
        { value: 'Ongoing', text: 'Ongoing' },
        { value: 'Ended', text: 'Ended' },
      ],
      dischargeStatusOptions: [
        { value: 'On Admission', text: 'On Admission' },
        { value: 'Discharged', text: 'Discharged' },
      ],
      ageGroupOptions: [
        { value: 'Infant (0-1)', text: 'Infant (0-1)' },
        { value: 'Toddler (1-4)', text: 'Toddler (1-4)' },
        { value: 'Child (5-12)', text: 'Child (5-12)' },
        { value: 'Teen (13-19)', text: 'Teen (13-19)' },
        { value: 'Young Adult (20-39)', text: 'Young Adult (20-39)' },
        { value: 'Middle Age (40-59)', text: 'Middle Age (40-59)' },
        { value: 'Senior (60-79)', text: 'Senior (60-79)' },
        { value: 'Elderly (80+)', text: 'Elderly (80+)' },
      ],
      wardOptions: [],
    };
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = {
          ...this.localFilters,
          ...newFilters,
        };
      },
      deep: true,
    },
  },
  mounted() {
    this.loadWards();
  },
  methods: {
    onDateFilter(dateRange) {
      this.localFilters.dateRange = dateRange;
      this.emitFilters();
    },
    onFilterChange() {
      // Debounce or emit immediately based on requirement
      this.emitFilters();
    },
    applyFilters() {
      this.emitFilters();
    },
    resetFilters() {
      this.localFilters = {
        dateRange: {
          start: null,
          end: null,
        },
        patient_type: null,
        gender: null,
        category: null,
        department: null,
        status: null,
        ward_id: null,
        cause_of_death: null,
        age_group: null,
      };
      this.emitFilters();
    },
    emitFilters() {
      const filters = {
        start: this.localFilters.dateRange.start,
        end: this.localFilters.dateRange.end,
        patient_type: this.localFilters.patient_type,
        gender: this.localFilters.gender,
        category: this.localFilters.category,
        department: this.localFilters.department,
        status: this.localFilters.status,
        ward_id: this.localFilters.ward_id,
        cause_of_death: this.localFilters.cause_of_death,
        age_group: this.localFilters.age_group,
      };

      // Remove null/undefined values
      Object.keys(filters).forEach((key) => {
        if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      this.$emit('filter', filters);
    },
    async loadWards() {
      try {
        // Load wards from API if needed
        // For now, leave empty or load from store
      } catch (error) {
        console.error('Failed to load wards:', error);
      }
    },
  },
};
</script>

<style scoped>
.report-filters {
  margin-bottom: 1.5rem;
}
</style>
