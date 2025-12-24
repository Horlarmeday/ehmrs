<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row">{{ field.label }}</th>
      <td>
        <input
          type="text"
          class="form-control form-control-sm"
          :value="value"
          :disabled="disabled"
          :placeholder="field.placeholder"
          @input="handleInput"
          :class="{ 'is-invalid': hasError }"
        />
        <span v-if="hasError" class="invalid-feedback">{{ errorMessage }}</span>
      </td>
      <td v-if="field.unit">{{ field.unit }}</td>
    </template>

    <template v-else>
      <label>{{ field.label }}</label>
      <input
        type="text"
        class="form-control"
        :value="value"
        :disabled="disabled"
        :placeholder="field.placeholder || `Enter ${field.label}`"
        @input="handleInput"
        :class="{ 'is-invalid': hasError }"
      />
      <small v-if="field.unit" class="form-text text-muted">Unit: {{ field.unit }}</small>
      <span v-if="hasError" class="invalid-feedback d-block">{{ errorMessage }}</span>
      <div v-if="field.description" class="field-description">
        <div class="description-content">{{ field.description }}</div>
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'TextField',
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
.form-group {
  margin-bottom: 1rem;
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
