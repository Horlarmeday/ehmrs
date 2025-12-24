<template>
  <div class="investigation-result-page">
    <!-- Loading State -->
    <result-skeleton v-if="isLoading" title="Investigation Result" />

    <!-- Main Content -->
    <div v-else-if="result" class="page-content">
      <!-- Page Header Card -->
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">
              <i class="fas fa-file-medical-alt text-primary"></i>
              Investigation Result
            </h3>
          </div>
          <div class="card-toolbar">
            <!-- Quick Actions -->
            <b-button-group size="sm">
              <b-button
                variant="outline-primary"
                @click="downloadPDF"
                :disabled="downloadingPdf"
                v-b-tooltip.hover
                title="Download PDF Report"
              >
                <b-spinner v-if="downloadingPdf" small></b-spinner>
                <i v-else class="fas fa-file-pdf"></i>
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="viewPrescription"
                v-b-tooltip.hover
                title="View Original Prescription"
              >
                <i class="fas fa-prescription"></i>
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="viewPatientHistory"
                v-b-tooltip.hover
                title="Patient History"
              >
                <i class="fas fa-history"></i>
              </b-button>
            </b-button-group>
          </div>
        </div>

        <div class="card-body">
          <!-- Result Metadata -->
          <div class="result-metadata mb-5">
            <b-row>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Result ID</small>
                  <strong>#{{ $route.params.id }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Status</small>
                  <b-badge :variant="getStatusVariant(result.status)" size="lg">
                    <i class="fas fa-check-circle"></i>
                    {{ result.status }}
                  </b-badge>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Approved Date</small>
                  <strong>{{
                    formatDate(result?.results?.[0]?.investigation?.investigation_approved_date)
                  }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Total Investigations</small>
                  <strong>{{ result.results?.length || 0 }}</strong>
                </div>
              </b-col>
            </b-row>
          </div>

          <!-- Patient Information Section -->
          <section-title text="Patient Information" icon="fas fa-user-injured" />
          <patient-section
            v-if="result.patient"
            :patient="result.patient"
            :insurance="result.insurance"
          />
        </div>
      </div>

      <!-- Investigation Results Section -->
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">
              <i class="fas fa-clipboard-list text-success"></i>
              Investigation Results & Reports
            </h3>
          </div>
        </div>
        <div class="card-body">
          <result-section
            v-if="result.results && result.results.length > 0"
            :results="result.results"
          />
          <div v-else class="empty-state text-center py-5">
            <i class="fas fa-clipboard fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No results available</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state text-center py-5">
      <div class="card card-custom">
        <div class="card-body">
          <i class="fas fa-exclamation-circle fa-4x text-danger mb-4"></i>
          <h4 class="text-danger mb-3">Result Not Found</h4>
          <p class="text-muted">The requested investigation result could not be loaded.</p>
          <b-button variant="primary" @click="goBack">
            <i class="fas fa-arrow-left"></i> Go Back
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from '../../../utils/SectionTitle.vue';
import PatientSection from '../../../utils/PatientSection.vue';
// import PageTitle from '../../../utils/PageTitle.vue';
import ResultSection from './result/ResultSection.vue';
import ResultSkeleton from '@/view/pages/radiology/components/skeleton/ResultSkeleton.vue';

export default {
  name: 'InvestigationResultEnhanced',
  components: { ResultSkeleton, ResultSection, PatientSection, SectionTitle },
  data() {
    return {
      isLoading: true,
      hasPreviousResults: false,
      showShareModal: false,
      shareEmail: '',
      shareIncludeImages: true,
      downloadingPdf: false,
    };
  },
  computed: {
    result() {
      return this.$store.state.radiology.result;
    },
    hasCriticalFindings() {
      if (!this.result?.results) return false;
      return this.result.results.some((result) => result.has_critical_finding);
    },
    criticalFindingsCount() {
      if (!this.result?.results) return 0;
      return this.result.results.filter((result) => result.has_critical_finding).length;
    },
  },
  async created() {
    await this.loadResult();
  },
  methods: {
    async loadResult() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('radiology/fetchOneInvestigationResult', {
          id: this.$route.params.id,
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to load result',
          type: 'error',
        });
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getStatusVariant(status) {
      const variants = {
        Accepted: 'success',
        Pending: 'warning',
        Rejected: 'danger',
        'In Progress': 'info',
      };
      return variants[status] || 'secondary';
    },

    viewPrescription() {
      if (this.result?.prescription_id) {
        this.$router.push(`/radiology/prescription/${this.result.prescription_id}`);
      }
    },

    viewPatientHistory() {
      if (this.result?.patient?.id) {
        this.$router.push(`/radiology/patient-history/${this.result.patient.id}`);
      }
    },

    compareResults() {
      if (this.result?.patient?.id) {
        this.$router.push(
          `/radiology/compare-results/${this.result.patient.id}/${this.$route.params.id}`
        );
      }
    },

    async downloadPDF() {
      this.downloadingPdf = true;
      try {
        await this.$store.dispatch('radiology/downloadRadiologyResult', {
          id: this.$route.params.id,
        });

        this.$bvToast.toast('PDF downloaded successfully', {
          title: 'Success',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Error downloading PDF:', error);
        this.$bvToast.toast(error.response?.data?.message || 'Failed to download PDF', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.downloadingPdf = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.investigation-result-page {
  padding-bottom: 40px;
}

.page-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-metadata {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e6ef;
}

.metadata-item {
  padding: 8px 0;
}

.metadata-item small {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-item strong {
  font-size: 14px;
  color: #3f4254;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e6ef;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.summary-content h3 {
  font-size: 28px;
  font-weight: 600;
  color: #3f4254;
}

.bg-light-primary {
  background-color: #e1f0ff;
}

.bg-light-info {
  background-color: #d1ecf1;
}

.bg-light-success {
  background-color: #d4edda;
}

.bg-light-danger {
  background-color: #f8d7da;
}

.bg-light-secondary {
  background-color: #e4e6ef;
}

.empty-state {
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e4e6ef;
}

.error-state {
  padding: 60px 20px;
}

/* Print Styles */
@media print {
  .card-toolbar,
  .card-header {
    display: none !important;
  }

  .card {
    box-shadow: none !important;
    border: none !important;
  }

  .summary-card {
    page-break-inside: avoid;
  }

  .page-content {
    padding: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .result-metadata {
    padding: 15px;
  }

  .metadata-item {
    margin-bottom: 10px;
  }

  .card-toolbar .btn-group {
    flex-direction: column;
    width: 100%;
  }

  .card-toolbar .btn {
    margin-bottom: 5px;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
  }

  .summary-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
