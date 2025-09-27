<template>
  <div class="death-statistics-dashboard">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Death Statistics Dashboard</h4>
        <p class="text-muted mb-0">Comprehensive analytics and reporting for deceased patients</p>
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
        <h6 class="mb-0">Filters</h6>
      </b-card-header>
      <b-card-body>
        <b-row>
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
          <b-col md="3">
            <label>Cause of Death</label>
            <b-form-input
              v-model="filters.cause_of_death"
              placeholder="Filter by cause"
              class="mb-2"
            ></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="12" class="text-right">
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
      <p>Loading death statistics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <!-- Statistics Content -->
    <div v-else-if="statistics">
      <!-- Summary Cards -->
      <b-row class="mb-4">
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-primary mb-2">
                <i class="fas fa-skull fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{ statistics && statistics.summary ? statistics.summary.total_deaths : 0 }}
              </h3>
              <p class="text-muted mb-0">Total Deaths</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-warning mb-2">
                <i class="fas fa-calendar-day fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{
                  statistics && statistics.summary ? statistics.summary.recent_deaths_30_days : 0
                }}
              </h3>
              <p class="text-muted mb-0">Recent (30 days)</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-info mb-2">
                <i class="fas fa-chart-line fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{ statistics && statistics.summary ? statistics.summary.average_age_at_death : 0 }}
              </h3>
              <p class="text-muted mb-0">Avg Age at Death</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-success mb-2">
                <i class="fas fa-calendar-alt fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{
                  statistics && statistics.summary && statistics.summary.date_range
                    ? statistics.summary.date_range.start
                    : 'N/A'
                }}
              </h3>
              <p class="text-muted mb-0">Date Range</p>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Charts Row -->
      <b-row class="mb-4">
        <b-col md="6">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Deaths by Month</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  statistics &&
                  statistics.breakdown &&
                  Object.keys(statistics.breakdown.by_month).length > 0
                "
              >
                <canvas ref="monthlyChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">No data available</div>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="6">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Deaths by Department</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  statistics &&
                  statistics.breakdown &&
                  Object.keys(statistics.breakdown.by_department).length > 0
                "
              >
                <canvas ref="departmentChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">No data available</div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Additional Charts Row -->
      <b-row class="mb-4">
        <b-col md="6">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Deaths by Cause</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  statistics &&
                  statistics.breakdown &&
                  Object.keys(statistics.breakdown.by_cause).length > 0
                "
              >
                <canvas ref="causeChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">No data available</div>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="6">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Deaths by Age Group</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  statistics &&
                  statistics.breakdown &&
                  Object.keys(statistics.breakdown.by_age_group).length > 0
                "
              >
                <canvas ref="ageGroupChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">No data available</div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Recent Deaths Table -->
      <b-card>
        <b-card-header>
          <h6 class="mb-0">Recent Deaths</h6>
        </b-card-header>
        <b-card-body>
          <div v-if="statistics && statistics.recent_deaths && statistics.recent_deaths.length > 0">
            <b-table
              :items="statistics.recent_deaths"
              :fields="recentDeathsFields"
              striped
              hover
              responsive
              :per-page="10"
              :current-page="currentPage"
            >
              <template #cell(date_of_death)="row">
                {{ formatDate(row.item.date_of_death) }}
              </template>
              <template #cell(cause_of_death)="row">
                <span v-if="row.item.cause_of_death" class="badge badge-secondary">
                  {{ row.item.cause_of_death }}
                </span>
                <span v-else class="text-muted">Unknown</span>
              </template>
            </b-table>
            <b-pagination
              v-model="currentPage"
              :total-rows="
                statistics && statistics.recent_deaths ? statistics.recent_deaths.length : 0
              "
              :per-page="10"
              class="mt-3"
            ></b-pagination>
          </div>
          <div v-else class="text-center text-muted py-4">No recent deaths found</div>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Chart from 'chart.js';

export default {
  name: 'DeathStatisticsDashboard',
  data() {
    return {
      loading: false,
      error: null,
      statistics: null,
      currentPage: 1,
      filters: {
        start: '',
        end: '',
        department: '',
        cause_of_death: '',
      },
      recentDeathsFields: [
        { key: 'fullname', label: 'Patient Name', sortable: true },
        { key: 'date_of_death', label: 'Date of Death', sortable: true },
        { key: 'cause_of_death', label: 'Cause of Death', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'marked_by', label: 'Marked By', sortable: true },
      ],
      charts: {
        monthly: null,
        department: null,
        cause: null,
        ageGroup: null,
      },
    };
  },
  async mounted() {
    await this.loadStatistics();
  },
  methods: {
    ...mapActions('patient', ['getDeathStatistics']),

    async loadStatistics() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          date_from: this.filters.start,
          date_to: this.filters.end,
          department: this.filters.department,
          cause_of_death: this.filters.cause_of_death,
        };

        this.statistics = await this.getDeathStatistics(params);

        // Render charts after data is loaded
        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        this.error = error.message || 'Failed to load death statistics';
        console.error('Error loading death statistics:', error);
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadStatistics();
    },

    applyFilters() {
      this.currentPage = 1;
      this.loadStatistics();
    },

    clearFilters() {
      this.filters = {
        start: '',
        end: '',
        department: '',
        cause_of_death: '',
      };
      this.applyFilters();
    },

    renderCharts() {
      if (!this.statistics) return;

      // Destroy existing charts
      Object.values(this.charts).forEach((chart) => {
        if (chart) chart.destroy();
      });

      // Render monthly chart
      this.renderMonthlyChart();

      // Render department chart
      this.renderDepartmentChart();

      // Render cause chart
      this.renderCauseChart();

      // Render age group chart
      this.renderAgeGroupChart();
    },

    renderMonthlyChart() {
      const ctx = this.$refs.monthlyChart;
      if (!ctx) return;

      if (!this.statistics || !this.statistics.breakdown || !this.statistics.breakdown.by_month)
        return;
      const data = this.statistics.breakdown.by_month;
      const labels = Object.keys(data).sort();
      const values = labels.map((label) => data[label]);

      this.charts.monthly = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Deaths',
              data: values,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
            },
          ],
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

    renderDepartmentChart() {
      const ctx = this.$refs.departmentChart;
      if (!ctx) return;

      if (
        !this.statistics ||
        !this.statistics.breakdown ||
        !this.statistics.breakdown.by_department
      )
        return;
      const data = this.statistics.breakdown.by_department;
      const labels = Object.keys(data);
      const values = Object.values(data);

      this.charts.department = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },

    renderCauseChart() {
      const ctx = this.$refs.causeChart;
      if (!ctx) return;

      if (!this.statistics || !this.statistics.breakdown || !this.statistics.breakdown.by_cause)
        return;
      const data = this.statistics.breakdown.by_cause;
      const labels = Object.keys(data);
      const values = Object.values(data);

      this.charts.cause = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Deaths',
              data: values,
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
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

    renderAgeGroupChart() {
      const ctx = this.$refs.ageGroupChart;
      if (!ctx) return;

      if (!this.statistics || !this.statistics.breakdown || !this.statistics.breakdown.by_age_group)
        return;
      const data = this.statistics.breakdown.by_age_group;
      const labels = Object.keys(data);
      const values = Object.values(data);

      this.charts.ageGroup = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#FF6384',
                '#36A2EB',
              ],
            },
          ],
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
    Object.values(this.charts).forEach((chart) => {
      if (chart) chart.destroy();
    });
  },
};
</script>

<style scoped>
.death-statistics-dashboard {
  padding: 20px;
}

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  max-height: 300px;
}
</style>
