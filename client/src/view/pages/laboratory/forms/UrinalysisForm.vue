<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        <urinalysis-form-row
          v-for="item in urinalysisFields"
          :key="item.key"
          :section="section"
          :urinalysis="urinalysis"
          :field="item"
          @emitUrinalysisResult="emitUrinalysisResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import UrinalysisFormRow from '@/view/pages/laboratory/forms/rows/UrinalysisFormRow.vue';

export default {
  components: { UrinalysisFormRow },
  data: () => ({
    urinalysis: {
      leukocytes: '',
      protein: '',
      glucose: '',
      culture: '',
      appearance: '',
      blood: '',
      ph: '',
      ascorbic_acid: '',
      urobilinogen: '',
      ketones: '',
      gravity: '',
      bilirubin: '',
      nitrite: '',
      comments: '',
      others: '',
    },
    urinalysisFields: [
      { key: 'culture', label: 'Culture' },
      { key: 'appearance', label: 'Appearance' },
      { key: 'leukocytes', label: 'Leukocytes', small: true },
      { key: 'protein', label: 'Protein', small: true },
      { key: 'glucose', label: 'Glucose', small: true },
      { key: 'blood', label: 'Blood', small: true },
      { key: 'ph', label: 'PH', small: true },
      { key: 'ascorbic_acid', label: 'Ascorbic Acid', small: true },
      { key: 'urobilinogen', label: 'Urobilinogen', small: true },
      { key: 'ketones', label: 'Ketones', small: true },
      { key: 'gravity', label: 'S.gravity', small: true },
      { key: 'bilirubin', label: 'Bilirubin', small: true },
      { key: 'nitrite', label: 'Nitrite', small: true },
      { key: 'others', label: 'Others', small: true },
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
          Object.assign(this.urinalysis, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  methods: {
    emitUrinalysisResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.urinalysis, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
