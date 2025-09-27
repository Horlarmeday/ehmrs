<template>
  <div class="export-button-container">
    <b-dropdown
      :disabled="disabled || !hasData"
      variant="outline-primary"
      :size="size"
      :block="block"
      :split="split"
      :text="buttonText"
      @click="handleExport"
    >
      <template v-if="!split" #button-content>
        <i :class="iconClass" class="mr-2"></i>
        {{ buttonText }}
      </template>

      <b-dropdown-item
        v-for="format in availableFormats"
        :key="format"
        @click="exportToFormat(format)"
        :disabled="disabled"
      >
        <i :class="getFormatIcon(format)" class="mr-2"></i>
        Export as {{ format.toUpperCase() }}
      </b-dropdown-item>

      <b-dropdown-divider v-if="showAdvancedOptions"></b-dropdown-divider>

      <b-dropdown-item
        v-if="showAdvancedOptions"
        @click="showAdvancedExport = true"
        :disabled="disabled"
      >
        <i class="fas fa-cog mr-2"></i>
        Advanced Export
      </b-dropdown-item>
    </b-dropdown>

    <!-- Advanced Export Modal -->
    <b-modal
      v-model="showAdvancedExport"
      title="Advanced Export Options"
      size="lg"
      :ok-disabled="!isValidExportData"
      @ok="handleAdvancedExport"
      @cancel="showAdvancedExport = false"
    >
      <div class="advanced-export-form">
        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bold">Export Formats</label>
            <div class="form-group">
              <b-form-checkbox-group
                v-model="selectedFormats"
                :options="formatOptions"
                stacked
              ></b-form-checkbox-group>
            </div>
          </div>

          <div class="col-md-6">
            <label class="font-weight-bold">Export Options</label>
            <div class="form-group">
              <b-form-checkbox v-model="includeMetadata"> Include metadata </b-form-checkbox>
              <b-form-checkbox v-model="includeFilters">
                Include filter information
              </b-form-checkbox>
              <b-form-checkbox v-model="formatDates"> Format dates </b-form-checkbox>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <label class="font-weight-bold">Filename</label>
            <b-form-input
              v-model="customFilename"
              placeholder="Enter custom filename"
            ></b-form-input>
          </div>

          <div class="col-md-6">
            <label class="font-weight-bold">Date Range</label>
            <b-form-input
              v-model="dateRange"
              placeholder="e.g., 2024-01-01 to 2024-01-31"
            ></b-form-input>
          </div>
        </div>

        <div class="row" v-if="hasData">
          <div class="col-12">
            <div class="export-preview">
              <h6>Export Preview</h6>
              <p class="text-muted">
                <strong>{{ data.length }}</strong> records will be exported
              </p>
              <div class="table-responsive" style="max-height: 200px">
                <table class="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th v-for="header in previewHeaders" :key="header">
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in previewData" :key="index">
                      <td v-for="header in previewHeaders" :key="header">
                        {{ formatPreviewValue(row[header]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
export default {
  name: 'ExportButton',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    reportName: {
      type: String,
      required: true,
    },
    formats: {
      type: Array,
      default: () => ['xlsx', 'pdf'],
    },
    buttonText: {
      type: String,
      default: 'Export',
    },
    icon: {
      type: String,
      default: 'fas fa-download',
    },
    size: {
      type: String,
      default: 'md',
    },
    block: {
      type: Boolean,
      default: false,
    },
    split: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showAdvancedOptions: {
      type: Boolean,
      default: true,
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
    formatters: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      showAdvancedExport: false,
      selectedFormats: ['xlsx'],
      includeMetadata: true,
      includeFilters: true,
      formatDates: true,
      customFilename: '',
      dateRange: '',
    };
  },

  computed: {
    hasData() {
      return Array.isArray(this.data) && this.data.length > 0;
    },

    availableFormats() {
      return this.formats.filter((format) => this.$getSupportedFormats().includes(format));
    },

    formatOptions() {
      return this.availableFormats.map((format) => ({
        value: format,
        text: format.toUpperCase(),
      }));
    },

    isValidExportData() {
      return this.hasData && this.selectedFormats.length > 0;
    },

    previewHeaders() {
      if (!this.hasData) return [];
      return Object.keys(this.data[0]).slice(0, 5); // Show first 5 columns
    },

    previewData() {
      if (!this.hasData) return [];
      return this.data.slice(0, 3); // Show first 3 rows
    },

    iconClass() {
      return this.icon;
    },
  },

  methods: {
    handleExport() {
      if (this.split) return; // Let dropdown handle it

      // Default export to first available format
      if (this.availableFormats.length > 0) {
        this.exportToFormat(this.availableFormats[0]);
      }
    },

    async exportToFormat(format) {
      try {
        const filename = this.getFilename(format);
        const options = this.getExportOptions(format);

        await this.$exportData(this.data, filename, format, options);

        this.$logUserAction('Export completed', {
          reportName: this.reportName,
          format,
          recordCount: this.data.length,
        });
      } catch (error) {
        this.$logError('Export failed', error, {
          reportName: this.reportName,
          format,
        });
      }
    },

    async handleAdvancedExport() {
      try {
        const results = [];

        // eslint-disable-next-line no-unused-vars
        for (const format of this.selectedFormats) {
          const filename = this.getFilename(format);
          const options = this.getAdvancedExportOptions(format);

          await this.$exportData(this.data, filename, format, options);
          results.push({ format, success: true });
        }

        this.$toast.success(`Exported ${results.length} format(s) successfully`);
        this.showAdvancedExport = false;

        this.$logUserAction('Advanced export completed', {
          reportName: this.reportName,
          formats: this.selectedFormats,
          recordCount: this.data.length,
        });
      } catch (error) {
        this.$logError('Advanced export failed', error, {
          reportName: this.reportName,
          formats: this.selectedFormats,
        });
      }
    },

    getFilename(format) {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseName = this.customFilename || this.reportName;
      return `${baseName}_${timestamp}.${format}`;
    },

    getExportOptions(format) {
      const options = {};

      if (this.formatDates) {
        options.formatters = this.formatters;
      }

      return options;
    },

    getAdvancedExportOptions(format) {
      const options = this.getExportOptions(format);

      if (this.includeMetadata) {
        options.metadata = {
          reportName: this.reportName,
          exportDate: new Date().toISOString(),
          recordCount: this.data.length,
          generatedBy: 'EHMRS System',
        };
      }

      if (this.includeFilters && Object.keys(this.filters).length > 0) {
        options.filters = this.filters;
      }

      if (this.dateRange) {
        options.dateRange = this.dateRange;
      }

      return options;
    },

    getFormatIcon(format) {
      const icons = {
        csv: 'fas fa-file-csv',
        xlsx: 'fas fa-file-excel',
        pdf: 'fas fa-file-pdf',
        json: 'fas fa-file-code',
      };
      return icons[format] || 'fas fa-file';
    },

    formatPreviewValue(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      if (typeof value === 'string' && value.length > 20) {
        return value.substring(0, 20) + '...';
      }
      return value;
    },
  },
};
</script>

<style scoped>
.export-button-container {
  display: inline-block;
}

.advanced-export-form {
  padding: 1rem 0;
}

.export-preview {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.export-preview h6 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.export-preview .table {
  margin-bottom: 0;
}

.export-preview .table th {
  border-top: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.export-preview .table td {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
