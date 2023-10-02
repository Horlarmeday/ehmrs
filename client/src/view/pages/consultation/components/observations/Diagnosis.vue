<template>
  <div>
    <div class="mb-3">
      <div class="radio-inline">
        <label
          class="radio radio-md radio-rounded"
          v-for="(type, index) in diseaseTypes"
          :key="index"
        >
          <input type="radio" name="radio4" v-model="diagnosisType" :value="type" />
          <span></span>
          {{ type }}
        </label>
      </div>
    </div>
    <div class="form-group row" v-for="(diag, index) in diagnosis" :key="index">
      <div class="col-lg-5">
        <label class="font-weight-bold text-center">Diagnosis</label>
        <v-select
          name="diagnosis"
          @input="addNewDiagnosis"
          @search="searchDiagnosis"
          v-model="diag.diagnosis"
          label="diagnosis"
          :reduce="
            diagnoses => ({
              id: diagnoses.id,
              diagnosis: diagnoses.diagnosis,
              type: diagnosisType,
            })
          "
          :options="diagnoses"
        >
          <template #search="{attributes, events}">
            <input
              class="vs__search"
              :required="!diag.diagnosis"
              v-bind="attributes"
              v-on="events"
            />
          </template>
        </v-select>
      </div>
      <div class="col-lg-3">
        <label class="font-weight-bold">Certainty</label>
        <div class="radio-inline">
          <label class="radio radio-md radio-square" v-for="(certainty, i) in certainties" :key="i">
            <input type="radio" v-model="diag.certainty" :value="certainty" />
            <span></span>
            {{ certainty }}
          </label>
        </div>
      </div>
      <div class="col-lg-3">
        <label class="font-weight-bold text-center">Notes</label>
        <input name="notes" v-model="diag.notes" type="text" class="form-control form-control-sm" />
      </div>
      <div class="col-lg-1">
        <br />
        <a href="#" class="col-lg-1 col-form-label">
          <i
            class="far fa-trash-alt icon-md text-danger icon-lg"
            v-if="index !== 0"
            @click="removeDiagnosis(index)"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';
export default {
  name: 'Diagnosis',
  components: { vSelect },
  props: {
    sendDiagnosis: {
      type: Boolean,
      required: true,
    },
    endDiagnosis: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      diagnosisType: 'ICD10',
      certainties: ['Confirmed', 'Presumed'],
      diseaseTypes: ['ICD10', 'ICPC2'],
      diagnosis: [
        {
          certainty: '',
          notes: '',
          diagnosis: '',
        },
      ],
    };
  },
  computed: {
    diagnoses: {
      get() {
        if (this.diagnosisType === 'ICD10') {
          return this.$store.state.diagnosis.icd10Diseases;
        }
        return this.$store.state.diagnosis.icpc2Diseases;
      },
      set() {
        this.diagnoses = [];
      },
    },
  },

  methods: {
    initializeRequest() {
      this.initValues();
    },

    addNewDiagnosis() {
      this.diagnosis.push({
        certainty: '',
        diagnosis: '',
        notes: '',
      });
    },

    removeDiagnosis(i) {
      this.diagnosis.splice(i, 1);
    },

    initValues() {
      this.diagnosis = [
        {
          certainty: '',
          diagnosis: '',
          notes: '',
        },
      ];
    },

    searchDiagnosis(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      if (vm.diagnosisType === 'ICD10') {
        vm.fetchDiagnosis('diagnosis/fetchICD10Diagnosis', loading, search, vm);
      } else {
        vm.fetchDiagnosis('diagnosis/fetchICPC2Diagnosis', loading, search, vm);
      }
    }, 500),

    fetchDiagnosis(type, loading, search, vm) {
      vm.$store.dispatch(type, { search }).then(() => loading(false));
    },

    emitDiagnosis() {
      this.$emit('diagnosis', this.diagnosis);
    },
  },
  watch: {
    sendDiagnosis(value) {
      if (value) this.emitDiagnosis();
    },

    endDiagnosis(value) {
      if (value) this.initValues();
    },
  },
};
</script>

<style scoped></style>
