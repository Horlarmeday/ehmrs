<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ item.name }}</th>
    <td>
      <input
        v-if="!item?.isTextarea"
        v-model="analyte[item.model]"
        @input="emitAnalyteResult"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
      />
      <textarea
        v-else
        v-model="analyte[item.model]"
        @input="emitAnalyteResult"
        class="form-control"
        :disabled="shouldDisableRow"
        cols="30"
        rows="2"
      ></textarea>
    </td>
    <td>{{ item.unit }}</td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    analyte: Object,
    item: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.analyte[this.item.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitAnalyteResult() {
      this.$emit('emitAnalyteResult');
    },
  },
};
</script>

<style scoped></style>
