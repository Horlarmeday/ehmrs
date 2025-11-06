<template>
  <div class="image-uploader">
    <!-- Upload Area -->
    <div
      class="upload-dropzone"
      :class="{ 'drag-over': isDragging, disabled: uploading || disabled }"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFileTypes"
        :multiple="multiple"
        style="display: none"
        @change="onFileSelect"
      />

      <div v-if="!uploading" class="upload-content">
        <i class="fas fa-cloud-upload-alt fa-4x text-primary mb-3"></i>
        <h5>{{ uploadText }}</h5>
        <p class="text-muted">{{ uploadSubtext }}</p>
        <b-button variant="primary" size="sm" :disabled="disabled">
          <i class="fas fa-folder-open"></i> Browse Files
        </b-button>
        <div class="upload-info mt-3">
          <small class="text-muted d-block"
            >Supported formats: DICOM (.dcm), JPEG, PNG, GIF, TIFF</small
          >
          <small class="text-muted d-block"
            >Maximum file size: {{ formatFileSize(maxFileSize) }}</small
          >
          <small v-if="multiple" class="text-muted d-block">Maximum files: {{ maxFiles }}</small>
        </div>
      </div>

      <div v-else class="upload-progress-summary">
        <b-spinner variant="primary" label="Uploading..."></b-spinner>
        <p class="mt-3 mb-0">
          <strong>Uploading {{ uploadingFiles.length }} file(s)...</strong>
        </p>
        <p class="text-muted">{{ uploadProgress }}% complete</p>
      </div>
    </div>

    <!-- Selected Files List -->
    <div v-if="selectedFiles.length > 0 && !uploading" class="selected-files mt-3">
      <div class="selected-files-header">
        <h6 class="mb-0">
          <i class="fas fa-paperclip"></i> Selected Files
          <b-badge variant="primary" class="ml-2">{{ selectedFiles.length }}</b-badge>
        </h6>
        <b-button size="sm" variant="outline-danger" @click="clearFiles">
          <i class="fas fa-times"></i> Clear All
        </b-button>
      </div>

      <div class="files-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <div class="file-preview">
            <img v-if="file.preview" :src="file.preview" :alt="file.name" />
            <div v-else class="preview-placeholder">
              <i class="fas fa-file-image fa-2x"></i>
            </div>
          </div>

          <div class="file-info flex-grow-1">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <small class="text-muted">
                <i class="fas fa-hdd"></i> {{ formatFileSize(file.size) }}
              </small>
              <b-badge v-if="file.isDicom" variant="info" class="ml-2">
                <i class="fas fa-file-medical"></i> DICOM
              </b-badge>
              <b-badge v-if="file.error" variant="danger" class="ml-2">
                <i class="fas fa-exclamation-triangle"></i> {{ file.error }}
              </b-badge>
            </div>
          </div>

          <b-button size="sm" variant="outline-danger" @click="removeFile(index)">
            <i class="fas fa-trash"></i>
          </b-button>
        </div>
      </div>

      <div class="upload-actions mt-3">
        <b-button variant="primary" @click="uploadFiles" :disabled="hasErrors || uploading">
          <i class="fas fa-upload"></i> Upload {{ selectedFiles.length }} File(s)
        </b-button>
        <b-button variant="outline-secondary" class="ml-2" @click="clearFiles">
          <i class="fas fa-times"></i> Cancel
        </b-button>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading && uploadingFiles.length > 0" class="upload-progress mt-3">
      <h6 class="mb-3"><i class="fas fa-sync fa-spin"></i> Uploading Files...</h6>
      <div v-for="(file, index) in uploadingFiles" :key="index" class="progress-item mb-2">
        <div class="d-flex justify-content-between mb-1">
          <small>{{ file.name }}</small>
          <small>{{ file.progress }}%</small>
        </div>
        <b-progress
          :value="file.progress"
          :variant="file.error ? 'danger' : 'primary'"
          height="8px"
        ></b-progress>
        <small v-if="file.error" class="text-danger">
          <i class="fas fa-exclamation-circle"></i> {{ file.error }}
        </small>
      </div>
    </div>

    <!-- Upload Results -->
    <div v-if="uploadComplete && uploadResults" class="upload-results mt-3">
      <b-alert
        :variant="uploadResults.hasErrors ? 'warning' : 'success'"
        show
        dismissible
        @dismissed="clearResults"
      >
        <h6 class="alert-heading">
          <i
            :class="uploadResults.hasErrors ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'"
          ></i>
          Upload {{ uploadResults.hasErrors ? 'Completed with Errors' : 'Successful' }}
        </h6>

        <div v-if="uploadResults.successful && uploadResults.successful.length > 0" class="mb-2">
          <strong>Successfully uploaded {{ uploadResults.successful.length }} file(s):</strong>
          <ul class="mb-0 mt-1">
            <li v-for="(file, index) in uploadResults.successful" :key="'success-' + index">
              {{ file.originalName || file.file_name }}
            </li>
          </ul>
        </div>

        <div v-if="uploadResults.failed && uploadResults.failed.length > 0">
          <strong class="text-danger"
            >Failed to upload {{ uploadResults.failed.length }} file(s):</strong
          >
          <ul class="mb-0 mt-1">
            <li
              v-for="(file, index) in uploadResults.failed"
              :key="'failed-' + index"
              class="text-danger"
            >
              {{ file.originalName }} - {{ file.error }}
            </li>
          </ul>
        </div>

        <div v-if="uploadResults.warnings && uploadResults.warnings.length > 0" class="mt-2">
          <strong class="text-warning">Warnings:</strong>
          <ul class="mb-0 mt-1">
            <li
              v-for="(warning, index) in uploadResults.warnings"
              :key="'warning-' + index"
              class="text-warning"
            >
              {{ warning }}
            </li>
          </ul>
        </div>
      </b-alert>
    </div>
  </div>
</template>

<script>
import { isDicomFile } from '@/utils/dicom/dicom-parser';

export default {
  name: 'ImageUploader',
  props: {
    uploadUrl: {
      type: String,
      required: true,
    },
    resultId: {
      type: [String, Number],
      required: true,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    maxFiles: {
      type: Number,
      default: 20,
    },
    maxFileSize: {
      type: Number,
      default: 100 * 1024 * 1024, // 100MB
    },
    acceptedFileTypes: {
      type: String,
      default: '.dcm,.dicom,.jpg,.jpeg,.png,.gif,.tiff,.tif',
    },
    uploadText: {
      type: String,
      default: 'Drag and drop files here',
    },
    uploadSubtext: {
      type: String,
      default: 'or click to browse',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    autoUpload: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isDragging: false,
      selectedFiles: [],
      uploadingFiles: [],
      uploading: false,
      uploadComplete: false,
      uploadResults: null,
      retryCount: 0,
      maxRetries: 2,
    };
  },
  computed: {
    hasErrors() {
      return this.selectedFiles.some((file) => file.error);
    },
    uploadProgress() {
      if (this.uploadingFiles.length === 0) return 0;
      const total = this.uploadingFiles.reduce((sum, file) => sum + (file.progress || 0), 0);
      return Math.round(total / this.uploadingFiles.length);
    },
  },
  methods: {
    openFileDialog() {
      if (!this.uploading && !this.disabled) {
        this.$refs.fileInput.click();
      }
    },

    onDragOver() {
      if (!this.uploading && !this.disabled) {
        this.isDragging = true;
      }
    },

    onDragLeave() {
      this.isDragging = false;
    },

    async onDrop(event) {
      this.isDragging = false;
      if (this.uploading || this.disabled) return;

      const files = Array.from(event.dataTransfer.files);
      await this.processFiles(files);
    },

    async onFileSelect(event) {
      const files = Array.from(event.target.files);
      await this.processFiles(files);
      // Reset input to allow selecting the same file again
      this.$refs.fileInput.value = '';
    },

    async processFiles(files) {
      // Clear previous results
      this.uploadComplete = false;
      this.uploadResults = null;

      // Validate file count
      const totalFiles = this.selectedFiles.length + files.length;
      if (totalFiles > this.maxFiles) {
        this.$bvToast.toast(`You can only upload a maximum of ${this.maxFiles} files`, {
          title: 'Too Many Files',
          variant: 'warning',
          solid: true,
        });
        return;
      }

      // Process each file
      for (const file of files) {
        const processedFile = await this.validateAndProcessFile(file);
        this.selectedFiles.push(processedFile);
      }

      // Auto upload if enabled
      if (this.autoUpload && !this.hasErrors) {
        this.uploadFiles();
      }
    },

    async validateAndProcessFile(file) {
      const processedFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null,
        isDicom: false,
        error: null,
      };

      // Validate minimum file size (avoid empty or corrupted files)
      if (file.size < 100) {
        processedFile.error = 'File is too small or empty';
        return processedFile;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        processedFile.error = `File size exceeds ${this.formatFileSize(this.maxFileSize)}`;
        return processedFile;
      }

      // Validate file name length
      if (file.name.length > 255) {
        processedFile.error = 'File name is too long (max 255 characters)';
        return processedFile;
      }

      // Check for invalid characters in file name
      const invalidChars = /[<>:"|?*\\]/;
      if (invalidChars.test(file.name)) {
        processedFile.error = 'File name contains invalid characters';
        return processedFile;
      }

      // Validate file type
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const acceptedExtensions = this.acceptedFileTypes.split(',');
      if (!acceptedExtensions.includes(extension)) {
        processedFile.error = `File type ${extension} is not supported`;
        return processedFile;
      }

      // Check if DICOM
      try {
        const arrayBuffer = await file.arrayBuffer();
        processedFile.isDicom = isDicomFile(arrayBuffer);

        // Generate preview for non-DICOM images
        if (!processedFile.isDicom && file.type.startsWith('image/')) {
          processedFile.preview = URL.createObjectURL(file);
        }
      } catch (error) {
        console.error('Error processing file:', error);
      }

      return processedFile;
    },

    removeFile(index) {
      const file = this.selectedFiles[index];
      // Revoke preview URL if exists
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      this.selectedFiles.splice(index, 1);
    },

    clearFiles() {
      // Revoke all preview URLs
      this.selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      this.selectedFiles = [];
      this.uploadComplete = false;
      this.uploadResults = null;
    },

    async uploadFiles() {
      if (this.hasErrors || this.uploading) return;

      try {
        this.uploading = true;
        this.uploadComplete = false;
        this.uploadingFiles = this.selectedFiles.map((f) => ({
          name: f.name,
          progress: 0,
          error: null,
        }));

        // Extract raw File objects for FormData
        const files = this.selectedFiles.map((fileObj) => fileObj.file);

        // Use Vuex store action for upload
        const response = await this.$store.dispatch('radiology/uploadInvestigationImages', {
          files,
          resultId: this.resultId,
        });

        // Monitor upload progress from store
        const unwatch = this.$watch(
          () => this.$store.state.radiology.uploadProgress,
          (progress) => {
            Object.keys(progress).forEach((fileId) => {
              const percentCompleted = progress[fileId];
              this.uploadingFiles.forEach((file) => {
                file.progress = percentCompleted;
              });
            });
          },
          { deep: true }
        );

        // Handle response
        if (response.data.success) {
          unwatch(); // Stop watching progress

          this.uploadResults = {
            successful: response.data.data || [],
            failed: [],
            warnings: [],
            hasErrors: false,
          };

          // Emit success event
          this.$emit('upload-complete', this.uploadResults);

          // Show toast
          this.$bvToast.toast(
            `Successfully uploaded ${this.uploadResults.successful.length} file(s)`,
            {
              title: 'Upload Complete',
              variant: 'success',
              solid: true,
            }
          );

          // Clear selected files
          this.clearFiles();
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }

        this.uploadComplete = true;
        this.retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('Upload error:', error);

        // Check if it's a network error and retry is possible
        const isNetworkError =
          !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';

        if (isNetworkError && this.retryCount < this.maxRetries) {
          this.retryCount++;
          const retryDelay = 1000 * this.retryCount; // Exponential backoff: 1s, 2s

          this.$bvToast.toast(
            `Network error detected. Retrying upload in ${
              retryDelay / 1000
            } second(s)... (Attempt ${this.retryCount} of ${this.maxRetries})`,
            {
              title: 'Retrying Upload',
              variant: 'warning',
              solid: true,
              autoHideDelay: retryDelay,
            }
          );

          setTimeout(() => {
            this.uploading = false;
            this.uploadFiles(); // Retry upload
          }, retryDelay);

          return; // Exit without finalizing error state
        }

        // Determine error type and provide user-friendly message
        let errorMessage = 'Upload failed';
        let errorDetails = '';

        if (error.response) {
          // Server responded with error
          errorMessage = error.response.data?.message || 'Server error occurred';
          if (error.response.status === 413) {
            errorDetails = 'File size too large for server to process';
          } else if (error.response.status === 400) {
            errorDetails = 'Invalid file format or data';
          } else if (error.response.status === 401 || error.response.status === 403) {
            errorDetails = 'Authentication error - please login again';
          } else if (error.response.status >= 500) {
            errorDetails = 'Server error - please try again later';
          }
        } else if (error.request) {
          // Request made but no response
          errorMessage = 'Network error';
          errorDetails = 'No response from server. Please check your internet connection.';
        } else {
          // Something else happened
          errorMessage = error.message || 'Unknown error occurred';
        }

        this.uploadResults = {
          successful: [],
          failed: this.selectedFiles.map((f) => ({
            originalName: f.name,
            error: errorDetails || errorMessage,
          })),
          warnings: [],
          hasErrors: true,
        };

        this.$bvToast.toast(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage, {
          title: 'Upload Error',
          variant: 'danger',
          solid: true,
          autoHideDelay: 5000,
        });

        this.uploadComplete = true;
        this.retryCount = 0; // Reset retry count
        this.$emit('upload-error', error);
      } finally {
        if (this.retryCount === 0) {
          // Only reset if not retrying
          this.uploading = false;
          this.uploadingFiles = [];
        }
      }
    },

    clearResults() {
      this.uploadComplete = false;
      this.uploadResults = null;
    },

    formatFileSize(bytes) {
      if (!bytes) return '0 Bytes';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    },
  },

  beforeDestroy() {
    // Clean up preview URLs
    this.selectedFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  },
};
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-dropzone {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-dropzone:hover:not(.disabled) {
  border-color: #007bff;
  background: #e7f3ff;
}

.upload-dropzone.drag-over {
  border-color: #007bff;
  background: #e7f3ff;
  transform: scale(1.02);
}

.upload-dropzone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-content {
  pointer-events: none;
}

.upload-content i {
  display: block;
}

.upload-info {
  padding-top: 12px;
  border-top: 1px solid #dee2e6;
}

.upload-progress-summary {
  pointer-events: none;
}

.selected-files {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.selected-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #dee2e6;
}

.files-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #f8f9fa;
  transition: background 0.2s ease;
}

.file-item:hover {
  background: #e9ecef;
}

.file-preview {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #dee2e6;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.file-info {
  min-width: 0;
}

.file-name {
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.upload-actions {
  padding-top: 12px;
  border-top: 1px solid #dee2e6;
}

.upload-progress {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.progress-item {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.upload-results {
  margin-top: 16px;
}

/* Scrollbar styling */
.files-list::-webkit-scrollbar {
  width: 8px;
}

.files-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.files-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.files-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive */
@media (max-width: 576px) {
  .upload-dropzone {
    padding: 30px 15px;
  }

  .selected-files-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .selected-files-header button {
    margin-top: 8px;
  }

  .file-preview {
    width: 50px;
    height: 50px;
  }

  .upload-actions {
    display: flex;
    flex-direction: column;
  }

  .upload-actions .btn {
    width: 100%;
    margin-left: 0 !important;
    margin-top: 8px;
  }

  .upload-actions .btn:first-child {
    margin-top: 0;
  }
}
</style>
