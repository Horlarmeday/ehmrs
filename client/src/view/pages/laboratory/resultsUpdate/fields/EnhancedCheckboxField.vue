<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row">{{ field.label }}</th>
      <td>
        <div class="checkbox-group">
          <div
            v-for="option in field.options"
            :key="option.value"
            class="custom-control custom-checkbox custom-control-inline"
          >
            <input
              type="checkbox"
              class="custom-control-input"
              :id="`${field.id}-${option.value}`"
              :value="option.value"
              :checked="isChecked(option.value)"
              :disabled="disabled"
              @change="handleChange(option.value)"
            />
            <label class="custom-control-label" :for="`${field.id}-${option.value}`">
              {{ option.label }}
            </label>
          </div>
        </div>
      </td>
    </template>

    <template v-else>
      <div class="enhanced-field-wrapper">
        <label class="field-label">{{ field.label }}</label>
        <div class="checkbox-group-vertical">
          <div
            v-for="option in field.options"
            :key="option.value"
            class="custom-control custom-checkbox"
          >
            <input
              type="checkbox"
              class="custom-control-input"
              :id="`${field.id}-${option.value}`"
              :value="option.value"
              :checked="isChecked(option.value)"
              :disabled="disabled"
              @change="handleChange(option.value)"
            />
            <label class="custom-control-label" :for="`${field.id}-${option.value}`">
              {{ option.label }}
            </label>
          </div>
        </div>
        <div v-if="field.description" class="field-description">
          <div class="description-content">{{ field.description }}</div>
        </div>
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'EnhancedCheckboxField',
  props: {
    field: { type: Object, required: true },
    value: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    renderAs: { type: String, default: 'list-item' },
  },
  computed: {
    wrapperComponent() {
      return this.renderAs === 'table-row' ? 'tr' : 'div';
    },
    wrapperProps() {
      return this.renderAs === 'table-row' ? {} : { class: 'form-group' };
    },
  },
  methods: {
    isChecked(optionValue) {
      return Array.isArray(this.value) && this.value.includes(optionValue);
    },
    handleChange(optionValue) {
      const newValue = Array.isArray(this.value) ? [...this.value] : [];
      const index = newValue.indexOf(optionValue);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(optionValue);
      }
      this.$emit('input', newValue);
    },
  },
};
</script>

<style scoped>
.checkbox-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.enhanced-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #3f4254;
  margin-bottom: 0;
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
