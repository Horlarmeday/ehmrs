<template>
  <div class="deceased-patients-list">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h5 class="mb-1">Deceased Patients List</h5>
        <p class="text-muted mb-0">View and manage deceased patients</p>
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
            <label>Search</label>
            <b-form-input
              v-model="filters.search"
              placeholder="Search patients..."
              class="mb-2"
            ></b-form-input>
          </b-col>
          <b-col md="3" class="text-right">
            <b-button variant="outline-primary" @click="clearFilters" class="mr-2">
              Clear
            </b-button>
            <b-button variant="primary" @click="applyFilters" :disabled="loading"> Apply </b-button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-3"></b-spinner>
      <p>Loading deceased patients...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <!-- Patients Table -->
    <div v-else>
      <b-card>
        <b-card-header>
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Deceased Patients ({{ totalPatients }})</h6>
            <div>
              <b-form-select
                v-model="perPage"
                :options="perPageOptions"
                size="sm"
                class="d-inline-block w-auto mr-2"
              ></b-form-select>
            </div>
          </div>
        </b-card-header>
        <b-card-body>
          <div v-if="patients && patients.length > 0">
            <b-table
              :items="patients"
              :fields="patientFields"
              striped
              hover
              responsive
              :per-page="perPage"
              :current-page="currentPage"
              :filter="filters.search"
              :filter-included-fields="searchFields"
            >
              <template #cell(patient_status)="row">
                <b-badge variant="danger">
                  <i class="fas fa-skull mr-1"></i>
                  Deceased
                </b-badge>
              </template>
              <template #cell(date_of_death)="row">
                {{ formatDate(row.item.date_of_death) }}
              </template>
              <template #cell(cause_of_death)="row">
                <span v-if="row.item.cause_of_death" class="badge badge-secondary">
                  {{ row.item.cause_of_death }}
                </span>
                <span v-else class="text-muted">Unknown</span>
              </template>
              <template #cell(death_certificate_number)="row">
                <span v-if="row.item.death_certificate_number" class="text-primary">
                  {{ row.item.death_certificate_number }}
                </span>
                <span v-else class="text-muted">Not generated</span>
              </template>
              <template #cell(actions)="row">
                <b-button-group size="sm">
                  <b-button
                    variant="outline-primary"
                    @click="viewPatient(row.item)"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </b-button>
                  <b-button
                    variant="outline-success"
                    @click="downloadCertificate(row.item)"
                    title="Download Certificate"
                    :disabled="!row.item.death_certificate_number"
                  >
                    <i class="fas fa-download"></i>
                  </b-button>
                  <b-button
                    variant="outline-info"
                    @click="viewStatistics(row.item)"
                    title="View Statistics"
                  >
                    <i class="fas fa-chart-line"></i>
                  </b-button>
                </b-button-group>
              </template>
            </b-table>
            <b-pagination
              v-model="currentPage"
              :total-rows="totalPatients"
              :per-page="perPage"
              class="mt-3"
            ></b-pagination>
          </div>
          <div v-else class="text-center text-muted py-4">
            <i class="fas fa-skull fa-3x mb-3"></i>
            <h5>No deceased patients found</h5>
            <p>Try adjusting your filters or date range</p>
          </div>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'DeceasedPatientsList',
  data() {
    return {
      loading: false,
      error: null,
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 5, text: '5 per page' },
        { value: 10, text: '10 per page' },
        { value: 25, text: '25 per page' },
        { value: 50, text: '50 per page' },
      ],
      filters: {
        start: '',
        end: '',
        search: '',
      },
      searchFields: ['fullname', 'hospital_id', 'cause_of_death'],
      patientFields: [
        { key: 'fullname', label: 'Patient Name', sortable: true },
        { key: 'hospital_id', label: 'Hospital ID', sortable: true },
        { key: 'patient_status', label: 'Status', sortable: true },
        { key: 'date_of_death', label: 'Date of Death', sortable: true },
        { key: 'cause_of_death', label: 'Cause of Death', sortable: true },
        { key: 'death_certificate_number', label: 'Certificate #', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
      ],
    };
  },
  computed: {
    ...mapState('patient', ['patients', 'total']),
    totalPatients() {
      return this.total || (this.patients ? this.patients.length : 0);
    },
  },
  async mounted() {
    await this.loadPatients();
  },
  methods: {
    ...mapActions('patient', ['getDeceasedPatients']),

    async loadPatients() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          date_from: this.filters.start,
          date_to: this.filters.end,
          search: this.filters.search,
          currentPage: this.currentPage,
          pageLimit: this.perPage,
        };

        await this.getDeceasedPatients(params);
      } catch (error) {
        this.error = error.message || 'Failed to load deceased patients';
        console.error('Error loading deceased patients:', error);
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      await this.loadPatients();
    },

    applyFilters() {
      this.currentPage = 1;
      this.loadPatients();
    },

    clearFilters() {
      this.filters = {
        start: '',
        end: '',
        search: '',
      };
      this.applyFilters();
    },

    viewPatient(patient) {
      // Navigate to patient details
      this.$router.push({
        name: 'PatientDetails',
        params: { id: patient.id },
      });
    },

    downloadCertificate(patient) {
      if (patient.death_certificate_number) {
        const url = `/api/patients/death-certificate-pdf/${patient.id}`;
        window.open(url, '_blank');
      }
    },

    viewStatistics(patient) {
      // Navigate to statistics with patient filter
      this.$router.push({
        name: 'DeceasedPatientManagement',
        query: {
          tab: 'statistics',
          patient_id: patient.id,
        },
      });
    },

    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.deceased-patients-list {
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

.btn-group .btn {
  margin-right: 2px;
}
</style>
