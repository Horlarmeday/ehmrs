<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ field.label }}</th>
    <td>
      <input
        v-if="!field?.isTextArea"
        v-model="urinalysis[field.key]"
        @input="emitUrinalysisResult"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
        :class="{ 'form-control-sm': field.small }"
      />
      <textarea
        v-else
        v-model="urinalysis[field.key]"
        @input="emitUrinalysisResult"
        class="form-control"
        :disabled="shouldDisableRow"
        cols="30"
        rows="2"
      ></textarea>
    </td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    urinalysis: Object,
    field: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.urinalysis[this.field.key]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitUrinalysisResult() {
      this.$emit('emitUrinalysisResult');
    },
  },
};
</script>

<style scoped></style>
