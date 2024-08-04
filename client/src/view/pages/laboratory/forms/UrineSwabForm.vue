<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th colspan="7">
            <input
              @input="emitUrineSwabResult"
              v-model="urineSwab.specimen"
              type="text"
              :disabled="shouldDisableRow"
              class="form-control"
              placeholder="Input Specimen here"
            />
          </th>
        </tr>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        <urine-swab-form-row
          v-for="field in urineSwabFields"
          :key="field.key"
          :label="field.label"
          :small="field.small"
          :value.sync="urineSwab[field.key]"
          :section="section"
          @updateUrineSwabValue="updateUrineSwabValue(field.key, $event)"
        />
        <template v-if="showAntibiotics">
          <tr>
            <th class="text-center" colspan="2">Antibiotic Sensitivity</th>
          </tr>
          <urine-swab-form-row
            v-for="field in antibiotics"
            :key="field.key"
            :label="field.label"
            :small="field.small"
            :value.sync="urineSwab[field.key]"
            :section="section"
            @updateUrineSwabValue="updateUrineSwabValue(field.key, $event)"
          />
        </template>
        <tr v-if="shouldCommentRow">
          <th scope="row">Comments</th>
          <td>
            <textarea
              v-model="urineSwab.comments"
              @input="emitUrineSwabResult"
              :disabled="shouldDisableRow"
              class="form-control"
              cols="30"
              rows="2"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce } from '@/common/common';
import UrineSwabFormRow from '@/view/pages/laboratory/forms/rows/UrineSwabFormRow.vue';

export default {
  components: { UrineSwabFormRow },
  data: () => ({
    urineSwab: {
      epithelial_cells: '',
      specimen: '',
      pus_cells: '',
      vaginalis_cells: '',
      culture: '',
      rbc: '',
      cast: '',
      crystals: '',
      parasites: '',
      others: '',
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
    urineSwabFields: [
      { key: 'culture', label: 'Culture' },
      { key: 'epithelial_cells', label: 'Epithelial Cells', small: true },
      { key: 'pus_cells', label: 'PUS Cells', small: true },
      { key: 'vaginalis_cells', label: 'T. Vaginalis', small: true },
      { key: 'rbc', label: 'RBC', small: true },
      { key: 'cast', label: 'Cast', small: true },
      { key: 'crystals', label: 'Crystals', small: true },
      { key: 'parasites', label: 'Parasites', small: true },
      { key: 'others', label: 'Others', small: true },
    ],
    antibiotics: [
      { label: 'Ciprofloxacin', key: 'ciprofloxacin', small: true },
      { label: 'Rifampicin', key: 'rifampicin', small: true },
      { label: 'Streptomycin', key: 'streptomycin', small: true },
      { label: 'Azithromycin', key: 'azithromycin', small: true },
      { label: 'Amoxicillin', key: 'amoxicillin', small: true },
      { label: 'Erythromycin', key: 'erythromycin', small: true },
      { label: 'Levofloxacin', key: 'levofloxacin', small: true },
      { label: 'Gentamycin', key: 'gentamycin', small: true },
      { label: 'Cefuroxime', key: 'cefuroxime', small: true },
      { label: 'Ofloxacin', key: 'ofloxacin', small: true },
      { label: 'Augmentin', key: 'augmentin', small: true },
      { label: 'Peflacine', key: 'peflacine', small: true },
      { label: 'Ceftazidime', key: 'ceftazidime', small: true },
      { label: 'Ceporex', key: 'ceporex', small: true },
      { label: 'Ceftriaxone', key: 'ceftriaxone', small: true },
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
          Object.assign(this.urineSwab, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  computed: {
    showAntibiotics() {
      const antibiotics = {
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
      };
      const urineSwabAntibiotics = Object.keys(antibiotics)
        .map(key => this.urineSwab[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!urineSwabAntibiotics?.length
      );
    },

    shouldCommentRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.urineSwab.comments
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  methods: {
    emitUrineSwabResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.urineSwab, vm.testId);
    }, 500),

    updateUrineSwabValue(model, value) {
      this.urineSwab[model] = value;
      this.emitUrineSwabResult();
    },
  },
};
</script>

<style scoped></style>
