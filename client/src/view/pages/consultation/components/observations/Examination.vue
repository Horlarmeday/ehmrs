<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">History and Observation</span>
        </h3>
      </div>

      <div class="card-body py-2">
        <div class="form-group row">
          <label class="col-2 col-form-label">Chief Complaint</label>
          <div class="col-9">
            <textarea
              v-model="complaint_note"
              class="form-control form-control-sm"
              cols="10"
              rows="2"
              name="chief_complaint"
              v-validate="'required'"
              data-vv-validate-on="blur"
            />
            <span class="text-danger text-sm">{{ errors.first('complaint') }}</span>
          </div>
        </div>
        <div class="form-group row mt-3" v-for="(complaint, index) in complaints" :key="index">
          <label class="col-lg-2 col-form-label">Additional Complaint:</label>
          <div class="col-lg-4">
            <input
              name="complaint"
              v-model="complaint.complaint"
              type="text"
              class="form-control
            form-control-sm"
            />
            <!--            <span class="text-danger text-sm">{{ errors.first('complaint') }}</span>-->
          </div>
          <label class="col-lg-1 col-form-label">For</label>
          <div class="col-lg-2">
            <input
              name="frequency_number"
              v-model="complaint.frequency_number"
              type="number"
              class="form-control form-control-sm"
            />
            <!--            <span class="text-danger text-sm">{{ errors.first('frequency_number') }}</span>-->
          </div>
          <div class="col-lg-2">
            <select
              name="frequency"
              v-model="complaint.frequency"
              class="form-control form-control-sm"
            >
              <option value="Minutes">Minutes</option>
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
              <option value="Weeks">Weeks</option>
              <option value="Months">Months</option>
              <option value="Years">Years</option>
            </select>
            <!--            <span class="text-danger text-sm">{{ errors.first('frequency') }}</span>-->
          </div>
          <a href="#" class="col-lg-1 col-form-label">
            <i
              v-if="index === 0"
              class="far fa-plus-square mr-3 text-primary icon-lg"
              @click="addNewComplaint"
            />
            <i
              class="far fa-trash-alt icon-md text-danger"
              v-if="index !== 0"
              @click="removeComplaints(index)"
            />
          </a>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">History Notes</label>
          <div class="col-9">
            <textarea
              v-model="history_note"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Examination Notes</label>
          <div class="col-9">
            <textarea
              v-model="examination_note"
              class="form-control form-control-sm"
              cols="30"
              rows="2"
            />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-2 col-form-label">Smoking History</label>
          <div class="radio-inline col-9">
            <label class="radio radio-lg">
              <input type="radio" name="" v-model="has_smoking_history" :value="true" />
              <span></span>
              Yes
            </label>
            <label class="radio radio-lg">
              <input type="radio" name="" v-model="has_smoking_history" :value="false" />
              <span></span>
              No
            </label>
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
export default {
  name: 'Examination',
  components: { vSelect },
  data() {
    return {
      complaints: [
        {
          complaint: '',
          frequency_number: '',
          frequency: '',
          notes: '',
        },
      ],
      diagnosis: [
        {
          certainty: '',
          diagnosis: '',
          notes: '',
        },
      ],
      complaint_note: '',
      history_note: '',
      examination_note: '',
      has_smoking_history: '',
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
      this.fetchVisitsHistory();
    },

    createExamination() {
      this.removeEmptyDiagnosis();
      if (this.checkDiagnosisNotSelected()) return this.errorMessage();
      this.$validator
        .validateAll()
        .then(result => {
          if (result) {
            const obj = {
              ...(this.complaints.some(({ complaint }) => complaint) && {
                complaints: this.complaints,
              }),
              has_smoking_history: this.has_smoking_history,
              examination_note: this.examination_note,
              history_note: this.history_note,
              complaint_note: this.complaint_note,
              diagnosis: this.diagnosis.map(({ diagnosis, certainty, notes }) => ({
                diagnosis_id: diagnosis.id,
                type: diagnosis.type,
                certainty,
                notes,
              })),
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
        })
        .catch(e => console.error(e));
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

    addNewComplaint() {
      this.complaints.push({
        complaint: '',
        frequency_number: '',
        frequency: '',
        notes: '',
      });
    },

    removeComplaints(index) {
      this.complaints.splice(index, 1);
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
      this.complaints = [
        {
          complaint: '',
          frequency_number: '',
          frequency: '',
          notes: '',
        },
      ];
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

    fetchVisitsHistory() {
      this.$store.dispatch('consultation/fetchVisitsHistory', {
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        visitId: this.$route.params.id,
      });
    },
  },
};
</script>

<style scoped></style>
