<template>
  <div class="approve-result-section mt-3">
    <!-- Loading State -->
    <div v-if="isLoading">
      <DefaultSkeleton />
      <DefaultSkeleton />
    </div>

    <!-- Main Content -->
    <div v-else-if="investigations && investigations.length > 0">
      <!-- Investigation Tabs -->
      <b-card no-body class="investigation-tabs-card">
        <b-tabs v-model="activeTabIndex" card nav-wrapper-class="investigation-tabs-nav">
          <b-tab
            v-for="(investigation, index) in investigations"
            :key="index"
            :title-link-class="getTabClass()"
            @click="selectInvestigation(index)"
          >
            <!-- Tab Title -->
            <template #title>
              <div class="tab-title-content">
                <div class="d-flex align-items-center justify-content-between w-100">
                  <div class="flex-grow-1">
                    <div class="font-weight-bold">{{ investigation.name }}</div>
                    <small class="text-muted">{{
                      investigation.investigationType || 'Investigation'
                    }}</small>
                  </div>
                  <div class="ml-2">
                    <!-- Image Count Badge -->
                    <b-badge
                      v-if="investigation.images && investigation.images.length > 0"
                      variant="primary"
                      class="ml-1"
                    >
                      <i class="fas fa-images"></i> {{ investigation.images.length }}
                    </b-badge>
                  </div>
                </div>
              </div>
            </template>

            <!-- Tab Content -->
            <div class="tab-content-area">
              <!-- Right Side: Report & Approval Section -->
              <div class="report-section">
                <b-card class="h-100">
                  <template #header>
                    <h5 class="mb-0">
                      <i class="fas fa-file-medical-alt"></i> Investigation Report
                    </h5>
                  </template>

                  <!-- Investigation Result (Readonly) -->
                  <div class="report-content">
                    <div class="">
                      <div v-html="investigation.result"></div>
                    </div>
                  </div>

                  <div class="separator separator-dashed my-5"></div>
                </b-card>
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </b-card>

      <!-- Action Buttons -->
      <div class="separator separator-solid my-6"></div>
      <div class="action-buttons text-center">
        <b-button
          variant="success"
          size="lg"
          @click="showApproveModal = true"
          :disabled="isDisabled"
          ref="kt-approveInvestigationResult-submit"
        >
          <i class="fas fa-check"></i> Approve Results
        </b-button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-5">
      <i class="fas fa-clipboard-check fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No results available for approval</h5>
      <p class="text-muted">Results must be submitted before they can be reviewed and approved</p>
    </div>

    <!-- Approval Confirmation Modal -->
    <b-modal
      v-model="showApproveModal"
      title="Confirm Approval"
      @ok="approveResults"
      ok-variant="success"
      ok-title="Approve"
      cancel-title="Cancel"
    >
      <div class="text-center py-3">
        <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
        <h5>Approve Investigation Results?</h5>
        <p class="text-muted mb-3">
          You are about to approve <strong>{{ investigations.length }}</strong> investigation
          result(s).
        </p>

        <p class="mb-0 small text-muted">
          Once approved, these results will be finalized and available to authorized personnel.
        </p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
// import TextEditor from '@/utils/TextEditor.vue';
export default {
  name: 'ApproveResultSectionEnhanced',
  components: {
    // TextEditor,
    DefaultSkeleton,
  },
  props: {
    tests: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      investigations: [],
      activeTabIndex: 0,
      isLoading: false,
      isDisabled: false,
      viewMode: 'gallery', // 'gallery' or 'viewer'
      selectedImageForViewer: null,
      showApproveModal: false,
      showRejectModal: false,
      showLightbox: false,
      lightboxImage: null,
      rejectionReason: '',
      qualityOptions: [
        { text: 'Excellent', value: 'excellent' },
        { text: 'Good', value: 'good' },
        { text: 'Acceptable', value: 'acceptable' },
        { text: 'Poor', value: 'poor' },
      ],
    };
  },
  watch: {
    tests: {
      handler() {
        this.initializeInvestigations();
      },
      immediate: true,
    },
  },
  methods: {
    initializeInvestigations() {
      this.investigations = this.tests
        .filter((test) => test.status === 'Result Added')
        .map((test) => ({
          result: test?.result?.result || '',
          name: test.investigation.name,
          investigationType: test.investigation.type || test.investigation.modality,
          investigation_prescription_id: this.$route.params.id,
          prescribed_investigation_id: test?.id,
        }));
    },

    selectInvestigation(index) {
      this.activeTabIndex = index;
      const investigation = this.investigations[index];
      if (investigation.images && investigation.images.length > 0) {
        this.selectedImageForViewer = investigation.images[0];
      } else {
        this.selectedImageForViewer = null;
      }
    },

    getTabClass() {
      const classes = ['investigation-tab'];
      return classes.join(' ');
    },

    approveResults() {
      const submitButton = this.$refs['kt-approveInvestigationResult-submit'];
      this.addSpinner(submitButton);

      // Prepare investigations with reviewer data
      const investigationsToApprove = this.investigations.map((inv) => ({
        ...inv,
      }));

      this.$store
        .dispatch('radiology/approveInvestigationResult', investigationsToApprove)
        .then(() => {
          this.endRequest(submitButton);
          this.showApproveModal = false;
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Investigation results approved successfully',
            type: 'success',
          });
          this.$router.push(`/radiology/investigations-results/${this.$route.params.id}`);
        })
        .catch(() => {
          this.removeSpinner(submitButton);
        });
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      if (submitButton) {
        submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
      }
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      if (submitButton) {
        submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
      }
    },

    endRequest(button) {
      this.removeSpinner(button);
    },
  },
};
</script>

<style scoped>
.approve-result-section {
  width: 100%;
}

.investigation-tabs-card {
  border: none;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
}

.investigation-tabs-nav {
  min-width: 300px;
  max-width: 350px;
  border-right: 1px solid #e4e6ef;
}

.tab-title-content {
  width: 100%;
  padding: 4px 0;
}

.investigation-tab {
  border-left: 3px solid transparent;
}

.investigation-tab.critical-finding {
  border-left-color: #f64e60;
}

.tab-content-area {
  padding: 20px;
}

.approval-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.viewer-section,
.report-section {
  height: 100%;
}

.empty-viewer-state {
  border: 2px dashed #e4e6ef;
  border-radius: 8px;
  background: #f8f9fa;
}

.report-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.result-display {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.reviewer-section {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e4e6ef;
}

.critical-finding-checkbox {
  background: #fff5f5;
  padding: 12px;
  border-radius: 6px;
  border: 2px solid #ffc;
}

.critical-finding-checkbox:hover {
  background: #ffe;
}

.action-buttons {
  padding: 20px 0;
}

.empty-state {
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e4e6ef;
}

/* Responsive Design */
@media (max-width: 992px) {
  .investigation-tabs-nav {
    min-width: 250px;
    max-width: 250px;
  }

  .approval-container {
    grid-template-columns: 1fr;
  }

  .viewer-section {
    order: 1;
  }

  .report-section {
    order: 2;
  }
}

@media (max-width: 768px) {
  .approval-container {
    gap: 15px;
  }

  .tab-content-area {
    padding: 15px;
  }

  .investigation-tabs-nav {
    min-width: 200px;
    max-width: 200px;
  }
}
</style>
