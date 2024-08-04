<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ row.label }}</th>
    <td>
      <input
        v-if="!row?.isTextArea"
        @input="emitHormonalAssayResult"
        v-model="hormonalAssay[row.model]"
        type="text"
        class="form-control"
        :disabled="shouldDisableRow"
      />
      <textarea
        v-else
        v-model="hormonalAssay[row.model]"
        @input="emitHormonalAssayResult"
        class="form-control"
        :disabled="shouldDisableRow"
        cols="30"
        rows="2"
      ></textarea>
    </td>
    <td>
      <p v-for="range in row?.ranges" :key="range">{{ range }}</p>
    </td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    hormonalAssay: Object,
    row: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.hormonalAssay[this.row.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitHormonalAssayResult() {
      this.$emit('emitHormonalAssayResult');
    },
  },
};
</script>

<style scoped></style>
