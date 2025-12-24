<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <!-- Table Row Rendering -->
      <th scope="row" class="param-cell">
        <div class="param-content">
          <span class="param-label">{{ field.label }}</span>
          <i
            v-if="field.validation?.required"
            class="fas fa-asterisk text-danger param-required"
          ></i>
        </div>
      </th>
      <td class="result-cell">
        <div class="input-container" :class="{ 'has-abnormal': isAbnormal }">
          <input
            type="number"
            class="form-control form-control-sm enhanced-input"
            :value="value"
            :disabled="disabled"
            :placeholder="field.placeholder"
            :min="field.validation?.min"
            :max="field.validation?.max"
            :step="getStep"
            @input="handleInput"
            :class="{ 'is-invalid': hasError, 'is-abnormal': isAbnormal }"
          />
          <span v-if="isAbnormal" class="abnormal-indicator">
            <i class="fas fa-exclamation-circle"></i>
          </span>
        </div>
        <span v-if="hasError" class="invalid-feedback">{{ errorMessage }}</span>
      </td>
      <td v-for="(range, key) in displayRanges" :key="key" class="range-cell">
        <span class="range-value">{{ range }}</span>
      </td>
      <td v-if="field.unit" class="unit-cell">
        <span class="unit-badge">{{ field.unit }}</span>
      </td>
    </template>

    <template v-else>
      <!-- List Item Rendering -->
      <div class="enhanced-field-wrapper">
        <label class="field-label">
          {{ field.label }}
          <span v-if="field.validation?.required" class="text-danger ml-1">*</span>
        </label>

        <div class="input-group-enhanced">
          <input
            type="number"
            class="form-control enhanced-input"
            :value="value"
            :disabled="disabled"
            :placeholder="field.placeholder || `Enter ${field.label}`"
            :min="field.validation?.min"
            :max="field.validation?.max"
            :step="getStep"
            @input="handleInput"
            :class="{ 'is-invalid': hasError, 'is-abnormal': isAbnormal }"
          />
          <div v-if="field.unit" class="input-group-append">
            <span class="input-group-text unit-text">{{ field.unit }}</span>
          </div>
        </div>

        <!-- Reference Range Display -->
        <div v-if="referenceRangeText" class="ref-range-info">
          <i class="fas fa-info-circle"></i>
          <span>Normal range: {{ referenceRangeText }}</span>
        </div>

        <!-- Abnormal Warning -->
        <div v-if="isAbnormal" class="abnormal-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Value is outside normal range</span>
        </div>

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
  name: 'EnhancedNumberField',
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      type: [String, Number],
      default: null,
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

    getStep() {
      if (this.field.validation?.decimalPlaces !== undefined) {
        return Math.pow(10, -this.field.validation.decimalPlaces);
      }
      return 'any';
    },

    hasError() {
      return !!this.errorMessage;
    },

    isAbnormal() {
      if (!this.field.abnormalDetection?.enabled || !this.value) return false;
      if (!this.field.referenceRanges) return false;

      const numValue = Number(this.value);
      if (isNaN(numValue)) return false;

      // Get appropriate range (simplified - would need patient data for full implementation)
      const range = this.field.referenceRanges.adultMale || this.field.referenceRanges.normal;
      if (!range) return false;

      if (range.min !== undefined && numValue < range.min) return true;
      if (range.max !== undefined && numValue > range.max) return true;

      return false;
    },

    displayRanges() {
      if (!this.field.referenceRanges) return {};

      const ranges = {};
      Object.keys(this.field.referenceRanges).forEach((key) => {
        ranges[key] = this.field.referenceRanges[key].display;
      });
      return ranges;
    },

    referenceRangeText() {
      if (!this.field.referenceRanges) return '';

      const range = this.field.referenceRanges.normal || this.field.referenceRanges.adultMale;
      return range?.display || '';
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

      if (value) {
        const numValue = Number(value);

        if (this.field.validation?.min !== undefined && numValue < this.field.validation.min) {
          this.errorMessage = `Minimum value is ${this.field.validation.min}`;
          return false;
        }

        if (this.field.validation?.max !== undefined && numValue > this.field.validation.max) {
          this.errorMessage = `Maximum value is ${this.field.validation.max}`;
          return false;
        }
      }

      return true;
    },
  },
};
</script>

<style scoped>
/* Table Row Styles */
.param-cell {
  font-weight: 500 !important;
  color: #181c32;
}

.param-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-required {
  font-size: 8px;
  margin-left: 2px;
  color: #8b0000;
}

.result-cell {
  position: relative;
}

.input-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.input-container.has-abnormal {
  animation: pulse-warning 2.5s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

.enhanced-input {
  border: 2px solid #e4e6ef;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  color: #181c32;
  background: #fff;
}

.enhanced-input:focus {
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.08);
  outline: none;
  background: #fffafa;
}

.enhanced-input.is-abnormal {
  border-color: #cd5c5c;
  background-color: #fff5ee;
}

.enhanced-input.is-abnormal:focus {
  border-color: #cd5c5c;
  box-shadow: 0 0 0 4px rgba(205, 92, 92, 0.12);
}

.abnormal-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #cd5c5c;
  font-size: 15px;
  pointer-events: none;
}

.range-cell {
  text-align: center;
  color: #7e8299;
  font-size: 13px;
}

.range-value {
  padding: 5px 10px;
  background: #f3f6f9;
  border-radius: 6px;
  display: inline-block;
  font-weight: 500;
}

.unit-cell {
  text-align: center;
}

.unit-badge {
  background: #e6e6fa;
  color: #000080;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* List Item Styles */
.enhanced-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #3f4254;
  margin-bottom: 4px;
}

.input-group-enhanced {
  display: flex;
}

.input-group-append {
  display: flex;
}

.input-group-text {
  background: #f3f6f9;
  border: 2px solid #e4e6ef;
  border-left: none;
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
}

.unit-text {
  color: #7e8299;
  font-size: 13px;
  font-weight: 500;
}

.ref-range-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #7e8299;
  padding: 10px 14px;
  background: #f3f6f9;
  border-radius: 6px;
  border-left: 3px solid #000080;
}

.ref-range-info i {
  color: #000080;
}

.abnormal-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cd5c5c;
  padding: 10px 14px;
  background: #fff5ee;
  border-left: 3px solid #cd5c5c;
  border-radius: 6px;
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
