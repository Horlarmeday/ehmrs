<template>
  <div v-if="shouldShowSection" class="enhanced-conditional-section">
    <!-- Section Header with Toggle -->
    <div v-if="section.title" class="section-header" @click="toggleSection">
      <h6 class="section-title">
        <i :class="isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="mr-2"></i>
        {{ section.title }}
      </h6>
    </div>

    <!-- Collapsible Content -->
    <div v-if="isExpanded" class="section-content">
      <div class="fields-list">
        <div v-for="field in section.fields" :key="field.id" class="field-item">
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
  name: 'EnhancedConditionalSection',
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
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    shouldShowSection() {
      // Show if section has any values OR if we're in add mode
      const hasValues = this.section.fields.some((field) => this.result[field.id]);
      return hasValues || !this.disabled;
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

    toggleSection() {
      this.isExpanded = !this.isExpanded;
    },

    handleFieldChange(fieldId, value) {
      this.$emit('field-change', fieldId, value);
    },
  },
};
</script>

<style scoped>
.enhanced-conditional-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
  border: 2px solid #e4e6ef;
  transition: all 0.15s ease;
}

.enhanced-conditional-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #8b0000;
}

.section-header {
  background: #f3f6f9;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.section-header:hover {
  background: #ebedf3;
  border-left-color: #8b0000;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #3f4254;
  margin: 0;
  transition: color 0.2s ease;
}

.section-header:hover .section-title {
  color: #181c32;
}

.section-title i {
  color: #8b0000;
  transition: transform 0.3s ease;
}

.section-content {
  padding: 20px;
  animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-item {
  width: 100%;
}
</style>
