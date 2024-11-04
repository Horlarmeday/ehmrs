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
        <lipid-profile-form-row
          v-for="row in rows"
          :key="row.id"
          :section="section"
          :lipid-profile="lipidProfile"
          :row="row"
          @emitLipidProfileResult="emitLipidProfileResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce, randomId } from '@/common/common';
import LipidProfileFormRow from '@/view/pages/laboratory/forms/rows/LipidProfileFormRow.vue';

export default {
  components: { LipidProfileFormRow },
  data: () => ({
    lipidProfile: {
      ldl: '',
      hdl: '',
      tg: '',
      vldl: '',
      chol: '',
      comments: '',
    },
    rows: [
      { id: randomId(), label: 'Chol', model: 'chol', range: '140 - 220 mg/dl' },
      { id: randomId(), label: 'VLDL', model: 'vldl', range: '15 - 50 mg/dl' },
      { id: randomId(), label: 'HDL', model: 'hdl', range: '35 - 65 mg/dl' },
      { id: randomId(), label: 'TG', model: 'tg', range: '60 - 165 mg/dl' },
      { id: randomId(), label: 'LDL', model: 'ldl', range: 'less than 130 mg/dl' },
      { id: randomId(), label: 'Comments', model: 'comments', isTextArea: true },
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
          Object.assign(this.lipidProfile, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  methods: {
    emitLipidProfileResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.lipidProfile, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
