<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ item.name }}</th>
    <td>
      <input
        v-if="!item?.isTextArea"
        v-model="sputum[item.model]"
        @input="emitSputumResult"
        type="text"
        :disabled="shouldDisableRow"
        class="form-control"
      />
      <textarea
        v-else
        v-model="sputum[item.model]"
        @input="emitSputumResult"
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
    sputum: Object,
    item: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.sputum[this.item.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitSputumResult() {
      this.$emit('emitSputumResult');
    },
  },
};
</script>

<style scoped></style>
