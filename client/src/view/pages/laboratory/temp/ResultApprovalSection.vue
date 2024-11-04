<template>
  <div>
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <DefaultSkeleton v-if="!results?.length" />
      <div v-else class="card" v-for="(test, i) in results" :key="test.prescribed_test_id">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-${i}`">
            <span class="mr-3 text-black-50">Lab No.:</span>
            <span class="mr-5 text-dark">{{ accession_number }}{{ `-${i + 1}` }}</span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50">
              Test.:
            </span>
            <span class="mr-5 text-dark">
              <span
                :title="`${test.test_type}`"
                v-b-tooltip.hover
                :class="getLabelDotStatus(test.test_type)"
                class="label label-dot label-lg mr-1"
              ></span>
              {{ test?.name }}
            </span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50">Sample Type:</span
            ><span class="mr-5 text-dark">{{ test?.sample_name }}</span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50">Result Status:</span
            ><span class="text-dark"
              ><span :class="getResultStatus(test?.status)" class="label label-md label-inline ml-2"
                >{{ test?.status }}
              </span></span
            >
            <span
              v-if="test.is_urgent"
              class="label pulse pulse-warning ml-5"
              title="Urgent"
              v-b-tooltip.hover
            >
              <span class="position-relative">
                <i class="fas fa-lightbulb text-warning icon-lg"
              /></span>
              <span class="pulse-ring"></span>
            </span>
          </div>
        </div>
        <div>
          <b-collapse visible :id="`collapse-${i}`">
            <b-card :class="test.shouldDisable && DISABLED">
              <div class="form-group row">
                <div class="col-lg-8">
                  <label>Result</label>
                  <result-form
                    @emitTestResult="testResultData"
                    :result-form="test?.result_form"
                    :result="test.result"
                    :test-id="test.prescribed_test_id"
                    :section="APPROVAL_SECTION"
                  />
                </div>
                <div class="col-lg-2">
                  <label>Approve Result</label>
                  <label
                    v-b-tooltip.hover
                    title="Enable to approve test"
                    class="checkbox checkbox-lg"
                  >
                    <input type="checkbox" v-model="test.test_status" />
                    <span></span>
                  </label>
                </div>
              </div>
            </b-card>
          </b-collapse>
        </div>
      </div>
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
    <div class="separator separator-solid mb-6"></div>
    <div class="text-center">
      <button
        @click="approveTests"
        :disabled="shouldDisable"
        ref="kt-approveResult-submit"
        class="text-center btn btn-lg btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { getLabelDotStatus, isEmpty } from '@/common/common';
import ResultForm from '@/view/pages/laboratory/temp/ResultForm.vue';

export default {
  name: 'ResultValidationsSection',
  components: { ResultForm, DefaultSkeleton },
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
    result_notes: {
      type: String,
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
      results: this.tests
        .filter(test => test?.result?.status === 'Accepted')
        .map(test => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          sample_name: test?.sample?.name,
          patient_id: this.patient_id,
          result: test?.result?.result,
          comments: test?.result?.comments,
          status: test?.result?.status,
          test_type: test?.test_type,
          is_urgent: test?.is_urgent,
          result_form: test?.test?.result_form,
          shouldDisable: test.status === 'Approved',
          test_status: test.status === 'Approved',
        })),
      accession_numb: this.accession_number,
      isDisabled: false,
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
      DISABLED: 'disabledCard',
      APPROVAL_SECTION: 'ApprovalSection',
    };
  },
  methods: {
    getLabelDotStatus,
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
      results = results.map(
        ({
          result_unit,
          test_type,
          shouldDisable,
          is_urgent,
          result_form,
          sample_name,
          payment_status,
          testStatus,
          ...rest
        }) => rest
      );

      this.$store
        .dispatch('laboratory/approveTestResults', results)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.endRequest(submitButton));
    },

    testResultData(data, testId) {
      const test = this.tests.find(test => test.prescribed_test_id === testId);
      this.$set(test, 'result', data);
    },

    getResultStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Accepted') return 'label-success ';
      if (status === 'Rejected') return 'label-danger ';
      return 'label-primary ';
    },
  },
};
</script>

<style scoped>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}

.vertical-line {
  border-left: 1px solid #858992; /* Adjust color and thickness as needed */
  height: 20px; /* Adjust height as needed */
  margin-left: 5px; /* Adjust margin as needed */
  margin-right: 15px; /* Adjust margin as needed */
}
</style>
