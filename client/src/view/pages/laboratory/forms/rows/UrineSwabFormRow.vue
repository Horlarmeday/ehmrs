<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ label }}</th>
    <td>
      <input
        v-model="localValue"
        @input="emitUrineSwabResult"
        type="text"
        :disabled="shouldDisableRow"
        class="form-control"
        :class="{ 'form-control-sm': small }"
      />
    </td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    small: Boolean,
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localValue: this.value,
    };
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') || !!this.value
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitUrineSwabResult() {
      this.$emit('updateUrineSwabValue', this.localValue);
    },
  },
  watch: {
    value(val) {
      this.localValue = JSON.parse(JSON.stringify(val));
    },
  },
};
</script>

<style scoped></style>
