<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row" class="param-cell">
        <span class="param-label">{{ field.label }}</span>
        <i v-if="field.validation?.required" class="fas fa-asterisk text-danger param-required"></i>
      </th>
      <td>
        <input
          type="text"
          class="form-control form-control-sm enhanced-input"
          :value="value"
          :disabled="disabled"
          :placeholder="field.placeholder"
          @input="handleInput"
          :class="{ 'is-invalid': hasError }"
        />
        <span v-if="hasError" class="invalid-feedback">{{ errorMessage }}</span>
      </td>
      <td v-if="field.unit">
        <span class="unit-badge">{{ field.unit }}</span>
      </td>
    </template>

    <template v-else>
      <div class="enhanced-field-wrapper">
        <label class="field-label">
          {{ field.label }}
          <span v-if="field.validation?.required" class="text-danger ml-1">*</span>
        </label>
        <input
          type="text"
          class="form-control enhanced-input"
          :value="value"
          :disabled="disabled"
          :placeholder="field.placeholder || `Enter ${field.label}`"
          @input="handleInput"
          :class="{ 'is-invalid': hasError }"
        />
        <small v-if="field.unit" class="unit-info">Unit: {{ field.unit }}</small>
        <span v-if="hasError" class="error-feedback">{{ errorMessage }}</span>
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'EnhancedTextField',
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

      if (value && this.field.validation?.pattern) {
        const regex = new RegExp(this.field.validation.pattern);
        if (!regex.test(value)) {
          this.errorMessage = `${this.field.label} format is invalid`;
          return false;
        }
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
}

.param-label {
  margin-right: 4px;
}

.param-required {
  font-size: 8px;
  color: #8b0000;
}

.enhanced-input {
  border: 2px solid #e4e6ef;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #181c32;
  background: #fff;
}

.enhanced-input:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.08);
  outline: none;
  background: #fffafa;
}

.unit-badge {
  background: #e6e6fa;
  color: #000080;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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

.unit-info {
  color: #7e8299;
  font-size: 13px;
  padding: 6px 12px;
  background: #f3f6f9;
  border-radius: 6px;
  border-left: 3px solid #000080;
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
</style>
