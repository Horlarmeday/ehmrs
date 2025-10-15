<template>
  <div class="dicom-viewer-container">
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-overlay">
      <b-spinner variant="primary" label="Loading image..."></b-spinner>
      <p class="mt-2">{{ loadingMessage }}</p>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-overlay">
      <b-alert variant="danger" show>
        <h5>Error Loading Image</h5>
        <p>{{ error }}</p>
      </b-alert>
    </div>

    <!-- Toolbar -->
    <div v-if="!error" class="viewer-toolbar">
      <b-button-group size="sm">
        <!-- Pan Tool -->
        <b-button
          :variant="activeTool === 'pan' ? 'primary' : 'outline-primary'"
          @click="setActiveTool('pan')"
          v-b-tooltip.hover
          title="Pan (P)"
        >
          <i class="fas fa-arrows-alt"></i>
        </b-button>

        <!-- Zoom Tool -->
        <b-button
          :variant="activeTool === 'zoom' ? 'primary' : 'outline-primary'"
          @click="setActiveTool('zoom')"
          v-b-tooltip.hover
          title="Zoom (Z)"
        >
          <i class="fas fa-search-plus"></i>
        </b-button>

        <!-- Window/Level Tool -->
        <b-button
          :variant="activeTool === 'windowLevel' ? 'primary' : 'outline-primary'"
          @click="setActiveTool('windowLevel')"
          v-b-tooltip.hover
          title="Window/Level (W)"
        >
          <i class="fas fa-adjust"></i>
        </b-button>

        <!-- Length Measurement -->
        <b-button
          :variant="activeTool === 'length' ? 'primary' : 'outline-primary'"
          @click="setActiveTool('length')"
          v-b-tooltip.hover
          title="Measure Distance (L)"
        >
          <i class="fas fa-ruler"></i>
        </b-button>

        <!-- Angle Measurement -->
        <b-button
          :variant="activeTool === 'angle' ? 'primary' : 'outline-primary'"
          @click="setActiveTool('angle')"
          v-b-tooltip.hover
          title="Measure Angle (A)"
        >
          <i class="fas fa-drafting-compass"></i>
        </b-button>
      </b-button-group>

      <b-button-group size="sm" class="ml-2">
        <!-- Rotate Left -->
        <b-button variant="outline-secondary" @click="rotateLeft" v-b-tooltip.hover title="Rotate Left (R)">
          <i class="fas fa-undo"></i>
        </b-button>

        <!-- Rotate Right -->
        <b-button variant="outline-secondary" @click="rotateRight" v-b-tooltip.hover title="Rotate Right (Shift+R)">
          <i class="fas fa-redo"></i>
        </b-button>

        <!-- Flip Horizontal -->
        <b-button variant="outline-secondary" @click="flipHorizontal" v-b-tooltip.hover title="Flip Horizontal (H)">
          <i class="fas fa-arrows-alt-h"></i>
        </b-button>

        <!-- Flip Vertical -->
        <b-button variant="outline-secondary" @click="flipVertical" v-b-tooltip.hover title="Flip Vertical (V)">
          <i class="fas fa-arrows-alt-v"></i>
        </b-button>

        <!-- Invert -->
        <b-button variant="outline-secondary" @click="invert" v-b-tooltip.hover title="Invert (I)">
          <i class="fas fa-circle-half-stroke"></i>
        </b-button>
      </b-button-group>

      <!-- Window/Level Presets -->
      <b-dropdown
        v-if="imageMetadata && imageMetadata.modality === 'CT'"
        size="sm"
        text="Presets"
        variant="outline-secondary"
        class="ml-2"
      >
        <b-dropdown-item @click="applyPreset('ABDOMEN')">Abdomen</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('BONE')">Bone</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('BRAIN')">Brain</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('CHEST')">Chest</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('LIVER')">Liver</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('LUNG')">Lung</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('MEDIASTINUM')">Mediastinum</b-dropdown-item>
        <b-dropdown-item @click="applyPreset('SPINE')">Spine</b-dropdown-item>
      </b-dropdown>

      <!-- Reset View -->
      <b-button size="sm" variant="outline-danger" class="ml-2" @click="resetView" v-b-tooltip.hover title="Reset (Esc)">
        <i class="fas fa-sync-alt"></i> Reset
      </b-button>

      <!-- Fit to Window -->
      <b-button size="sm" variant="outline-info" class="ml-2" @click="fitToWindow" v-b-tooltip.hover title="Fit to Window (F)">
        <i class="fas fa-expand"></i> Fit
      </b-button>

      <!-- Series Navigation (if multiple images) -->
      <div v-if="hasMultipleImages" class="ml-auto d-flex align-items-center">
        <b-button size="sm" variant="outline-secondary" @click="previousImage" :disabled="currentImageIndex === 0">
          <i class="fas fa-chevron-left"></i>
        </b-button>
        <span class="mx-2">{{ currentImageIndex + 1 }} / {{ images.length }}</span>
        <b-button
          size="sm"
          variant="outline-secondary"
          @click="nextImage"
          :disabled="currentImageIndex === images.length - 1"
        >
          <i class="fas fa-chevron-right"></i>
        </b-button>
      </div>
    </div>

    <!-- Viewport Container -->
    <div class="viewport-container" :style="{ height: viewportHeight }">
      <div ref="viewport" class="cornerstone-viewport" @wheel="onMouseWheel" @contextmenu.prevent></div>

      <!-- Image Info Overlay -->
      <div v-if="imageMetadata && showInfo" class="image-info-overlay">
        <div class="info-section">
          <div v-if="imageMetadata.patientName">
            <strong>Patient:</strong> {{ imageMetadata.patientName }}
          </div>
          <div v-if="imageMetadata.studyDescription">
            <strong>Study:</strong> {{ imageMetadata.studyDescription }}
          </div>
          <div v-if="imageMetadata.seriesDescription">
            <strong>Series:</strong> {{ imageMetadata.seriesDescription }}
          </div>
          <div v-if="imageMetadata.modality">
            <strong>Modality:</strong> {{ imageMetadata.modality }}
          </div>
          <div v-if="currentViewport">
            <strong>WW/WL:</strong> {{ Math.round(currentViewport.voi.windowWidth) }} /
            {{ Math.round(currentViewport.voi.windowCenter) }}
          </div>
          <div v-if="currentViewport">
            <strong>Zoom:</strong> {{ (currentViewport.scale * 100).toFixed(0) }}%
          </div>
        </div>
      </div>

      <!-- Pixel Probe -->
      <div v-if="pixelProbe" class="pixel-probe-overlay">
        <div>
          <strong>Position:</strong> ({{ pixelProbe.x }}, {{ pixelProbe.y }})
        </div>
        <div>
          <strong>Value:</strong> {{ pixelProbe.value }}
        </div>
        <div v-if="pixelProbe.modalityValue !== pixelProbe.value">
          <strong>HU:</strong> {{ Math.round(pixelProbe.modalityValue) }}
        </div>
      </div>
    </div>

    <!-- Bottom Info Bar -->
    <div v-if="!error" class="info-bar">
      <b-form-checkbox v-model="showInfo" size="sm" switch class="mr-3"> Show Image Info </b-form-checkbox>
      <span v-if="imageMetadata && imageMetadata.rows && imageMetadata.columns" class="mr-3">
        <i class="fas fa-image"></i> {{ imageMetadata.columns }} × {{ imageMetadata.rows }}
      </span>
      <span v-if="imageMetadata && imageMetadata.pixelSpacing" class="mr-3">
        <i class="fas fa-ruler-combined"></i> {{ imageMetadata.pixelSpacing }}
      </span>
      <span class="ml-auto text-muted">
        <i class="fas fa-info-circle"></i> Use mouse wheel to scroll through series
      </span>
    </div>
  </div>
</template>

<script>
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { initializeCornerstoneLoaders, loadImage } from '@/utils/dicom/dicom-loader';
import {
  resetViewport,
  fitToWindow as fitToWindowHelper,
  invertImage,
  rotateImage,
  flipHorizontal as flipHorizontalHelper,
  flipVertical as flipVerticalHelper,
  setWindowLevel,
  getPixelValue,
  WINDOW_LEVEL_PRESETS,
} from '@/utils/dicom/dicom-helpers';

export default {
  name: 'DicomViewer',
  props: {
    imageId: {
      type: String,
      default: null,
    },
    images: {
      type: Array,
      default: () => [],
    },
    metadata: {
      type: Object,
      default: () => ({}),
    },
    viewportHeight: {
      type: String,
      default: '600px',
    },
    enableTools: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isLoading: false,
      loadingMessage: 'Loading image...',
      error: null,
      element: null,
      currentImageIndex: 0,
      activeTool: 'pan',
      imageMetadata: null,
      currentViewport: null,
      showInfo: true,
      pixelProbe: null,
      viewportUpdateInterval: null,
      isInitialized: false,
    };
  },
  computed: {
    hasMultipleImages() {
      return this.images && this.images.length > 1;
    },
    currentImageId() {
      if (this.hasMultipleImages) {
        return this.images[this.currentImageIndex];
      }
      return this.imageId;
    },
  },
  watch: {
    imageId(newVal) {
      if (newVal && !this.hasMultipleImages) {
        this.loadCurrentImage();
      }
    },
    images: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.currentImageIndex = 0;
          this.loadCurrentImage();
        }
      },
      deep: true,
    },
    metadata: {
      handler(newVal) {
        if (newVal) {
          this.imageMetadata = { ...this.imageMetadata, ...newVal };
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.initializeViewer();
  },
  beforeDestroy() {
    this.cleanupViewer();
  },
  methods: {
    async initializeViewer() {
      try {
        // Initialize Cornerstone loaders
        initializeCornerstoneLoaders();

        // Initialize Cornerstone Tools
        if (this.enableTools) {
          cornerstoneTools.external.cornerstone = cornerstone;
          cornerstoneTools.init({
            mouseEnabled: true,
            touchEnabled: true,
            globalToolSyncEnabled: false,
            showSVGCursors: true,
          });
        }

        // Get viewport element
        this.element = this.$refs.viewport;

        // Enable Cornerstone on the element
        cornerstone.enable(this.element);

        // Add tools
        if (this.enableTools) {
          this.initializeTools();
        }

        // Set up event listeners
        this.setupEventListeners();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        this.isInitialized = true;

        // Load image if provided
        if (this.currentImageId) {
          await this.loadCurrentImage();
        }
      } catch (error) {
        console.error('Error initializing viewer:', error);
        this.error = `Failed to initialize viewer: ${error.message}`;
      }
    },

    initializeTools() {
      // Add tools
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool); // Window/Level
      cornerstoneTools.addTool(cornerstoneTools.LengthTool);
      cornerstoneTools.addTool(cornerstoneTools.AngleTool);
      cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);

      // Activate default tool (Pan)
      cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });

      // Enable stack scroll with mouse wheel
      if (this.hasMultipleImages) {
        cornerstoneTools.setToolActive('StackScrollMouseWheel', {});
      }
    },

    setupEventListeners() {
      // Image rendered event
      this.element.addEventListener('cornerstoneimagerendered', this.onImageRendered);

      // Mouse move for pixel probe
      this.element.addEventListener('mousemove', this.onMouseMove);

      // Mouse leave to clear pixel probe
      this.element.addEventListener('mouseleave', () => {
        this.pixelProbe = null;
      });

      // Update viewport info periodically
      this.viewportUpdateInterval = setInterval(() => {
        if (this.element && this.isInitialized) {
          try {
            const viewport = cornerstone.getViewport(this.element);
            this.currentViewport = viewport;
          } catch (error) {
            // Ignore errors when element is not enabled
          }
        }
      }, 100);
    },

    setupKeyboardShortcuts() {
      document.addEventListener('keydown', this.handleKeyDown);
    },

    handleKeyDown(event) {
      if (!this.isInitialized || this.error) return;

      switch (event.key.toLowerCase()) {
        case 'p':
          this.setActiveTool('pan');
          break;
        case 'z':
          this.setActiveTool('zoom');
          break;
        case 'w':
          this.setActiveTool('windowLevel');
          break;
        case 'l':
          this.setActiveTool('length');
          break;
        case 'a':
          this.setActiveTool('angle');
          break;
        case 'r':
          if (event.shiftKey) {
            this.rotateRight();
          } else {
            this.rotateLeft();
          }
          break;
        case 'h':
          this.flipHorizontal();
          break;
        case 'v':
          this.flipVertical();
          break;
        case 'i':
          this.invert();
          break;
        case 'f':
          this.fitToWindow();
          break;
        case 'escape':
          this.resetView();
          break;
        case 'arrowleft':
          if (this.hasMultipleImages) {
            this.previousImage();
          }
          break;
        case 'arrowright':
          if (this.hasMultipleImages) {
            this.nextImage();
          }
          break;
      }
    },

    async loadCurrentImage() {
      if (!this.currentImageId || !this.element) return;

      try {
        this.isLoading = true;
        this.error = null;
        this.loadingMessage = 'Loading image...';

        // Load and display the image
        const image = await loadImage(this.currentImageId);

        cornerstone.displayImage(this.element, image);

        // Update metadata
        this.imageMetadata = { ...this.metadata, ...image };

        // Emit event
        this.$emit('image-loaded', {
          imageId: this.currentImageId,
          index: this.currentImageIndex,
          image,
        });

        this.isLoading = false;
      } catch (error) {
        console.error('Error loading image:', error);
        this.error = `Failed to load image: ${error.message}`;
        this.isLoading = false;
      }
    },

    setActiveTool(tool) {
      if (!this.enableTools || !this.isInitialized) return;

      // Deactivate all tools
      cornerstoneTools.setToolPassive('Pan');
      cornerstoneTools.setToolPassive('Zoom');
      cornerstoneTools.setToolPassive('Wwwc');
      cornerstoneTools.setToolPassive('Length');
      cornerstoneTools.setToolPassive('Angle');

      // Activate selected tool
      switch (tool) {
        case 'pan':
          cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
          break;
        case 'zoom':
          cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
          break;
        case 'windowLevel':
          cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
          break;
        case 'length':
          cornerstoneTools.setToolActive('Length', { mouseButtonMask: 1 });
          break;
        case 'angle':
          cornerstoneTools.setToolActive('Angle', { mouseButtonMask: 1 });
          break;
      }

      this.activeTool = tool;
    },

    rotateLeft() {
      rotateImage(this.element, -90);
    },

    rotateRight() {
      rotateImage(this.element, 90);
    },

    flipHorizontal() {
      flipHorizontalHelper(this.element);
    },

    flipVertical() {
      flipVerticalHelper(this.element);
    },

    invert() {
      invertImage(this.element);
    },

    resetView() {
      resetViewport(this.element);
    },

    fitToWindow() {
      fitToWindowHelper(this.element);
    },

    applyPreset(preset) {
      if (!this.imageMetadata || this.imageMetadata.modality !== 'CT') return;

      const presetValues = WINDOW_LEVEL_PRESETS.CT[preset];
      if (presetValues) {
        setWindowLevel(this.element, presetValues.windowCenter, presetValues.windowWidth);
      }
    },

    previousImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
        this.loadCurrentImage();
      }
    },

    nextImage() {
      if (this.currentImageIndex < this.images.length - 1) {
        this.currentImageIndex++;
        this.loadCurrentImage();
      }
    },

    onMouseWheel(event) {
      if (this.hasMultipleImages && this.isInitialized) {
        event.preventDefault();
        if (event.deltaY < 0) {
          this.previousImage();
        } else if (event.deltaY > 0) {
          this.nextImage();
        }
      }
    },

    onImageRendered() {
      // Image rendered successfully
      this.$emit('image-rendered');
    },

    onMouseMove(event) {
      if (!this.isInitialized) return;

      try {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const pixelData = getPixelValue(this.element, x, y);
        if (pixelData) {
          this.pixelProbe = pixelData;
        }
      } catch (error) {
        // Ignore errors
      }
    },

    cleanupViewer() {
      // Clear interval
      if (this.viewportUpdateInterval) {
        clearInterval(this.viewportUpdateInterval);
      }

      // Remove keyboard listener
      document.removeEventListener('keydown', this.handleKeyDown);

      // Remove event listeners
      if (this.element) {
        this.element.removeEventListener('cornerstoneimagerendered', this.onImageRendered);
        this.element.removeEventListener('mousemove', this.onMouseMove);

        // Disable Cornerstone
        try {
          cornerstone.disable(this.element);
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    },
  },
};
</script>

<style scoped>
.dicom-viewer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
}

.viewport-container {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.cornerstone-viewport {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 1000;
}

.image-info-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  pointer-events: none;
}

.info-section div {
  margin-bottom: 4px;
}

.pixel-probe-overlay {
  position: absolute;
  bottom: 60px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  pointer-events: none;
}

.pixel-probe-overlay div {
  margin-bottom: 2px;
}

.info-bar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #2d2d2d;
  border-top: 1px solid #444;
  color: #ccc;
  font-size: 12px;
}

.info-bar span {
  display: flex;
  align-items: center;
}

.info-bar i {
  margin-right: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .viewer-toolbar {
    flex-wrap: wrap;
  }

  .viewer-toolbar .ml-auto {
    margin-left: 0 !important;
    margin-top: 8px;
    width: 100%;
    justify-content: center;
  }

  .image-info-overlay {
    font-size: 10px;
    padding: 6px;
  }

  .info-bar {
    flex-wrap: wrap;
    font-size: 10px;
  }
}

/* Dark mode button styles */
.viewer-toolbar .btn-outline-primary,
.viewer-toolbar .btn-outline-secondary,
.viewer-toolbar .btn-outline-danger,
.viewer-toolbar .btn-outline-info {
  border-color: #555;
  color: #ccc;
}

.viewer-toolbar .btn-outline-primary:hover,
.viewer-toolbar .btn-outline-secondary:hover,
.viewer-toolbar .btn-outline-danger:hover,
.viewer-toolbar .btn-outline-info:hover {
  background-color: #444;
  border-color: #666;
  color: #fff;
}

.viewer-toolbar .btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}
</style>
