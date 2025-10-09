<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row">{{ field.label }}</th>
      <td>
        <input
          type="date"
          class="form-control form-control-sm enhanced-input"
          :value="value"
          :disabled="disabled"
          @input="handleInput"
        />
      </td>
    </template>

    <template v-else>
      <div class="enhanced-field-wrapper">
        <label class="field-label">
          {{ field.label }}
          <span v-if="field.validation?.required" class="text-danger ml-1">*</span>
        </label>
        <input
          type="date"
          class="form-control enhanced-input"
          :value="value"
          :disabled="disabled"
          @input="handleInput"
        />
      </div>
    </template>
  </component>
</template>

<script>
export default {
  name: 'EnhancedDateField',
  props: {
    field: { type: Object, required: true },
    value: { type: String, default: '' },
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
    handleInput(event) {
      this.$emit('input', event.target.value);
    },
  },
};
</script>

<style scoped>
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
</style>
