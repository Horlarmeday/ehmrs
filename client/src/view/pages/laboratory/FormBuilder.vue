<template>
  <div class="form-builder-page">
    <div class="builder-header">
      <div class="header-left">
        <button class="btn btn-sm btn-light mr-2" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <h3 class="mb-0">{{ isEditMode ? 'Edit' : 'Create' }} Form Template</h3>
      </div>
      <div class="header-right">
        <button class="btn btn-sm btn-light-primary mr-2" @click="previewForm">
          <i class="fas fa-eye"></i> Preview
        </button>
        <button class="btn btn-sm btn-light-warning mr-2" @click="saveAsDraft" :disabled="saving">
          <i class="fas fa-save"></i> Save Draft
        </button>
        <button class="btn btn-sm btn-primary" @click="publishTemplate" :disabled="saving">
          <i class="fas fa-check"></i> Publish
        </button>
      </div>
    </div>

    <div class="builder-content">
      <!-- Template Settings Panel -->
      <div class="settings-panel">
        <div class="card card-custom">
          <div class="card-body">
            <h5 class="mb-4">Template Settings</h5>

            <div class="form-group">
              <label>Template Name *</label>
              <input
                type="text"
                class="form-control"
                v-model="template.name"
                placeholder="e.g., Full Blood Count"
              />
            </div>

            <div class="form-group">
              <label>Template Code *</label>
              <input
                type="text"
                class="form-control"
                v-model="template.code"
                placeholder="e.g., FBC"
                :disabled="isEditMode"
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                class="form-control"
                v-model="template.description"
                rows="3"
                placeholder="Describe what this form is used for"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Category</label>
              <select class="form-control" v-model="template.category">
                <option value="">Select Category</option>
                <option value="Hematology">Hematology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Serology">Serology</option>
                <option value="Hormones">Hormones</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Form Type</label>
              <select class="form-control" v-model="formSchema.formType">
                <option value="table">Table Layout</option>
                <option value="list">List Layout</option>
                <option value="grouped">Grouped Layout</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Builder Area -->
      <div class="builder-area">
        <div class="row h-100">
          <!-- Field Palette -->
          <div class="col-md-3">
            <FieldPalette @drag-start="onFieldDragStart" />
          </div>

          <!-- Canvas -->
          <div class="col-md-6">
            <div class="canvas-container">
              <div class="canvas-header">
                <h5>Form Canvas</h5>
                <button class="btn btn-sm btn-light-primary" @click="addSection">
                  <i class="fas fa-plus"></i> Add Section
                </button>
              </div>

              <div class="canvas-content">
                <!-- Sections -->
                <div
                  v-for="(section, sectionIndex) in formSchema.sections"
                  :key="section.id"
                  class="section-container"
                >
                  <div class="section-header">
                    <input
                      type="text"
                      class="section-title-input"
                      v-model="section.title"
                      placeholder="Section Title (optional)"
                    />
                    <div class="section-actions">
                      <button
                        class="btn btn-sm btn-icon btn-light"
                        @click="moveSectionUp(sectionIndex)"
                        v-if="sectionIndex > 0"
                      >
                        <i class="fas fa-arrow-up"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-icon btn-light"
                        @click="moveSectionDown(sectionIndex)"
                        v-if="sectionIndex < formSchema.sections.length - 1"
                      >
                        <i class="fas fa-arrow-down"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-icon btn-light-danger"
                        @click="removeSection(sectionIndex)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Drop Zone -->
                  <div
                    class="drop-zone"
                    @dragover.prevent="onDragOver"
                    @drop="onDrop($event, sectionIndex)"
                    :class="{ 'drag-over': isDraggingOver }"
                  >
                    <div v-if="section.fields.length === 0" class="drop-zone-empty">
                      <i class="fas fa-hand-pointer fa-2x text-muted mb-2"></i>
                      <p class="text-muted">Drag fields here</p>
                    </div>

                    <!-- Fields -->
                    <div
                      v-for="(field, fieldIndex) in section.fields"
                      :key="field.id"
                      class="field-item"
                      :class="{ selected: selectedField === field }"
                      @click="selectField(field, sectionIndex, fieldIndex)"
                      draggable="true"
                      @dragstart="onFieldReorder($event, sectionIndex, fieldIndex)"
                    >
                      <div class="field-icon">
                        <i :class="getFieldIcon(field.type)"></i>
                      </div>
                      <div class="field-info">
                        <div class="field-label">{{ field.label }}</div>
                        <small class="field-type">{{ field.type }}</small>
                      </div>
                      <div class="field-actions">
                        <button
                          class="btn btn-sm btn-icon btn-light-danger"
                          @click.stop="removeField(sectionIndex, fieldIndex)"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="formSchema.sections.length === 0" class="empty-canvas">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p class="text-muted">Click "Add Section" to start building your form</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Property Panel -->
          <div class="col-md-3">
            <PropertyPanel
              :selected-field="selectedField"
              @field-updated="onFieldUpdated"
              @delete-field="deleteSelectedField"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FieldPalette from '@/components/laboratory/form-builder/FieldPalette.vue';
import PropertyPanel from '@/components/laboratory/form-builder/PropertyPanel.vue';
import { notifyGeneralError, notifyGeneralSuccess } from '@/common/common';

export default {
  name: 'FormBuilder',
  components: {
    FieldPalette,
    PropertyPanel,
  },
  data() {
    return {
      template: {
        name: '',
        code: '',
        description: '',
        category: '',
        version: '1.0',
        is_active: false,
      },
      formSchema: {
        formId: '',
        formName: '',
        formType: 'list',
        version: '1.0',
        sections: [],
      },
      selectedField: null,
      selectedSectionIndex: null,
      selectedFieldIndex: null,
      isDraggingOver: false,
      draggedField: null,
      saving: false,
      isEditMode: false,
    };
  },
  methods: {
    onFieldDragStart(fieldConfig) {
      this.draggedField = fieldConfig;
    },

    onDragOver(event) {
      event.preventDefault();
      this.isDraggingOver = true;
    },

    onDrop(event, sectionIndex) {
      event.preventDefault();
      this.isDraggingOver = false;

      try {
        const fieldData = JSON.parse(event.dataTransfer.getData('application/json'));
        this.formSchema.sections[sectionIndex].fields.push(fieldData);
      } catch (error) {
        console.error('Error dropping field:', error);
      }
    },

    onFieldReorder(event, sectionIndex, fieldIndex) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('field-reorder', JSON.stringify({ sectionIndex, fieldIndex }));
    },

    selectField(field, sectionIndex, fieldIndex) {
      this.selectedField = field;
      this.selectedSectionIndex = sectionIndex;
      this.selectedFieldIndex = fieldIndex;
    },

    onFieldUpdated(updatedField) {
      console.log(updatedField);
      // Field is already updated by reference
    },

    deleteSelectedField() {
      if (this.selectedSectionIndex !== null && this.selectedFieldIndex !== null) {
        this.removeField(this.selectedSectionIndex, this.selectedFieldIndex);
      }
    },

    addSection() {
      const sectionId = `section_${Date.now()}`;
      this.formSchema.sections.push({
        id: sectionId,
        title: '',
        type: this.formSchema.formType,
        fields: [],
      });
    },

    removeSection(index) {
      this.formSchema.sections.splice(index, 1);
      if (this.selectedSectionIndex === index) {
        this.selectedField = null;
        this.selectedSectionIndex = null;
        this.selectedFieldIndex = null;
      }
    },

    moveSectionUp(index) {
      if (index > 0) {
        const temp = this.formSchema.sections[index];
        this.$set(this.formSchema.sections, index, this.formSchema.sections[index - 1]);
        this.$set(this.formSchema.sections, index - 1, temp);
      }
    },

    moveSectionDown(index) {
      if (index < this.formSchema.sections.length - 1) {
        const temp = this.formSchema.sections[index];
        this.$set(this.formSchema.sections, index, this.formSchema.sections[index + 1]);
        this.$set(this.formSchema.sections, index + 1, temp);
      }
    },

    removeField(sectionIndex, fieldIndex) {
      this.formSchema.sections[sectionIndex].fields.splice(fieldIndex, 1);
      if (this.selectedSectionIndex === sectionIndex && this.selectedFieldIndex === fieldIndex) {
        this.selectedField = null;
        this.selectedSectionIndex = null;
        this.selectedFieldIndex = null;
      }
    },

    getFieldIcon(type) {
      const icons = {
        number: 'fas fa-hashtag',
        text: 'fas fa-font',
        textarea: 'fas fa-align-left',
        select: 'fas fa-list',
        radio: 'fas fa-dot-circle',
        checkbox: 'fas fa-check-square',
        date: 'fas fa-calendar',
      };
      return icons[type] || 'fas fa-question';
    },

    async previewForm() {
      // Save current state to store before previewing
      if (!this.validateTemplate()) {
        notifyGeneralError(
          'Please complete template settings and add at least one field before previewing'
        );
        return;
      }

      // Temporarily save schema to store for preview
      this.formSchema.formId = this.template.code || 'preview';
      this.formSchema.formName = this.template.name || 'Preview';

      // Store in session storage for preview access
      sessionStorage.setItem(
        'previewFormSchema',
        JSON.stringify({
          template: this.template,
          schema: this.formSchema,
        })
      );

      // Open preview in new tab
      const route = this.$router.resolve({
        name: 'form-template-preview',
        params: { id: 'preview' },
      });
      window.open(route.href, '_blank');
    },

    async saveAsDraft() {
      await this.saveTemplate(false);
    },

    async publishTemplate() {
      await this.saveTemplate(true);
    },

    async saveTemplate(publish) {
      if (!this.validateTemplate()) {
        return;
      }

      this.saving = true;
      try {
        this.formSchema.formId = this.template.code;
        this.formSchema.formName = this.template.name;

        const payload = {
          ...this.template,
          schema_json: this.formSchema,
          is_active: publish,
        };

        if (this.isEditMode) {
          await this.$store.dispatch('laboratory/updateFormTemplate', payload);
          notifyGeneralSuccess('Template updated successfully');
        } else {
          await this.$store.dispatch('laboratory/createFormTemplate', payload);
          notifyGeneralSuccess('Template created successfully');
        }

        this.$router.push('/laboratory/form-templates');
      } catch (error) {
        notifyGeneralError(error.message || 'Failed to save template');
      } finally {
        this.saving = false;
      }
    },

    validateTemplate() {
      if (!this.template.name) {
        notifyGeneralError('Template name is required');
        return false;
      }
      if (!this.template.code) {
        notifyGeneralError('Template code is required');
        return false;
      }
      if (this.formSchema.sections.length === 0) {
        notifyGeneralError('Please add at least one section');
        return false;
      }
      const hasFields = this.formSchema.sections.some((s) => s.fields.length > 0);
      if (!hasFields) {
        notifyGeneralError('Please add at least one field to your form');
        return false;
      }
      return true;
    },

    goBack() {
      this.$router.go(-1);
    },

    async loadTemplate() {
      const templateId = this.$route.params.id;
      if (templateId) {
        this.isEditMode = true;
        try {
          const response = await this.$store.dispatch(
            'laboratory/fetchFormTemplateById',
            templateId
          );
          const templateData = response.data.data;
          this.template = {
            id: templateData.id,
            name: templateData.name,
            code: templateData.code,
            description: templateData.description,
            category: templateData.category,
            version: templateData.version,
            is_active: templateData.is_active,
          };
          this.formSchema = JSON.parse(JSON.stringify(templateData.schema_json));
        } catch (error) {
          notifyGeneralError('Failed to load template');
          this.goBack();
        }
      }
    },
  },
  created() {
    this.loadTemplate();
  },
};
</script>

<style scoped>
.form-builder-page {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.builder-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.settings-panel {
  margin-bottom: 20px;
}

.builder-area {
  height: calc(100vh - 280px);
}

.canvas-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 2px solid #e0e0e0;
}

.canvas-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.section-container {
  margin-bottom: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.section-title-input {
  flex: 1;
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 14px;
  padding: 5px;
}

.section-actions button {
  margin-left: 5px;
}

.drop-zone {
  min-height: 100px;
  padding: 15px;
  transition: background 0.2s;
}

.drop-zone.drag-over {
  background: #f1f8ff;
  border: 2px dashed #3699ff;
}

.drop-zone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.field-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.field-item:hover {
  border-color: #3699ff;
  box-shadow: 0 2px 8px rgba(54, 153, 255, 0.2);
}

.field-item.selected {
  border-color: #3699ff;
  background: #f1f8ff;
}

.field-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f8;
  border-radius: 6px;
  margin-right: 12px;
}

.field-icon i {
  color: #3699ff;
}

.field-info {
  flex: 1;
}

.field-label {
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 2px;
}

.field-type {
  color: #b5b5c3;
  font-size: 11px;
  text-transform: uppercase;
}

.empty-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
</style>
