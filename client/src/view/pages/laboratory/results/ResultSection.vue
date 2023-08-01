<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Result</th>
          <th>Abnormal</th>
          <th>Referral Reason</th>
          <th>Institute</th>
          <th>Note</th>
        </tr>
      </thead>
    </table>
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <div class="card" v-for="(order, i) in tests" :key="i">
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
              <table class="table">
                <tbody v-for="(test, index) in order.tests" :key="index">
                  <tr>
                    <th scope="row" align="middle">{{ test.name }}</th>
                    <td style="vertical-align: middle"></td>
                    <td>
                      <input v-model="test.result" type="text" class="" />
                    </td>
                    <td>
                      <span v-b-tooltip.hover title="Result was rejected" class="mr-4" v-if="test.status === 'Rejected'"
                      ><i class="flaticon2-warning text-warning icon-lg" />
                      </span>
                    </td>
                    <td>
                      <input
                        v-b-tooltip.hover
                        title="Enable if result is abnormal"
                        v-model="test.is_abnormal"
                        type="checkbox"
                        class=""
                      />
                    </td>
                    <td>
                      <div>
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
                        class=""
                        :disabled="test.disabledReferral"
                      />
                    </td>
                    <td>
                      <textarea v-model="test.comments" name="" class="" cols="20" rows="2" />
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
export default {
  name: 'ResultSection',
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
          patient_id: this.patient_id,
          disabledReferral: true,
          result: test?.result?.result,
          is_abnormal: test?.result?.is_abnormal,
          institute_referred: test?.result?.institute_referred,
          referral_reason: test?.result?.referral_reason,
          comments: test?.result?.comments,
          status: test?.result?.status,
        })),
      })),
      accession_numb: this.accession_number,
      isDisabled: false,
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

    toggleCheck(test, event, i, index) {
      this.tests[i].tests[index].disabledReferral = !event.target.checked;
    },

    addResult() {
      const results = this.tests
        .map(
          // eslint-disable-next-line no-unused-vars
          ({ sample, ...tests }) => tests
        )
        .flatMap(r => r.tests);
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

<style scoped></style>
