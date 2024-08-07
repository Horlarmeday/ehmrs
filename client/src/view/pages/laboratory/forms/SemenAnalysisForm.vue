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
        <semen-analysis-form-row
          v-for="item in semenAnalysisItems"
          :key="item.id"
          :section="section"
          :semen-analysis="semenAnalysis"
          :item="item"
          @emitSemenAnalysisResult="emitSemenAnalysisResult"
        />
        <template v-if="showMethodOfProduction">
          <tr>
            <th class="text-center" colspan="2">Method of Production</th>
          </tr>
          <semen-analysis-form-row
            v-for="item in methodOfProduction"
            :key="item.id"
            :section="section"
            :semen-analysis="semenAnalysis"
            :item="item"
            @emitSemenAnalysisResult="emitSemenAnalysisResult"
          />
        </template>
        <template v-if="showMicroscopy">
          <tr>
            <th class="text-center" colspan="2">Microscopy</th>
          </tr>
          <semen-analysis-form-row
            v-for="item in microscopy"
            :key="item.id"
            :section="section"
            :semen-analysis="semenAnalysis"
            :item="item"
            @emitSemenAnalysisResult="emitSemenAnalysisResult"
          />
        </template>
        <template v-if="showPercentageMortility">
          <tr>
            <th class="text-center" colspan="2">Percentage Motility</th>
          </tr>
          <semen-analysis-form-row
            v-for="item in microscopy"
            :key="item.id"
            :section="section"
            :semen-analysis="semenAnalysis"
            :item="item"
            @emitSemenAnalysisResult="emitSemenAnalysisResult"
          />
        </template>
        <template v-if="showMorphology">
          <tr>
            <th class="text-center" colspan="2">Morphology</th>
          </tr>
          <semen-analysis-form-row
            v-for="item in morphology"
            :key="item.id"
            :section="section"
            :semen-analysis="semenAnalysis"
            :item="item"
            @emitSemenAnalysisResult="emitSemenAnalysisResult"
          />
        </template>
        <template v-if="showAntibiotics">
          <tr>
            <th class="text-center" colspan="2">Antibiotic Sensitivity</th>
          </tr>
          <semen-analysis-form-row
            v-for="item in antibiotics"
            :key="item.id"
            :section="section"
            :semen-analysis="semenAnalysis"
            :item="item"
            @emitSemenAnalysisResult="emitSemenAnalysisResult"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>
<script>
import { debounce, randomId } from '@/common/common';
import SemenAnalysisFormRow from '@/view/pages/laboratory/forms/rows/SemenAnalysisFormRow.vue';

export default {
  components: { SemenAnalysisFormRow },
  data: () => ({
    semenAnalysis: {
      culture: '',
      appearance: '',
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
      time_produced: '',
      time_received: '',
      time_of_analysis: '',
      method_of_production: '',
      period_of_abstinence: '',
      colour: '',
      viscosity: '',
      liquefaction: '',
      spillage: '',
      volume: '',
      odour: '',
      ph: '',
      microscopy: '',
      pus_cells: '',
      rbc: '',
      cellula_debris: '',
      spermatozoan: '',
      epithelial_cells: '',
      percentage_motility: '',
      active: '',
      sluggish: '',
      non_progressive: '',
      dead_cells: '',
      morphology: '',
      normal_cells: '',
      abnormal_cells: '',
      sperm_count: '',
      others: '',
    },
    methodOfProduction: [
      { id: randomId(), label: 'Time Produced', model: 'time_produced', isSmall: true },
      { id: randomId(), label: 'Time Received', model: 'time_received', isSmall: true },
      { id: randomId(), label: 'Time of Analysis', model: 'time_of_analysis', isSmall: true },
      {
        id: randomId(),
        label: 'Method of Production',
        model: 'method_of_production',
        isSmall: true,
      },
      {
        id: randomId(),
        label: 'Period of Abstinence',
        model: 'period_of_abstinence',
        isSmall: true,
      },
      { id: randomId(), label: 'Colour', model: 'colour', isSmall: true },
      { id: randomId(), label: 'Viscosity', model: 'viscosity', isSmall: true },
      { id: randomId(), label: 'Liquefaction', model: 'liquefaction', isSmall: true },
      { id: randomId(), label: 'Spillage', model: 'spillage', isSmall: true },
      { id: randomId(), label: 'Volume', model: 'volume', isSmall: true },
      { id: randomId(), label: 'Odour', model: 'odour', isSmall: true },
      { id: randomId(), label: 'PH', model: 'ph', isSmall: true },
    ],
    microscopy: [
      { id: randomId(), label: 'Microscopy', model: 'microscopy', isSmall: true },
      { id: randomId(), label: 'PUS Cells', model: 'pus_cells', isSmall: true },
      { id: randomId(), label: 'RBC', model: 'rbc', isSmall: true },
      { id: randomId(), label: 'Cellula Debris', model: 'cellula_debris', isSmall: true },
      { id: randomId(), label: 'Spermatozoan', model: 'spermatozoan', isSmall: true },
      { id: randomId(), label: 'Epithelial Cells', model: 'epithelial_cells', isSmall: true },
    ],
    percentageMobility: [
      { id: randomId(), label: 'Percentage Motility', model: 'percentage_motility', isSmall: true },
      { id: randomId(), label: 'Active', model: 'active', isSmall: true },
      { id: randomId(), label: 'Sluggish', model: 'sluggish', isSmall: true },
      { id: randomId(), label: 'Non-Progressive', model: 'non_progressive', isSmall: true },
      { id: randomId(), label: 'Dead Cells', model: 'dead_cells', isSmall: true },
    ],
    morphology: [
      { id: randomId(), label: 'Morphology', model: 'morphology', isSmall: true },
      { id: randomId(), label: '% Normal Cells', model: 'normal_cells', isSmall: true },
      { id: randomId(), label: '% Abnormal Cells', model: 'abnormal_cells', isSmall: true },
      { id: randomId(), label: 'Sperm Count', model: 'sperm_count', isSmall: true },
      { id: randomId(), label: 'Others', model: 'others', isSmall: true },
    ],
    antibiotics: [
      { id: randomId(), label: 'Antibiotic Sensitivity', isHeader: true },
      { id: randomId(), label: 'Ciprofloxacin', model: 'ciprofloxacin', isSmall: true },
      { id: randomId(), label: 'Rifampicin', model: 'rifampicin', isSmall: true },
      { id: randomId(), label: 'Streptomycin', model: 'streptomycin', isSmall: true },
      { id: randomId(), label: 'Azithromycin', model: 'azithromycin', isSmall: true },
      { id: randomId(), label: 'Amoxicillin', model: 'amoxicillin', isSmall: true },
      { id: randomId(), label: 'Erythromycin', model: 'erythromycin', isSmall: true },
      { id: randomId(), label: 'Levofloxacin', model: 'levofloxacin', isSmall: true },
      { id: randomId(), label: 'Gentamycin', model: 'gentamycin', isSmall: true },
      { id: randomId(), label: 'Cefuroxime', model: 'cefuroxime', isSmall: true },
      { id: randomId(), label: 'Ofloxacin', model: 'ofloxacin', isSmall: true },
      { id: randomId(), label: 'Augmentin', model: 'augmentin', isSmall: true },
      { id: randomId(), label: 'Peflacine', model: 'peflacine', isSmall: true },
      { id: randomId(), label: 'Ceftazidime', model: 'ceftazidime', isSmall: true },
      { id: randomId(), label: 'Ceporex', model: 'ceporex', isSmall: true },
      { id: randomId(), label: 'Ceftriaxone', model: 'ceftriaxone', isSmall: true },
      { id: randomId(), label: 'Comments', model: 'comments', isTextArea: true },
    ],
    semenAnalysisItems: [
      { id: randomId(), label: 'Culture', model: 'culture' },
      { id: randomId(), label: 'Appearance', model: 'appearance' },
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
          Object.assign(this.semenAnalysis, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  computed: {
    showPercentageMortility() {
      const percentageMortility = {
        active: '',
        sluggish: '',
        non_progressive: '',
        dead_cells: '',
        percentage_motility: '',
      };
      const semenPercentageMortility = Object.keys(percentageMortility)
        .map(key => this.semenAnalysis[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!semenPercentageMortility?.length
      );
    },

    showMicroscopy() {
      const microscopy = {
        microscopy: '',
        pus_cells: '',
        rbc: '',
        cellula_debris: '',
        spermatozoan: '',
        epithelial_cells: '',
      };
      const semenMicroscopy = Object.keys(microscopy)
        .map(key => this.semenAnalysis[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!semenMicroscopy?.length
      );
    },

    showMorphology() {
      const morphology = {
        morphology: '',
        normal_cells: '',
        abnormal_cells: '',
        sperm_count: '',
        others: '',
      };
      const semenMorphology = Object.keys(morphology)
        .map(key => this.semenAnalysis[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!semenMorphology?.length
      );
    },

    showMethodOfProduction() {
      const methodOfProduction = {
        method_of_production: '',
        time_produced: '',
        time_received: '',
        time_of_analysis: '',
        period_of_abstinence: '',
        colour: '',
        viscosity: '',
        liquefaction: '',
        spillage: '',
        volume: '',
        odour: '',
        ph: '',
      };
      const semenMethodOfProduction = Object.keys(methodOfProduction)
        .map(key => this.semenAnalysis[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!semenMethodOfProduction?.length
      );
    },

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
      const semenAntibiotics = Object.keys(antibiotics)
        .map(key => this.semenAnalysis[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!semenAntibiotics?.length
      );
    },
  },
  methods: {
    emitSemenAnalysisResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.semenAnalysis, vm.testId);
    }, 500),
  },
};
</script>

<style scoped></style>
