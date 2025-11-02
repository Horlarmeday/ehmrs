<template>
  <div class="report-details-page">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon2-list-1 text-primary mr-3"></i>
            {{ getReportTitle() }} - Detailed Report
          </h1>
          <p class="text-muted font-size-lg mb-0">
            View detailed information for {{ getReportTitle() }}
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <b-button variant="outline-secondary" @click="goBack" class="mr-2">
            <i class="flaticon2-back mr-2"></i>
            Back
          </b-button>
          <b-button variant="success" @click="showExportModal">
            <i class="flaticon2-download mr-2"></i>
            Export
          </b-button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <ReportFilters
      :report-type="reportType"
      :filters="filters"
      @filter="onFilterChange"
      class="mb-4"
    />

    <!-- Report Table -->
    <ReportTable
      :title="getReportTitle()"
      :rows="details.rows || []"
      :fields="getTableFields()"
      :count="details.count || 0"
      :pages="details.pages || 1"
      :current-page="currentPage"
      :page-limit="pageLimit"
      :loading="loading"
      @page-change="onPageChange"
      @export="showExportModal"
    />

    <!-- Export Modal -->
    <ExportModal
      ref="exportModal"
      :report-type="reportType"
      :filters="filters"
      @export="handleExport"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ReportFilters from './components/ReportFilters.vue';
import ReportTable from './components/ReportTable.vue';
import ExportModal from './components/ExportModal.vue';

export default {
  name: 'ReportDetails',
  components: {
    ReportFilters,
    ReportTable,
    ExportModal,
  },
  data() {
    return {
      reportType: this.$route.params.reportType || 'patient-registrations',
      filters: {
        start: null,
        end: null,
      },
      currentPage: 1,
      pageLimit: 10,
      loading: false,
      reportTypes: {
        'patient-registrations': {
          label: 'Patient Registrations',
          fields: [
            { key: 'hospital_id', label: 'Patient ID', sortable: true },
            { key: 'firstname', label: 'First Name', sortable: true },
            { key: 'lastname', label: 'Last Name', sortable: true },
            { key: 'middlename', label: 'Middle Name', sortable: false },
            { key: 'gender', label: 'Gender', sortable: true },
            { key: 'date_of_birth', label: 'Date of Birth', sortable: true, format: 'date' },
            { key: 'patient_type', label: 'Patient Type', sortable: true },
            { key: 'createdAt', label: 'Date Registered', sortable: true, format: 'datetime' },
          ],
        },
        'visit-categories': {
          label: 'Visit Categories',
          fields: [
            { key: 'visit_id', label: 'Visit ID', sortable: true },
            { key: 'patient_name', label: 'Patient Name', sortable: true },
            { key: 'category', label: 'Category', sortable: true },
            { key: 'department', label: 'Department', sortable: true },
            { key: 'doctor_name', label: 'Doctor', sortable: true },
            { key: 'visit_date', label: 'Visit Date', sortable: true, format: 'date' },
            { key: 'status', label: 'Status', sortable: true },
          ],
        },
        demographics: {
          label: 'Demographics',
          fields: [
            { key: 'patient_id', label: 'Patient ID', sortable: true },
            { key: 'firstname', label: 'First Name', sortable: true },
            { key: 'lastname', label: 'Last Name', sortable: true },
            { key: 'gender', label: 'Gender', sortable: true },
            { key: 'date_of_birth', label: 'Date of Birth', sortable: true, format: 'date' },
            { key: 'age', label: 'Age', sortable: true },
            { key: 'age_group', label: 'Age Group', sortable: true },
          ],
        },
        admissions: {
          label: 'Admissions',
          fields: [
            { key: 'admission_id', label: 'Admission ID', sortable: true },
            { key: 'patient_name', label: 'Patient Name', sortable: true },
            { key: 'ward_name', label: 'Ward', sortable: true },
            { key: 'bed_number', label: 'Bed', sortable: true },
            { key: 'admission_date', label: 'Admission Date', sortable: true, format: 'date' },
            { key: 'discharge_date', label: 'Discharge Date', sortable: true, format: 'date' },
            { key: 'length_of_stay_days', label: 'Length of Stay (Days)', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ],
        },
        'deceased-patients': {
          label: 'Deceased Patients',
          fields: [
            { key: 'hospital_id', label: 'Patient ID', sortable: true },
            { key: 'firstname', label: 'First Name', sortable: true },
            { key: 'lastname', label: 'Last Name', sortable: true },
            { key: 'gender', label: 'Gender', sortable: true },
            { key: 'date_of_birth', label: 'Date of Birth', sortable: true, format: 'date' },
            { key: 'date_of_death', label: 'Date of Death', sortable: true, format: 'date' },
            { key: 'cause_of_death', label: 'Cause of Death', sortable: true },
            { key: 'age_at_death', label: 'Age at Death', sortable: true },
          ],
        },
      },
    };
  },
  computed: {
    ...mapGetters('reports', ['getDetailsByReportType']),
    details() {
      return this.getDetailsByReportType(this.reportType) || { rows: [], count: 0, pages: 1 };
    },
  },
  mounted() {
    this.loadFiltersFromQuery();
    this.loadDetails();
  },
  watch: {
    '$route.params.reportType'(newType) {
      this.reportType = newType;
      this.currentPage = 1;
      this.loadDetails();
    },
  },
  methods: {
    ...mapActions('reports', ['fetchMedicalRecordsDetails', 'exportReport']),
    loadFiltersFromQuery() {
      const query = this.$route.query;
      this.filters = {
        start: query.start || null,
        end: query.end || null,
        patient_type: query.patient_type || null,
        gender: query.gender || null,
        category: query.category || null,
        department: query.department || null,
        status: query.status || null,
        ward_id: query.ward_id || null,
        cause_of_death: query.cause_of_death || null,
        age_group: query.age_group || null,
      };
      this.currentPage = parseInt(query.currentPage) || 1;
      this.pageLimit = parseInt(query.pageLimit) || 10;
    },
    async loadDetails() {
      this.loading = true;
      try {
        await this.fetchMedicalRecordsDetails({
          reportType: this.reportType,
          ...this.filters,
          currentPage: this.currentPage,
          pageLimit: this.pageLimit,
        });
      } catch (error) {
        this.$bvToast.toast('Failed to load report details', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loading = false;
      }
    },
    onFilterChange(filters) {
      this.filters = filters;
      this.currentPage = 1;
      this.updateQueryParams();
      this.loadDetails();
    },
    onPageChange(page) {
      this.currentPage = page;
      this.updateQueryParams();
      this.loadDetails();
    },
    updateQueryParams() {
      const query = {
        ...this.filters,
        currentPage: this.currentPage,
        pageLimit: this.pageLimit,
      };
      Object.keys(query).forEach((key) => {
        if (query[key] === null || query[key] === undefined || query[key] === '') {
          delete query[key];
        }
      });
      this.$router.replace({
        query,
      });
    },
    getReportTitle() {
      return this.reportTypes[this.reportType]?.label || 'Report Details';
    },
    getTableFields() {
      return this.reportTypes[this.reportType]?.fields || [];
    },
    goBack() {
      this.$router.push({ name: 'medical-records-reports' });
    },
    showExportModal() {
      this.$refs.exportModal.show();
    },
    async handleExport(exportOptions) {
      try {
        await this.exportReport({
          domain: exportOptions.domain,
          reportType: exportOptions.reportType,
          format: exportOptions.format,
          filters: {
            ...this.filters,
            currentPage: 1,
            pageLimit: 10000,
          },
        });
        this.$bvToast.toast('Report exported successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        this.$bvToast.toast('Failed to export report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
  },
};
</script>

<style scoped>
.report-details-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}
</style>
