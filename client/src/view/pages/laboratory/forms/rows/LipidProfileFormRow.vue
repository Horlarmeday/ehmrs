<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ row?.label }}</th>
    <td>
      <input
        v-if="!row?.isTextArea"
        v-model="lipidProfile[row.model]"
        @input="emitLipidProfileResult"
        type="text"
        :disabled="shouldDisableRow"
        class="form-control"
      />
      <textarea
        v-else
        v-model="lipidProfile[row.model]"
        @input="emitLipidProfileResult"
        class="form-control"
        :disabled="shouldDisableRow"
        cols="30"
        rows="2"
      ></textarea>
    </td>
    <td v-if="row?.range">{{ row.range }}</td>
  </tr>
</template>

<script>
export default {
  props: {
    section: String,
    lipidProfile: Object,
    row: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.lipidProfile[this.row.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitLipidProfileResult() {
      this.$emit('emitLipidProfileResult');
    },
  },
};
</script>

<style scoped></style>
