<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row">{{ field.label }}</th>
      <td>
        <div class="checkbox-group">
          <div
            v-for="option in field.options"
            :key="option.value"
            class="form-check form-check-inline"
          >
            <input
              class="form-check-input"
              type="checkbox"
              :id="`${field.id}-${option.value}`"
              :value="option.value"
              :checked="isChecked(option.value)"
              :disabled="disabled"
              @change="handleChange"
            />
            <label class="form-check-label" :for="`${field.id}-${option.value}`">
              {{ option.label }}
            </label>
          </div>
        </div>
        <span v-if="hasError" class="invalid-feedback d-block">{{ errorMessage }}</span>
      </td>
    </template>

    <template v-else>
      <label>{{ field.label }}</label>
      <div class="checkbox-group">
        <div v-for="option in field.options" :key="option.value" class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            :id="`${field.id}-${option.value}`"
            :value="option.value"
            :checked="isChecked(option.value)"
            :disabled="disabled"
            @change="handleChange"
          />
          <label class="form-check-label" :for="`${field.id}-${option.value}`">
            {{ option.label }}
          </label>
        </div>
      </div>
      <span v-if="hasError" class="invalid-feedback d-block">{{ errorMessage }}</span>
      <div v-if="field.description" class="field-description">
        <div class="description-content">{{ field.description }}</div>
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'CheckboxField',
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      type: Array,
      default: () => [],
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
    isChecked(optionValue) {
      return Array.isArray(this.value) && this.value.includes(optionValue);
    },

    handleChange(event) {
      const checkboxValue = event.target.value;
      let newValue = Array.isArray(this.value) ? [...this.value] : [];

      if (event.target.checked) {
        if (!newValue.includes(checkboxValue)) {
          newValue.push(checkboxValue);
        }
      } else {
        newValue = newValue.filter((v) => v !== checkboxValue);
      }

      this.validate(newValue);
      this.$emit('input', newValue);
    },

    validate(value) {
      this.errorMessage = '';

      if (this.field.validation?.required && (!value || value.length === 0)) {
        this.errorMessage = `${this.field.label} is required`;
        return false;
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

.checkbox-group {
  padding-top: 0.375rem;
}

.form-check {
  margin-bottom: 0.5rem;
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
