<template>
  <div class="result-section mt-3">
    <!-- Results List -->
    <div v-if="results && results.length > 0">
      <div v-for="(result, index) in results" :key="index" class="result-card mb-4">
        <b-card no-body class="investigation-result-card">
          <!-- Card Header -->
          <div class="card-header result-header">
            <div class="result-title-section">
              <div class="d-flex align-items-center justify-content-between flex-wrap">
                <div class="result-title-content">
                  <h4 class="mb-1">
                    <i class="fas fa-microscope text-primary mr-2"></i>
                    {{ result.investigation.investigation.name }}
                  </h4>
                  <div class="result-meta">
                    <small class="text-muted mr-3">
                      <i class="fas fa-calendar-alt"></i>
                      {{ formatDate(result.created_at) }}
                    </small>
                    <small v-if="result.approved_by" class="text-muted mr-3">
                      <i class="fas fa-user-md"></i>
                      Approved by: {{ result.approved_by }}
                    </small>
                    <small v-if="result.approved_at" class="text-muted">
                      <i class="fas fa-check-circle text-success"></i>
                      {{ formatDate(result.approved_at) }}
                    </small>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="result-actions">
                  <b-button-group size="sm">
                    <b-button
                      variant="outline-primary"
                      @click="toggleImages(index)"
                      v-b-tooltip.hover
                      title="Toggle Images"
                    >
                      <i :class="result.showImages ? 'fas fa-images' : 'far fa-images'"></i>
                      Images ({{ result.images?.length || 0 }})
                    </b-button>
                    <b-button
                      variant="outline-info"
                      @click="printResult(result)"
                      v-b-tooltip.hover
                      title="Print Report"
                    >
                      <i class="fas fa-print"></i>
                    </b-button>
                    <b-button
                      variant="outline-success"
                      @click="downloadReport(result)"
                      v-b-tooltip.hover
                      title="Download PDF"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </b-button>
                    <b-button
                      v-if="result.images && result.images.length > 0"
                      variant="outline-secondary"
                      @click="downloadAllImages(result)"
                      v-b-tooltip.hover
                      title="Download All Images"
                    >
                      <i class="fas fa-download"></i>
                    </b-button>
                  </b-button-group>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <!-- Images Section (Collapsible) -->
            <b-collapse :visible="result.showImages" class="mb-4">
              <div v-if="result.images && result.images.length > 0" class="images-container">
                <div class="images-header mb-3">
                  <h5 class="mb-0">
                    <i class="fas fa-images text-primary"></i>
                    Investigation Images ({{ result.images.length }})
                  </h5>
                </div>

                <!-- Image Gallery -->
                <ImageGallery
                  :images="result.images"
                  :allow-delete="false"
                  :allow-reorder="false"
                  :allow-set-primary="false"
                  :allow-download="true"
                  @view-image="viewImage"
                  @download-image="downloadImage"
                />
              </div>
              <div v-else class="no-images-notice">
                <i class="fas fa-info-circle text-muted mr-2"></i>
                <span class="text-muted">No images attached to this result</span>
              </div>
            </b-collapse>

            <!-- Report Content -->
            <div class="report-content">
              <div class="report-body">
                <div v-html="formatReportHtml(result.result)"></div>
              </div>
            </div>

            <!-- Reviewer Comments (if present) -->
            <div v-if="result.reviewer_comments" class="reviewer-comments mt-4">
              <div class="reviewer-comments-header">
                <h6 class="mb-0">
                  <i class="fas fa-comment-medical text-info"></i>
                  Reviewer Comments
                </h6>
              </div>
              <div class="reviewer-comments-body">
                <p class="mb-0">{{ result.reviewer_comments }}</p>
              </div>
            </div>

            <!-- Critical Finding Alert -->
            <div v-if="result.has_critical_finding" class="alert alert-danger mt-4 mb-0">
              <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-triangle fa-2x mr-3"></i>
                <div>
                  <h6 class="mb-1">⚠️ CRITICAL FINDING</h6>
                  <p class="mb-0">
                    This result contains critical findings requiring immediate clinical attention.
                  </p>
                </div>
              </div>
            </div>

            <!-- Technical Quality Badge -->
            <div v-if="result.technical_quality" class="mt-3">
              <b-badge :variant="getQualityVariant(result.technical_quality)" size="lg">
                <i class="fas fa-star"></i>
                Technical Quality: {{ capitalizeFirst(result.technical_quality) }}
              </b-badge>
            </div>
          </div>

          <!-- Card Footer - Approval Info -->
          <div v-if="result.status === 'Accepted'" class="card-footer result-footer">
            <div class="approval-stamp">
              <i class="fas fa-certificate text-success fa-2x mr-3"></i>
              <div>
                <strong class="text-success">Approved & Finalized</strong>
                <br />
                <small class="text-muted">
                  {{ formatDate(result.approved_at) }} by {{ result.approved_by || 'Radiologist' }}
                </small>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-5">
      <i class="fas fa-file-medical fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No Results Available</h5>
      <p class="text-muted">Investigation results will appear here once they are approved</p>
    </div>

    <!-- Image Lightbox Modal -->
    <b-modal
      v-model="showLightbox"
      size="xl"
      :title="lightboxTitle"
      hide-footer
      body-class="p-0"
      modal-class="image-lightbox-modal"
    >
      <DicomViewer
        v-if="selectedImage"
        :image-id="selectedImage.file_path || selectedImage.imageUrl"
        :images="currentImages.map((img) => img.file_path || img.imageUrl)"
        :metadata="selectedImage.dicom_metadata ? JSON.parse(selectedImage.dicom_metadata) : {}"
        viewport-height="75vh"
      />
    </b-modal>
  </div>
</template>

<script>
import ImageGallery from '@/components/radiology/ImageGallery.vue';
import DicomViewer from '@/components/radiology/DicomViewer.vue';

export default {
  name: 'ResultSectionEnhanced',
  components: {
    ImageGallery,
    DicomViewer,
  },
  props: {
    results: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      showLightbox: false,
      selectedImage: null,
      lightboxTitle: 'Image Viewer',
      currentImages: [],
    };
  },
  mounted() {
    // Initialize show images state for each result
    this.results.forEach((result, index) => {
      this.$set(result, 'showImages', true); // Show images by default
      // Load images for each result
      if (result.id) {
        this.loadResultImages(index, result.id);
      }
    });
  },
  methods: {
    async loadResultImages(index, resultId) {
      try {
        const response = await this.$store.dispatch('radiology/fetchInvestigationImages', resultId);
        if (response.data.success) {
          this.$set(this.results[index], 'images', response.data.data);
        }
      } catch (error) {
        console.error('Error loading images:', error);
      }
    },

    toggleImages(index) {
      this.$set(this.results[index], 'showImages', !this.results[index].showImages);
    },

    viewImage(image) {
      this.selectedImage = image;
      this.lightboxTitle = `${image.file_name || 'Image'} - ${image.investigation?.name || ''}`;
      this.currentImages = this.results.flatMap((r) => r.images || []);
      this.showLightbox = true;
    },

    downloadImage(image) {
      if (image.file_path || image.imageUrl) {
        const url = image.file_path || image.imageUrl;
        window.open(url ? url : `/radiology/investigation-images/download/${image.id}`, '_blank');
      }
    },

    async downloadAllImages(result) {
      this.$notify({
        group: 'foo',
        title: 'Download Started',
        text: 'Preparing images for download...',
        type: 'info',
      });

      try {
        const response = await this.$http.get(
          `/radiology/investigation-images/${result.id}/download-all`,
          {
            responseType: 'blob',
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `investigation-${result.id}-images.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        this.$notify({
          group: 'foo',
          title: 'Success',
          text: 'Images downloaded successfully',
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

    printResult(result) {
      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      const printContent = this.generatePrintContent(result);
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    },

    downloadReport(result) {
      console.log(result);
      // This would typically call a backend endpoint to generate a PDF
      this.$notify({
        group: 'foo',
        title: 'Info',
        text: 'PDF generation feature coming soon',
        type: 'info',
      });
    },

    generatePrintContent(result) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Investigation Report - ${result.investigation.investigation.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .investigation-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .meta-info {
              color: #666;
              margin-bottom: 5px;
            }
            .report-body {
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .footer {
              border-top: 1px solid #ddd;
              padding-top: 20px;
              margin-top: 30px;
              text-align: center;
              color: #666;
            }
            @media print {
              @page {
                margin: 2cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="investigation-name">${result.investigation.investigation.name}</div>
            <div class="meta-info">Date: ${this.formatDate(result.created_at)}</div>
            ${
              result.approved_by
                ? `<div class="meta-info">Approved by: ${result.approved_by}</div>`
                : ''
            }
          </div>
          <div class="report-body">
            ${result.result}
          </div>
          <div class="footer">
            <p>This is an official medical report. Unauthorized reproduction is prohibited.</p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;
    },

    formatReportHtml(text) {
      if (!text) return '<p class="text-muted">No report content</p>';
      // Preserve line breaks and formatting
      return text.replace(/\n/g, '<br>');
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

    capitalizeFirst(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    getQualityVariant(quality) {
      const variantMap = {
        excellent: 'success',
        good: 'primary',
        acceptable: 'warning',
        poor: 'danger',
      };
      return variantMap[quality] || 'secondary';
    },
  },
};
</script>

<style scoped>
.result-section {
  width: 100%;
}

.investigation-result-card {
  border: none;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.investigation-result-card:hover {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.12);
}

.result-header {
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border-bottom: 2px solid #e4e6ef;
}

.result-title-section {
  width: 100%;
  padding: 10px 0;
}

.result-title-content h4 {
  color: #3f4254;
  font-weight: 600;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.result-actions {
  margin-top: 10px;
}

.images-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e6ef;
}

.images-header {
  padding-bottom: 15px;
  border-bottom: 2px solid #e4e6ef;
}

.no-images-notice {
  padding: 30px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e4e6ef;
}

.report-content {
  background: #ffffff;
  padding: 25px;
  border-radius: 8px;
  line-height: 1.8;
}

.report-body {
  font-size: 14px;
  color: #3f4254;
}

.reviewer-comments {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.reviewer-comments-header {
  margin-bottom: 10px;
}

.reviewer-comments-body {
  font-size: 14px;
  color: #3f4254;
}

.result-footer {
  background: #f8f9fa;
  border-top: 2px solid #e4e6ef;
}

.approval-stamp {
  display: flex;
  align-items: center;
}

.empty-state {
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e4e6ef;
}

/* Print Styles */
@media print {
  .result-actions,
  .images-container {
    display: none !important;
  }

  .investigation-result-card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    page-break-inside: avoid;
  }

  .result-header {
    background: #f8f9fa !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .result-title-section {
    flex-direction: column;
  }

  .result-actions {
    width: 100%;
    margin-top: 15px;
  }

  .result-actions .btn-group {
    width: 100%;
    display: flex;
  }

  .result-actions .btn {
    flex: 1;
  }

  .report-content {
    padding: 15px;
  }
}
</style>
