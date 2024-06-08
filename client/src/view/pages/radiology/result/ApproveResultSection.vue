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
        <div>
          <b-collapse visible :id="`collapse-${i}`">
            <b-card>
              <text-editor :key="i" v-model="investigation.result" />
            </b-card>
          </b-collapse>
        </div>
      </div>
    </div>
    <div class="separator separator-solid mb-6"></div>
    <div class="text-center">
      <button
        :disabled="isDisabled"
        @click="approveResult"
        ref="kt-addInvestigationResult-submit"
        class="btn btn-lg btn-primary"
      >
        Approve
      </button>
    </div>
  </div>
</template>

<script>
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';
import TextEditor from '@/utils/TextEditor.vue';
export default {
  name: 'ApproveResultSection',
  props: {
    tests: {
      type: Array,
      required: true,
    },
  },
  components: {
    TextEditor,
    DefaultSkeleton,
  },
  data() {
    return {
      investigations: this.tests
        .filter(test => test.status === 'Result Added')
        .map(test => {
          return {
            result: test?.result?.result || '',
            name: test.investigation.name,
            investigation_prescription_id: this.$route.params.id,
            prescribed_investigation_id: test?.id,
          };
        }),
      isDisabled: false,
      COMPLETED: 'Completed',
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

    approveResult() {
      const submitButton = this.$refs['kt-addInvestigationResult-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('radiology/approveInvestigationResult', this.investigations)
        .then(() => {
          this.endRequest(submitButton);
        })
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped></style>
