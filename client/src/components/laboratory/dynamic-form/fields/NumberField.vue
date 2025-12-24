<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row">{{ field.label }}</th>
      <td>
        <input
          type="number"
          class="form-control form-control-sm"
          :value="value"
          :disabled="disabled"
          :placeholder="field.placeholder"
          :min="field.validation?.min"
          :max="field.validation?.max"
          :step="getStep"
          @input="handleInput"
          :class="{ 'is-invalid': hasError, 'is-abnormal': isAbnormal }"
        />
        <span v-if="hasError" class="invalid-feedback">{{ errorMessage }}</span>
      </td>
      <td v-for="(range, key) in displayRanges" :key="key">
        {{ range }}
      </td>
      <td v-if="field.unit">{{ field.unit }}</td>
    </template>

    <template v-else>
      <label>{{ field.label }}</label>
      <input
        type="number"
        class="form-control"
        :value="value"
        :disabled="disabled"
        :placeholder="field.placeholder || `Enter ${field.label}`"
        :min="field.validation?.min"
        :max="field.validation?.max"
        :step="getStep"
        @input="handleInput"
        :class="{ 'is-invalid': hasError, 'is-abnormal': isAbnormal }"
      />
      <small v-if="field.unit" class="form-text text-muted">Unit: {{ field.unit }}</small>
      <small v-if="referenceRangeText" class="form-text text-muted">
        Range: {{ referenceRangeText }}
      </small>
      <span v-if="hasError" class="invalid-feedback d-block">{{ errorMessage }}</span>
      <span v-if="isAbnormal" class="text-warning d-block">
        <i class="fas fa-exclamation-triangle"></i> Value is outside normal range
      </span>
      <div v-if="field.description" class="field-description">
        <div class="description-content">{{ field.description }}</div>
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'NumberField',
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
.is-abnormal {
  border-color: #ffc107 !important;
  background-color: #fff3cd;
}

.text-warning {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.field-description {
  margin-top: 10px;
  padding: 12px;
  background-color: #f8f9fa;
  border-left: 3px solid #3699ff;
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

.description-cell {
  padding: 12px !important;
  background-color: #f8f9fa;
}
</style>
