<template>
  <component
    :is="fieldComponent"
    :field="field"
    :value="value"
    :disabled="disabled"
    :render-as="renderAs"
    @input="$emit('input', $event)"
  />
</template>

<script>
import NumberField from './NumberField.vue';
import TextField from './TextField.vue';
import TextareaField from './TextareaField.vue';
import SelectField from './SelectField.vue';
import DateField from './DateField.vue';
import RadioField from './RadioField.vue';
import CheckboxField from './CheckboxField.vue';

export default {
  name: 'DynamicField',
  components: {
    NumberField,
    TextField,
    TextareaField,
    SelectField,
    DateField,
    RadioField,
    CheckboxField,
  },
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      type: [String, Number, Boolean, Array],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    renderAs: {
      type: String,
      default: 'list-item', // 'list-item' | 'table-row'
      validator(value) {
        return ['list-item', 'table-row'].includes(value);
      },
    },
  },
  computed: {
    fieldComponent() {
      const componentMap = {
        number: 'NumberField',
        text: 'TextField',
        textarea: 'TextareaField',
        select: 'SelectField',
        date: 'DateField',
        radio: 'RadioField',
        checkbox: 'CheckboxField',
      };

      return componentMap[this.field.type] || 'TextField';
    },
  },
};
</script>
