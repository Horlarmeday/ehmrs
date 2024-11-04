<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ field.label }}</th>
    <td>
      <input
        v-if="!field?.isTextArea"
        v-model="seucr[field.key]"
        @input="emitSeUCrResult"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
        :class="{ 'form-control-sm': field.small }"
      />
      <textarea
        v-else
        v-model="seucr[field.key]"
        @input="emitSeUCrResult"
        class="form-control"
        :disabled="shouldDisableRow"
        cols="30"
        rows="2"
      ></textarea>
    </td>
    <td>{{ field.range }}</td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    seucr: Object,
    field: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.seucr[this.field.key]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitSeUCrResult() {
      this.$emit('emitSeUCrResult');
    },
  },
};
</script>

<style scoped></style>
