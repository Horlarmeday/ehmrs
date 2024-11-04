<template>
  <transition>
    <tr v-if="shouldDisplayRow">
      <th scope="row">{{ item.name }}</th>
      <td v-if="item.type === INPUT">
        <input
          v-model="glucose[item.model]"
          @input="emitGlucoseResult"
          type="text"
          :disabled="shouldDisableRow"
          class="form-control"
        />
      </td>
      <td v-if="item.type === TEXTAREA" colspan="2">
        <textarea
          v-model="glucose[item.model]"
          @input="emitGlucoseResult"
          class="form-control"
          :disabled="shouldDisableRow"
          cols="30"
          rows="2"
        ></textarea>
      </td>
      <td v-if="item.range">{{ item.range }}</td>
    </tr>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      TEXTAREA: 'textarea',
      INPUT: 'input',
    };
  },
  props: {
    section: String,
    glucose: Object,
    item: Object,
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.glucose[this.item.model]
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitGlucoseResult() {
      this.$emit('emitGlucoseResult');
    },
  },
};
</script>
<style scoped></style>
