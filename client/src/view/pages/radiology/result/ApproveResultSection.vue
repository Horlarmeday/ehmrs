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
        <b-tabs v-model="activeTabIndex" card vertical nav-wrapper-class="investigation-tabs-nav">
          <b-tab
            v-for="(investigation, index) in investigations"
            :key="index"
            :title-link-class="getTabClass(investigation)"
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
                    <!-- Critical Finding Badge -->
                    <b-badge v-if="investigation.hasCriticalFinding" variant="danger" class="ml-1">
                      <i class="fas fa-exclamation-triangle"></i> Critical
                    </b-badge>
                  </div>
                </div>
              </div>
            </template>

            <!-- Tab Content -->
            <div class="tab-content-area">
              <!-- Split Layout Container -->
              <div class="approval-container">
                <!-- Left Side: Images & Viewer Section -->
                <div class="viewer-section">
                  <b-card class="h-100">
                    <template #header>
                      <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-eye"></i> Images & Viewer</h5>
                        <!-- View Mode Toggle -->
                        <b-button-group
                          v-if="investigation.images && investigation.images.length > 0"
                          size="sm"
                        >
                          <b-button
                            :variant="viewMode === 'gallery' ? 'primary' : 'outline-primary'"
                            @click="viewMode = 'gallery'"
                          >
                            <i class="fas fa-th"></i> Gallery
                          </b-button>
                          <b-button
                            :variant="viewMode === 'viewer' ? 'primary' : 'outline-primary'"
                            @click="viewMode = 'viewer'"
                          >
                            <i class="fas fa-expand"></i> Viewer
                          </b-button>
                        </b-button-group>
                      </div>
                    </template>

                    <!-- Gallery View -->
                    <div
                      v-if="
                        viewMode === 'gallery' &&
                        investigation.images &&
                        investigation.images.length > 0
                      "
                    >
                      <ImageGallery
                        :images="investigation.images"
                        :allow-delete="false"
                        :allow-reorder="false"
                        :allow-set-primary="false"
                        @view-image="viewImageInViewer(index, $event)"
                        @image-selected="selectImageForViewing(index, $event)"
                      />
                    </div>

                    <!-- DICOM Viewer -->
                    <div v-else-if="viewMode === 'viewer' && selectedImageForViewer">
                      <DicomViewer
                        :image-id="
                          selectedImageForViewer.file_path || selectedImageForViewer.imageUrl
                        "
                        :images="investigation.images.map((img) => img.file_path || img.imageUrl)"
                        :metadata="
                          selectedImageForViewer.dicom_metadata
                            ? JSON.parse(selectedImageForViewer.dicom_metadata)
                            : {}
                        "
                        viewport-height="600px"
                      />
                    </div>

                    <!-- Empty State -->
                    <div v-else class="empty-viewer-state text-center py-5">
                      <i class="fas fa-image fa-3x text-muted mb-3"></i>
                      <p class="text-muted">No images available</p>
                      <small class="text-muted">Images will appear here once uploaded</small>
                    </div>
                  </b-card>
                </div>

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
                      <div class="result-display">
                        <div v-html="formatReportHtml(investigation.result)"></div>
                      </div>
                    </div>

                    <div class="separator separator-dashed my-5"></div>

                    <!-- Reviewer Comments Section -->
                    <div class="reviewer-section">
                      <h6 class="mb-3"><i class="fas fa-user-md"></i> Reviewer Comments</h6>

                      <!-- Critical Finding Checkbox -->
                      <b-form-checkbox
                        v-model="investigation.hasCriticalFinding"
                        size="lg"
                        class="mb-3 critical-finding-checkbox"
                      >
                        <strong class="text-danger">
                          <i class="fas fa-exclamation-triangle"></i>
                          This result contains CRITICAL FINDINGS requiring immediate attention
                        </strong>
                      </b-form-checkbox>

                      <!-- Reviewer Comments -->
                      <b-form-group
                        label="Reviewer Comments / Notes"
                        label-for="reviewer-comments"
                        description="Add any comments, recommendations, or notes about this result"
                      >
                        <b-form-textarea
                          id="reviewer-comments"
                          v-model="investigation.reviewerComments"
                          placeholder="Enter your comments or recommendations..."
                          rows="4"
                        ></b-form-textarea>
                      </b-form-group>

                      <!-- Quality Assessment -->
                      <b-form-group label="Technical Quality" label-for="quality-assessment">
                        <b-form-radio-group
                          id="quality-assessment"
                          v-model="investigation.technicalQuality"
                          :options="qualityOptions"
                          buttons
                          button-variant="outline-primary"
                          size="sm"
                        ></b-form-radio-group>
                      </b-form-group>
                    </div>
                  </b-card>
                </div>
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </b-card>

      <!-- Action Buttons -->
      <div class="separator separator-solid my-6"></div>
      <div class="action-buttons text-center">
        <b-button
          variant="danger"
          size="lg"
          class="mr-2"
          @click="showRejectModal = true"
          :disabled="isDisabled"
        >
          <i class="fas fa-times"></i> Request Changes
        </b-button>
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

        <!-- Critical Findings Warning -->
        <b-alert v-if="hasCriticalFindings" variant="danger" show class="text-left">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Critical Findings Detected!</strong>
          <p class="mb-0 mt-2">
            Some results have been marked as containing critical findings. Please ensure appropriate
            clinical follow-up has been arranged.
          </p>
        </b-alert>

        <p class="mb-0 small text-muted">
          Once approved, these results will be finalized and available to authorized personnel.
        </p>
      </div>
    </b-modal>

    <!-- Rejection Modal -->
    <b-modal
      v-model="showRejectModal"
      title="Request Changes"
      @ok="rejectResults"
      ok-variant="danger"
      ok-title="Request Changes"
      cancel-title="Cancel"
    >
      <div class="py-3">
        <p class="text-muted mb-3">
          Please provide a reason for requesting changes to these results:
        </p>

        <b-form-group label="Reason for Changes" label-for="rejection-reason">
          <b-form-textarea
            id="rejection-reason"
            v-model="rejectionReason"
            placeholder="Enter specific issues or changes required..."
            rows="4"
            required
          ></b-form-textarea>
        </b-form-group>

        <b-alert variant="warning" show class="mb-0">
          <small>
            <i class="fas fa-info-circle"></i>
            The results will be returned to the technician for revision with your comments.
          </small>
        </b-alert>
      </div>
    </b-modal>

    <!-- Image Lightbox Modal -->
    <b-modal v-model="showLightbox" size="xl" title="Image Viewer" hide-footer body-class="p-0">
      <DicomViewer
        v-if="lightboxImage"
        :image-id="lightboxImage.file_path || lightboxImage.imageUrl"
        :metadata="lightboxImage.dicom_metadata ? JSON.parse(lightboxImage.dicom_metadata) : {}"
        viewport-height="80vh"
      />
    </b-modal>
  </div>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
// import TextEditor from '@/utils/TextEditor.vue';
import ImageGallery from '@/components/radiology/ImageGallery.vue';
import DicomViewer from '@/components/radiology/DicomViewer.vue';

export default {
  name: 'ApproveResultSectionEnhanced',
  components: {
    //TextEditor,
    DefaultSkeleton,
    ImageGallery,
    DicomViewer,
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
  computed: {
    hasCriticalFindings() {
      return this.investigations.some((inv) => inv.hasCriticalFinding);
    },
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
          result_id: test?.result?.id,
          images: test?.result?.images || [],
          hasCriticalFinding: false,
          reviewerComments: '',
          technicalQuality: 'good',
        }));

      // Load images for each investigation
      this.investigations.forEach((inv, index) => {
        if (inv.result_id) {
          this.loadInvestigationImages(index, inv.result_id);
        }
      });

      // Select first image if available
      if (this.investigations.length > 0 && this.investigations[0].images?.length > 0) {
        this.selectedImageForViewer = this.investigations[0].images[0];
      }
    },

    async loadInvestigationImages(index, resultId) {
      try {
        const response = await this.$http.get(`/radiology/investigation-images/${resultId}`);
        if (response.data.success) {
          this.$set(this.investigations[index], 'images', response.data.data);
          // Select first image for viewer
          if (response.data.data.length > 0 && !this.selectedImageForViewer) {
            this.selectedImageForViewer = response.data.data[0];
          }
        }
      } catch (error) {
        console.error('Error loading images:', error);
      }
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

    getTabClass(investigation) {
      const classes = ['investigation-tab'];
      if (investigation.hasCriticalFinding) {
        classes.push('critical-finding');
      }
      return classes.join(' ');
    },

    selectImageForViewing(index, image) {
      this.selectedImageForViewer = image;
      this.viewMode = 'viewer';
    },

    viewImageInViewer(index, image) {
      this.lightboxImage = image;
      this.showLightbox = true;
    },

    formatReportHtml(text) {
      if (!text) return '<p class="text-muted">No report content</p>';
      // Convert line breaks to HTML
      return text.replace(/\n/g, '<br>');
    },

    approveResults() {
      const submitButton = this.$refs['kt-approveInvestigationResult-submit'];
      this.addSpinner(submitButton);

      // Prepare investigations with reviewer data
      const investigationsToApprove = this.investigations.map((inv) => ({
        ...inv,
        reviewerComments: inv.reviewerComments,
        hasCriticalFinding: inv.hasCriticalFinding,
        technicalQuality: inv.technicalQuality,
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
        })
        .catch(() => {
          this.removeSpinner(submitButton);
        });
    },

    rejectResults() {
      if (!this.rejectionReason || this.rejectionReason.trim() === '') {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Please provide a reason for requesting changes',
          type: 'error',
        });
        return;
      }

      // Prepare rejection data
      const rejectionData = {
        investigations: this.investigations.map((inv) => ({
          prescribed_investigation_id: inv.prescribed_investigation_id,
          investigation_prescription_id: inv.investigation_prescription_id,
        })),
        rejectionReason: this.rejectionReason,
      };

      this.$store
        .dispatch('radiology/rejectInvestigationResult', rejectionData)
        .then(() => {
          this.showRejectModal = false;
          this.rejectionReason = '';
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Change request sent successfully',
            type: 'success',
          });
        })
        .catch(() => {
          this.$notify({
            group: 'foo',
            title: 'Error',
            text: 'Failed to send change request',
            type: 'error',
          });
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
