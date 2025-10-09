<template>
  <div class="enhanced-list-section">
    <!-- Section Header -->
    <div v-if="section.title" class="section-header">
      <h5 class="section-title">
        <i class="fas fa-list-ul mr-2"></i>
        {{ section.title }}
      </h5>
    </div>

    <!-- Fields Grid -->
    <div class="fields-grid">
      <div v-for="field in section.fields" :key="field.id" :class="getFieldGridClass(field)">
        <component
          :is="getFieldComponent(field)"
          :field="field"
          :value="result[field.id]"
          :disabled="disabled"
          render-as="list-item"
          @input="handleFieldChange(field.id, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import EnhancedNumberField from '../fields/EnhancedNumberField.vue';
import EnhancedTextField from '../fields/EnhancedTextField.vue';
import EnhancedTextareaField from '../fields/EnhancedTextareaField.vue';
import EnhancedSelectField from '../fields/EnhancedSelectField.vue';
import EnhancedRadioField from '../fields/EnhancedRadioField.vue';
import EnhancedCheckboxField from '../fields/EnhancedCheckboxField.vue';
import EnhancedDateField from '../fields/EnhancedDateField.vue';

export default {
  name: 'EnhancedListSection',
  components: {
    EnhancedNumberField,
    EnhancedTextField,
    EnhancedTextareaField,
    EnhancedSelectField,
    EnhancedRadioField,
    EnhancedCheckboxField,
    EnhancedDateField,
  },
  props: {
    section: {
      type: Object,
      required: true,
    },
    result: {
      type: Object,
      default: () => ({}),
    },
    sectionIndex: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getFieldComponent(field) {
      const componentMap = {
        number: 'EnhancedNumberField',
        text: 'EnhancedTextField',
        textarea: 'EnhancedTextareaField',
        select: 'EnhancedSelectField',
        date: 'EnhancedDateField',
        radio: 'EnhancedRadioField',
        checkbox: 'EnhancedCheckboxField',
      };
      return componentMap[field.type] || 'EnhancedTextField';
    },

    getFieldGridClass(field) {
      if (field.type === 'textarea') {
        return 'field-full';
      }
      return 'field-auto';
    },

    handleFieldChange(fieldId, value) {
      this.$emit('field-change', fieldId, value);
    },
  },
};
</script>

<style scoped>
.enhanced-list-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
  border-left: 4px solid #8b0000;
  transition: box-shadow 0.15s ease;
}

.enhanced-list-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f3f6f9;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #181c32;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #8b0000;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.field-full {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .fields-grid {
    grid-template-columns: 1fr;
  }

  .enhanced-list-section {
    padding: 20px;
  }
}
</style>
