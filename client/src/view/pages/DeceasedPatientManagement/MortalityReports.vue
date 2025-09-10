<template>
  <div class="mortality-reports">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Mortality Reports</h4>
        <p class="text-muted mb-0">Detailed mortality analysis by department and condition</p>
      </div>
      <div>
        <b-button variant="primary" @click="refreshData" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i>
          Refresh
        </b-button>
      </div>
    </div>

    <!-- Filters -->
    <b-card class="mb-4">
      <b-card-header>
        <h6 class="mb-0">Report Configuration</h6>
      </b-card-header>
      <b-card-body>
        <b-row>
          <b-col md="3">
            <label>Report Type</label>
            <b-form-select
              v-model="filters.report_type"
              :options="reportTypeOptions"
              class="mb-2"
            ></b-form-select>
          </b-col>
          <b-col md="3">
            <label>Date From</label>
            <b-form-datepicker
              v-model="filters.start"
              :max="filters.end"
              class="mb-2"
            ></b-form-datepicker>
          </b-col>
          <b-col md="3">
            <label>Date To</label>
            <b-form-datepicker
              v-model="filters.end"
              :min="filters.start"
              class="mb-2"
            ></b-form-datepicker>
          </b-col>
          <b-col md="3">
            <label>Department</label>
            <b-form-input
              v-model="filters.department"
              placeholder="Filter by department"
              class="mb-2"
            ></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6">
            <label>Cause of Death</label>
            <b-form-input
              v-model="filters.cause_of_death"
              placeholder="Filter by cause of death"
              class="mb-2"
            ></b-form-input>
          </b-col>
          <b-col md="6" class="text-right">
            <b-button variant="outline-primary" @click="clearFilters" class="mr-2">
              Clear Filters
            </b-button>
            <b-button variant="primary" @click="applyFilters" :disabled="loading">
              Apply Filters
            </b-button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-3"></b-spinner>
      <p>Loading mortality reports...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <!-- Reports Content -->
    <div v-else-if="reports">
      <!-- Summary Cards -->
      <b-row class="mb-4">
        <b-col md="4">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-primary mb-2">
                <i class="fas fa-chart-bar fa-2x"></i>
              </div>
              <h3 class="mb-1">{{ reports && reports.summary ? reports.summary.total_deaths : 0 }}</h3>
              <p class="text-muted mb-0">Total Deaths</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="4">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-info mb-2">
                <i class="fas fa-building fa-2x"></i>
              </div>
              <h3 class="mb-1">{{ reports && reports.summary ? (reports.summary.total_departments || reports.summary.total_conditions) : 0 }}</h3>
              <p class="text-muted mb-0">{{ reports && reports.report_type === 'department' ? 'Departments' : 'Conditions' }}</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="4">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-success mb-2">
                <i class="fas fa-calendar-alt fa-2x"></i>
              </div>
              <h3 class="mb-1">{{ reports && reports.date_range ? reports.date_range.start : 'N/A' }}</h3>
              <p class="text-muted mb-0">Date Range</p>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Department/Condition Reports -->
      <div v-if="reports && (reports.departments || reports.conditions)">
        <b-card v-for="(item, index) in (reports.departments || reports.conditions)" :key="index" class="mb-4">
          <b-card-header>
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                {{ item.department || item.condition }}
                <span class="badge badge-primary ml-2">{{ item.total_deaths }} deaths</span>
              </h6>
              <div>
                <span class="text-muted">Avg Age: {{ item.average_age }}</span>
              </div>
            </div>
          </b-card-header>
          <b-card-body>
            <!-- Statistics Row -->
            <b-row class="mb-3">
              <b-col md="3">
                <div class="text-center">
                  <h5 class="text-primary mb-1">{{ item.total_deaths }}</h5>
                  <small class="text-muted">Total Deaths</small>
                </div>
              </b-col>
              <b-col md="3">
                <div class="text-center">
                  <h5 class="text-info mb-1">{{ item.average_age }}</h5>
                  <small class="text-muted">Average Age</small>
                </div>
              </b-col>
              <b-col md="3">
                <div class="text-center">
                  <h5 class="text-warning mb-1">{{ Object.keys(item.deaths_by_month).length }}</h5>
                  <small class="text-muted">Months with Deaths</small>
                </div>
              </b-col>
              <b-col md="3">
                <div class="text-center">
                  <h5 class="text-success mb-1">{{ Object.keys(item.deaths_by_cause || item.deaths_by_department).length }}</h5>
                  <small class="text-muted">{{ reports && reports.report_type === 'department' ? 'Causes' : 'Departments' }}</small>
                </div>
              </b-col>
            </b-row>

            <!-- Charts Row -->
            <b-row>
              <b-col md="6">
                <h6 class="mb-3">Deaths by Month</h6>
                <div v-if="Object.keys(item.deaths_by_month).length > 0">
                  <canvas :ref="`monthlyChart${index}`" height="200"></canvas>
                </div>
                <div v-else class="text-center text-muted py-3">
                  No monthly data available
                </div>
              </b-col>
              <b-col md="6">
                <h6 class="mb-3">Deaths by {{ reports && reports.report_type === 'department' ? 'Cause' : 'Department' }}</h6>
                <div v-if="Object.keys(item.deaths_by_cause || item.deaths_by_department).length > 0">
                  <canvas :ref="`breakdownChart${index}`" height="200"></canvas>
                </div>
                <div v-else class="text-center text-muted py-3">
                  No breakdown data available
                </div>
              </b-col>
            </b-row>

            <!-- Age Group Distribution -->
            <div v-if="Object.keys(item.deaths_by_age_group).length > 0" class="mt-4">
              <h6 class="mb-3">Age Group Distribution</h6>
              <b-row>
                <b-col v-for="(count, ageGroup) in item.deaths_by_age_group" :key="ageGroup" md="2" class="text-center mb-2">
                  <div class="border rounded p-2">
                    <div class="h6 mb-1">{{ count }}</div>
                    <small class="text-muted">{{ ageGroup }}</small>
                  </div>
                </b-col>
              </b-row>
            </div>

            <!-- Recent Deaths Table -->
            <div v-if="item.recent_deaths && item.recent_deaths.length > 0" class="mt-4">
              <h6 class="mb-3">Recent Deaths</h6>
              <b-table
                :items="item.recent_deaths"
                :fields="recentDeathsFields"
                striped
                hover
                responsive
                small
                :per-page="5"
                :current-page="getCurrentPage(index)"
              >
                <template #cell(date_of_death)="row">
                  {{ formatDate(row.item.date_of_death) }}
                </template>
                <template #cell(age)="row">
                  <span v-if="row.item.age" class="badge badge-info">
                    {{ row.item.age }} years
                  </span>
                  <span v-else class="text-muted">Unknown</span>
                </template>
                <template #cell(cause_of_death)="row">
                  <span v-if="row.item.cause_of_death" class="badge badge-secondary">
                    {{ row.item.cause_of_death }}
                  </span>
                  <span v-else class="text-muted">Unknown</span>
                </template>
              </b-table>
              <b-pagination
                v-model="currentPages[index]"
                :total-rows="item.recent_deaths.length"
                :per-page="5"
                class="mt-2"
                size="sm"
              ></b-pagination>
            </div>
          </b-card-body>
        </b-card>
      </div>

      <!-- No Data State -->
      <div v-else class="text-center py-5">
        <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No mortality data found</h5>
        <p class="text-muted">Try adjusting your filters or date range</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Chart from 'chart.js';

export default {
  name: 'MortalityReports',
  data() {
    return {
      loading: false,
      error: null,
      reports: null,
      currentPages: {},
      filters: {
        report_type: 'department',
        start: '',
        end: '',
        department: '',
        cause_of_death: '',
      },
      reportTypeOptions: [
        { value: 'department', text: 'By Department' },
        { value: 'condition', text: 'By Condition' },
      ],
      recentDeathsFields: [
        { key: 'fullname', label: 'Patient Name', sortable: true },
        { key: 'date_of_death', label: 'Date of Death', sortable: true },
        { key: 'age', label: 'Age', sortable: true },
        { key: 'cause_of_death', label: 'Cause of Death', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'marked_by', label: 'Marked By', sortable: true },
      ],
      charts: {},
    };
  },
  async mounted() {
    await this.loadReports();
  },
  methods: {
    ...mapActions('patient', ['getMortalityReports']),
    
    async loadReports() {
      this.loading = true;
      this.error = null;
      
      try {
        const params = {
          report_type: this.filters.report_type,
          date_from: this.filters.start,
          date_to: this.filters.end,
          department: this.filters.department,
          cause_of_death: this.filters.cause_of_death,
        };
        
        this.reports = await this.getMortalityReports(params);
        
        // Initialize current pages for pagination
        this.initializeCurrentPages();
        
        // Render charts after data is loaded
        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        this.error = error.message || 'Failed to load mortality reports';
        console.error('Error loading mortality reports:', error);
      } finally {
        this.loading = false;
      }
    },
    
    initializeCurrentPages() {
      if (this.reports && (this.reports.departments || this.reports.conditions)) {
        const items = this.reports.departments || this.reports.conditions;
        items.forEach((_, index) => {
          this.$set(this.currentPages, index, 1);
        });
      }
    },
    
    getCurrentPage(index) {
      return this.currentPages[index] || 1;
    },
    
    async refreshData() {
      await this.loadReports();
    },
    
    applyFilters() {
      this.loadReports();
    },
    
    clearFilters() {
      this.filters = {
        report_type: 'department',
        start: '',
        end: '',
        department: '',
        cause_of_death: '',
      };
      this.applyFilters();
    },
    
    renderCharts() {
      if (!this.reports || (!this.reports.departments && !this.reports.conditions)) return;
      
      // Destroy existing charts
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
      });
      this.charts = {};
      
      // Render charts for each department/condition
      const items = this.reports.departments || this.reports.conditions;
      items.forEach((item, index) => {
        this.renderMonthlyChart(item, index);
        this.renderBreakdownChart(item, index);
      });
    },
    
    renderMonthlyChart(item, index) {
      const ctx = this.$refs[`monthlyChart${index}`];
      if (!ctx || !ctx[0]) return;
      
      const data = item.deaths_by_month;
      const labels = Object.keys(data).sort();
      const values = labels.map(label => data[label]);
      
      this.charts[`monthly${index}`] = new Chart(ctx[0], {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Deaths',
            data: values,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
    
    renderBreakdownChart(item, index) {
      const ctx = this.$refs[`breakdownChart${index}`];
      if (!ctx || !ctx[0]) return;
      
      const data = item.deaths_by_cause || item.deaths_by_department;
      const labels = Object.keys(data);
      const values = Object.values(data);
      
      this.charts[`breakdown${index}`] = new Chart(ctx[0], {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString();
    },
  },
  
  beforeDestroy() {
    // Clean up charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  },
};
</script>

<style scoped>
.mortality-reports {
  padding: 20px;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.badge {
  font-size: 0.75em;
}

canvas {
  max-height: 200px;
}

.border {
  border: 1px solid #dee2e6 !important;
}
</style>
