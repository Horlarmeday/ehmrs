<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <template v-if="renderAs === 'table-row'">
      <th scope="row">{{ field.label }}</th>
      <td>
        <textarea
          class="form-control form-control-sm"
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
      <label>{{ field.label }}</label>
      <textarea
        class="form-control"
        :value="value"
        :disabled="disabled"
        :placeholder="field.placeholder || `Enter ${field.label}`"
        :rows="field.rows || 4"
        @input="handleInput"
        :class="{ 'is-invalid': hasError }"
      ></textarea>
      <span v-if="hasError" class="invalid-feedback d-block">{{ errorMessage }}</span>
    </template>
  </component>
</template>

<script>
export default {
  name: 'TextareaField',
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

      return true;
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

textarea {
  resize: vertical;
}
</style>
