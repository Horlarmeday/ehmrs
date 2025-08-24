<template>
  <div>
    <!-- Header -->
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="card-title align-items-start flex-column">
            <span class="card-label font-weight-bolder text-dark">Encounter Details</span>
            <span class="text-muted mt-3 font-weight-bold font-size-md">{{
              encounterDetails?.encounters?.[0]?.examiner?.fullname || 'Loading...'
            }}</span>
          </h3>
          <div class="card-toolbar d-flex align-items-center">
            <router-link to="/statistics/encounters" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i> Back to Encounters
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card card-custom gutter-b">
      <div class="card-body text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="mt-3">Loading encounter details...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="encounterDetails">
      <!-- Summary Section -->
      <encounter-summary :summary="encounterDetails.summary" />

      <!-- Encounter Types Chart -->
      <encounter-types-chart :encounters-by-type="encounterDetails.summary?.encountersByType" />

      <!-- Encounters List -->
      <encounters-list
        :encounters="encounterDetails.encounters"
        @viewActions="viewEncounterActions"
      />
    </div>

    <!-- Error State -->
    <div v-else class="card card-custom gutter-b">
      <div class="card-body text-center">
        <i class="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
        <h5>Failed to load encounter details</h5>
        <p class="text-muted">Please try again or contact support if the problem persists.</p>
        <button @click="loadEncounterDetails" class="btn btn-primary">Retry</button>
      </div>
    </div>

    <!-- Encounter Actions Modal -->
    <encounter-actions-modal
      :display-prompt="showActionsModal"
      :encounter-actions="encounterActions"
      @close="closeActionsModal"
      @view-actions="viewEncounterActions"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import dayjs from 'dayjs';

// Components
import EncounterSummary from '../components/EncounterSummary.vue';
import EncounterTypesChart from '../components/EncounterTypesChart.vue';
import EncountersList from '../components/EncountersList.vue';
import EncounterActionsModal from '../components/EncounterActionsModal.vue';

export default {
  name: 'EncounterDetails',
  components: {
    EncounterSummary,
    EncounterTypesChart,
    EncountersList,
    EncounterActionsModal,
  },
  data() {
    return {
      showActionsModal: false,
    };
  },
  computed: {
    ...mapState('model', ['encounterDetails', 'encounterActions', 'encounterDetailsLoading']),
    loading() {
      return this.encounterDetailsLoading;
    },
  },
  methods: {
    ...mapActions('model', ['fetchEncounterDetails', 'fetchEncounterActions']),

    async loadEncounterDetails() {
      try {
        await this.fetchEncounterDetails({
          staffId: this.$route.params.staffId,
          start:
            this.$route.query.startDate ||
            dayjs()
              .startOf('month')
              .format('YYYY-MM-DD'),
          end:
            this.$route.query.endDate ||
            dayjs()
              .endOf('month')
              .format('YYYY-MM-DD'),
        });
      } catch (error) {
        console.error('Error fetching encounter details:', error);
        this.$toast.error('Failed to load encounter details');
      }
    },

    async viewEncounterActions(encounterId) {
      try {
        await this.fetchEncounterActions(encounterId);
        this.showActionsModal = true;
      } catch (error) {
        console.error('Error fetching encounter actions:', error);
        this.$toast.error('Failed to load encounter actions');
      }
    },

    closeActionsModal() {
      this.showActionsModal = false;
    },
  },
  created() {
    this.loadEncounterDetails();
  },
};
</script>

<style scoped>
.card-custom {
  border: 1px solid #e4e6ea;
  border-radius: 0.42rem;
}

.card-header {
  background-color: #f3f6f9;
  border-bottom: 1px solid #e4e6ea;
}
</style>
