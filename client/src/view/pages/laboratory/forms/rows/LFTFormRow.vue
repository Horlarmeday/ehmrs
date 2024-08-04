<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ row?.label }}</th>
    <td>
      <input
        v-if="!row.isTextArea"
        @input="emitLFTResult"
        v-model="lft[row.model]"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
      />
      <textarea
        v-else
        v-model="lft[row.model]"
        @input="emitLFTResult"
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
    lft: Object,
    row: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.lft[this.row.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitLFTResult() {
      this.$emit('emitLFTResult');
    },
  },
};
</script>

<style scoped></style>
