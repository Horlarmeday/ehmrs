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
            <th>Status</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody v-for="(result, i) in results" :key="i">
          <tr v-if="result.status === 'Accepted'">
            <td>{{ accession_number }}</td>
            <td>{{ result.name }}</td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ result.result }}
              </span>
            </td>
            <td>
              <label class="checkbox">
                <input disabled type="checkbox" v-model="result.is_abnormal" />
                <span></span>
              </label>
            </td>
            <td>
              <label :class="getLabelStatus(result.status)" class="label label-inline">
                {{ result.status }}
              </label>
            </td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">{{
                result.comments
              }}</span>
            </td>
            <td>
              <label v-b-tooltip.hover title="Enable to approve test" class="checkbox">
                <input type="checkbox" v-model="result.test_status" />
                <span></span>
              </label>
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
        @click="approveTests"
        ref="kt-approveResult-submit"
        class="text-center btn btn-lg btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultApprovalSection',
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
    patient_id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isDisabled: false,
      results: this.tests.flatMap(({ data }) =>
        data.map(test => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          patient_id: this.patient_id,
          result: test?.result?.result,
          is_abnormal: test?.result?.is_abnormal,
          status: test?.result?.status,
          test_status: false,
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

    approveTests() {
      const results = this.results.filter(({ status }) => status === 'Accepted');
      if (!results.some(({ test_status }) => test_status)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Approve atleast one result',
          type: 'error',
        });
      }
      const submitButton = this.$refs['kt-approveResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('laboratory/approveTestResults', results)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.endRequest(submitButton));
    },

    getLabelStatus(type) {
      if (type === 'Accepted') return 'label-light-success';
      if (type === 'Rejected') return 'label-light-danger';
      return 'label-light-warning';
    },
  },
};
</script>

<style scoped></style>
