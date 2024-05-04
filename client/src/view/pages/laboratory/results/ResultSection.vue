<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Result</th>
          <th class="text-center">Referral Reason</th>
          <th>Institute</th>
          <th>Note</th>
        </tr>
      </thead>
    </table>
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <DefaultSkeleton v-if="!tests?.length" />
      <div v-else class="card" v-for="(order, i) in tests" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-${i}`">
            <span class="mr-5 text-black-50">Lab No.:</span>
            <span class="mr-5 text-dark">{{ accession_number }}{{ `-${i + 1}` }}</span>
            <span class="mr-3 text-black-50">Sample Type:</span
            ><span class="text-dark">{{ order.sample }}</span>
          </div>
        </div>
        <div>
          <b-collapse visible :id="`collapse-${i}`">
            <b-card>
              <DefaultSkeleton v-if="!order.tests?.length" />
              <table class="table">
                <tbody v-for="(test, index) in order.tests" :key="index">
                  <tr :class="{ disabled: test.payment_status === PENDING }">
                    <th scope="row" align="middle">
                      <span
                        :title="`${test.test_type}`"
                        v-b-tooltip.hover
                        :class="getLabelDotStatus(test.test_type)"
                        class="label label-dot label-lg mr-2"
                      ></span>
                      {{ test.name }}
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
                    </th>
                    <td style="vertical-align: middle"></td>
                    <td>
                      <textarea v-model="test.result" cols="25" rows="2" class="" />
                      <span class="font-weight-bold ml-2">{{ test?.result_unit }}</span>
                    </td>
                    <td>
                      <span
                        v-b-tooltip.hover
                        title="Result was rejected"
                        class="mr-4"
                        v-if="test.status === REJECTED"
                        ><i class="flaticon2-warning text-warning icon-lg" />
                      </span>
                    </td>
                    <td>
                      <div class="float-right">
                        <input
                          v-b-tooltip.hover
                          title="Enable if result is referred"
                          type="checkbox"
                          class="mr-2"
                          :checked="!test.disabledReferral"
                          @change="toggleCheck(test, $event, i, index)"
                        />
                        <select
                          v-model="test.referral_reason"
                          class=""
                          :disabled="test.disabledReferral"
                        >
                          <option selected></option>
                          <option value="Referred Out">Referred Out</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="test.institute_referred"
                        class="float-right"
                        :disabled="test.disabledReferral"
                      />
                    </td>
                    <td>
                      <textarea
                        v-model="test.comments"
                        name=""
                        class="float-right"
                        cols="25"
                        rows="2"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </b-card>
          </b-collapse>
        </div>
      </div>
    </div>
    <div class="separator separator-solid mb-6"></div>
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
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import { getLabelDotStatus } from '@/common/common';

export default {
  name: 'ResultSection',
  components: { DefaultSkeleton },
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
  data() {
    return {
      tests: this.prescriptions.map(pres => ({
        sample: pres.sample,
        tests: pres?.data.map(test => ({
          prescribed_test_id: test.id,
          test_prescription_id: this.$route.params.id,
          name: test.test.name,
          result_unit: test.test.result_unit,
          patient_id: this.patient_id,
          disabledReferral: true,
          result: test?.result?.result || '',
          valid_range: test?.test?.valid_range,
          institute_referred: test?.result?.institute_referred || '',
          referral_reason: test?.result?.referral_reason || '',
          comments: test?.result?.comments || '',
          status: test?.result?.status,
          payment_status: test?.payment_status,
          test_type: test?.test_type,
          is_urgent: test?.is_urgent,
        })),
      })),
      accession_numb: this.accession_number,
      isDisabled: false,
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      PENDING: 'Pending',
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

    toggleCheck(test, event, i, index) {
      this.tests[i].tests[index].disabledReferral = !event.target.checked;
    },

    addResult() {
      const results = this.tests
        // eslint-disable-next-line no-unused-vars
        .map(({ sample, ...tests }) => tests)
        .flatMap(r => r.tests)
        .filter(test => test.status !== this.ACCEPTED)
        // eslint-disable-next-line no-unused-vars
        .map(({ result_unit, payment_status, test_type, is_urgent, ...rest }) => rest);

      if (!results.some(({ result }) => result)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Input at least one result',
          type: 'error',
        });
      }
      const submitButton = this.$refs['kt-addResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('laboratory/addTestResult', results)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
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
