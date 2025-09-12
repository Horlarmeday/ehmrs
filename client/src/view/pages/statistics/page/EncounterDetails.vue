<template>
  <div class="encounter-details">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Encounter Details</h4>
        <p class="text-muted mb-0" v-if="encounterDetails">
          {{ encounterDetails.summary.totalEncounters }} encounters with
          {{ encounterDetails.summary.uniquePatients }} unique patients
        </p>
      </div>
      <b-button variant="outline-secondary" @click="$router.go(-1)">
        <i class="mdi mdi-arrow-left"></i> Back
      </b-button>
    </div>

    <!-- Loading State -->
    <div v-if="encounterDetailsLoading" class="text-center py-5">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
      <p class="mt-2 text-muted">Loading encounter details...</p>
    </div>

    <!-- Content -->
    <div v-else-if="encounterDetails">
      <!-- Summary Cards -->
      <b-row class="mb-4">
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="text-center h-100">
            <div class="text-primary mb-2">
              <i class="mdi mdi-account-multiple mdi-24px"></i>
            </div>
            <h5 class="mb-1">{{ encounterDetails.summary.totalEncounters }}</h5>
            <small class="text-muted">Total Encounters</small>
          </b-card>
        </b-col>
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="text-center h-100">
            <div class="text-success mb-2">
              <i class="mdi mdi-account-heart mdi-24px"></i>
            </div>
            <h5 class="mb-1">{{ encounterDetails.summary.uniquePatients }}</h5>
            <small class="text-muted">Unique Patients</small>
          </b-card>
        </b-col>
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="text-center h-100">
            <div class="text-info mb-2">
              <i class="mdi mdi-calendar-check mdi-24px"></i>
            </div>
            <h5 class="mb-1">{{ encounterDetails.summary.uniqueVisits }}</h5>
            <small class="text-muted">Unique Visits</small>
          </b-card>
        </b-col>
        <b-col md="3" sm="6" class="mb-3">
          <b-card class="text-center h-100">
            <div class="text-warning mb-2">
              <i class="mdi mdi-chart-pie mdi-24px"></i>
            </div>
            <h5 class="mb-1">{{ encounterDetails.summary.encountersByType.length }}</h5>
            <small class="text-muted">Encounter Types</small>
          </b-card>
        </b-col>
      </b-row>

      <!-- Encounter Types Chart -->
      <b-card class="mb-4" v-if="encounterDetails.summary.encountersByType.length > 0">
        <template #header>
          <h6 class="mb-0">Encounters by Type</h6>
        </template>
        <div class="row">
          <div class="col-md-8">
            <apexchart
              type="donut"
              :options="chartOptions"
              :series="chartSeries"
              height="300"
            ></apexchart>
          </div>
          <div class="col-md-4">
            <div class="encounter-type-legend">
              <div
                v-for="(type, index) in encounterDetails.summary.encountersByType"
                :key="type.type"
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <div class="d-flex align-items-center">
                  <div
                    class="legend-color me-2"
                    :style="{ backgroundColor: chartOptions.colors[index] }"
                  ></div>
                  <span>{{ type.type }}</span>
                </div>
                <b-badge variant="secondary">{{ type.count }}</b-badge>
              </div>
            </div>
          </div>
        </div>
      </b-card>

      <!-- Encounters List -->
      <b-card>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Recent Encounters</h6>
            <b-button
              variant="outline-primary"
              size="sm"
              @click="fetchEncounterActions(staffId)"
              :disabled="encounterDetailsLoading"
            >
              <i class="mdi mdi-refresh"></i> Refresh
            </b-button>
          </div>
        </template>

        <div v-if="encounterDetails.encounters.length === 0" class="text-center py-4">
          <i class="mdi mdi-information-outline mdi-48px text-muted"></i>
          <p class="text-muted mt-2">No encounters found for the selected period.</p>
        </div>

        <b-table
          v-else
          :items="encounterDetails.encounters"
          :fields="tableFields"
          responsive
          striped
          hover
          :per-page="perPage"
          :current-page="currentPage"
          show-empty
        >
          <template #cell(patient)="{ item }">
            <div>
              <strong>{{ item.patient.firstname }} {{ item.patient.lastname }}</strong>
              <br />
              <small class="text-muted">ID: {{ item.patient.hospital_id }}</small>
            </div>
          </template>

          <template #cell(encounter_type)="{ item }">
            <b-badge
              :variant="getEncounterTypeVariant(item.encounter_type)"
              class="text-capitalize"
            >
              {{ item.encounter_type || 'Unknown' }}
            </b-badge>
          </template>

          <template #cell(time_of_encounter)="{ item }">
            <div>
              <div>{{ formatDate(item.time_of_encounter) }}</div>
              <small class="text-muted">{{ formatTime(item.time_of_encounter) }}</small>
            </div>
          </template>

          <template #cell(visit_status)="{ item }">
            <b-badge :variant="getVisitStatusVariant(item.visit.status)" class="text-capitalize">
              {{ item.visit.status }}
            </b-badge>
          </template>

          <template #cell(actions)="{ item }">
            <b-button variant="outline-primary" size="sm" @click="viewEncounterActions(item.id)">
              <i class="mdi mdi-eye"></i> View Actions
            </b-button>
          </template>
        </b-table>

        <!-- Pagination -->
        <b-pagination
          v-if="encounterDetails.encounters.length > perPage"
          v-model="currentPage"
          :total-rows="encounterDetails.encounters.length"
          :per-page="perPage"
          align="center"
          class="mt-3"
        ></b-pagination>
      </b-card>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-5">
      <i class="mdi mdi-alert-circle-outline mdi-48px text-danger"></i>
      <p class="text-muted mt-2">Failed to load encounter details. Please try again.</p>
      <b-button variant="primary" @click="loadEncounterDetails">
        <i class="mdi mdi-refresh"></i> Retry
      </b-button>
    </div>

    <!-- Encounter Actions Modal -->
    <b-modal v-model="showActionsModal" title="Encounter Actions" size="xl" hide-footer>
      <div v-if="encounterDetailsLoading" class="text-center py-4">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2">Loading encounter actions...</p>
      </div>
      <div v-else-if="encounterActions">
        <!-- Actions content will be displayed here -->
        <encounter-actions-view :actions="encounterActions" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
import EncounterActionsView from '@/components/EncounterActionsView.vue';

export default {
  name: 'EncounterDetails',
  components: {
    EncounterActionsView,
  },
  data() {
    return {
      staffId: null,
      currentPage: 1,
      perPage: 10,
      showActionsModal: false,
      tableFields: [
        {
          key: 'patient',
          label: 'Patient',
          sortable: true,
        },
        {
          key: 'encounter_type',
          label: 'Type',
          sortable: true,
        },
        {
          key: 'time_of_encounter',
          label: 'Date & Time',
          sortable: true,
        },
        {
          key: 'visit_status',
          label: 'Visit Status',
          sortable: true,
        },
        {
          key: 'actions',
          label: 'Actions',
          class: 'text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState('model', ['encounterDetails', 'encounterActions', 'encounterDetailsLoading']),
    chartSeries() {
      if (!this.encounterDetails?.summary?.encountersByType) return [];
      return this.encounterDetails.summary.encountersByType.map(type => type.count);
    },
    chartOptions() {
      return {
        chart: {
          type: 'donut',
        },
        labels: this.encounterDetails?.summary?.encountersByType?.map(type => type.type) || [],
        colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'],
        legend: {
          show: false,
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return Math.round(val) + '%';
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
            },
          },
        ],
      };
    },
  },
  methods: {
    ...mapActions('model', ['fetchEncounterDetails', 'fetchEncounterActions']),
    loadEncounterDetails() {
      if (this.staffId) {
        const payload = {
          staff_id: this.staffId,
          start: this.$route.query.startDate,
          end: this.$route.query.endDate,
          // Add date range if needed
        };
        this.fetchEncounterDetails(payload);
      }
    },
    viewEncounterActions(encounterId) {
      this.fetchEncounterActions(encounterId);
      this.showActionsModal = true;
    },
    formatDate(date) {
      return moment(date).format('MMM DD, YYYY');
    },
    formatTime(date) {
      return moment(date).format('hh:mm A');
    },
    getEncounterTypeVariant(type) {
      const variants = {
        consultation: 'primary',
        follow_up: 'success',
        emergency: 'danger',
        routine: 'info',
      };
      return variants[type?.toLowerCase()] || 'secondary';
    },
    getVisitStatusVariant(status) {
      const variants = {
        active: 'success',
        completed: 'primary',
        cancelled: 'danger',
        pending: 'warning',
      };
      return variants[status?.toLowerCase()] || 'secondary';
    },
  },
  mounted() {
    // Get staff ID from route params
    this.staffId = this.$route.params.staffId;
    if (this.staffId) {
      this.loadEncounterDetails();
    } else {
      this.$router.push('/statistics/encounters');
    }
  },
};
</script>

<style scoped>
.encounter-details {
  padding: 20px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.encounter-type-legend {
  padding: 20px 0;
}

.h-100 {
  height: 100% !important;
}
</style>
