<template>
  <div class="field-palette">
    <div class="palette-header">
      <h5>Field Types</h5>
      <small class="text-muted">Drag fields to the canvas</small>
    </div>

    <div class="field-types">
      <div
        v-for="fieldType in fieldTypes"
        :key="fieldType.type"
        class="field-type-item"
        draggable="true"
        @dragstart="onDragStart($event, fieldType)"
      >
        <div class="field-icon">
          <i :class="fieldType.icon"></i>
        </div>
        <div class="field-info">
          <div class="field-name">{{ fieldType.name }}</div>
          <small class="field-description">{{ fieldType.description }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FieldPalette',
  data() {
    return {
      fieldTypes: [
        {
          type: 'number',
          name: 'Number',
          icon: 'fas fa-hashtag',
          description: 'Numeric values with validation',
          defaultConfig: {
            label: 'Number Field',
            type: 'number',
            unit: '',
            placeholder: '',
            description: '',
            validation: {
              required: false,
              min: undefined,
              max: undefined,
              decimalPlaces: 2,
            },
            referenceRanges: {},
            abnormalDetection: {
              enabled: false,
              ageDependent: false,
              sexDependent: false,
            },
          },
        },
        {
          type: 'text',
          name: 'Text',
          icon: 'fas fa-font',
          description: 'Single line text input',
          defaultConfig: {
            label: 'Text Field',
            type: 'text',
            placeholder: '',
            description: '',
            validation: {
              required: false,
              pattern: '',
            },
          },
        },
        {
          type: 'textarea',
          name: 'Textarea',
          icon: 'fas fa-align-left',
          description: 'Multi-line text area',
          defaultConfig: {
            label: 'Textarea Field',
            type: 'textarea',
            placeholder: '',
            description: '',
            rows: 4,
            validation: {
              required: false,
            },
          },
        },
        {
          type: 'select',
          name: 'Select',
          icon: 'fas fa-list',
          description: 'Dropdown selection',
          defaultConfig: {
            label: 'Select Field',
            type: 'select',
            placeholder: 'Select an option',
            description: '',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
            validation: {
              required: false,
            },
          },
        },
        {
          type: 'radio',
          name: 'Radio',
          icon: 'fas fa-dot-circle',
          description: 'Radio button group',
          defaultConfig: {
            label: 'Radio Field',
            type: 'radio',
            description: '',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
            validation: {
              required: false,
            },
          },
        },
        {
          type: 'checkbox',
          name: 'Checkbox',
          icon: 'fas fa-check-square',
          description: 'Multiple selection checkboxes',
          defaultConfig: {
            label: 'Checkbox Field',
            type: 'checkbox',
            description: '',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ],
            validation: {
              required: false,
            },
          },
        },
        {
          type: 'date',
          name: 'Date',
          icon: 'fas fa-calendar',
          description: 'Date picker input',
          defaultConfig: {
            label: 'Date Field',
            type: 'date',
            description: '',
            validation: {
              required: false,
            },
          },
        },
      ],
    };
  },
  methods: {
    onDragStart(event, fieldType) {
      const fieldId = `field_${Date.now()}`;
      const fieldConfig = {
        id: fieldId,
        ...fieldType.defaultConfig,
      };

      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('application/json', JSON.stringify(fieldConfig));
      event.dataTransfer.setData('field-type', fieldType.type);

      this.$emit('drag-start', fieldConfig);
    },
  },
};
</script>

<style scoped>
.field-palette {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
}

.palette-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
}

.palette-header h5 {
  margin: 0 0 5px 0;
  font-weight: 600;
}

.field-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-type-item {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  cursor: grab;
  transition: all 0.2s;
}

.field-type-item:hover {
  border-color: #3699ff;
  box-shadow: 0 3px 10px rgba(54, 153, 255, 0.2);
  transform: translateY(-2px);
}

.field-type-item:active {
  cursor: grabbing;
}

.field-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f8;
  border-radius: 6px;
  margin-right: 12px;
}

.field-icon i {
  font-size: 18px;
  color: #3699ff;
}

.field-info {
  flex: 1;
}

.field-name {
  font-weight: 600;
  color: #3f4254;
  margin-bottom: 3px;
}

.field-description {
  color: #b5b5c3;
  font-size: 12px;
  line-height: 1.3;
}
</style>
