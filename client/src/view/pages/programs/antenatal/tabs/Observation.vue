<template>
  <div class="card card-custom card-stretch gutter-b card-shadowless">
    <div class="card-body">
      <observations-accordion />
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Mother's Condition:</label>
          <textarea
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="mother_condition"
            name="mother_condition"
            class="form-control"
            cols="30"
            rows="5"
          />
          <span class="text-danger text-sm">{{ errors.first('mother_condition') }}</span>
        </div>
        <div class="col-lg-6">
          <label>Foetal Condition:</label>
          <textarea
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="foetal_condition"
            name="foetal_condition"
            class="form-control"
            cols="30"
            rows="5"
          />
          <span class="text-danger text-sm">{{ errors.first('foetal_condition') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Doctor's Comments:</label>
          <textarea
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="doctor_comments"
            name="doctor_comments"
            class="form-control"
            cols="30"
            rows="5"
          />
          <span class="text-danger text-sm">{{ errors.first('doctor_comments') }}</span>
        </div>
        <div class="col-lg-6">
          <label>Doctor Continuation Sheet:</label>
          <textarea
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="continuation_sheet"
            name="doctor_continuation_sheet"
            class="form-control"
            cols="30"
            rows="5"
          />
          <span class="text-danger text-sm">{{ errors.first('continuation_sheet') }}</span>
        </div>
      </div>
      <diagnosis
        :send-diagnosis="emitDiagnosis"
        @diagnosis="getDiagnosis"
        :end-diagnosis="endDiagnosis"
      />
      <div>
        <button
          ref="kt_observation_submit"
          :disabled="isDisabled"
          class="btn btn-primary float-right"
          @click="createObservation"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import Diagnosis from '@/view/pages/consultation/components/observations/Diagnosis.vue';
import { notifyError } from '@/common/common';
import ObservationsAccordion from '@/view/components/accordion/AntenatalObservationAccordion.vue';

export default {
  name: 'Observation',
  components: { ObservationsAccordion, Diagnosis },
  data: () => ({
    mother_condition: '',
    foetal_condition: '',
    doctor_comments: '',
    continuation_sheet: '',
    isDisabled: false,
    diagnosis: null,
    emitDiagnosis: false,
    endDiagnosis: false,
  }),
  methods: {
    getDiagnosis(value) {
      this.diagnosis = value;
    },

    removeDiagnosis(index, diagnosis) {
      diagnosis.splice(index, 1);
    },

    removeEmptyDiagnosis(diagnosis) {
      const index = diagnosis.findIndex(({ diagnosis }) => !diagnosis);
      if (diagnosis.length > 1 && index !== -1) this.removeDiagnosis(index, diagnosis);
    },

    checkDiagnosisNotSelected(diagnosis) {
      return diagnosis.some(({ diagnosis, certainty }) => !diagnosis || !certainty);
    },

    errorMessage() {
      this.$notify({
        group: 'foo',
        title: 'Error!',
        text: 'Please select a diagnosis with certainty',
        type: 'error',
      });
    },

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
    },

    createObservation() {
      this.emitDiagnosis = true;
      this.$validator
        .validateAll()
        .then(result => {
          if (result) {
            this.removeEmptyDiagnosis(this.diagnosis);
            if (this.checkDiagnosisNotSelected(this.diagnosis)) return this.errorMessage();

            const data = {
              mother_condition: this.mother_condition,
              foetal_condition: this.foetal_condition,
              doctor_comments: this.doctor_comments,
              continuation_sheet: this.continuation_sheet,
              diagnosis: this.diagnosis.map(({ diagnosis, certainty, notes }) => ({
                diagnosis_id: diagnosis.id,
                type: diagnosis.type,
                certainty,
                notes,
              })),
              ante_natal_id: this.$route.query.antenatal,
            };
            const submitButton = this.$refs['kt_observation_submit'];
            this.addSpinner(submitButton);

            this.$store
              .dispatch('antenatal/createObservation', {
                id: this.$route.params.id,
                data,
              })
              .then(() => this.endRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        })
        .catch(e => notifyError(e));
    },

    initValues() {
      this.mother_condition = '';
      this.foetal_condition = '';
      this.doctor_comments = '';
      this.continuation_sheet = '';
      this.isDisabled = false;
      this.diagnosis = null;
      this.emitDiagnosis = false;
      this.endDiagnosis = true;
    },
  },
};
</script>

<style scoped></style>
