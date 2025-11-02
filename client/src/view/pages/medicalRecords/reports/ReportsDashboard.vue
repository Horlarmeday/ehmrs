<template>
  <div class="medical-records-reports-dashboard">
    <!-- Header Section -->
    <div class="page-header mb-6">
      <div class="row align-items-center">
        <div class="col-lg-8">
          <h1 class="text-dark font-weight-bold mb-2">
            <i class="flaticon-statistics text-primary mr-3"></i>
            Medical Records Reports & Statistics
          </h1>
          <p class="text-muted font-size-lg mb-0">
            Comprehensive insights into patient registrations, visits, demographics, admissions, and
            mortality
          </p>
        </div>
        <div class="col-lg-4 text-right">
          <b-button variant="outline-primary" @click="refreshData" :disabled="loadingStats">
            <i class="flaticon2-refresh mr-2" :class="{ 'fa-spin': loadingStats }"></i>
            Refresh
          </b-button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <ReportFilters
      :report-type="selectedReportType"
      :filters="filters"
      @filter="onFilterChange"
      class="mb-4"
    />

    <!-- Report Type Selector -->
    <b-card class="mb-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap">
        <div class="report-type-selector">
          <b-button-group>
            <b-button
              v-for="reportType in reportTypes"
              :key="reportType.key"
              :variant="selectedReportType === reportType.key ? 'primary' : 'outline-primary'"
              @click="selectReportType(reportType.key)"
            >
              <i :class="reportType.icon + ' mr-2'"></i>
              {{ reportType.label }}
            </b-button>
          </b-button-group>
        </div>
        <div>
          <b-button variant="success" @click="showExportModal">
            <i class="flaticon2-download mr-2"></i>
            Export
          </b-button>
          <b-button variant="info" @click="saveCurrentReport" class="ml-2">
            <i class="flaticon2-checking mr-2"></i>
            Save Report
          </b-button>
        </div>
      </div>
    </b-card>

    <!-- Statistics Cards -->
    <div class="statistics-section mb-6">
      <!-- Loading State -->
      <div v-if="loadingStats" class="row">
        <div v-for="i in 4" :key="i" class="col-lg-3 col-md-6 mb-4">
          <b-card class="h-100">
            <b-skeleton-wrapper :loading="true">
              <template #loading>
                <div class="d-flex align-items-center">
                  <b-skeleton type="avatar" size="60px" class="mr-4"></b-skeleton>
                  <div class="flex-grow-1">
                    <b-skeleton width="60%"></b-skeleton>
                    <b-skeleton width="40%" class="mt-2"></b-skeleton>
                  </div>
                </div>
              </template>
            </b-skeleton-wrapper>
          </b-card>
        </div>
      </div>

      <!-- Data State -->
      <div v-else-if="stats" class="row">
        <div class="col-lg-3 col-md-6 mb-4">
          <StatisticsCard
            :label="getStatLabel('total')"
            :value="stats.summary.total"
            icon="flaticon2-chart"
            variant="primary"
          />
        </div>
        <div v-for="(stat, key) in getAdditionalStats()" :key="key" class="col-lg-3 col-md-6 mb-4">
          <StatisticsCard
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :variant="stat.variant"
            :format="stat.format"
            :subtitle="stat.subtitle"
            :subtitle-variant="stat.subtitleVariant"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="flaticon2-chart text-muted" style="font-size: 4rem"></i>
        <p class="text-muted mt-3 mb-0">No statistics available</p>
        <small class="text-muted">Select a report type and apply filters to view statistics</small>
      </div>
    </div>

    <!-- Breakdown Charts Section -->
    <div class="breakdown-section mb-6">
      <!-- Loading State -->
      <div v-if="loadingStats" class="row">
        <div v-for="i in 2" :key="i" class="col-lg-6 mb-4">
          <b-card>
            <template #header>
              <b-skeleton width="40%"></b-skeleton>
            </template>
            <b-skeleton-wrapper :loading="true">
              <template #loading>
                <div v-for="j in 4" :key="j" class="mb-3">
                  <b-skeleton width="100%"></b-skeleton>
                </div>
              </template>
            </b-skeleton-wrapper>
          </b-card>
        </div>
      </div>

      <!-- Data State -->
      <div v-else-if="stats && stats.breakdown" class="row">
        <div v-for="(breakdown, key) in stats.breakdown" :key="key" class="col-lg-6 mb-4">
          <b-card>
            <template #header>
              <h4 class="mb-0">
                {{ formatBreakdownLabel(key) }}
              </h4>
            </template>
            <div class="breakdown-content">
              <ul class="list-unstyled mb-0">
                <li
                  v-for="(value, label) in breakdown"
                  :key="label"
                  class="d-flex justify-content-between align-items-center py-2 border-bottom"
                >
                  <h5>{{ label }}</h5>
                  <h6>
                    <strong>{{ value }}</strong>
                  </h6>
                </li>
              </ul>
            </div>
          </b-card>
        </div>
      </div>
    </div>

    <!-- Trends Section -->
    <div class="trends-section mb-6">
      <div class="row">
        <div class="col-12">
          <TrendsChart
            v-if="stats && stats.trends && stats.trends.daily"
            :trends-data="stats.trends.daily"
            :report-type="selectedReportType"
            :loading="loadingStats"
          />
        </div>
      </div>
    </div>

    <!-- View Details Button -->
    <div class="text-center mb-4">
      <b-button variant="primary" size="lg" @click="viewDetails">
        <i class="flaticon2-eye mr-2"></i>
        View Detailed Report
      </b-button>
    </div>

    <!-- Export Modal -->
    <ExportModal
      ref="exportModal"
      :report-type="selectedReportType"
      :filters="filters"
      @export="handleExport"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ReportFilters from './components/ReportFilters.vue';
import StatisticsCard from './components/StatisticsCard.vue';
import ExportModal from './components/ExportModal.vue';
import TrendsChart from './components/TrendsChart.vue';

export default {
  name: 'ReportsDashboard',
  components: {
    ReportFilters,
    StatisticsCard,
    ExportModal,
    TrendsChart,
  },
  data() {
    return {
      selectedReportType: 'patient-registrations',
      filters: {
        start: null,
        end: null,
      },
      reportTypes: [
        {
          key: 'patient-registrations',
          label: 'Patient Registrations',
          icon: 'flaticon2-user',
        },
        {
          key: 'visit-categories',
          label: 'Visit Categories',
          icon: 'flaticon-users-1',
        },
        {
          key: 'demographics',
          label: 'Demographics',
          icon: 'flaticon2-user-1',
        },
        {
          key: 'admissions',
          label: 'Admissions',
          icon: 'fas fa-bed',
        },
        {
          key: 'deceased-patients',
          label: 'Deceased Patients',
          icon: 'flaticon2-delete',
        },
      ],
    };
  },
  computed: {
    ...mapGetters('reports', ['getStatsByReportType', 'isLoadingStats']),
    stats() {
      return this.getStatsByReportType(this.selectedReportType);
    },
    loadingStats() {
      return this.isLoadingStats;
    },
  },
  mounted() {
    this.loadStats();
  },
  methods: {
    ...mapActions('reports', ['fetchMedicalRecordsStats', 'exportReport', 'saveReport']),
    selectReportType(reportType) {
      this.selectedReportType = reportType;
      this.loadStats();
    },
    async loadStats() {
      try {
        await this.fetchMedicalRecordsStats({
          reportType: this.selectedReportType,
          ...this.filters,
        });
      } catch (error) {
        this.$bvToast.toast('Failed to load statistics', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    onFilterChange(filters) {
      this.filters = filters;
      this.loadStats();
    },
    refreshData() {
      this.loadStats();
    },
    viewDetails() {
      this.$router.push({
        name: 'medical-records-report-details',
        params: {
          reportType: this.selectedReportType,
        },
        query: this.filters,
      });
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
          filters: exportOptions.filters,
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
    async saveCurrentReport() {
      const reportTitle = this.reportTypes.find((r) => r.key === this.selectedReportType)?.label;
      try {
        await this.saveReport({
          title: `${reportTitle} - ${new Date().toLocaleDateString()}`,
          domain: 'medical-records',
          report_type: this.selectedReportType,
          date_range_start: this.filters.start,
          date_range_end: this.filters.end,
          filters: this.filters,
        });
        this.$bvToast.toast('Report saved successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        this.$bvToast.toast('Failed to save report', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    getStatLabel(type) {
      const labels = {
        'patient-registrations': {
          total: 'Total Registered Patients',
        },
        'visit-categories': {
          total: 'Total Visits',
        },
        demographics: {
          total: 'Total Patients',
        },
        admissions: {
          total: 'Total Admissions',
        },
        'deceased-patients': {
          total: 'Total Deceased',
        },
      };
      return labels[this.selectedReportType]?.[type] || 'Total';
    },
    getAdditionalStats() {
      if (!this.stats || !this.stats.summary) return [];

      const additional = [];
      const summary = this.stats.summary;

      if (summary.current_admissions !== undefined) {
        additional.push({
          label: 'Current Admissions',
          value: summary.current_admissions,
          icon: 'fas fa-bed',
          variant: 'info',
        });
      }

      if (summary.average_length_of_stay_days !== undefined) {
        additional.push({
          label: 'Avg Length of Stay',
          value: summary.average_length_of_stay_days,
          icon: 'flaticon2-calendar',
          variant: 'success',
          format: 'number',
          subtitle: 'days',
        });
      }

      return additional;
    },
    formatBreakdownLabel(key) {
      return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
  },
};
</script>

<style scoped>
.medical-records-reports-dashboard {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.statistics-section {
  margin-bottom: 2rem;
}

.breakdown-section {
  margin-bottom: 2rem;
}

.report-type-selector {
  flex: 1;
}
</style>
