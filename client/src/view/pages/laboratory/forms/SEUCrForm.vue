<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
          <th scope="col">Range/Unit</th>
        </tr>
      </thead>
      <tbody>
        <SEUCrFormRow
          v-for="(item, index) in seucrFields"
          :key="index"
          :section="section"
          :seucr="seucr"
          :field="item"
          @emitSeUCrResult="emitSeUCrResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import SEUCrFormRow from '@/view/pages/laboratory/forms/rows/SEUCrFormRow.vue';

export default {
  components: { SEUCrFormRow },
  data: () => ({
    seucr: {
      sodium: '',
      potassium: '',
      chlorine: '',
      hco3: '',
      urea: '',
      chromium: '',
      comments: '',
    },
    seucrFields: [
      { key: 'sodium', label: 'Na+', range: '128 - 160 Mmol/L' },
      { key: 'potassium', label: 'K', range: '3.5 - 5.5 Mmol/L' },
      { key: 'chlorine', label: 'CL', range: '97 - 108 Mmol/L' },
      { key: 'hco3', label: 'HCO3', range: '24 - 32 Mmol/L', small: true },
      { key: 'urea', label: 'Urea', range: '10 - 55 Mmol/L', small: true },
      { key: 'chromium', label: 'Cr', range: '0.7 - 1.4 Mmol/L', small: true },
      { key: 'comments', label: 'Comments', isTextArea: true },
    ],
  }),
  props: {
    result: {
      type: Object,
      required: true,
    },
    testId: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          Object.assign(this.seucr, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  methods: {
    emitSeUCrResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.seucr, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
