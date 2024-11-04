<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ label }}</th>
    <td>
      <input
        @input="emitUpdateOValue"
        :disabled="shouldDisableRow"
        v-model="localOValue"
        type="text"
        class="form-control"
      />
    </td>
    <td>
      <input
        @input="emitUpdateHValue"
        :disabled="shouldDisableRow"
        v-model="localHValue"
        type="text"
        class="form-control"
      />
    </td>
  </tr>
</template>
<script>
export default {
  props: {
    section: String,
    label: {
      type: String,
      required: true,
    },
    OValue: {
      type: String,
      required: true,
    },
    HValue: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      localOValue: this.OValue,
      localHValue: this.HValue,
    };
  },
  watch: {
    OValue(val) {
      this.localOValue = JSON.parse(JSON.stringify(val));
    },
    HValue(val) {
      this.localHValue = JSON.parse(JSON.stringify(val));
    },
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.OValue ||
        !!this.HValue
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitUpdateOValue() {
      this.$emit('updateOValue', this.localOValue);
    },

    emitUpdateHValue() {
      this.$emit('updateHValue', this.localHValue);
    },
  },
};
</script>

<style scoped></style>
