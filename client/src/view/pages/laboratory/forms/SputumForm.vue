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
        <sputum-form-row
          v-for="(item, index) in sputumItems"
          :key="index"
          :section="section"
          :sputum="sputum"
          :item="item"
          @emitSputumResult="emitSputumResult"
        />
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import SputumFormRow from '@/view/pages/laboratory/forms/rows/SputumFormRow.vue';

const sputumItems = [
  { name: 'Culture', model: 'culture' },
  { name: 'Appearance', model: 'appearance' },
  { name: 'Sputum', model: 'sputum' },
  { name: 'Ciprofloxacin', model: 'ciprofloxacin' },
  { name: 'Rifampicin', model: 'rifampicin' },
  { name: 'Streptomycin', model: 'streptomycin' },
  { name: 'Azithromycin', model: 'azithromycin' },
  { name: 'Amoxicillin', model: 'amoxicillin' },
  { name: 'Erythromycin', model: 'erythromycin' },
  { name: 'Levofloxacin', model: 'levofloxacin' },
  { name: 'Gentamycin', model: 'gentamycin' },
  { name: 'Cefuroxime', model: 'cefuroxime' },
  { name: 'Ofloxacin', model: 'ofloxacin' },
  { name: 'Augmentin', model: 'augmentin' },
  { name: 'Peflacine', model: 'peflacine' },
  { name: 'Ceftazidime', model: 'ceftazidime' },
  { name: 'Ceporex', model: 'ceporex' },
  { name: 'Ceftriaxone', model: 'ceftriaxone' },
  { name: 'Comments', model: 'comments', isTextArea: true },
];
export default {
  components: { SputumFormRow },
  data: () => ({
    sputum: {
      sputum: '',
      culture: '',
      appearance: '',
      ciprofloxacin: '',
      rifampicin: '',
      streptomycin: '',
      azithromycin: '',
      amoxicillin: '',
      erythromycin: '',
      levofloxacin: '',
      gentamycin: '',
      ceftazidime: '',
      cefuroxime: '',
      ofloxacin: '',
      augmentin: '',
      peflacine: '',
      ceftriaxone: '',
      ceporex: '',
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
    sputumItems() {
      return sputumItems;
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          const sputumData = JSON.parse(JSON.stringify(val));
          Object.keys(this.sputum).forEach(key => {
            this.sputum[key] = sputumData[key] || '';
          });
        }
      },
    },
  },
  methods: {
    emitSputumResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.sputum, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
