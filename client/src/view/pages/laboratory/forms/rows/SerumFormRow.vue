<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ field.label }}</th>
    <td>
      <input
        v-if="!field?.isTextArea"
        v-model="serum[field.key]"
        @input="emitSerumResult"
        :disabled="shouldDisableRow"
        type="text"
        class="form-control"
        :class="{ 'form-control-sm': field.small }"
      />
      <textarea
        v-else
        v-model="serum[field.key]"
        @input="emitSerumResult"
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
    serum: Object,
    field: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.serum[this.field.key]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitSerumResult() {
      this.$emit('emitSerumResult');
    },
  },
};
</script>

<style scoped></style>
