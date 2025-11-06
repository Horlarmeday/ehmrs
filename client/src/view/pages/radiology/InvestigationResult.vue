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
              <b-button
                variant="outline-secondary"
                @click="compareResults"
                v-b-tooltip.hover
                title="Compare Results"
                :disabled="!hasPreviousResults"
              >
                <i class="fas fa-exchange-alt"></i>
              </b-button>
              <b-button
                variant="outline-primary"
                @click="printPage"
                v-b-tooltip.hover
                title="Print Report"
              >
                <i class="fas fa-print"></i>
              </b-button>
              <b-button
                variant="outline-success"
                @click="downloadPdf"
                v-b-tooltip.hover
                title="Download PDF"
              >
                <i class="fas fa-file-pdf"></i>
              </b-button>
              <b-button
                v-if="hasImages"
                variant="outline-info"
                @click="downloadAllImages"
                v-b-tooltip.hover
                title="Download All Images"
              >
                <i class="fas fa-download"></i> Images
              </b-button>
              <b-button
                variant="outline-warning"
                @click="shareResult"
                v-b-tooltip.hover
                title="Share Result"
              >
                <i class="fas fa-share-alt"></i>
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
                  <strong>{{ formatDate(result.approved_at) }}</strong>
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

          <!-- Summary Cards -->
          <b-row class="mb-5">
            <!-- Total Results -->
            <b-col md="3">
              <div class="summary-card">
                <div class="summary-icon bg-light-primary">
                  <i class="fas fa-vials fa-2x text-primary"></i>
                </div>
                <div class="summary-content">
                  <h3 class="mb-0">{{ result.results?.length || 0 }}</h3>
                  <p class="text-muted mb-0">Total Results</p>
                </div>
              </div>
            </b-col>

            <!-- Total Images -->
            <b-col md="3">
              <div class="summary-card">
                <div class="summary-icon bg-light-info">
                  <i class="fas fa-images fa-2x text-info"></i>
                </div>
                <div class="summary-content">
                  <h3 class="mb-0">{{ totalImages }}</h3>
                  <p class="text-muted mb-0">Total Images</p>
                </div>
              </div>
            </b-col>

            <!-- DICOM Images -->
            <b-col md="3">
              <div class="summary-card">
                <div class="summary-icon bg-light-success">
                  <i class="fas fa-file-medical fa-2x text-success"></i>
                </div>
                <div class="summary-content">
                  <h3 class="mb-0">{{ dicomImageCount }}</h3>
                  <p class="text-muted mb-0">DICOM Images</p>
                </div>
              </div>
            </b-col>

            <!-- Critical Findings -->
            <b-col md="3">
              <div class="summary-card">
                <div
                  :class="
                    hasCriticalFindings
                      ? 'summary-icon bg-light-danger'
                      : 'summary-icon bg-light-secondary'
                  "
                >
                  <i
                    :class="
                      hasCriticalFindings
                        ? 'fas fa-exclamation-triangle fa-2x text-danger'
                        : 'fas fa-check-circle fa-2x text-secondary'
                    "
                  ></i>
                </div>
                <div class="summary-content">
                  <h3 class="mb-0">{{ criticalFindingsCount }}</h3>
                  <p class="text-muted mb-0">Critical Findings</p>
                </div>
              </div>
            </b-col>
          </b-row>

          <!-- Critical Findings Alert -->
          <div v-if="hasCriticalFindings" class="alert alert-danger mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-exclamation-triangle fa-3x mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">⚠️ CRITICAL FINDINGS PRESENT</h5>
                <p class="mb-0">
                  This result contains <strong>{{ criticalFindingsCount }}</strong> critical
                  finding(s) that require immediate clinical attention.
                </p>
              </div>
            </div>
          </div>
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

    <!-- Share Modal -->
    <b-modal v-model="showShareModal" title="Share Result" @ok="handleShare">
      <b-form-group label="Share with (Email)" label-for="share-email">
        <b-form-input
          id="share-email"
          v-model="shareEmail"
          type="email"
          placeholder="Enter email address"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group>
        <b-form-checkbox v-model="shareIncludeImages">Include images</b-form-checkbox>
      </b-form-group>
    </b-modal>
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
    };
  },
  computed: {
    result() {
      return this.$store.state.radiology.result;
    },
    totalImages() {
      if (!this.result?.results) return 0;
      return this.result.results.reduce((total, result) => {
        return total + (result.images?.length || 0);
      }, 0);
    },
    dicomImageCount() {
      if (!this.result?.results) return 0;
      return this.result.results.reduce((total, result) => {
        const dicomImages = (result.images || []).filter((img) => img.file_type === 'DICOM');
        return total + dicomImages.length;
      }, 0);
    },
    hasCriticalFindings() {
      if (!this.result?.results) return false;
      return this.result.results.some((result) => result.has_critical_finding);
    },
    criticalFindingsCount() {
      if (!this.result?.results) return 0;
      return this.result.results.filter((result) => result.has_critical_finding).length;
    },
    hasImages() {
      return this.totalImages > 0;
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

        // Check for previous results
        if (this.result?.patient?.id) {
          await this.checkPreviousResults();
        }
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

    async checkPreviousResults() {
      try {
        const response = await this.$http.get(
          `/radiology/patient-results/${this.result.patient.id}`
        );
        this.hasPreviousResults = response.data.data && response.data.data.length > 1; // More than current
      } catch (error) {
        console.error('Error checking previous results:', error);
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

    printPage() {
      window.print();
    },

    downloadPdf() {
      this.$notify({
        group: 'foo',
        title: 'Info',
        text: 'PDF generation in progress...',
        type: 'info',
      });
      // Call API to generate PDF
      window.open(`/radiology/results/${this.$route.params.id}/pdf`, '_blank');
    },

    async downloadAllImages() {
      this.$notify({
        group: 'foo',
        title: 'Download Started',
        text: 'Preparing all images for download...',
        type: 'info',
      });

      try {
        const response = await this.$http.get(
          `/radiology/results/${this.$route.params.id}/download-images`,
          {
            responseType: 'blob',
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `result-${this.$route.params.id}-images.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'All images downloaded successfully',
          type: 'success',
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to download images',
          type: 'error',
        });
      }
    },

    shareResult() {
      this.showShareModal = true;
    },

    async handleShare() {
      if (!this.shareEmail) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Please enter an email address',
          type: 'error',
        });
        return;
      }

      try {
        await this.$http.post(`/radiology/results/${this.$route.params.id}/share`, {
          email: this.shareEmail,
          includeImages: this.shareIncludeImages,
        });

        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Result shared successfully',
          type: 'success',
        });

        this.showShareModal = false;
        this.shareEmail = '';
        this.shareIncludeImages = true;
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Failed to share result',
          type: 'error',
        });
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
