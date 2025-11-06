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

              <!-- Split Layout Container -->
              <div class="result-input-container">
                <!-- Left Side: Images Section -->
                <div class="images-section">
                  <b-card class="h-100">
                    <template #header>
                      <h5 class="mb-0"><i class="fas fa-images"></i> Investigation Images</h5>
                    </template>

                    <!-- Image Uploader -->
                    <div
                      v-if="!investigation.status || investigation.status !== ACCEPTED"
                      class="mb-3"
                    >
                      <ImageUploader
                        :upload-url="`/radiology/investigation-images/upload`"
                        :result-id="investigation.result_id || 'temp'"
                        :multiple="true"
                        :max-files="20"
                        :auto-upload="false"
                        :disabled="investigation.payment_status === PENDING"
                        @upload-complete="handleUploadComplete(index, $event)"
                        @upload-error="handleUploadError"
                      />
                    </div>

                    <!-- Image Gallery -->
                    <div v-if="investigation.images && investigation.images.length > 0">
                      <ImageGallery
                        :images="investigation.images"
                        :allow-delete="investigation.status !== ACCEPTED"
                        :allow-reorder="investigation.status !== ACCEPTED"
                        :allow-set-primary="investigation.status !== ACCEPTED"
                        @view-image="viewImage"
                        @delete-image="deleteImage(index, $event)"
                        @set-primary="setPrimaryImage(index, $event)"
                        @reorder="reorderImages(index, $event)"
                      />
                    </div>

                    <!-- Empty State -->
                    <div v-else class="empty-images-state text-center py-5">
                      <i class="fas fa-images fa-3x text-muted mb-3"></i>
                      <p class="text-muted">No images uploaded yet</p>
                    </div>
                  </b-card>
                </div>

                <!-- Right Side: Report Editor Section -->
                <div class="editor-section">
                  <b-card class="h-100">
                    <template #header>
                      <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                          <i class="fas fa-file-medical-alt"></i> Investigation Report
                        </h5>
                        <!-- Template Selector -->
                        <b-form-select
                          v-model="investigation.selectedTemplate"
                          :options="templateOptions"
                          size="sm"
                          style="max-width: 200px"
                          @change="applyTemplate(index)"
                          :disabled="
                            investigation.payment_status === PENDING ||
                            investigation.status === ACCEPTED
                          "
                        >
                          <template #first>
                            <b-form-select-option :value="null"
                              >Select Template</b-form-select-option
                            >
                          </template>
                        </b-form-select>
                      </div>
                    </template>

                    <!-- Template Sections (if template selected) -->
                    <div
                      v-if="investigation.selectedTemplate && investigation.templateSections"
                      class="template-sections"
                    >
                      <b-alert variant="info" show dismissible class="mb-3">
                        <small>
                          <i class="fas fa-lightbulb"></i>
                          <strong>Template Applied:</strong> Fill in the sections below. You can
                          switch between structured and free-text editing modes.
                        </small>
                      </b-alert>

                      <!-- Toggle between Structured/Free-text -->
                      <div class="mb-3 d-flex justify-content-end">
                        <b-button-group size="sm">
                          <b-button
                            :variant="
                              investigation.editorMode === 'structured'
                                ? 'primary'
                                : 'outline-primary'
                            "
                            @click="investigation.editorMode = 'structured'"
                          >
                            <i class="fas fa-list"></i> Structured
                          </b-button>
                          <b-button
                            :variant="
                              investigation.editorMode === 'freetext'
                                ? 'primary'
                                : 'outline-primary'
                            "
                            @click="investigation.editorMode = 'freetext'"
                          >
                            <i class="fas fa-align-left"></i> Free Text
                          </b-button>
                        </b-button-group>
                      </div>

                      <!-- Structured Editor Mode -->
                      <div
                        v-if="investigation.editorMode === 'structured'"
                        class="structured-editor"
                      >
                        <b-form-group
                          v-for="section in investigation.templateSections"
                          :key="section.id"
                          :label="section.title"
                          :label-for="`section-${index}-${section.id}`"
                          class="section-group"
                        >
                          <b-form-textarea
                            :id="`section-${index}-${section.id}`"
                            v-model="section.content"
                            :placeholder="section.placeholder"
                            :required="section.required"
                            rows="4"
                            :disabled="
                              investigation.payment_status === PENDING ||
                              investigation.status === ACCEPTED
                            "
                            @input="handleAutoSave(index)"
                          ></b-form-textarea>
                          <small
                            v-if="section.hints && section.hints.length > 0"
                            class="text-muted mt-1 d-block"
                          >
                            <strong>Hints:</strong> {{ section.hints.slice(0, 3).join(', ') }}
                            <span v-if="section.hints.length > 3">...</span>
                          </small>
                        </b-form-group>
                      </div>

                      <!-- Free-text Editor Mode -->
                      <div v-else class="freetext-editor">
                        <text-editor
                          v-model="investigation.result"
                          :disabled="
                            investigation.status === ACCEPTED ||
                            investigation.payment_status === PENDING
                          "
                          @input="handleAutoSave(index)"
                        />
                      </div>
                    </div>

                    <!-- Default Editor (no template) -->
                    <div v-else class="default-editor">
                      <text-editor
                        v-model="investigation.result"
                        :disabled="
                          investigation.status === ACCEPTED ||
                          investigation.payment_status === PENDING
                        "
                        @input="handleAutoSave(index)"
                      />
                    </div>

                    <!-- Impression Field (separate from findings) -->
                    <div v-if="investigation.selectedTemplate" class="mt-3">
                      <b-form-group
                        label="IMPRESSION / CONCLUSION"
                        label-for="impression"
                        description="Summarize the key findings and their clinical significance"
                      >
                        <b-form-textarea
                          id="impression"
                          v-model="investigation.impression"
                          placeholder="Enter summary of key findings..."
                          rows="3"
                          :disabled="
                            investigation.payment_status === PENDING ||
                            investigation.status === ACCEPTED
                          "
                          @input="handleAutoSave(index)"
                        ></b-form-textarea>
                      </b-form-group>
                    </div>

                    <!-- Auto-save Indicator -->
                    <div v-if="autoSaveStatus" class="text-right mt-2">
                      <small :class="autoSaveStatus.variant">
                        <i :class="autoSaveStatus.icon"></i> {{ autoSaveStatus.message }}
                      </small>
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

    <!-- Image Lightbox Modal -->
    <b-modal v-model="showLightbox" size="xl" title="Image Viewer" hide-footer body-class="p-0">
      <DicomViewer
        v-if="selectedImage"
        :image-id="selectedImage.file_path || selectedImage.imageUrl"
        :metadata="selectedImage.dicom_metadata ? JSON.parse(selectedImage.dicom_metadata) : {}"
        viewport-height="70vh"
      />
    </b-modal>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import TextEditor from '@/utils/TextEditor.vue';
import ImageUploader from '@/components/radiology/ImageUploader.vue';
import ImageGallery from '@/components/radiology/ImageGallery.vue';
import DicomViewer from '@/components/radiology/DicomViewer.vue';
import { templateList, getTemplate, formatReportToText } from '@/utils/medical-templates';

export default {
  name: 'InputResultSectionEnhanced',
  components: {
    TextEditor,
    DefaultSkeleton,
    ImageUploader,
    ImageGallery,
    DicomViewer,
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
  created() {
    this.loadDrafts();
  },
  methods: {
    initializeInvestigations() {
      this.investigations = this.tests.map((test) => {
        const savedDraft = this.getDraft(test.id);

        return {
          result: savedDraft?.result || test?.result?.result || '',
          impression: savedDraft?.impression || '',
          patient_id: this.patient_id,
          name: test.investigation.name,
          investigationType: test.investigation.type || test.investigation.modality,
          investigation_prescription_id: this.$route.params.id,
          prescribed_investigation_id: test.id,
          result_id: test?.result?.id,
          status: test?.result?.status || 'Pending',
          payment_status: test?.payment_status,
          images: test?.result?.images || [],
          selectedTemplate: savedDraft?.selectedTemplate || null,
          templateSections: savedDraft?.templateSections || null,
          editorMode: savedDraft?.editorMode || 'structured',
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

    applyTemplate(index) {
      const investigation = this.investigations[index];
      const template = getTemplate(investigation.selectedTemplate);

      if (template) {
        investigation.templateSections = template.sections.map((section) => ({
          ...section,
          content: section.defaultContent || '',
        }));
        investigation.editorMode = 'structured';
        this.handleAutoSave(index);
      }
    },

    handleUploadComplete(index, result) {
      if (result.successful && result.successful.length > 0) {
        this.$notify({
          group: 'foo',
          title: 'Success',
          text: `${result.successful.length} image(s) uploaded successfully`,
          type: 'success',
        });

        // Refresh images for this investigation
        this.refreshInvestigationImages(index);
      }
    },

    handleUploadError(error) {
      this.$notify({
        group: 'foo',
        title: 'Upload Error',
        text: error.message || 'Failed to upload images',
        type: 'error',
      });
    },

    async refreshInvestigationImages(index) {
      const investigation = this.investigations[index];
      if (!investigation.result_id) return;

      try {
        const response = await this.$store.dispatch(
          'radiology/fetchInvestigationImages',
          investigation.result_id
        );
        if (response.data.success) {
          this.$set(this.investigations[index], 'images', response.data.data);
        }
      } catch (error) {
        console.error('Error refreshing images:', error);
      }
    },

    viewImage(image) {
      this.selectedImage = image;
      this.showLightbox = true;
    },

    async deleteImage(index, image) {
      try {
        const response = await this.$store.dispatch('radiology/deleteInvestigationImage', image.id);
        if (response.data.success) {
          const imageIndex = this.investigations[index].images.findIndex(
            (img) => img.id === image.id
          );
          if (imageIndex > -1) {
            this.investigations[index].images.splice(imageIndex, 1);
          }
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Image deleted successfully',
            type: 'success',
          });
        }
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete image',
          type: 'error',
        });
      }
    },

    async setPrimaryImage(index, image) {
      try {
        const response = await this.$store.dispatch('radiology/setAsPrimaryImage', image.id);
        if (response.data.success) {
          // Update all images to reflect new primary
          this.refreshInvestigationImages(index);
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Primary image updated',
            type: 'success',
          });
        }
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to set primary image',
          type: 'error',
        });
      }
    },

    async reorderImages(index, imageOrders) {
      try {
        const investigation = this.investigations[index];
        const response = await this.$store.dispatch('radiology/reorderInvestigationImages', {
          resultId: investigation.result_id,
          imageOrders,
        });
        if (response.data.success) {
          this.$notify({
            group: 'foo',
            title: 'Success',
            text: 'Images reordered successfully',
            type: 'success',
          });
        }
      } catch (error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to reorder images',
          type: 'error',
        });
      }
    },

    handleAutoSave(index) {
      // Clear existing timeout
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }

      // Set saving status
      this.autoSaveStatus = {
        message: 'Saving...',
        icon: 'fas fa-spinner fa-spin',
        variant: 'text-warning',
      };

      // Debounce auto-save by 2 seconds
      this.autoSaveTimeout = setTimeout(() => {
        this.saveDraftToLocalStorage(index);
        this.autoSaveStatus = {
          message: 'Saved',
          icon: 'fas fa-check-circle',
          variant: 'text-success',
        };

        // Clear status after 2 seconds
        setTimeout(() => {
          this.autoSaveStatus = null;
        }, 2000);
      }, 2000);
    },

    saveDraftToLocalStorage(index) {
      const investigation = this.investigations[index];
      const draft = {
        result: investigation.result,
        impression: investigation.impression,
        selectedTemplate: investigation.selectedTemplate,
        templateSections: investigation.templateSections,
        editorMode: investigation.editorMode,
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

    loadDrafts() {
      // Drafts are loaded during initializeInvestigations
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
        .map(
          ({ payment_status, images, selectedTemplate, templateSections, editorMode, ...rest }) => {
            // If using structured template, compile to result text
            if (selectedTemplate && templateSections && editorMode === 'structured') {
              const report = {
                sections: templateSections.reduce((acc, section) => {
                  acc[section.id] = {
                    title: section.title,
                    content: section.content || '',
                  };
                  return acc;
                }, {}),
              };
              rest.result = formatReportToText(report);

              // Append impression
              if (rest.impression) {
                rest.result += '\n\nIMPRESSION\n==========\n' + rest.impression;
              }
            }

            return rest;
          }
        );

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
