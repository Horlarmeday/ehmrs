<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ label }}</th>
    <td>
      <input
        @input="emitUpdateValue"
        v-model="localValue"
        type="text"
        :disabled="shouldDisableRow"
        class="form-control form-control-sm"
      />
    </td>
    <td v-if="range">{{ range }}</td>
    <td v-if="proteinModel">
      <input
        @input="emitUpdateProtein"
        v-model="localProtein"
        type="text"
        :disabled="shouldDisableRow"
        class="form-control form-control-sm"
      />
    </td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    protein: {
      type: String,
      required: false,
      default: null,
    },
    proteinModel: {
      type: String,
    },
    range: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      localValue: this.value,
      localProtein: this.protein,
    };
  },
  watch: {
    value(val) {
      this.localValue = JSON.parse(JSON.stringify(val));
    },
    protein(val) {
      this.localProtein = JSON.parse(JSON.stringify(val));
    },
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.value ||
        !!this.protein
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitUpdateValue() {
      this.$emit('updateValue', this.localValue);
    },

    emitUpdateProtein() {
      this.$emit('updateProtein', this.localProtein);
    },
  },
};
</script>

<style scoped></style>
