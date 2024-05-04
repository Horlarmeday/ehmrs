<template>
  <div>
    <div class="table-responsive">
      <TableSkeleton v-if="!results?.length" columns="6" />
      <table
        v-else
        class="table table-head-custom table-head-bg table-borderless table-vertical-center"
      >
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
          <tr :class="{ disabled: result.shouldDisable }">
            <td>{{ accession_number }}</td>
            <td>{{ result.name }}</td>
            <td>
              <span class="font-weight-boldest mr-2">{{ result.result || '-' }}</span>
              <span class="font-weight-light">{{ result.result_unit }}</span>
            </td>
            <td>
              <span>{{ result.is_abnormal ? 'Yes' : 'No' }}</span>
            </td>
            <td>
              <label class="radio radio-square">
                <input type="radio" v-model="result.status" :value="ACCEPTED" />
                <span></span>
              </label>
            </td>
            <td>
              <label class="radio radio-square">
                <input type="radio" v-model="result.status" :value="REJECTED" />
                <span></span>
              </label>
            </td>
            <td>
              <span>{{ result.comments }}</span>
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
        v-model="result_notes"
        class="form-control-sm form-control mb-6"
        cols="30"
        rows="5"
      />
    </div>
    <div class="text-center">
      <button
        @click="validateTests"
        :disabled="shouldDisable"
        ref="kt-validateResult-submit"
        class="text-center btn btn-lg btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import TableSkeleton from '@/view/pages/nhis/components/TableSkeleton.vue';
import { isEmpty } from '@/common/common';

export default {
  name: 'ResultValidationSection',
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
    patient_id: {
      type: Number,
      required: true,
    },
  },
  computed: {
    shouldDisable() {
      return this.results.every(result => !result.result);
    },
  },
  data() {
    return {
      isDisabled: false,
      result_notes: '',
      APPROVED: 'Approved',
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
      results: this.tests.flatMap(({ data }) =>
        data.map(test => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          result_unit: test.test.result_unit,
          patient_id: this.patient_id,
          result: test?.result?.result || '',
          is_abnormal: test?.result?.is_abnormal,
          status: test?.result?.status,
          comments: test?.result?.comments,
          testStatus: test.status,
          shouldDisable: !test?.result?.result || test.status === 'Approved',
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
          const results = this.results
            .filter(({ result, testStatus }) => !isEmpty(result) && testStatus !== this.APPROVED)
            // eslint-disable-next-line no-unused-vars
            .map(({ result_unit, shouldDisable, testStatus, ...rest }) => rest);

          if (!results?.length || results.every(result => result.status === this.PENDING)) {
            return this.$notify({
              group: 'foo',
              title: 'Error message',
              text: 'Validate at least one result',
              type: 'error',
            });
          }
          const submitButton = this.$refs['kt-validateResult-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('laboratory/validateTestResults', {
              result_notes: this.result_notes,
              results,
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
