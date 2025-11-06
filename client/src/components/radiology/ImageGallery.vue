<template>
  <div class="image-gallery">
    <!-- Gallery Header -->
    <div v-if="showHeader" class="gallery-header">
      <h5 class="mb-0">
        <i class="fas fa-images"></i>
        {{ title }}
        <b-badge variant="primary" class="ml-2">{{ images.length }}</b-badge>
      </h5>
      <div class="gallery-actions">
        <b-button-group size="sm">
          <b-button
            :variant="viewMode === 'grid' ? 'primary' : 'outline-primary'"
            @click="viewMode = 'grid'"
            v-b-tooltip.hover
            title="Grid View"
          >
            <i class="fas fa-th"></i>
          </b-button>
          <b-button
            :variant="viewMode === 'list' ? 'primary' : 'outline-primary'"
            @click="viewMode = 'list'"
            v-b-tooltip.hover
            title="List View"
          >
            <i class="fas fa-list"></i>
          </b-button>
        </b-button-group>
        <b-form-checkbox v-if="allowReorder" v-model="reorderMode" size="sm" switch class="ml-2">
          Reorder Mode
        </b-form-checkbox>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="images.length === 0" class="empty-state">
      <i class="fas fa-images fa-3x text-muted mb-3"></i>
      <p class="text-muted">{{ emptyMessage }}</p>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="gallery-grid"
      :class="{ 'reorder-mode': reorderMode }"
    >
      <draggable
        v-model="localImages"
        :disabled="!reorderMode"
        @end="onReorderEnd"
        class="row"
        ghost-class="ghost-card"
      >
        <div
          v-for="(image, index) in localImages"
          :key="image.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3"
        >
          <b-card
            :class="[
              'image-card',
              {
                selected: selectedImageId === image.id,
                primary: image.is_primary,
                draggable: reorderMode,
              },
            ]"
            @click="selectImage(image)"
          >
            <!-- Primary Badge -->
            <div v-if="image.is_primary" class="primary-badge">
              <i class="fas fa-star"></i> Primary
            </div>

            <!-- Loading Indicator -->
            <div v-if="image.loading" class="loading-indicator">
              <b-spinner small></b-spinner>
            </div>

            <!-- Thumbnail -->
            <div class="thumbnail-container">
              <img
                v-if="image.thumbnail_url || image.thumbnailUrl"
                :src="image.thumbnail_url || image.thumbnailUrl"
                :alt="`Image ${index + 1}`"
                class="thumbnail-image"
                @error="onImageError(image)"
              />
              <div v-else class="thumbnail-placeholder">
                <i class="fas fa-file-image fa-2x"></i>
              </div>

              <!-- DICOM Badge -->
              <div v-if="image.file_type === 'DICOM'" class="dicom-badge">
                <i class="fas fa-file-medical"></i> DICOM
              </div>

              <!-- Overlay Actions -->
              <div class="image-overlay">
                <b-button-group size="sm">
                  <b-button
                    variant="light"
                    @click.stop="viewImage(image)"
                    v-b-tooltip.hover
                    title="View"
                  >
                    <i class="fas fa-eye"></i>
                  </b-button>
                  <b-button
                    v-if="allowSetPrimary && !image.is_primary"
                    variant="warning"
                    @click.stop="setPrimary(image)"
                    v-b-tooltip.hover
                    title="Set as Primary"
                  >
                    <i class="fas fa-star"></i>
                  </b-button>
                  <b-button
                    v-if="allowDownload"
                    variant="info"
                    @click.stop="downloadImage(image)"
                    v-b-tooltip.hover
                    title="Download"
                  >
                    <i class="fas fa-download"></i>
                  </b-button>
                  <b-button
                    v-if="allowDelete"
                    variant="danger"
                    @click.stop="confirmDelete(image)"
                    v-b-tooltip.hover
                    title="Delete"
                  >
                    <i class="fas fa-trash"></i>
                  </b-button>
                </b-button-group>
              </div>
            </div>

            <!-- Image Info -->
            <b-card-body class="p-2">
              <div class="image-info">
                <div
                  class="image-name text-truncate"
                  :title="image.file_name || `Image ${index + 1}`"
                >
                  {{ image.file_name || `Image ${index + 1}` }}
                </div>
                <div class="image-meta">
                  <small class="text-muted">
                    <i class="fas fa-hdd"></i> {{ formatFileSize(image.file_size) }}
                  </small>
                  <small v-if="image.created_at" class="text-muted ml-2">
                    <i class="fas fa-clock"></i> {{ formatDate(image.created_at) }}
                  </small>
                </div>
                <div v-if="showDicomInfo && image.dicom_metadata" class="dicom-info mt-1">
                  <small class="text-muted d-block">
                    <strong>Modality:</strong>
                    {{ parseDicomMetadata(image.dicom_metadata).modality || 'N/A' }}
                  </small>
                  <small class="text-muted d-block">
                    <strong>Series:</strong>
                    {{ parseDicomMetadata(image.dicom_metadata).seriesDescription || 'N/A' }}
                  </small>
                </div>
              </div>
            </b-card-body>
          </b-card>
        </div>
      </draggable>
    </div>

    <!-- List View -->
    <div v-else class="gallery-list">
      <draggable
        v-model="localImages"
        :disabled="!reorderMode"
        @end="onReorderEnd"
        ghost-class="ghost-row"
      >
        <div
          v-for="(image, index) in localImages"
          :key="image.id"
          class="list-item"
          :class="{ selected: selectedImageId === image.id, draggable: reorderMode }"
          @click="selectImage(image)"
        >
          <div class="list-thumbnail">
            <img
              v-if="image.thumbnail_url || image.thumbnailUrl"
              :src="image.thumbnail_url || image.thumbnailUrl"
              :alt="`Image ${index + 1}`"
              @error="onImageError(image)"
            />
            <div v-else class="thumbnail-placeholder-small">
              <i class="fas fa-file-image"></i>
            </div>
          </div>

          <div class="list-info flex-grow-1">
            <div class="d-flex align-items-center">
              <strong class="mr-2">{{ image.file_name || `Image ${index + 1}` }}</strong>
              <b-badge v-if="image.is_primary" variant="warning" class="mr-2">
                <i class="fas fa-star"></i> Primary
              </b-badge>
              <b-badge v-if="image.file_type === 'DICOM'" variant="info">
                <i class="fas fa-file-medical"></i> DICOM
              </b-badge>
            </div>
            <div class="text-muted small mt-1">
              <span class="mr-3"
                ><i class="fas fa-hdd"></i> {{ formatFileSize(image.file_size) }}</span
              >
              <span v-if="image.created_at"
                ><i class="fas fa-clock"></i> {{ formatDate(image.created_at) }}</span
              >
            </div>
          </div>

          <div class="list-actions">
            <b-button-group size="sm">
              <b-button
                variant="outline-primary"
                @click.stop="viewImage(image)"
                v-b-tooltip.hover
                title="View"
              >
                <i class="fas fa-eye"></i>
              </b-button>
              <b-button
                v-if="allowSetPrimary && !image.is_primary"
                variant="outline-warning"
                @click.stop="setPrimary(image)"
                v-b-tooltip.hover
                title="Set as Primary"
              >
                <i class="fas fa-star"></i>
              </b-button>
              <b-button
                v-if="allowDownload"
                variant="outline-info"
                @click.stop="downloadImage(image)"
                v-b-tooltip.hover
                title="Download"
              >
                <i class="fas fa-download"></i>
              </b-button>
              <b-button
                v-if="allowDelete"
                variant="outline-danger"
                @click.stop="confirmDelete(image)"
                v-b-tooltip.hover
                title="Delete"
              >
                <i class="fas fa-trash"></i>
              </b-button>
            </b-button-group>
          </div>
        </div>
      </draggable>
    </div>

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirm Delete"
      header-bg-variant="danger"
      header-text-variant="light"
      @ok="deleteImage"
    >
      <p>Are you sure you want to delete this image?</p>
      <p v-if="imageToDelete" class="mb-0">
        <strong>{{ imageToDelete.file_name || 'Unnamed Image' }}</strong>
      </p>
      <p v-if="imageToDelete && imageToDelete.is_primary" class="text-warning mt-2 mb-0">
        <i class="fas fa-exclamation-triangle"></i> This is the primary image. Another image will be
        automatically set as primary.
      </p>
    </b-modal>
  </div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
  name: 'ImageGallery',
  components: {
    draggable,
  },
  props: {
    images: {
      type: Array,
      required: true,
      default: () => [],
    },
    title: {
      type: String,
      default: 'Images',
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    emptyMessage: {
      type: String,
      default: 'No images available',
    },
    allowReorder: {
      type: Boolean,
      default: true,
    },
    allowDelete: {
      type: Boolean,
      default: true,
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    allowSetPrimary: {
      type: Boolean,
      default: true,
    },
    showDicomInfo: {
      type: Boolean,
      default: true,
    },
    defaultView: {
      type: String,
      default: 'grid',
      validator: (value) => ['grid', 'list'].includes(value),
    },
  },
  data() {
    return {
      viewMode: this.defaultView,
      reorderMode: false,
      selectedImageId: null,
      localImages: [],
      showDeleteModal: false,
      imageToDelete: null,
    };
  },
  watch: {
    images: {
      handler(newVal) {
        this.localImages = [...newVal];
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    selectImage(image) {
      this.selectedImageId = image.id;
      this.$emit('image-selected', image);
    },

    viewImage(image) {
      this.$emit('view-image', image);
    },

    setPrimary(image) {
      this.$emit('set-primary', image);
    },

    downloadImage(image) {
      this.$emit('download-image', image);
    },

    confirmDelete(image) {
      this.imageToDelete = image;
      this.showDeleteModal = true;
    },

    deleteImage() {
      if (this.imageToDelete) {
        this.$emit('delete-image', this.imageToDelete);
        this.imageToDelete = null;
      }
    },

    onReorderEnd() {
      if (this.reorderMode) {
        const reorderedImages = this.localImages.map((img, index) => ({
          id: img.id,
          display_order: index,
        }));
        this.$emit('reorder', reorderedImages);
      }
    },

    onImageError(image) {
      this.$set(image, 'thumbnailError', true);
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
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
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
  },
};
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px 4px 0 0;
}

.gallery-actions {
  display: flex;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.gallery-grid {
  padding: 16px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-top: none;
}

.gallery-grid.reorder-mode .image-card {
  cursor: move;
}

.image-card {
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.image-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.image-card.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.image-card.primary {
  border-color: #ffc107;
}

.image-card.draggable {
  cursor: move !important;
}

.primary-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ffc107;
  color: #000;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  z-index: 2;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.thumbnail-container {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  background: #f8f9fa;
  overflow: hidden;
}

.thumbnail-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.dicom-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: #17a2b8;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-info {
  font-size: 13px;
}

.image-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.image-meta {
  display: flex;
  flex-wrap: wrap;
}

.dicom-info {
  border-top: 1px solid #dee2e6;
  padding-top: 4px;
}

/* List View */
.gallery-list {
  background: #fff;
  border: 1px solid #dee2e6;
  border-top: none;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  transition: background 0.2s ease;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: #f8f9fa;
}

.list-item.selected {
  background: #e7f3ff;
  border-left: 4px solid #007bff;
}

.list-item.draggable {
  cursor: move !important;
}

.list-thumbnail {
  width: 80px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.list-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-actions {
  flex-shrink: 0;
}

/* Drag and Drop */
.ghost-card {
  opacity: 0.5;
  background: #007bff;
}

.ghost-row {
  opacity: 0.5;
  background: #007bff;
}

/* Responsive */
@media (max-width: 576px) {
  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gallery-actions {
    margin-top: 8px;
    width: 100%;
    justify-content: space-between;
  }

  .list-thumbnail {
    width: 60px;
    height: 45px;
    margin-right: 12px;
  }

  .list-actions .btn-group {
    flex-direction: column;
  }
}
</style>
