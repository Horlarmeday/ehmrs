<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-body py-4">
        <diagnosis-accordion />
        <div class="form-group row">
          <label class="col-2 col-form-label">Presenting Complaint</label>
          <div class="col-9">
            <textarea
              v-model="complaint_note"
              class="form-control form-control-sm"
              cols="10"
              rows="3"
              name="chief_complaint"
              v-validate="'required'"
              data-vv-validate-on="blur"
            />
            <span class="text-danger text-sm">{{ errors.first('complaint') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">History</label>
          <div class="col-9">
            <textarea
              v-model="additional_complaint"
              class="form-control form-control-sm"
              cols="10"
              rows="3"
            />
          </div>
        </div>
        <h5 class="text-center mb-4">Physical Examination</h5>
        <div class="form-group row">
          <label class="col-2 col-form-label">General Examination</label>
          <div class="col-9">
            <textarea
              v-model="examination_note"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
              name="general_examination"
              v-validate="'required'"
              data-vv-validate-on="blur"
            />
            <span class="text-danger text-sm">{{ errors.first('general_examination') }}</span>
          </div>
        </div>
        <h5 class="text-center mb-4">Systemic Examination</h5>
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Respiratory:</label>
          <div class="col-4">
            <textarea
              v-model="respiratory"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
            />
          </div>
          <label class="col-lg-1 col-form-label">CVS:</label>
          <div class="col-4">
            <textarea v-model="cvs" class="form-control form-control-sm" cols="30" rows="2" />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Abdomen:</label>
          <div class="col-4">
            <textarea v-model="abdomen" class="form-control form-control-sm" cols="30" rows="2" />
          </div>
          <label class="col-lg-1 col-form-label">CNS:</label>
          <div class="col-4">
            <textarea v-model="cns" class="form-control form-control-sm" cols="30" rows="2" />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">MSS:</label>
          <div class="col-4">
            <textarea v-model="mss" class="form-control form-control-sm" cols="30" rows="2" />
          </div>
          <label class="col-lg-1 col-form-label">ENT:</label>
          <div class="col-4">
            <textarea v-model="ent" class="form-control form-control-sm" cols="30" rows="2" />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-lg-2 col-form-label">Other:</label>
          <div class="col-9">
            <textarea
              v-model="other_examination"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Treatment Plan</label>
          <div class="col-9">
            <textarea
              v-model="history_note"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
              name="treatment_plan"
              v-validate="'required'"
              data-vv-validate-on="blur"
            />
            <span class="text-danger text-sm">{{ errors.first('treatment_plan') }}</span>
          </div>
        </div>
        <hr />
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
                <label
                  class="radio radio-md radio-square"
                  v-for="(certainty, i) in certainties"
                  :key="i"
                >
                  <input type="radio" v-model="diag.certainty" :value="certainty" />
                  <span></span>
                  {{ certainty }}
                </label>
              </div>
            </div>
            <div class="col-lg-3">
              <label class="font-weight-bold text-center">Notes</label>
              <input
                name="notes"
                v-model="diag.notes"
                type="text"
                class="form-control form-control-sm"
              />
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
        <div>
          <button
            ref="kt_observation_submit"
            :disabled="isDisabled"
            class="btn btn-primary float-right"
            @click="createExamination"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';
import DiagnosisAccordion from '@/view/components/accordion/DiagnosisAccordion.vue';
import KTUtil from '@/assets/js/components/util';
export default {
  name: 'Examination',
  components: { DiagnosisAccordion, vSelect },
  data() {
    return {
      diagnosis: [
        {
          certainty: '',
          diagnosis: '',
          notes: '',
        },
      ],
      complaint_note: '',
      additional_complaint: '',
      history_note: '',
      chest: '',
      other_examination: '',
      cvs: '',
      mss: '',
      ent: '',
      cns: '',
      respiratory: '',
      abdomen: '',
      examination_note: '',
      isDisabled: false,
      diagnosisType: 'ICD10',
      certainties: ['Confirmed', 'Presumed'],
      diseaseTypes: ['ICD10', 'ICPC2'],
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
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      setTimeout(() => {
        KTUtil.scrollTop();
      }, 500);
      this.fetchDiagnosesAndFindings();
    },

    createExamination() {
      this.removeEmptyDiagnosis();
      if (this.checkDiagnosisNotSelected()) return this.errorMessage();
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            has_smoking_history: this.has_smoking_history,
            examination_note: this.examination_note,
            history_note: this.history_note,
            complaint_note: this.complaint_note,
            chest: this.chest,
            cvs: this.cvs,
            mss: this.mss,
            abdomen: this.abdomen,
            other_examination: this.other_examination,
            diagnosis: this.diagnosis.map(({ diagnosis, certainty, notes }) => ({
              diagnosis_id: diagnosis.id,
              type: diagnosis.type,
              certainty,
              notes,
            })),
            ent: this.ent,
            cns: this.cns,
            respiratory: this.respiratory,
            additional_complaint: this.additional_complaint,
          };
          const submitButton = this.$refs['kt_observation_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('consultation/addObservation', {
              visit_id: this.$route.params.id,
              complaint: obj,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    checkDiagnosisNotSelected() {
      return this.diagnosis.some(({ diagnosis, certainty }) => !diagnosis || !certainty);
    },

    errorMessage() {
      this.$notify({
        group: 'foo',
        title: 'Error!',
        text: 'Please select a diagnosis with certainty',
        type: 'error',
      });
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

    removeEmptyDiagnosis() {
      const index = this.diagnosis.findIndex(({ diagnosis }) => !diagnosis);
      if (this.diagnosis.length > 1 && index !== -1) this.removeDiagnosis(index);
    },

    initValues() {
      this.diagnosis = [
        {
          certainty: '',
          diagnosis: '',
          notes: '',
        },
      ];
      this.has_smoking_history = '';
      this.examination_note = '';
      this.history_note = '';
      this.complaint_note = '';
      this.chest = '';
      this.other_examination = '';
      this.cvs = '';
      this.mss = '';
      this.abdomen = '';
      this.ent = '';
      this.cns = '';
      this.respiratory = '';
      this.additional_complaint = '';
    },

    searchDiagnosis(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.search(loading, search, this);
      }
    },

    search: debounce((loading, search, vm) => {
      const dispatchType =
        vm.diagnosisType === 'ICD10'
          ? 'diagnosis/fetchICD10Diagnosis'
          : 'diagnosis/fetchICPC2Diagnosis';
      vm.$store
        .dispatch(dispatchType, {
          search,
        })
        .then(() => loading(false));
    }, 500),

    fetchDiagnosesAndFindings() {
      this.$store.dispatch('consultation/fetchDiagnosesAndFindings', this.$route.params.id);
    },
  },
};
</script>

<style scoped></style>
