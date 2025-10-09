<template>
  <div class="dynamic-form-renderer">
    <div v-for="(section, index) in formSchema.sections" :key="`section-${index}`">
      <DynamicSection
        :section="section"
        :result="result"
        :section-index="index"
        :disabled="isDisabled"
        @field-change="handleFieldChange"
      />
    </div>
  </div>
</template>

<script>
import DynamicSection from './sections/DynamicSection.vue';
import { debounce } from '@/common/common';

export default {
  name: 'DynamicFormRenderer',
  components: {
    DynamicSection,
  },
  props: {
    formSchema: {
      type: Object,
      required: true,
      validator(value) {
        // Validate schema structure
        return value.formId && value.formName && value.sections && Array.isArray(value.sections);
      },
    },
    result: {
      type: Object,
      default: () => ({}),
    },
    testId: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
      validator(value) {
        return ['AddResultSection', 'ValidationSection', 'ApprovalSection'].includes(value);
      },
    },
  },
  data() {
    return {
      formData: {},
    };
  },
  computed: {
    isDisabled() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  watch: {
    result: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val && Object.keys(val).length > 0) {
          this.formData = { ...val };
        }
      },
    },
  },
  methods: {
    handleFieldChange(fieldId, value) {
      this.formData[fieldId] = value;
      this.emitFormData();
    },

    emitFormData() {
      this.debounceInput(this);
    },

    debounceInput: debounce((vm) => {
      vm.$emit('emitResult', vm.formData, vm.testId);
    }, 500),

    /**
     * Validate form data against schema
     */
    validateForm() {
      const errors = [];

      this.formSchema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          const value = this.formData[field.id];

          // Required validation
          if (field.validation?.required && !value) {
            errors.push({
              field: field.id,
              message: `${field.label} is required`,
            });
          }

          // Number validation
          if (field.type === 'number' && value) {
            const numValue = Number(value);

            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors.push({
                field: field.id,
                message: `${field.label} must be at least ${field.validation.min}`,
              });
            }

            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors.push({
                field: field.id,
                message: `${field.label} must not exceed ${field.validation.max}`,
              });
            }
          }
        });
      });

      return errors;
    },

    /**
     * Check if value is abnormal based on reference ranges
     */
    isAbnormal(field, value, patientAge, patientSex) {
      if (!field.abnormalDetection?.enabled || !value) return false;
      if (!field.referenceRanges) return false;

      const numValue = Number(value);
      if (isNaN(numValue)) return false;

      let rangeKey = 'normal';

      // Determine which range to use
      if (field.abnormalDetection.ageDependent && field.abnormalDetection.sexDependent) {
        rangeKey = patientAge < 18 ? 'child' : `adult${patientSex}`;
      } else if (field.abnormalDetection.ageDependent) {
        rangeKey = patientAge < 18 ? 'child' : 'adult';
      } else if (field.abnormalDetection.sexDependent) {
        rangeKey = `adult${patientSex}`;
      }

      const range = field.referenceRanges[rangeKey];
      if (!range || (range.min === undefined && range.max === undefined)) return false;

      // Check if value is outside range
      if (range.min !== undefined && numValue < range.min) return true;
      if (range.max !== undefined && numValue > range.max) return true;

      return false;
    },
  },
};
</script>

<style scoped>
.dynamic-form-renderer {
  width: 100%;
}
</style>
