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
        <stool-analysis-form-row
          v-for="field in stoolAnalysisFields"
          :key="field.key"
          :label="field.label"
          :small="field.small"
          :value.sync="stoolAnalysis[field.key]"
          :section="section"
          @updateStoolAnalysisValue="updateStoolAnalysisValue(field.key, $event)"
        />
        <template v-if="showAntibiotics">
          <tr>
            <th class="text-center" colspan="2">Antibiotic Sensitivity</th>
          </tr>
          <stool-analysis-form-row
            v-for="field in antibiotics"
            :key="field.key"
            :label="field.label"
            :small="field.small"
            :value.sync="stoolAnalysis[field.key]"
            :section="section"
            @updateStoolAnalysisValue="updateStoolAnalysisValue(field.key, $event)"
          />
        </template>
        <tr v-if="shouldCommentRow">
          <th scope="row">Comments</th>
          <td>
            <textarea
              v-model="stoolAnalysis.comments"
              @input="emitStoolAnalysisResult"
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
import StoolAnalysisFormRow from '@/view/pages/laboratory/forms/rows/StoolAnalysisFormRow.vue';

export default {
  components: { StoolAnalysisFormRow },
  data: () => ({
    stoolAnalysis: {
      pus_cells: '',
      rbc: '',
      ova_cyst: '',
      culture: '',
      appearance: '',
      undigested_food_particles: '',
      schistoma_ova: '',
      fob: '',
      others: '',
      comments: '',
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
    },
    stoolAnalysisFields: [
      { key: 'culture', label: 'Culture' },
      { key: 'appearance', label: 'Appearance' },
      { key: 'pus_cells', label: 'PUS Cells', small: true },
      { key: 'rbc', label: 'RBC', small: true },
      { key: 'ova_cyst', label: 'OVA/Cyst', small: true },
      { key: 'undigested_food_particles', label: 'Undigested Food Particles', small: true },
      { key: 'schistoma_ova', label: 'Schistoma Ova', small: true },
      { key: 'fob', label: 'FOB', small: true },
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
      const stoolAntibiotics = Object.keys(antibiotics)
        .map(key => this.stoolAnalysis[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!stoolAntibiotics?.length
      );
    },

    shouldCommentRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.stoolAnalysis.comments
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },
  },
  watch: {
    result: {
      immediate: true,
      handler(val) {
        if (!val) return;
        if (Object.entries(val)?.length) {
          Object.assign(this.stoolAnalysis, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  methods: {
    emitStoolAnalysisResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.stoolAnalysis, vm.testId);
    }, 500),

    updateStoolAnalysisValue(model, value) {
      this.stoolAnalysis[model] = value;
      this.emitStoolAnalysisResult();
    },
  },
};
</script>

<style scoped></style>
