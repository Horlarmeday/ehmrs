<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row" class="param-cell">{{ field.label }}</th>
      <td :colspan="colspan">
        <textarea
          class="form-control form-control-sm enhanced-textarea"
          :value="value"
          :disabled="disabled"
          :placeholder="field.placeholder"
          :rows="field.rows || 3"
          @input="handleInput"
          :class="{ 'is-invalid': hasError }"
        ></textarea>
        <span v-if="hasError" class="invalid-feedback">{{ errorMessage }}</span>
      </td>
    </template>

    <template v-else>
      <div class="enhanced-field-wrapper">
        <label class="field-label">
          {{ field.label }}
          <span v-if="field.validation?.required" class="text-danger ml-1">*</span>
        </label>
        <textarea
          class="form-control enhanced-textarea"
          :value="value"
          :disabled="disabled"
          :placeholder="field.placeholder || `Enter ${field.label}`"
          :rows="field.rows || 4"
          @input="handleInput"
          :class="{ 'is-invalid': hasError }"
        ></textarea>
        <span v-if="hasError" class="error-feedback">{{ errorMessage }}</span>
        <div v-if="field.description" class="field-description">
          <div class="description-content">{{ field.description }}</div>
        </div>
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'EnhancedTextareaField',
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    renderAs: {
      type: String,
      default: 'list-item',
    },
    colspan: {
      type: Number,
      default: 6,
    },
  },
  data() {
    return {
      errorMessage: '',
    };
  },
  computed: {
    wrapperComponent() {
      return this.renderAs === 'table-row' ? 'tr' : 'div';
    },

    wrapperProps() {
      return this.renderAs === 'table-row' ? {} : { class: 'form-group' };
    },

    hasError() {
      return !!this.errorMessage;
    },
  },
  methods: {
    handleInput(event) {
      const inputValue = event.target.value;
      this.validate(inputValue);
      this.$emit('input', inputValue);
    },

    validate(value) {
      this.errorMessage = '';

      if (!value && this.field.validation?.required) {
        this.errorMessage = `${this.field.label} is required`;
        return false;
      }

      return true;
    },
  },
};
</script>

<style scoped>
.param-cell {
  font-weight: 500 !important;
  color: #181c32;
  vertical-align: top;
  padding-top: 14px !important;
}

.enhanced-textarea {
  border: 2px solid #e4e6ef;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  resize: vertical;
  color: #181c32;
  background: #fff;
  line-height: 1.5;
}

.enhanced-textarea:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.08);
  outline: none;
  background: #fffafa;
}

.enhanced-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #3f4254;
  margin-bottom: 0;
}

.error-feedback {
  color: #8b0000;
  font-size: 13px;
  display: block;
  margin-top: 4px;
}

.invalid-feedback {
  color: #8b0000;
  font-size: 13px;
  margin-top: 4px;
}

.field-description {
  margin-top: 10px;
  padding: 12px;
  background-color: #f8f9fa;
  border-left: 3px solid #8b0000;
  border-radius: 4px;
}

.description-content {
  font-size: 13px;
  color: #5e6278;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}
</style>
