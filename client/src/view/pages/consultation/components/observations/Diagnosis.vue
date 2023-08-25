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
          v-validate="'required'"
          data-vv-validate-on="blur"
          name="diagnosis"
          @input="addNewDiagnosis"
          @search="searchDiagnosis"
          v-model="diag.diagnosis_id"
          label="diagnosis"
          :reduce="diagnoses => diagnoses.id"
          :options="diagnoses"
        />
        <span class="text-danger text-sm">{{ errors.first('diagnosis') }}</span>
      </div>
      <div class="col-lg-3">
        <label class="font-weight-bold">Certainty</label>
        <div class="radio-inline">
          <label
            class="radio radio-md radio-square"
            v-for="(certainty, index) in certainties"
            :key="index"
          >
            <input
              type="radio"
              v-validate="'required'"
              name="certainty"
              v-model="diag.certainty"
              :value="certainty"
            />
            <span></span>
            {{ certainty }}
          </label>
        </div>
        <span class="text-danger text-sm">{{ errors.first('certainty') }}</span>
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
export default {
  name: 'Diagnosis',
  components: { vSelect },
  data() {
    return {
      diagnosisType: 'ICD10',
      certainties: ['Confirmed', 'Presumed'],
      diseaseTypes: ['ICD10', 'ICPC2'],
      diagnosis: [
        {
          certainty: '',
          notes: '',
          diagnosis_id: '',
          type: '',
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
    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    addNewDiagnosis() {
      this.diagnosis.push({
        certainty: '',
        diagnosis_id: '',
        notes: '',
        type: ''
      });
    },
    removeDiagnosis(i) {
      this.diagnosis.splice(i, 1);
    },

    initValues() {
      this.diagnosis = [
        {
          certainty: '',
          diagnosis_id: '',
          type: '',
          notes: '',
        },
      ];
    },

    searchDiagnosis(search) {
      if (this.diagnosisType === 'ICD10') {
        this.$store.dispatch('diagnosis/fetchICD10Diagnosis', {
          search,
        });
      } else {
        this.$store.dispatch('diagnosis/fetchICPC2Diagnosis', {
          search,
        });
      }
    },

  },
};
</script>

<style scoped></style>
