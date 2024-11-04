<template>
  <div class="accordion accordion-toggle-arrow" id="accordionExample1">
    <div class="card" v-for="(test, i) in results" :key="test.prescribed_test_id">
      <div class="card-header">
        <div class="card-title" v-b-toggle="`collapse-${i}`">
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
      <result-form
        :result-form="test?.result_form"
        :result="test.result"
        :test-id="test.prescribed_test_id"
        :section="APPROVAL_SECTION"
      />
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
    <div
      class="kt-invoice__body kt-invoice__body--centered table-responsive border"
      v-if="test_verifier && test_approver"
    >
      <table class="table">
        <thead>
          <tr>
            <th>APPROVED BY</th>
            <th>DATE APPROVED</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {{ test_approver }}
            </td>
            <td>
              {{ test_approved_date | dayjs('MMMM D, YYYY, h:mm A') }}
            </td>
          </tr>
          <tr>
            <th>VERIFIED BY</th>
            <th>DATE APPROVED</th>
            <th></th>
          </tr>
          <tr>
            <td>
              {{ test_verifier }}
            </td>
            <td>
              {{ test_verified_date | dayjs('MMMM D, YYYY, h:mm A') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="text-center mt-3" v-if="allowedRoles.includes(currentUser.role)">
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
import ResultForm from '@/view/pages/laboratory/temp/ResultForm.vue';
import { getLabelDotStatus, parseJwt } from '@/common/common';

export default {
  components: { ResultForm },
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
      required: false,
    },
  },
  data() {
    return {
      results: this.tests.map(test => ({
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
      APPROVAL_SECTION: 'ApprovalSection',
      test_verifier: this.tests?.[0]?.test_verifier?.fullname,
      test_approver: this.tests?.[0]?.test_approver?.fullname,
      test_approved_date: this.tests?.[0]?.test_approved_date,
      test_verified_date: this.tests?.[0]?.test_verified_date,
      allowedRoles: ['Super Admin', 'Laboratory'],
      currentUser: parseJwt(localStorage.getItem('user_token')),
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

<style scoped></style>
