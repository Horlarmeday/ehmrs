<!-- FBCRow.vue -->
<template>
  <tr v-if="shouldDisplayRow">
    <th scope="row">{{ label }}</th>
    <td :colspan="`${rowType === 'morphology' && '6'}`">
      <input
        @input="emitFBCResult"
        v-model="localValue"
        type="text"
        :disabled="shouldDisableRow"
        class="form-control form-control-sm"
      />
    </td>
    <td v-if="childRange">{{ childRange }}</td>
    <td :colspan="`${rowType === 'differential' && '2'}`" v-if="adultRangeMale">
      {{ adultRangeMale }}
    </td>
    <td :colspan="`${rowType === 'differential' && '2'}`" v-if="adultRangeFemale">
      {{ adultRangeFemale }}
    </td>
    <td>{{ unit }}</td>
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
    value: {
      type: String,
      required: true,
    },
    childRange: {
      type: String,
      default: '',
    },
    adultRangeMale: {
      type: String,
      default: '',
    },
    adultRangeFemale: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      required: true,
    },
    rowType: {
      type: String,
      required: false,
    },
  },
  methods: {
    emitFBCResult() {
      this.$emit('updateValue', this.localValue);
    },
  },
  data() {
    return {
      localValue: this.value,
    };
  },
  computed: {
    shouldDisplayRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') || !!this.value
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  watch: {
    value(val) {
      this.localValue = JSON.parse(JSON.stringify(val));
    },
  },
};
</script>
