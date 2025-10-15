<template>
  <b-modal
    v-model="isVisible"
    :title="title"
    size="xl"
    hide-footer
    body-class="p-0"
    modal-class="image-lightbox-modal"
    @hidden="handleClose"
  >
    <div class="lightbox-container">
      <!-- Toolbar -->
      <div class="lightbox-toolbar">
        <div class="toolbar-left">
          <h6 class="mb-0">{{ currentImageTitle }}</h6>
          <small class="text-muted">{{ currentIndex + 1 }} of {{ images.length }}</small>
        </div>
        <div class="toolbar-right">
          <b-button-group size="sm">
            <b-button variant="outline-light" @click="previousImage" :disabled="currentIndex === 0">
              <i class="fas fa-chevron-left"></i> Previous
            </b-button>
            <b-button variant="outline-light" @click="nextImage" :disabled="currentIndex === images.length - 1">
              Next <i class="fas fa-chevron-right"></i>
            </b-button>
          </b-button-group>
          <b-button variant="outline-light" size="sm" class="ml-2" @click="downloadCurrentImage">
            <i class="fas fa-download"></i> Download
          </b-button>
          <b-button variant="outline-light" size="sm" class="ml-2" @click="closeModal">
            <i class="fas fa-times"></i> Close
          </b-button>
        </div>
      </div>

      <!-- Viewer Area -->
      <div class="lightbox-viewer">
        <DicomViewer
          v-if="currentImage"
          :key="currentImage.id"
          :image-id="currentImage.file_path || currentImage.imageUrl"
          :images="images.map((img) => img.file_path || img.imageUrl)"
          :metadata="currentImage.dicom_metadata ? parseDicomMetadata(currentImage.dicom_metadata) : {}"
          viewport-height="75vh"
          :enable-tools="true"
        />
      </div>

      <!-- Image Info Panel (Collapsible) -->
      <b-collapse :visible="showInfo" class="image-info-panel">
        <div class="info-panel-content">
          <b-row>
            <b-col md="6">
              <h6 class="mb-3">Image Information</h6>
              <table class="info-table">
                <tr>
                  <td class="label">File Name:</td>
                  <td>{{ currentImage.file_name || 'N/A' }}</td>
                </tr>
                <tr>
                  <td class="label">File Type:</td>
                  <td>
                    <b-badge :variant="currentImage.file_type === 'DICOM' ? 'info' : 'secondary'">
                      {{ currentImage.file_type }}
                    </b-badge>
                  </td>
                </tr>
                <tr>
                  <td class="label">File Size:</td>
                  <td>{{ formatFileSize(currentImage.file_size) }}</td>
                </tr>
                <tr>
                  <td class="label">Upload Date:</td>
                  <td>{{ formatDate(currentImage.created_at) }}</td>
                </tr>
              </table>
            </b-col>
            <b-col v-if="currentImage.dicom_metadata" md="6">
              <h6 class="mb-3">DICOM Metadata</h6>
              <table class="info-table">
                <tr v-if="parsedMetadata.modality">
                  <td class="label">Modality:</td>
                  <td>{{ parsedMetadata.modality }}</td>
                </tr>
                <tr v-if="parsedMetadata.studyDescription">
                  <td class="label">Study:</td>
                  <td>{{ parsedMetadata.studyDescription }}</td>
                </tr>
                <tr v-if="parsedMetadata.seriesDescription">
                  <td class="label">Series:</td>
                  <td>{{ parsedMetadata.seriesDescription }}</td>
                </tr>
                <tr v-if="parsedMetadata.instanceNumber">
                  <td class="label">Instance:</td>
                  <td>{{ parsedMetadata.instanceNumber }}</td>
                </tr>
              </table>
            </b-col>
          </b-row>
        </div>
      </b-collapse>

      <!-- Info Toggle Button -->
      <div class="info-toggle">
        <b-button size="sm" variant="outline-light" @click="showInfo = !showInfo">
          <i :class="showInfo ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
          {{ showInfo ? 'Hide' : 'Show' }} Info
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import DicomViewer from './DicomViewer.vue';

export default {
  name: 'ImageLightbox',
  components: {
    DicomViewer,
  },
  props: {
    images: {
      type: Array,
      required: true,
      default: () => [],
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: 'Image Viewer',
    },
  },
  data() {
    return {
      isVisible: false,
      currentIndex: this.initialIndex,
      showInfo: false,
    };
  },
  computed: {
    currentImage() {
      if (this.images && this.images.length > 0) {
        return this.images[this.currentIndex];
      }
      return null;
    },
    currentImageTitle() {
      if (this.currentImage) {
        return this.currentImage.file_name || this.currentImage.description || `Image ${this.currentIndex + 1}`;
      }
      return '';
    },
    parsedMetadata() {
      if (this.currentImage?.dicom_metadata) {
        return this.parseDicomMetadata(this.currentImage.dicom_metadata);
      }
      return {};
    },
  },
  watch: {
    initialIndex(newVal) {
      this.currentIndex = newVal;
    },
  },
  methods: {
    open(index = 0) {
      this.currentIndex = index;
      this.isVisible = true;
    },

    closeModal() {
      this.isVisible = false;
    },

    handleClose() {
      this.$emit('close');
    },

    previousImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.$emit('image-changed', this.currentIndex);
      }
    },

    nextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++;
        this.$emit('image-changed', this.currentIndex);
      }
    },

    downloadCurrentImage() {
      if (this.currentImage) {
        this.$emit('download-image', this.currentImage);
        // Trigger download
        window.open(`/radiology/investigation-images/download/${this.currentImage.id}`, '_blank');
      }
    },

    parseDicomMetadata(metadata) {
      if (typeof metadata === 'string') {
        try {
          return JSON.parse(metadata);
        } catch {
          return {};
        }
      }
      return metadata || {};
    },

    formatFileSize(bytes) {
      if (!bytes) return 'N/A';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
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
  },
};
</script>

<style scoped>
.lightbox-container {
  background: #1a1a1a;
  color: #fff;
}

.lightbox-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
}

.toolbar-left h6 {
  color: #fff;
  margin-bottom: 2px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.lightbox-viewer {
  position: relative;
  min-height: 75vh;
  background: #000;
}

.image-info-panel {
  background: #2d2d2d;
  border-top: 1px solid #444;
}

.info-panel-content {
  padding: 20px;
}

.info-panel-content h6 {
  color: #fff;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

.info-table {
  width: 100%;
  color: #ccc;
  font-size: 13px;
}

.info-table tr {
  border-bottom: 1px solid #444;
}

.info-table td {
  padding: 8px 10px;
}

.info-table td.label {
  font-weight: 600;
  color: #999;
  width: 40%;
}

.info-toggle {
  text-align: center;
  padding: 10px;
  background: #2d2d2d;
  border-top: 1px solid #444;
}

/* Dark theme buttons */
.btn-outline-light {
  color: #ccc;
  border-color: #555;
}

.btn-outline-light:hover {
  background-color: #444;
  border-color: #666;
  color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .lightbox-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-right {
    margin-top: 10px;
    width: 100%;
    justify-content: space-between;
  }

  .info-panel-content {
    padding: 15px;
  }
}
</style>

<style>
/* Global modal styles */
.image-lightbox-modal .modal-dialog {
  max-width: 95vw;
  margin: 1.75rem auto;
}

.image-lightbox-modal .modal-content {
  background-color: #1a1a1a;
  border: none;
}

.image-lightbox-modal .modal-header {
  background-color: #2d2d2d;
  border-bottom: 1px solid #444;
  color: #fff;
}

.image-lightbox-modal .modal-header .close {
  color: #fff;
  opacity: 0.8;
}

.image-lightbox-modal .modal-header .close:hover {
  opacity: 1;
}
</style>
