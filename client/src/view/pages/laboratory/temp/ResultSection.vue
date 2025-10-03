<template>
  <div>
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <DefaultSkeleton v-if="!tests?.length" />
      <div v-else class="card" v-for="(test, i) in tests" :key="test.prescribed_test_id">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-${i}`">
            <span class="mr-3 text-black-50">Lab No.:</span>
            <span class="mr-5 text-dark">{{ accession_number }}{{ `-${i + 1}` }}</span>
            <span class="vertical-line"></span>

            <span class="mr-3 text-black-50"> Test.: </span>
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

            <span class="mr-3 text-black-50">Payment Status:</span
            ><span class="text-dark"
              ><span
                :class="getPaymentStatus(test?.payment_status)"
                class="label label-md label-inline ml-2"
                >{{ test?.payment_status }}
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
            <span
              v-b-tooltip.hover
              title="Result was rejected"
              class="ml-5"
              v-if="test.status === REJECTED"
              ><i class="flaticon2-warning text-warning icon-lg" />
            </span>
          </div>
        </div>
        <div>
          <b-collapse :visible="i === 0" :id="`collapse-${i}`">
            <b-card
              :class="
                test.payment_status === PENDING || test.test_status === APPROVED ? DISABLED : ''
              "
            >
              <div class="form-group row">
                <div :class="`${test?.result_form === 'FBCForm' ? 'col-lg-12' : 'col-lg-7'}`">
                  <label>Result</label>
                  <result-form
                    @emitTestResult="testResultData"
                    :result-form="test?.result_form"
                    :result="test.result"
                    :test-id="test.prescribed_test_id"
                    :section="RESULT_SECTION"
                  />
                </div>
                <div class="col-lg-2">
                  <label>Referral Reason</label>
                  <div style="display: flex">
                    <input
                      v-b-tooltip.hover
                      title="Enable if result is referred"
                      type="checkbox"
                      class="mr-2"
                      :checked="!test.disabledReferral"
                      @change="toggleCheck($event, i)"
                    />
                    <input
                      v-model="test.referral_reason"
                      type="text"
                      :disabled="test.disabledReferral"
                      class="form-control form-control-sm"
                    />
                  </div>
                </div>
                <div class="col-lg-3">
                  <label>Institute Referred</label>
                  <input
                    type="text"
                    v-model="test.institute_referred"
                    class="form-control form-control-sm"
                    :disabled="test.disabledReferral"
                  />
                </div>
              </div>
            </b-card>
          </b-collapse>
        </div>
      </div>
    </div>
    <div class="separator separator-solid mb-6"></div>
    <div>
      <div class="text-center col-4 offset-4 mb-6">
        <label class="font-weight-bold">Tester Name</label>
        <div>
          <select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="tester_id"
            v-model="tester_id"
            class="form-control-sm form-control"
            disabled
          >
            <option v-for="(staff, i) in staffs" :value="staff.id" :key="i">
              {{ staff.fullname }}
            </option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('tester_id') }}</span>
        </div>
      </div>
      <div class="text-center">
        <button
          :disabled="isDisabled"
          @click="addResult"
          ref="kt-addResult-submit"
          class="btn btn-lg btn-primary"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { getLabelDotStatus, parseJwt } from '@/common/common';
import ResultForm from '@/view/pages/laboratory/temp/ResultForm.vue';

export default {
  name: 'AddResultSection',
  components: { ResultForm, DefaultSkeleton },
  props: {
    prescriptions: {
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
  created() {
    this.fetchEmployees({ search: 'Laboratory' });
  },
  computed: {
    staffs() {
      return this.$store.state.employee.employees;
    },
  },
  data() {
    return {
      tests: this.prescriptions.map((test) => ({
        prescribed_test_id: test.id,
        test_prescription_id: this.$route.params.id,
        name: test.test.name,
        sample_name: test?.sample?.name,
        patient_id: this.patient_id,
        disabledReferral: true,
        result: test?.result?.result || {},
        valid_range: test?.test?.valid_range,
        institute_referred: test?.result?.institute_referred || '',
        referral_reason: test?.result?.referral_reason || '',
        comments: test?.result?.comments || '',
        status: test?.result?.status,
        payment_status: test?.payment_status,
        test_type: test?.test_type,
        is_urgent: test?.is_urgent,
        result_form: test?.test?.result_form,
        test_status: test?.status,
      })),
      tester_id:
        this.prescriptions[0]?.tester_id || parseJwt(localStorage.getItem('user_token'))?.sub,
      accession_numb: this.accession_number,
      isDisabled: false,
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
      DISABLED: 'disabledCard',
      RESULT_SECTION: 'ResultSection',
      APPROVED: 'Approved',
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

    toggleCheck(event, index) {
      this.tests[index].disabledReferral = !event.target.checked;
    },

    addResult() {
      const results = this.tests
        .filter((test) => Object.values(test.result)?.length > 0)
        .map(
          ({
            result_unit,
            payment_status,
            test_type,
            is_urgent,
            result_form,
            sample_name,
            test_status,
            ...rest
          }) => rest
        );

      if (results.every(({ result }) => Object.values(result)?.length === 0)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Input at least one result',
          type: 'error',
        });
      }

      this.$validator.validateAll().then((result) => {
        if (result) {
          const submitButton = this.$refs['kt-addResult-submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('laboratory/addTestResult', { results, tester_id: this.tester_id })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    testResultData(data, testId) {
      const test = this.tests.find((test) => test.prescribed_test_id === testId);
      this.$set(test, 'result', data);
    },

    getPaymentStatus(status) {
      if (status === 'Pending') return 'label-warning ';
      if (status === 'Paid') return 'label-success ';
      if (status === 'Cleared') return 'label-info ';
      return 'label-primary ';
    },

    fetchEmployees({ currentPage = 1, itemsPerPage = 100, search }) {
      return this.$store.dispatch('employee/fetchEmployees', {
        currentPage,
        itemsPerPage,
        ...(search && { search }),
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
