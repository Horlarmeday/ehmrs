<template>
  <div class="form-container border border-gray-500">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Result</th>
          <th scope="col">Children Range</th>
          <th scope="col" colspan="2">Adult Range</th>
          <th scope="col">Unit</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th>Male</th>
          <th>Female</th>
        </tr>
      </thead>
      <tbody>
        <FBCFormRow
          v-for="row in rows"
          :key="row.id"
          :label="row.label"
          :value.sync="fbc[row.model]"
          :childRange="row.childRange"
          :adultRangeMale="row.adultRangeMale"
          :adultRangeFemale="row.adultRangeFemale"
          :section="section"
          :unit="row.unit"
          @updateValue="updateFBCValue(row.model, $event)"
        />
        <!-- Conditional Rows -->
        <template v-if="showDifferential">
          <tr>
            <th>Differential</th>
            <th>Result</th>
            <th>Children Range</th>
            <th colspan="2">Adult Range</th>
            <th>Unit</th>
          </tr>
          <FBCFormRow
            v-for="row in differentialRows"
            row-type="differential"
            :key="row.id"
            :label="row.label"
            :value.sync="fbc[row.model]"
            :childRange="row.childRange"
            :section="section"
            :adultRangeMale="row.adultRangeMale"
            :adultRangeFemale="row.adultRangeFemale"
            :unit="row.unit"
            @updateValue="updateFBCValue(row.model, $event)"
          />
        </template>
        <template v-if="showMorphology">
          <tr>
            <th class="text-center" colspan="6">RBC Morphology</th>
          </tr>
          <FBCFormRow
            v-for="row in morphologyRows"
            row-type="morphology"
            :key="row.id"
            :label="row.label"
            :value.sync="fbc[row.model]"
            :unit="row.unit"
            :section="section"
            @updateValue="updateFBCValue(row.model, $event)"
          />
        </template>
        <tr v-if="shouldCommentRow">
          <th scope="row">Comments</th>
          <td colspan="6">
            <textarea
              @input="emitFBCResult"
              v-model="fbc.comments"
              class="form-control"
              :disabled="shouldDisableRow"
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
import { debounce, randomId } from '@/common/common';
import FBCFormRow from '@/view/pages/laboratory/forms/rows/FBCFormRow.vue';

export default {
  components: { FBCFormRow },
  data() {
    return {
      fbc: {
        wbc: '',
        rbc: '',
        hgb: '',
        hct: '',
        mcv: '',
        mch: '',
        mchc: '',
        rdw: '',
        plt: '',
        // differential
        basophils: '',
        eosinophils: '',
        neutrophils: '',
        monocytes: '',
        atypical_lymphocytes: '',
        lymphocytes: '',
        bands: '',
        // morphology
        macrocytosis: '',
        poikliocytosis: '',
        hypochromia: '',
        microcytosis: '',
        anisocytosis: '',
        comments: '',
      },
      rows: [
        {
          id: randomId(),
          label: 'WBC',
          model: 'wbc',
          childRange: '5 - 19',
          adultRangeMale: '3.3 - 10.0',
          adultRangeFemale: '3.4 - 9.8',
          unit: 'x10^3/ul',
        },
        {
          id: randomId(),
          label: 'RBC',
          model: 'rbc',
          childRange: '3.9 - 5.3',
          adultRangeMale: '4.35 - 5.9',
          adultRangeFemale: '3.69 - 5.19',
          unit: 'x10^4/ul',
        },
        {
          id: randomId(),
          label: 'HGB',
          model: 'hgb',
          childRange: '9.5 - 14.1',
          adultRangeMale: '13.7 - 16.7',
          adultRangeFemale: '11.7 - 14.5',
          unit: 'g/dl',
        },
        {
          id: randomId(),
          label: 'HCT',
          model: 'hct',
          childRange: '30 - 40',
          adultRangeMale: '40.5 - 49.7',
          adultRangeFemale: '34.1 - 44.3',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'MCV',
          model: 'mcv',
          childRange: '70 - 84',
          adultRangeMale: '79.7 - 92.0',
          adultRangeFemale: '81.5 - 96.7',
          unit: 'fl',
        },
        {
          id: randomId(),
          label: 'MCH',
          model: 'mch',
          childRange: '23 - 29',
          adultRangeMale: '26.1 - 33.3',
          adultRangeFemale: '26.5 - 33.5',
          unit: 'pg',
        },
        {
          id: randomId(),
          label: 'MCHC',
          model: 'mchc',
          childRange: '31 - 35',
          adultRangeMale: '32.2 - 35.0',
          adultRangeFemale: '31.9 - 35.3',
          unit: 'g/dl',
        },
        {
          id: randomId(),
          label: 'RDW',
          model: 'rdw',
          childRange: '11.6 - 14.4',
          adultRangeMale: '11.6 - 14.4',
          adultRangeFemale: '-',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'PLT',
          model: 'plt',
          childRange: '140 - 450',
          adultRangeMale: '140 - 450',
          adultRangeFemale: '-',
          unit: 'x10^3/ul',
        },
      ],
      differentialRows: [
        {
          id: randomId(),
          label: 'Neutrophils',
          model: 'neutrophils',
          childRange: '20 - 45',
          adultRangeMale: '45 - 66',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'Bands (Neutrophilic)',
          model: 'bands',
          childRange: '1 - 12',
          adultRangeMale: '1 - 12',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'Lymphocytes',
          model: 'lymphocytes',
          childRange: '46 - 76',
          adultRangeMale: '20 - 40',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'Atypical Lymphocytes',
          model: 'atypical_lymphocytes',
          childRange: '0 - 2',
          adultRangeMale: '0 - 2',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'Monocytes',
          model: 'monocytes',
          childRange: '1 - 5',
          adultRangeMale: '4 - 10',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'Eosinophils',
          model: 'eosinophils',
          childRange: '1 - 3',
          adultRangeMale: '1 - 6',
          unit: '%',
        },
        {
          id: randomId(),
          label: 'Basophils',
          model: 'basophils',
          childRange: '0 - 2',
          adultRangeMale: '0 - 2',
          unit: '%',
        },
      ],
      morphologyRows: [
        { id: randomId(), label: 'Anisocytosis', model: 'anisocytosis', unit: '' },
        { id: randomId(), label: 'Microcytosis', model: 'microcytosis', unit: '' },
        { id: randomId(), label: 'Macrocytosis', model: 'macrocytosis', unit: '' },
        { id: randomId(), label: 'Hypochromia', model: 'hypochromia', unit: '' },
        { id: randomId(), label: 'Poikliocytosis', model: 'poikliocytosis', unit: '' },
      ],
    };
  },
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
          Object.assign(this.fbc, JSON.parse(JSON.stringify(val)));
        }
      },
    },
  },
  computed: {
    showDifferential() {
      const differential = {
        basophils: '',
        eosinophils: '',
        neutrophils: '',
        monocytes: '',
        atypical_lymphocytes: '',
        lymphocytes: '',
      };
      const fbcDifferential = Object.keys(differential)
        .map(key => this.fbc[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!fbcDifferential?.length
      );
    },

    showMorphology() {
      const morphology = {
        macrocytosis: '',
        poikliocytosis: '',
        hypochromia: '',
        microcytosis: '',
        anisocytosis: '',
      };
      const fbcMorphology = Object.keys(morphology)
        .map(key => this.fbc[key])
        .filter(Boolean);
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!fbcMorphology?.length
      );
    },

    shouldDisableRow() {
      return this.section === 'ValidationSection' || this.section === 'ApprovalSection';
    },

    shouldCommentRow() {
      return (
        (this.section !== 'ValidationSection' && this.section !== 'ApprovalSection') ||
        !!this.fbc.comments
      );
    },
  },
  methods: {
    emitFBCResult() {
      this.debounceInput(this);
    },

    debounceInput: debounce(vm => {
      vm.$emit('emitResult', vm.fbc, vm.testId);
    }, 500),

    updateFBCValue(model, value) {
      this.fbc[model] = value;
      this.emitFBCResult();
    },
  },
};
</script>

<style scoped></style>
