<template>
  <div class="deceased-patient-management">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Deceased Patient Management</h4>
        <p class="text-muted mb-0">Comprehensive management and reporting for deceased patients</p>
      </div>
      <div>
        <b-button
          variant="outline-primary"
          size="sm"
          @click="generateMissingCertificates"
          :disabled="generatingCertificates"
        >
          <i class="fas fa-certificate mr-2"></i>
          <span v-if="!generatingCertificates">Generate Missing Certificates</span>
          <span v-else>
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Generating...
          </span>
        </b-button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <b-card>
      <b-tabs v-model="activeTab" card>
        <!-- Death Statistics Dashboard -->
        <b-tab title="Statistics Dashboard" title-item-class="text-primary">
          <template #title>
            <i class="fas fa-chart-line mr-2"></i>
            Statistics Dashboard
          </template>
          <DeathStatisticsDashboard />
        </b-tab>

        <!-- Mortality Reports -->
        <b-tab title="Mortality Reports" title-item-class="text-info">
          <template #title>
            <i class="fas fa-chart-bar mr-2"></i>
            Mortality Reports
          </template>
          <MortalityReports />
        </b-tab>

        <!-- Death Certificate Tracking -->
        <b-tab title="Certificate Tracking" title-item-class="text-success">
          <template #title>
            <i class="fas fa-certificate mr-2"></i>
            Certificate Tracking
          </template>
          <DeathCertificateTracking />
        </b-tab>

        <!-- Deceased Patients List -->
        <b-tab title="Deceased Patients" title-item-class="text-warning">
          <template #title>
            <i class="fas fa-list mr-2"></i>
            Deceased Patients
          </template>
          <DeceasedPatientsList />
        </b-tab>

        <!-- Certificate Verification -->
        <b-tab title="Certificate Verification" title-item-class="text-info">
          <template #title>
            <i class="fas fa-certificate mr-2"></i>
            Certificate Verification
          </template>
          <CertificateVerification />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import DeathStatisticsDashboard from './DeathStatisticsDashboard.vue';
import MortalityReports from './MortalityReports.vue';
import DeathCertificateTracking from './DeathCertificateTracking.vue';
import DeceasedPatientsList from './DeceasedPatientsList.vue';
import CertificateVerification from './CertificateVerification.vue';

export default {
  name: 'DeceasedPatientManagement',
  components: {
    DeathStatisticsDashboard,
    MortalityReports,
    DeathCertificateTracking,
    DeceasedPatientsList,
    CertificateVerification,
  },
  data() {
    return {
      activeTab: 0,
      generatingCertificates: false,
    };
  },
  methods: {
    async generateMissingCertificates() {
      try {
        this.generatingCertificates = true;

        const response = await this.$store.dispatch(
          'patient/generateMissingDeathCertificateNumbers'
        );

        if (response && response.updated > 0) {
          this.$bvToast.toast(
            `Successfully generated ${response.updated} missing death certificate numbers`,
            {
              title: 'Success',
              variant: 'success',
              solid: true,
            }
          );

          // Refresh the deceased patients list if we're on that tab
          if (this.activeTab === 3) {
            // Deceased Patients tab
            this.$store.dispatch('patient/getDeceasedPatients');
          }
        } else {
          this.$bvToast.toast('No deceased patients found without certificate numbers', {
            title: 'Info',
            variant: 'info',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Error generating missing certificates:', error);
        this.$bvToast.toast(
          error.response?.data?.message || 'Failed to generate missing certificates',
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      } finally {
        this.generatingCertificates = false;
      }
    },
  },
};
</script>

<style scoped>
.deceased-patient-management {
  padding: 20px;
}

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-weight: 500;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  border-bottom-color: #dee2e6;
}

.nav-tabs .nav-link.active {
  border-color: transparent;
  border-bottom-color: #007bff;
  color: #007bff;
  background-color: transparent;
}

.nav-tabs .nav-link.active i {
  color: #007bff;
}
</style>
