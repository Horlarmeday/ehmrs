<template>
  <div>
    <div class="table-responsive">
      <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Result</th>
            <th>Abnormal</th>
            <th>Valid Range</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody v-for="(test, i) in tests" :key="i">
          <tr>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ test.test.name }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ test.result.result }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ test.result.is_abnormal ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ test?.test?.valid_range }} {{ test?.test?.result_unit }}
              </span>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                test.result.comments
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="separator separator-solid mb-6"></div>
    <div>
      <label>Result Verification Notes</label>
      <textarea
        disabled
        v-model="result_notes"
        class="form-control-sm form-control mb-6"
        cols="30"
        rows="5"
      />
    </div>
    <div class="text-center">
      <button
        @click="downloadTestResult"
        ref="kt-downloadResult-submit"
        class="text-center btn btn-lg btn-primary"
      >
        Download
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tests: {
      type: Array,
      required: true,
    },
    accession_number: {
      type: String,
      required: true,
    },
    result_notes: {
      type: String,
      required: true,
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
    },

    downloadTestResult() {
      const submitButton = this.$refs['kt-downloadResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('laboratory/downloadTestResult', { id: this.$route.params.id })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.endRequest(submitButton));
    },
  },
};
</script>
