<template>
  <div>
    <div class="table-responsive">
      <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
        <thead>
          <tr>
            <th>Lab No</th>
            <th>Test Name</th>
            <th>Result</th>
            <th>Abnormal</th>
            <th>Accept</th>
            <th>Reject</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody v-for="(result, i) in results" :key="i">
          <tr :class="{ disabled: !result.result }">
            <td>{{ accession_number }}</td>
            <td>{{ result.name }}</td>
            <td>
              <input
                readonly
                type="text"
                class="form-control form-control-sm"
                v-model="result.result"
              />
            </td>
            <td>
              <label class="checkbox">
                <input disabled type="checkbox" v-model="result.is_abnormal" />
                <span></span>
              </label>
            </td>
            <td>
              <label class="radio radio-square">
                <input type="radio" v-model="result.status" value="Accepted" />
                <span></span>
              </label>
            </td>
            <td>
              <label class="radio radio-square">
                <input type="radio" v-model="result.status" value="Rejected" />
                <span></span>
              </label>
            </td>
            <td>
              <textarea readonly v-model="result.comments" cols="20" rows="1" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="separator separator-solid mb-6"></div>
    <div>
      <label>Lab Result Notes</label>
      <textarea
        name="notes"
        v-validate="'required'"
        data-vv-validate-on="blur"
        v-model="result_notes"
        class="form-control-sm form-control mb-6"
        cols="30"
        rows="5"
      />
      <span class="text-danger text-sm">{{ errors.first('notes') }}</span>
    </div>
    <div class="text-center">
      <button
        @click="validateTests"
        ref="kt-validateResult-submit"
        class="text-center btn btn-lg btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultValidationSection',
  props: {
    tests: {
      type: Array,
      required: true,
    },
    accession_number: {
      type: String,
      required: true,
    },
    patient_id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isDisabled: false,
      result_notes: '',
      results: this.tests.flatMap(({ data }) =>
        data.map(test => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          patient_id: this.patient_id,
          result: test?.result?.result,
          is_abnormal: test?.result?.is_abnormal,
          status: test?.result?.status,
          comments: test?.result?.comments,
        }))
      ),
    };
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
    },

    validateTests() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const submitButton = this.$refs['kt-validateResult-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('laboratory/validateTestResults', {
              result_notes: this.result_notes,
              results: this.results,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
};
</script>

<style scoped>
tr.disabled {
  pointer-events: none; /* Disable pointer events to prevent interaction */
  opacity: 0.5; /* Optionally, reduce the opacity to visually indicate the disabled state */
}
</style>
