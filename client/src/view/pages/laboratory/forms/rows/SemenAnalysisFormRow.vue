<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ item.label }}</th>
    <td>
      <input
        v-if="!item?.isTextArea"
        @input="emitSemenAnalysisResult"
        v-model="semenAnalysis[item.model]"
        :disabled="shouldDisableRow"
        type="text"
        :class="['form-control', { 'form-control-sm': item.isSmall }]"
      />
      <textarea
        v-else
        v-model="semenAnalysis[item.model]"
        @input="emitSemenAnalysisResult"
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
    semenAnalysis: Object,
    item: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.semenAnalysis[this.item.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitSemenAnalysisResult() {
      this.$emit('emitSemenAnalysisResult');
    },
  },
};
</script>

<style scoped></style>
