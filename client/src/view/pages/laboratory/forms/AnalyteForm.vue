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
        <analyte-form-row
          v-for="(item, index) in analyteItems"
          :key="index"
          :section="section"
          :analyte="analyte"
          :item="item"
          @emitAnalyteResult="emitAnalyteResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import AnalyteFormRow from '@/view/pages/laboratory/forms/rows/AnalyteFormRow.vue';
const analyteItems = [
  { name: 'Urine Protein', model: 'urine_protein', unit: '0 - 20 mg/dL' },
  { name: 'CSF Glucose', model: 'csf_glucose', unit: '2.5 - 4.4 Mmol/L' },
  { name: 'CSF Protein+', model: 'csf_protein', unit: '1.5 - 6.0 g/dL' },
  { name: 'Ascitic Fluid', model: 'ascitic_fluid', unit: '2.2 - 3.3 Mmol/L' },
  { name: 'Glucose', model: 'glucose', unit: '' },
  { name: 'Ascitic Fluid Total', model: 'ascitic_fluid_total', unit: '2.5 - 3.0 g/dL' },
  { name: 'Protein', model: 'protein', unit: '' },
  { name: 'CSF Chloride', model: 'csf_chloride', unit: '110 - 125 Mmol/L' },
  { name: '24 hour Urine', model: 'twenty_four_hour_urine', unit: '20 - 150 mg/24hrs' },
  { name: 'Comments', model: 'comments', unit: '', isTextarea: true },
];
export default {
  components: { AnalyteFormRow },
  data: () => ({
    analyte: {
      urine_protein: '',
      csf_glucose: '',
      csf_protein: '',
      ascitic_fluid: '',
      glucose: '',
      ascitic_fluid_total: '',
      protein: '',
      csf_chloride: '',
      twenty_four_hour_urine: '',
      comments: '',
    },
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
  computed: {
    analyteItems() {
      return analyteItems;
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const analyteData = JSON.parse(JSON.stringify(val));
          Object.keys(this.analyte).forEach(key => {
            this.analyte[key] = analyteData[key] || '';
          });
        }
      },
    },
  },
  methods: {
    emitAnalyteResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.analyte, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
