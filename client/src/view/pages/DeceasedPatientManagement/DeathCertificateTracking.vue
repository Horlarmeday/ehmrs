<template>
  <div class="death-certificate-tracking">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Death Certificate Tracking</h4>
        <p class="text-muted mb-0">Track and manage death certificate generation and status</p>
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
            <label>Status</label>
            <b-form-select
              v-model="filters.status"
              :options="statusOptions"
              class="mb-2"
            ></b-form-select>
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
      <p>Loading certificate tracking data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <!-- Tracking Content -->
    <div v-else-if="tracking">
      <!-- Summary Cards -->
      <b-row class="mb-4">
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-primary mb-2">
                <i class="fas fa-certificate fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{ tracking && tracking.summary ? tracking.summary.total_certificates : 0 }}
              </h3>
              <p class="text-muted mb-0">Total Certificates</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-info mb-2">
                <i class="fas fa-file-alt fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{ tracking && tracking.summary ? tracking.summary.generated : 0 }}
              </h3>
              <p class="text-muted mb-0">Generated</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-warning mb-2">
                <i class="fas fa-print fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{ tracking && tracking.summary ? tracking.summary.printed : 0 }}
              </h3>
              <p class="text-muted mb-0">Printed</p>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="3">
          <b-card class="text-center h-100">
            <b-card-body>
              <div class="text-success mb-2">
                <i class="fas fa-check-circle fa-2x"></i>
              </div>
              <h3 class="mb-1">
                {{ tracking && tracking.summary ? tracking.summary.delivered : 0 }}
              </h3>
              <p class="text-muted mb-0">Delivered</p>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Charts Row -->
      <b-row class="mb-4">
        <b-col md="6">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Certificates by Status</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  tracking &&
                    tracking.breakdown &&
                    Object.keys(tracking.breakdown.by_status).length > 0
                "
              >
                <canvas ref="statusChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">
                No data available
              </div>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col md="6">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Certificates by Department</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  tracking &&
                    tracking.breakdown &&
                    Object.keys(tracking.breakdown.by_department).length > 0
                "
              >
                <canvas ref="departmentChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">
                No data available
              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Monthly Chart -->
      <b-row class="mb-4">
        <b-col md="12">
          <b-card>
            <b-card-header>
              <h6 class="mb-0">Certificates by Month</h6>
            </b-card-header>
            <b-card-body>
              <div
                v-if="
                  tracking &&
                    tracking.breakdown &&
                    Object.keys(tracking.breakdown.by_month).length > 0
                "
              >
                <canvas ref="monthlyChart" height="300"></canvas>
              </div>
              <div v-else class="text-center text-muted py-4">
                No data available
              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <!-- Certificates Table -->
      <b-card>
        <b-card-header>
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Certificate Details</h6>
            <div>
              <b-form-select
                v-model="perPage"
                :options="perPageOptions"
                size="sm"
                class="d-inline-block w-auto mr-2"
              ></b-form-select>
              <b-form-input
                v-model="searchTerm"
                placeholder="Search certificates..."
                size="sm"
                class="d-inline-block w-auto"
              ></b-form-input>
            </div>
          </div>
        </b-card-header>
        <b-card-body>
          <div v-if="filteredCertificates.length > 0">
            <b-table
              :items="filteredCertificates"
              :fields="certificateFields"
              striped
              hover
              responsive
              :per-page="perPage"
              :current-page="currentPage"
              :filter="searchTerm"
              :filter-included-fields="searchFields"
            >
              <template #cell(certificate_status)="row">
                <b-badge :variant="getStatusVariant(row.item.certificate_status)">
                  {{ row.item.certificate_status }}
                </b-badge>
              </template>
              <template #cell(date_of_death)="row">
                {{ formatDate(row.item.date_of_death) }}
              </template>
              <template #cell(generated_at)="row">
                {{ formatDate(row.item.generated_at) }}
              </template>
              <template #cell(last_updated)="row">
                {{ formatDate(row.item.last_updated) }}
              </template>
              <template #cell(actions)="row">
                <b-button-group size="sm">
                  <b-button
                    variant="outline-primary"
                    @click="viewCertificate(row.item)"
                    title="View Certificate"
                  >
                    <i class="fas fa-eye"></i>
                  </b-button>
                  <b-button
                    variant="outline-success"
                    @click="downloadCertificate(row.item)"
                    title="Download PDF"
                  >
                    <i class="fas fa-download"></i>
                  </b-button>
                </b-button-group>
              </template>
            </b-table>
            <b-pagination
              v-model="currentPage"
              :total-rows="filteredCertificates.length"
              :per-page="perPage"
              class="mt-3"
            ></b-pagination>
          </div>
          <div v-else class="text-center text-muted py-4">
            No certificates found
          </div>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Chart from 'chart.js';

export default {
  name: 'DeathCertificateTracking',
  data() {
    return {
      loading: false,
      error: null,
      tracking: null,
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 5, text: '5 per page' },
        { value: 10, text: '10 per page' },
        { value: 25, text: '25 per page' },
        { value: 50, text: '50 per page' },
      ],
      searchTerm: '',
      searchFields: ['fullname', 'death_certificate_number', 'cause_of_death', 'department'],
      filters: {
        start: '',
        end: '',
        status: 'all',
        department: '',
      },
      statusOptions: [
        { value: 'all', text: 'All Statuses' },
        { value: 'generated', text: 'Generated' },
        { value: 'printed', text: 'Printed' },
        { value: 'delivered', text: 'Delivered' },
      ],
      certificateFields: [
        { key: 'fullname', label: 'Patient Name', sortable: true },
        { key: 'hospital_id', label: 'Hospital ID', sortable: true },
        { key: 'death_certificate_number', label: 'Certificate #', sortable: true },
        { key: 'date_of_death', label: 'Date of Death', sortable: true },
        { key: 'cause_of_death', label: 'Cause of Death', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'certificate_status', label: 'Status', sortable: true },
        { key: 'generated_at', label: 'Generated', sortable: true },
        { key: 'marked_by', label: 'Marked By', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
      ],
      charts: {
        status: null,
        department: null,
        monthly: null,
      },
    };
  },
  computed: {
    filteredCertificates() {
      if (!this.tracking || !this.tracking.certificates) return [];

      let filtered = this.tracking.certificates;

      // Filter by status
      if (this.filters.status !== 'all') {
        filtered = filtered.filter(cert => cert.certificate_status === this.filters.status);
      }

      return filtered;
    },
  },
  async mounted() {
    await this.loadTracking();
  },
  methods: {
    ...mapActions('patient', ['getDeathCertificateTracking']),

    async loadTracking() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          date_from: this.filters.start,
          date_to: this.filters.end,
          status: this.filters.status,
          department: this.filters.department,
        };

        this.tracking = await this.getDeathCertificateTracking(params);

        // Render charts after data is loaded
        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        this.error = error.message || 'Failed to load certificate tracking data';
        console.error('Error loading certificate tracking:', error);
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadTracking();
    },

    applyFilters() {
      this.currentPage = 1;
      this.loadTracking();
    },

    clearFilters() {
      this.filters = {
        start: '',
        end: '',
        status: 'all',
        department: '',
      };
      this.applyFilters();
    },

    renderCharts() {
      if (!this.tracking) return;

      // Destroy existing charts
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
      });

      // Render status chart
      this.renderStatusChart();

      // Render department chart
      this.renderDepartmentChart();

      // Render monthly chart
      this.renderMonthlyChart();
    },

    renderStatusChart() {
      const ctx = this.$refs.statusChart;
      if (!ctx) return;

      if (!this.tracking || !this.tracking.breakdown || !this.tracking.breakdown.by_status) return;
      const data = this.tracking.breakdown.by_status;
      const labels = Object.keys(data);
      const values = Object.values(data);

      this.charts.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },

    renderDepartmentChart() {
      const ctx = this.$refs.departmentChart;
      if (!ctx) return;

      if (!this.tracking || !this.tracking.breakdown || !this.tracking.breakdown.by_department)
        return;
      const data = this.tracking.breakdown.by_department;
      const labels = Object.keys(data);
      const values = Object.values(data);

      this.charts.department = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Certificates',
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

    renderMonthlyChart() {
      const ctx = this.$refs.monthlyChart;
      if (!ctx) return;

      if (!this.tracking || !this.tracking.breakdown || !this.tracking.breakdown.by_month) return;
      const data = this.tracking.breakdown.by_month;
      const labels = Object.keys(data).sort();
      const values = labels.map(label => data[label]);

      this.charts.monthly = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Certificates',
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

    getStatusVariant(status) {
      const variants = {
        generated: 'primary',
        printed: 'warning',
        delivered: 'success',
        not_generated: 'secondary',
      };
      return variants[status] || 'secondary';
    },

    viewCertificate(certificate) {
      // Open certificate in modal or new tab
      this.$router.push({
        name: 'DeathCertificate',
        params: { id: certificate.id },
      });
    },

    downloadCertificate(certificate) {
      this.$store.dispatch('patient/printDeathCertificate', { id: certificate.id });
      // .then(response => {
      //   // // Download PDF certificate
      //   // const url = `/api/patients/death-certificate-pdf/${certificate.id}`;
      //   // window.open(url, '_blank');
      // })
      // .catch(error => {
      //   console.error('Error downloading certificate:', error);
      // });
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
.death-certificate-tracking {
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

.btn-group .btn {
  margin-right: 2px;
}
</style>
