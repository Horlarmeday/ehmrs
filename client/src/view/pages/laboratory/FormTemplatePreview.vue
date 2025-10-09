<template>
  <div class="form-preview-page">
    <!-- Header -->
    <div class="preview-header">
      <div class="header-left">
        <button class="btn btn-sm btn-light mr-3" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <div v-if="template">
          <h3 class="mb-1">{{ template.name }}</h3>
          <div class="template-meta">
            <span class="badge badge-light-primary mr-2">
              <i class="fas fa-code"></i> {{ template.code }}
            </span>
            <span class="badge badge-light-info mr-2" v-if="template.category">
              <i class="fas fa-tag"></i> {{ template.category }}
            </span>
            <span class="badge badge-light-secondary mr-2">
              <i class="fas fa-code-branch"></i> v{{ template.version }}
            </span>
            <span :class="template.is_active ? 'badge badge-success' : 'badge badge-danger'">
              {{ template.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-sm btn-light-warning mr-2" @click="editTemplate" v-if="template">
          <i class="fas fa-edit"></i> Edit Template
        </button>
        <button class="btn btn-sm btn-light-info mr-2" @click="printPreview">
          <i class="fas fa-print"></i> Print
        </button>
        <button class="btn btn-sm btn-light-primary" @click="exportJSON" v-if="template">
          <i class="fas fa-download"></i> Export JSON
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="preview-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading template preview...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="preview-error">
      <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
      <h4>Failed to Load Template</h4>
      <p class="text-muted">{{ error }}</p>
      <button class="btn btn-primary mt-3" @click="goBack">Go Back</button>
    </div>

    <!-- Preview Content -->
    <div v-else-if="template && formSchema" class="preview-content">
      <div class="preview-container">
        <!-- Template Information Card -->
        <div class="card card-custom mb-5">
          <div class="card-body">
            <h5 class="card-title mb-3">Template Information</h5>
            <div class="row">
              <div class="col-md-6">
                <div class="info-item">
                  <label>Template Name:</label>
                  <span>{{ template.name }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <label>Template Code:</label>
                  <span>{{ template.code }}</span>
                </div>
              </div>
              <div class="col-md-12 mt-3" v-if="template.description">
                <div class="info-item">
                  <label>Description:</label>
                  <span>{{ template.description }}</span>
                </div>
              </div>
              <div class="col-md-4 mt-3">
                <div class="info-item">
                  <label>Category:</label>
                  <span>{{ template.category || 'N/A' }}</span>
                </div>
              </div>
              <div class="col-md-4 mt-3">
                <div class="info-item">
                  <label>Form Type:</label>
                  <span class="text-capitalize">{{ formSchema.formType }}</span>
                </div>
              </div>
              <div class="col-md-4 mt-3">
                <div class="info-item">
                  <label>Total Fields:</label>
                  <span>{{ totalFields }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Preview Card -->
        <div class="card card-custom" id="form-preview-printable">
          <div class="card-header">
            <div class="card-title">
              <h5>Form Preview</h5>
            </div>
            <div class="card-toolbar">
              <small class="text-muted">
                Preview how this form will appear to lab technicians
              </small>
            </div>
          </div>
          <div class="card-body">
            <DynamicFormRenderer
              :form-schema="formSchema"
              :result="sampleData"
              :test-id="0"
              section="AddResultSection"
            />
          </div>
        </div>

        <!-- Sample Data Toggle -->
        <div class="card card-custom mt-5">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">Sample Data</h6>
                <small class="text-muted"> Toggle to see form with sample values </small>
              </div>
              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="sampleDataToggle"
                  v-model="showSampleData"
                  @change="toggleSampleData"
                />
                <label class="custom-control-label" for="sampleDataToggle">
                  {{ showSampleData ? 'Hide' : 'Show' }} Sample Data
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- JSON Schema (Collapsible) -->
        <div class="card card-custom mt-5">
          <div class="card-header" @click="showJSON = !showJSON" style="cursor: pointer">
            <div class="card-title">
              <h6>
                <i :class="showJSON ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                JSON Schema
              </h6>
            </div>
          </div>
          <div class="card-body" v-if="showJSON">
            <pre class="json-preview">{{ JSON.stringify(formSchema, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DynamicFormRenderer from '@/components/laboratory/dynamic-form/DynamicFormRenderer.vue';
import { notifyGeneralError } from '@/common/common';

export default {
  name: 'FormTemplatePreview',
  components: {
    DynamicFormRenderer,
  },
  data() {
    return {
      template: null,
      formSchema: null,
      loading: false,
      error: null,
      showSampleData: false,
      sampleData: {},
      showJSON: false,
    };
  },
  computed: {
    totalFields() {
      if (!this.formSchema || !this.formSchema.sections) return 0;
      return this.formSchema.sections.reduce(
        (total, section) => total + (section.fields?.length || 0),
        0
      );
    },
  },
  methods: {
    async loadTemplate() {
      const templateId = this.$route.params.id;
      if (!templateId) {
        this.error = 'No template ID provided';
        return;
      }

      // Check if this is a preview from the builder
      if (templateId === 'preview') {
        const previewData = sessionStorage.getItem('previewFormSchema');
        if (previewData) {
          const { template, schema } = JSON.parse(previewData);
          this.template = {
            ...template,
            is_active: false,
            version: template.version || '1.0',
          };
          this.formSchema = schema;
          return;
        } else {
          this.error = 'No preview data found. Please return to the form builder.';
          return;
        }
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await this.$store.dispatch('laboratory/fetchFormTemplateById', templateId);

        if (response.data && response.data.data) {
          this.template = response.data.data;
          this.formSchema = this.template.schema_json;
        } else {
          this.error = 'Template not found';
        }
      } catch (error) {
        this.error = error.message || 'Failed to load template';
        notifyGeneralError(this.error);
      } finally {
        this.loading = false;
      }
    },

    toggleSampleData() {
      if (this.showSampleData) {
        this.generateSampleData();
      } else {
        this.sampleData = {};
      }
    },

    generateSampleData() {
      const data = {};

      if (!this.formSchema || !this.formSchema.sections) return;

      this.formSchema.sections.forEach((section) => {
        section.fields?.forEach((field) => {
          switch (field.type) {
            case 'number':
              // Generate sample number within reference range if available
              if (field.referenceRanges?.adultMale) {
                const range = field.referenceRanges.adultMale;
                const min = range.min || 0;
                const max = range.max || 100;
                data[field.id] = ((min + max) / 2).toFixed(field.validation?.decimalPlaces || 2);
              } else {
                data[field.id] = '50.00';
              }
              break;

            case 'text':
              data[field.id] = `Sample ${field.label}`;
              break;

            case 'textarea':
              data[field.id] = `Sample ${field.label} text area content`;
              break;

            case 'select':
              if (field.options && field.options.length > 0) {
                data[field.id] = field.options[0].value;
              }
              break;

            case 'radio':
              if (field.options && field.options.length > 0) {
                data[field.id] = field.options[0].value;
              }
              break;

            case 'checkbox':
              if (field.options && field.options.length > 0) {
                data[field.id] = [field.options[0].value];
              }
              break;

            case 'date':
              data[field.id] = new Date().toISOString().split('T')[0];
              break;

            default:
              data[field.id] = '';
          }
        });
      });

      this.sampleData = data;
    },

    goBack() {
      this.$router.go(-1);
    },

    editTemplate() {
      this.$router.push(`/laboratory/form-templates/${this.template.id}/edit`);
    },

    printPreview() {
      window.print();
    },

    exportJSON() {
      const dataStr = JSON.stringify(this.formSchema, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.template.code}_schema.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  },
  created() {
    this.loadTemplate();
  },
};
</script>

<style scoped>
.form-preview-page {
  min-height: calc(100vh - 100px);
  background: #f8f9fa;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.preview-loading,
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.preview-content {
  padding: 30px;
}

.preview-container {
  max-width: 1200px;
  margin: 0 auto;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #5e6278;
  font-size: 13px;
  margin-bottom: 5px;
}

.info-item span {
  color: #3f4254;
  font-size: 14px;
}

.json-preview {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 6px;
  font-size: 12px;
  max-height: 500px;
  overflow: auto;
  font-family: 'Courier New', monospace;
}

/* Print Styles */
@media print {
  .preview-header,
  .template-meta,
  .card:not(#form-preview-printable) {
    display: none !important;
  }

  .preview-content {
    padding: 0;
  }

  .card-header {
    background: white !important;
    border: none !important;
  }
}
</style>
