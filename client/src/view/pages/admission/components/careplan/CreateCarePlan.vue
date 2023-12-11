<template>
  <div>
    <div class="form-group row">
      <div class="col-lg-4">
        <label>Nursing Diagnosis</label>
        <textarea
          v-model="nursing_diagnosis"
          class="form-control form-control-sm"
          cols="30"
          rows="5"
        />
      </div>
      <div class="col-lg-4">
        <label>Nursing Objective</label>
        <textarea
          v-model="nursing_objective"
          class="form-control form-control-sm"
          cols="30"
          rows="5"
        />
      </div>
      <div class="col-lg-4">
        <label>Nursing Action </label>
        <textarea
          v-model="nursing_action"
          class="form-control form-control-sm"
          cols="30"
          rows="5"
        />
      </div>
      <div class="col-lg-4">
        <label>Scientific Principle</label>
        <textarea
          v-model="scientific_principle"
          class="form-control form-control-sm"
          cols="30"
          rows="5"
        />
      </div>
      <div class="col-lg-4">
        <label>Evaluation</label>
        <textarea v-model="evaluation" class="form-control form-control-sm" cols="30" rows="5" />
      </div>
    </div>
    <div>
      <button
        @click="createCarePlan"
        ref="kt_careplan_submit"
        :disabled="isDisabled || emptyFields"
        class="btn btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    evaluation: '',
    scientific_principle: '',
    nursing_objective: '',
    nursing_action: '',
    nursing_diagnosis: '',
    isDisabled: false,
  }),
  computed: {
    emptyFields() {
      return (
        !this.scientific_principle &&
        !this.nursing_diagnosis &&
        !this.nursing_action &&
        !this.nursing_objective &&
        !this.evaluation
      );
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
      this.$store.dispatch('admission/fetchCarePlans', {
        id: this.$route.params.id,
      });
    },

    createCarePlan() {
      if (
        !this.scientific_principle ||
        !this.nursing_diagnosis ||
        !this.nursing_action ||
        !this.nursing_objective ||
        !this.evaluation
      ) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'All fields cannot be empty',
          type: 'error',
        });
      }
      const obj = {
        nursing_action: this.nursing_action,
        nursing_objective: this.nursing_objective,
        nursing_diagnosis: this.nursing_diagnosis,
        scientific_principle: this.scientific_principle,
        evaluation: this.evaluation,
      };
      // set spinner to submit button
      const submitButton = this.$refs['kt_careplan_submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('admission/createCarePlan', {
          id: this.$route.params.id,
          data: obj,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    initValues() {
      this.scientific_principle = '';
      this.evaluation = '';
      this.nursing_action = '';
      this.nursing_objective = '';
      this.nursing_diagnosis = '';
      this.isDisabled = false;
    },
  },
};
</script>

<style scoped></style>
