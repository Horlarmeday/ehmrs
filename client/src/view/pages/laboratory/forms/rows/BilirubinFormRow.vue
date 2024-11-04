<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ item.age }}</th>
    <td v-if="!item.isTextarea">
      <input
        v-model="bilirubin[item.totalModel]"
        @input="emitBilirubinResult"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
      />
    </td>
    <td v-if="item.isTextarea" colspan="2">
      <textarea
        v-model="bilirubin[item.totalModel]"
        @input="emitBilirubinResult"
        class="form-control"
        :disabled="shouldDisableRow"
        cols="30"
        rows="2"
      ></textarea>
    </td>
    <td v-if="!item.isTextarea">
      <input
        v-model="bilirubin[item.directModel]"
        @input="emitBilirubinResult"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
      />
    </td>
    <td>{{ item.totalRange }}</td>
    <td>{{ item.directRange }}</td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    bilirubin: Object,
    item: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.bilirubin[this.item.directModel] ||
        !!this.bilirubin[this.item.totalModel]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitBilirubinResult() {
      this.$emit('emitBilirubinResult');
    },
  },
};
</script>

<style scoped></style>
