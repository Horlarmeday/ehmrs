<template>
  <div class="add-investigation-result-page">
    <!-- Loading State -->
    <result-skeleton v-if="isLoading" title="Add Investigation Result" />

    <!-- Main Content -->
    <div v-else-if="investigation" class="page-content">
      <!-- Page Header Card -->
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">
              <i class="fas fa-file-medical-alt text-primary"></i>
              Add Investigation Result
            </h3>
          </div>
          <div class="card-toolbar">
            <!-- Quick Actions -->
            <b-button-group size="sm">
              <b-button
                variant="outline-secondary"
                @click="viewPrescription"
                v-b-tooltip.hover
                title="View Prescription"
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
                variant="outline-info"
                @click="printPage"
                v-b-tooltip.hover
                title="Print"
              >
                <i class="fas fa-print"></i>
              </b-button>
            </b-button-group>
          </div>
        </div>

        <div class="card-body">
          <!-- Investigation Metadata -->
          <div class="investigation-metadata mb-5">
            <b-row>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Prescription ID</small>
                  <strong>#{{ $route.params.id }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Prescription Date</small>
                  <strong>{{ formatDate(investigation.created_at) }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Requested By</small>
                  <strong>{{ investigation.requested_by || 'N/A' }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Total Investigations</small>
                  <strong>{{ investigation.investigations?.length || 0 }}</strong>
                </div>
              </b-col>
            </b-row>
          </div>

          <!-- Patient Information Section -->
          <section-title text="Patient Information" icon="fas fa-user-injured" />
          <patient-section
            v-if="investigation.patient"
            :patient="investigation.patient"
            :insurance="investigation.insurance"
          />

          <!-- Pending Investigations Summary -->
          <div v-if="pendingInvestigations.length > 0" class="alert alert-light-primary mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-info-circle fa-2x text-primary mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">Pending Investigations</h5>
                <p class="mb-0">
                  You have <strong>{{ pendingInvestigations.length }}</strong> investigation(s) waiting for results.
                </p>
              </div>
            </div>
          </div>

          <!-- Accepted Investigations Notice -->
          <div v-if="acceptedInvestigations.length > 0" class="alert alert-light-info mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-check-circle fa-2x text-info mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">Accepted Results</h5>
                <p class="mb-0">
                  <strong>{{ acceptedInvestigations.length }}</strong> investigation result(s) have already been
                  accepted and cannot be modified.
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Pending Notice -->
          <div v-if="paymentPendingInvestigations.length > 0" class="alert alert-light-warning mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-exclamation-triangle fa-2x text-warning mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">Payment Required</h5>
                <p class="mb-0">
                  <strong>{{ paymentPendingInvestigations.length }}</strong> investigation(s) require payment
                  before results can be entered.
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
              <i class="fas fa-microscope text-success"></i>
              Investigation Results
            </h3>
          </div>
        </div>
        <div class="card-body">
          <investigation-result-section
            v-if="investigation.investigations && investigation.investigations.length > 0"
            ref="resultSection"
            :tests="investigation.investigations"
            :patient_id="investigation.patient.id"
            :key="uniqueKey"
            @unsaved-changes="hasUnsavedChanges = $event"
          />
          <div v-else class="empty-state text-center py-5">
            <i class="fas fa-vial fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No investigations found for this prescription</h5>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="card card-custom gutter-b bg-light-primary">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <i class="fas fa-question-circle fa-2x text-primary mr-4"></i>
            <div class="flex-grow-1">
              <h5 class="mb-2">Need Help?</h5>
              <ul class="mb-0 pl-4">
                <li>Upload DICOM or image files for each investigation</li>
                <li>Use report templates to structure your findings</li>
                <li>Your work is automatically saved as you type</li>
                <li>Click "Save Draft" to manually save your progress</li>
                <li>Click "Submit Results" when you're ready to submit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state text-center py-5">
      <div class="card card-custom">
        <div class="card-body">
          <i class="fas fa-exclamation-circle fa-4x text-danger mb-4"></i>
          <h4 class="text-danger mb-3">Investigation Not Found</h4>
          <p class="text-muted">The requested investigation could not be loaded.</p>
          <b-button variant="primary" @click="goBack">
            <i class="fas fa-arrow-left"></i> Go Back
          </b-button>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <b-modal
      v-model="showUnsavedModal"
      title="Unsaved Changes"
      @ok="confirmNavigation"
      @cancel="cancelNavigation"
      ok-variant="danger"
      ok-title="Leave Without Saving"
      cancel-title="Stay on Page"
    >
      <div class="text-center py-3">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h5>You have unsaved changes</h5>
        <p class="text-muted mb-0">
          Are you sure you want to leave this page? Any unsaved changes will be lost.
        </p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PatientSection from '@/utils/PatientSection.vue';
// import PageTitle from '@/utils/PageTitle.vue';
import InvestigationResultSection from './result/InputResultSection.vue';
import ResultSkeleton from '@/view/pages/radiology/components/skeleton/ResultSkeleton.vue';

export default {
  name: 'AddInvestigationResultEnhanced',
  components: {
    ResultSkeleton,
    InvestigationResultSection,
    // PageTitle,
    PatientSection,
    SectionTitle,
  },
  data() {
    return {
      isLoading: true,
      hasUnsavedChanges: false,
      showUnsavedModal: false,
      nextRoute: null,
    };
  },
  computed: {
    investigation() {
      return this.$store.state.radiology.reqInvestigation;
    },
    uniqueKey() {
      return this.investigation?.patient?.id + Date.now();
    },
    pendingInvestigations() {
      if (!this.investigation?.investigations) return [];
      return this.investigation.investigations.filter(
        (inv) => (!inv.result || inv.result.status !== 'Accepted') && inv.payment_status !== 'Pending'
      );
    },
    acceptedInvestigations() {
      if (!this.investigation?.investigations) return [];
      return this.investigation.investigations.filter((inv) => inv.result?.status === 'Accepted');
    },
    paymentPendingInvestigations() {
      if (!this.investigation?.investigations) return [];
      return this.investigation.investigations.filter((inv) => inv.payment_status === 'Pending');
    },
  },
  async created() {
    await this.loadInvestigation();
  },
  beforeRouteLeave(to, from, next) {
    // Check for unsaved changes
    if (this.hasUnsavedChanges) {
      this.nextRoute = to;
      this.showUnsavedModal = true;
      next(false);
    } else {
      next();
    }
  },
  methods: {
    async loadInvestigation() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('radiology/fetchOneRequestedInvestigation', {
          id: this.$route.params.id,
        });
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to load investigation',
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    viewPrescription() {
      // Navigate to prescription view or open in modal
      this.$router.push(`/radiology/prescription/${this.$route.params.id}`);
    },

    viewPatientHistory() {
      // Navigate to patient radiology history
      if (this.investigation?.patient?.id) {
        this.$router.push(`/radiology/patient-history/${this.investigation.patient.id}`);
      }
    },

    printPage() {
      window.print();
    },

    goBack() {
      this.$router.go(-1);
    },

    confirmNavigation() {
      this.hasUnsavedChanges = false;
      this.showUnsavedModal = false;
      if (this.nextRoute) {
        this.$router.push(this.nextRoute);
      }
    },

    cancelNavigation() {
      this.showUnsavedModal = false;
      this.nextRoute = null;
    },
  },
};
</script>

<style scoped>
.add-investigation-result-page {
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

.investigation-metadata {
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

.alert-light-primary {
  background-color: #e1f0ff;
  border-color: #b8daff;
}

.alert-light-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
}

.alert-light-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
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
  .card-header,
  .help-section {
    display: none !important;
  }

  .card {
    box-shadow: none !important;
    border: none !important;
  }

  .page-content {
    padding: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .investigation-metadata {
    padding: 15px;
  }

  .metadata-item {
    margin-bottom: 10px;
  }

  .card-toolbar .btn-group {
    flex-direction: column;
  }
}
</style>
