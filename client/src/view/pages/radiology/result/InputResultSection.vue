<template>
  <div class="investigation-result-input mt-3">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <DefaultSkeleton />
      <DefaultSkeleton />
    </div>

    <!-- Main Content -->
    <div v-else-if="investigations && investigations.length > 0" class="content-container">
      <!-- Investigation Tabs -->
      <b-card no-body class="investigation-tabs-card">
        <b-tabs v-model="activeTabIndex" card nav-wrapper-class="investigation-tabs-nav">
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
                    <!-- Payment Status Badge -->
                    <b-badge
                      :variant="investigation.payment_status === PENDING ? 'warning' : 'success'"
                      class="ml-2"
                    >
                      {{ investigation.payment_status || 'Pending' }}
                    </b-badge>
                    <!-- Status Badge -->
                    <b-badge v-if="investigation.status === ACCEPTED" variant="info" class="ml-1">
                      <i class="fas fa-check"></i> Accepted
                    </b-badge>
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
              <!-- Payment Pending Notice -->
              <b-alert
                v-if="investigation.payment_status === PENDING"
                variant="warning"
                show
                class="mb-3"
              >
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Payment Pending:</strong> This investigation cannot be processed until
                payment is completed.
              </b-alert>

              <!-- Already Accepted Notice -->
              <b-alert v-if="investigation.status === ACCEPTED" variant="info" show class="mb-3">
                <i class="fas fa-info-circle"></i>
                <strong>Already Accepted:</strong> This result has been accepted and cannot be
                modified.
              </b-alert>

              <text-editor
                :key="i"
                :disabled="
                  investigation.status === ACCEPTED || investigation.payment_status === PENDING
                "
                v-model="investigation.result"
              />
            </div>
          </b-tab>
        </b-tabs>
      </b-card>

      <!-- Action Buttons -->
      <div class="separator separator-solid my-6"></div>
      <div class="action-buttons text-center">
        <b-button
          variant="secondary"
          size="lg"
          class="mr-2"
          @click="saveDraft"
          :disabled="isSaving"
        >
          <i class="fas fa-save"></i> Save Draft
        </b-button>
        <b-button
          variant="primary"
          size="lg"
          @click="submitResults"
          :disabled="isSaving || !hasAnyResults"
          ref="kt-addInvestigationResult-submit"
        >
          <i class="fas fa-check"></i> Submit Results
        </b-button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-5">
      <i class="fas fa-flask fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No investigations found</h5>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import TextEditor from '@/utils/TextEditor.vue';
import { templateList, getTemplate, formatReportToText } from '@/utils/medical-templates';

export default {
  name: 'InputResultSection',
  components: {
    TextEditor,
    DefaultSkeleton,
  },
  props: {
    tests: {
      type: Array,
      required: true,
    },
    patient_id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      investigations: [],
      activeTabIndex: 0,
      isSaving: false,
      isLoading: false,
      autoSaveStatus: null,
      autoSaveTimeout: null,
      showLightbox: false,
      selectedImage: null,
      COMPLETED: 'Completed',
      ACCEPTED: 'Accepted',
      PENDING: 'Pending',
      templateOptions: templateList,
    };
  },
  computed: {
    hasAnyResults() {
      return this.investigations.some((inv) => inv.result && inv.result.trim() !== '');
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
      this.investigations = this.tests.map((test) => {
        const savedDraft = this.getDraft(test.id);

        return {
          result: savedDraft?.result || test?.result?.result || '',
          patient_id: this.patient_id,
          name: test.investigation.name,
          investigationType: test.investigation.type || test.investigation.modality,
          investigation_prescription_id: this.$route.params.id,
          prescribed_investigation_id: test.id,
          result_id: test?.result?.id,
          status: test?.result?.status || 'Pending',
          payment_status: test?.payment_status,
        };
      });
    },

    selectInvestigation(index) {
      this.activeTabIndex = index;
    },

    getTabClass(investigation) {
      const classes = ['investigation-tab'];
      if (investigation.payment_status === this.PENDING) {
        classes.push('payment-pending');
      }
      if (investigation.status === this.ACCEPTED) {
        classes.push('accepted');
      }
      return classes.join(' ');
    },

    saveDraftToLocalStorage(index) {
      const investigation = this.investigations[index];
      const draft = {
        result: investigation.result,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        `investigation_draft_${investigation.prescribed_investigation_id}`,
        JSON.stringify(draft)
      );
    },

    getDraft(prescribedInvestigationId) {
      const draftStr = localStorage.getItem(`investigation_draft_${prescribedInvestigationId}`);
      if (draftStr) {
        try {
          return JSON.parse(draftStr);
        } catch {
          return null;
        }
      }
      return null;
    },

    clearDrafts() {
      this.investigations.forEach((inv) => {
        localStorage.removeItem(`investigation_draft_${inv.prescribed_investigation_id}`);
      });
    },

    saveDraft() {
      this.investigations.forEach((inv, index) => {
        this.saveDraftToLocalStorage(index);
      });

      this.$notify({
        group: 'foo',
        title: 'Draft Saved',
        text: 'Your progress has been saved',
        type: 'success',
      });
    },

    submitResults() {
      const investigations = this.investigations
        .filter((investigation) => investigation.status !== this.ACCEPTED)
        .map(({ payment_status, ...rest }) => {
          return rest;
        });

      if (!investigations.some(({ result }) => result)) {
        return this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'At least one result must be provided',
          type: 'error',
        });
      }

      const submitButton = this.$refs['kt-addInvestigationResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('radiology/addInvestigationResult', investigations)
        .then(() => {
          this.endRequest(submitButton);
          this.clearDrafts();
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Investigation results submitted successfully',
            type: 'success',
          });
          this.$router.push(`/radiology/result-approval/${this.$route.params.id}`);
        })
        .catch(() => {
          this.removeSpinner(submitButton);
        });
    },

    addSpinner(submitButton) {
      this.isSaving = true;
      if (submitButton) {
        submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
      }
    },

    removeSpinner(submitButton) {
      this.isSaving = false;
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
.investigation-result-input {
  width: 100%;
}

.loading-container {
  padding: 20px;
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

.investigation-tab.payment-pending {
  border-left-color: #ffc107;
  opacity: 0.7;
}

.investigation-tab.accepted {
  border-left-color: #17a2b8;
}

.tab-content-area {
  padding: 20px;
}

.result-input-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-top: 20px;
}

.images-section,
.editor-section {
  height: 100%;
}

.empty-images-state {
  border: 2px dashed #e4e6ef;
  border-radius: 8px;
  background: #f8f9fa;
}

.section-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e4e6ef;
}

.section-group:last-child {
  border-bottom: none;
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

  .result-input-container {
    grid-template-columns: 1fr;
  }

  .images-section {
    order: 2;
  }

  .editor-section {
    order: 1;
  }
}

@media (max-width: 768px) {
  .result-input-container {
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
