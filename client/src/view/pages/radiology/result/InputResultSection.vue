<template>
  <div class="mt-3">
    <div class="accordion accordion-toggle-arrow" id="accordionExample1">
      <div v-if="!investigations?.length">
        <DefaultSkeleton />
        <DefaultSkeleton />
      </div>
      <div v-else class="card" v-for="(investigation, i) in investigations" :key="i">
        <div class="card-header">
          <div class="card-title" v-b-toggle="`collapse-${i}`">
            <span class="mr-5 text-black-50">Investigation:</span>
            <span class="mr-5 text-dark">{{ investigation.name }}</span>
          </div>
        </div>
        <div :class="investigation.payment_status === PENDING && 'disabledCard'">
          <b-collapse
            :disabled="investigation.payment_status === PENDING"
            visible
            :id="`collapse-${i}`"
          >
            <b-card>
              <text-editor
                :key="i"
                :disabled="
                  investigation.status === ACCEPTED || investigation.payment_status === PENDING
                "
                v-model="investigation.result"
              />
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
        ref="kt-addInvestigationResult-submit"
        class="btn btn-lg btn-primary"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import TextEditor from '@/utils/TextEditor.vue';
export default {
  name: 'InvestigationResultSection',
  props: {
    tests: {
      type: Array,
      required: true,
    },
    patient_id: {
      type: Number,
      required: true,
    },
  },
  components: {
    TextEditor,
    DefaultSkeleton,
  },
  data() {
    return {
      investigations: this.tests.map(test => {
        return {
          result: test?.result?.result || '',
          patient_id: this.patient_id,
          name: test.investigation.name,
          investigation_prescription_id: this.$route.params.id,
          prescribed_investigation_id: test.id,
          status: test?.result?.status || 'Pending',
          payment_status: test?.payment_status,
        };
      }),
      isDisabled: false,
      COMPLETED: 'Completed',
      ACCEPTED: 'Accepted',
      PENDING: 'Pending',
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

    addResult() {
      const investigations = this.investigations
        .filter(investigation => investigation.status !== this.ACCEPTED)
        // eslint-disable-next-line no-unused-vars
        .map(({ payment_status, ...rest }) => rest);

      if (!investigations.some(({ result }) => result)) {
        return this.$notify({
          group: 'foo',
          title: 'Error message',
          text: 'Result cannot be empty',
          type: 'error',
        });
      }

      const submitButton = this.$refs['kt-addInvestigationResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('radiology/addInvestigationResult', investigations)
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped>
.disabledCard {
  pointer-events: none;
  opacity: 0.4;
}
</style>
