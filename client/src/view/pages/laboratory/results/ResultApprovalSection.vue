<template>
  <div>
    <div class="table-responsive">
      <TableSkeleton v-if="!results?.length" columns="6" />
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
          <tr :class="{ disabled: result.shouldDisable }" v-if="result.status === 'Accepted'">
            <td>{{ accession_number }}</td>
            <td>{{ result.name }}</td>
            <td>
              <span class="text-dark-75 font-weight-bolder d-block font-size-md">
                {{ result.result }}
                <span class="font-weight-light">{{ result.result_unit }}</span></span
              >
            </td>
            <td>
              <span>{{ result.is_abnormal ? 'Yes' : 'No' }}</span>
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
    <div v-if="result_notes">
      <label>Result Verification Notes</label>
      <div class="example">
        <div class="example-code">
          <div class="example-highlight">{{ result_notes }}</div>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
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
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';

export default {
  name: 'ResultApprovalSection',
  components: { TableSkeleton },
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
          result_unit: test.test.result_unit,
          patient_id: this.patient_id,
          result: test?.result?.result,
          is_abnormal: test?.result?.is_abnormal,
          status: test?.result?.status,
          shouldDisable: test.status === 'Approved',
          test_status: test.status === 'Approved',
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
      let results = this.results.filter(({ status }) => status === 'Accepted');
      if (results.every(({ test_status }) => !test_status)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Approve at least one result',
          type: 'error',
        });
      }
      const submitButton = this.$refs['kt-approveResult-submit'];
      this.addSpinner(submitButton);

      // eslint-disable-next-line no-unused-vars
      results = results.map(({ result_unit, shouldDisable, ...rest }) => rest);

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

<style scoped>
tr.disabled {
  pointer-events: none; /* Disable pointer events to prevent interaction */
  opacity: 0.5; /* Optionally, reduce the opacity to visually indicate the disabled state */
}
</style>
