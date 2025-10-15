<template>
  <div class="approve-investigation-result-page">
    <!-- Loading State -->
    <result-skeleton v-if="isLoading" title="Approve Investigation Result" />

    <!-- Main Content -->
    <div v-else-if="investigation" class="page-content">
      <!-- Page Header Card -->
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">
              <i class="fas fa-clipboard-check text-success"></i>
              Approve Investigation Result
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
                title="Compare with Previous Results"
                :disabled="!hasPreviousResults"
              >
                <i class="fas fa-exchange-alt"></i>
              </b-button>
              <b-button variant="outline-info" @click="printPage" v-b-tooltip.hover title="Print">
                <i class="fas fa-print"></i>
              </b-button>
            </b-button-group>
          </div>
        </div>

        <div class="card-body">
          <!-- Approval Metadata -->
          <div class="approval-metadata mb-5">
            <b-row>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Prescription ID</small>
                  <strong>#{{ $route.params.id }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Results Submitted</small>
                  <strong>{{ formatDate(investigation.results_submitted_at) }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Submitted By</small>
                  <strong>{{ investigation.submitted_by || 'N/A' }}</strong>
                </div>
              </b-col>
              <b-col md="3">
                <div class="metadata-item">
                  <small class="text-muted d-block">Results Pending Approval</small>
                  <strong>{{ resultsForApproval.length }}</strong>
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

          <!-- Approval Status Summary -->
          <div v-if="resultsForApproval.length > 0" class="alert alert-light-warning mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-hourglass-half fa-2x text-warning mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">Awaiting Review</h5>
                <p class="mb-0">
                  <strong>{{ resultsForApproval.length }}</strong> investigation result(s) are
                  waiting for your review and approval.
                </p>
              </div>
            </div>
          </div>

          <!-- Already Approved Notice -->
          <div v-if="approvedResults.length > 0" class="alert alert-light-success mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-check-double fa-2x text-success mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">Previously Approved</h5>
                <p class="mb-0">
                  <strong>{{ approvedResults.length }}</strong> result(s) have already been
                  approved.
                </p>
              </div>
            </div>
          </div>

          <!-- Critical Findings Warning -->
          <div v-if="hasCriticalFindings" class="alert alert-danger mb-5">
            <div class="d-flex align-items-center">
              <i class="fas fa-exclamation-triangle fa-3x text-danger mr-3"></i>
              <div class="flex-grow-1">
                <h5 class="mb-1">⚠️ CRITICAL FINDINGS ALERT</h5>
                <p class="mb-2">
                  One or more results contain <strong>CRITICAL FINDINGS</strong> that require
                  immediate clinical attention.
                </p>
                <p class="mb-0 small">
                  <i class="fas fa-info-circle"></i> Please ensure that the ordering physician has
                  been notified and appropriate clinical follow-up has been arranged before
                  approving.
                </p>
              </div>
            </div>
          </div>

          <!-- Guidelines Card -->
          <div class="card bg-light-primary mb-5">
            <div class="card-body">
              <h6 class="mb-3">
                <i class="fas fa-clipboard-list text-primary"></i> Approval Guidelines
              </h6>
              <ul class="mb-0 pl-4">
                <li>Review all images and findings carefully</li>
                <li>Verify technical quality of images and report</li>
                <li>Check for any critical or urgent findings</li>
                <li>Add reviewer comments if needed</li>
                <li>Ensure proper documentation and compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval Section -->
      <div class="card card-custom gutter-b">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">
              <i class="fas fa-stethoscope text-primary"></i>
              Review & Approve Results
            </h3>
          </div>
        </div>
        <div class="card-body">
          <approve-result-section
            v-if="investigation.investigations && investigation.investigations.length > 0"
            ref="approvalSection"
            :tests="investigation.investigations"
            :key="uniqueKey"
            :investigation-status="investigation.status"
            @approval-complete="handleApprovalComplete"
            @critical-finding-detected="handleCriticalFinding"
          />
          <div v-else class="empty-state text-center py-5">
            <i class="fas fa-clipboard fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No results available for approval</h5>
          </div>
        </div>
      </div>

      <!-- Audit Trail Card -->
      <div
        v-if="investigation.audit_trail && investigation.audit_trail.length > 0"
        class="card card-custom gutter-b"
      >
        <div class="card-header">
          <div class="card-title">
            <h5 class="card-label">
              <i class="fas fa-history text-info"></i>
              Audit Trail
            </h5>
          </div>
        </div>
        <div class="card-body">
          <div class="timeline timeline-3">
            <div class="timeline-items">
              <div
                v-for="(entry, index) in investigation.audit_trail"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-media">
                  <i :class="getAuditIcon(entry.action)" class="fa-2x"></i>
                </div>
                <div class="timeline-content">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <div class="font-weight-bold">{{ entry.action }}</div>
                    <small class="text-muted">{{ formatDate(entry.timestamp) }}</small>
                  </div>
                  <p class="mb-0 text-muted">{{ entry.description }}</p>
                  <small v-if="entry.user" class="text-muted">
                    <i class="fas fa-user"></i> {{ entry.user }}
                  </small>
                </div>
              </div>
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
          <p class="text-muted">The requested investigation results could not be loaded.</p>
          <b-button variant="primary" @click="goBack">
            <i class="fas fa-arrow-left"></i> Go Back
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PatientSection from '@/utils/PatientSection.vue';
// import PageTitle from '@/utils/PageTitle.vue';
import ResultSkeleton from '@/view/pages/radiology/components/skeleton/ResultSkeleton.vue';
import ApproveResultSection from '@/view/pages/radiology/result/ApproveResultSection.vue';

export default {
  name: 'ApproveInvestigationResultEnhanced',
  components: {
    ApproveResultSection,
    ResultSkeleton,
    // PageTitle,
    PatientSection,
    SectionTitle,
  },
  data() {
    return {
      isLoading: true,
      hasCriticalFindings: false,
      hasPreviousResults: false,
    };
  },
  computed: {
    investigation() {
      return this.$store.state.radiology.reqInvestigation;
    },
    uniqueKey() {
      return this.investigation?.patient?.id + Date.now();
    },
    resultsForApproval() {
      if (!this.investigation?.investigations) return [];
      return this.investigation.investigations.filter(
        (inv) => inv.status === 'Result Added' && inv.result?.status !== 'Accepted'
      );
    },
    approvedResults() {
      if (!this.investigation?.investigations) return [];
      return this.investigation.investigations.filter((inv) => inv.result?.status === 'Accepted');
    },
  },
  async created() {
    await this.loadInvestigation();
  },
  methods: {
    async loadInvestigation() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('radiology/fetchOneRequestedInvestigation', {
          id: this.$route.params.id,
        });

        // Check for previous results
        if (this.investigation?.patient?.id) {
          await this.checkPreviousResults();
        }
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

    async checkPreviousResults() {
      try {
        const response = await this.$http.get(
          `/radiology/patient-results/${this.investigation.patient.id}`
        );
        this.hasPreviousResults = response.data.data && response.data.data.length > 0;
      } catch (error) {
        console.error('Error checking previous results:', error);
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
      this.$router.push(`/radiology/prescription/${this.$route.params.id}`);
    },

    viewPatientHistory() {
      if (this.investigation?.patient?.id) {
        this.$router.push(`/radiology/patient-history/${this.investigation.patient.id}`);
      }
    },

    compareResults() {
      if (this.investigation?.patient?.id) {
        this.$router.push(
          `/radiology/compare-results/${this.investigation.patient.id}/${this.$route.params.id}`
        );
      }
    },

    printPage() {
      window.print();
    },

    goBack() {
      this.$router.go(-1);
    },

    handleApprovalComplete(data) {
      this.$notify({
        group: 'foo',
        title: 'Success',
        text: `Investigation results approved successfully, ${data}`,
        type: 'success',
      });

      // Redirect to results listing or dashboard
      setTimeout(() => {
        this.$router.push('/radiology/pending-approvals');
      }, 2000);
    },

    handleCriticalFinding(data) {
      console.log(data);
      this.hasCriticalFindings = true;
    },

    getAuditIcon(action) {
      const iconMap = {
        Created: 'fas fa-plus-circle text-primary',
        Submitted: 'fas fa-paper-plane text-info',
        Approved: 'fas fa-check-circle text-success',
        Rejected: 'fas fa-times-circle text-danger',
        Modified: 'fas fa-edit text-warning',
        Viewed: 'fas fa-eye text-secondary',
      };
      return iconMap[action] || 'fas fa-circle text-muted';
    },
  },
};
</script>

<style scoped>
.approve-investigation-result-page {
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

.approval-metadata {
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

.alert-light-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.alert-light-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
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

/* Timeline Styles */
.timeline {
  position: relative;
}

.timeline-items {
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -15px;
  top: 30px;
  bottom: -10px;
  width: 2px;
  background: #e4e6ef;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-media {
  position: absolute;
  left: -30px;
  top: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content {
  padding-left: 15px;
}

/* Print Styles */
@media print {
  .card-toolbar,
  .card-header,
  .approval-actions {
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
  .approval-metadata {
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
