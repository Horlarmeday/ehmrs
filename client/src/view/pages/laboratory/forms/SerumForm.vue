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
        <serum-form-row
          v-for="(item, index) in serumFields"
          :key="index"
          :section="section"
          :serum="serum"
          :field="item"
          @emitSerumResult="emitSerumResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import SerumFormRow from '@/view/pages/laboratory/forms/rows/SerumFormRow.vue';

export default {
  components: { SerumFormRow },
  data: () => ({
    serum: {
      total_ca: '',
      uric_acid: '',
      mg: '',
      po42: '',
      ionized_ca: '',
      hb_ac: '',
      iron: '',
      tibc: '',
      comments: '',
    },
    serumFields: [
      { key: 'total_ca', label: 'Total Ca+', range: '2.2 - 2.7 Mmol/L' },
      { key: 'uric_acid', label: 'Uric Acid', range: '2.4 - 7.0 mg/dL' },
      { key: 'po42', label: 'PO42+', range: '2.5 - 4.5 mg/dL' },
      { key: 'mg', label: 'Mg2+', range: '1.5 - 2.5 Mmol/dL', small: true },
      { key: 'iron', label: 'Iron', range: '60 - 170 mcg/dl', small: true },
      { key: 'tibc', label: 'TIBC', range: '240 - 450 mcg/dl', small: true },
      { key: 'hb_ac', label: 'HB a/c', range: '4.0 - 5.6 %', small: true },
      { key: 'ionized_ca', label: 'Ionized Ca2+', range: '1.2 - 1.4 Mmol/L', small: true },
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
          Object.assign(this.serum, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  methods: {
    emitSerumResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.serum, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
