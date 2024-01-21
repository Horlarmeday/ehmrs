<template>
  <div>
    <div class="form-group row">
      <label class="col-lg-3 col-form-label">Notes:</label>
      <div class="col-lg-6">
        <textarea
          name="wardRound"
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="content"
          class="form-control-sm form-control"
          cols="30"
          rows="10"
        />
        <span class="text-danger text-sm">{{ errors.first('wardRound') }}</span>
      </div>
    </div>
    <div class="col-lg-6 offset-3">
      <button
        @click="createWardRound"
        ref="kt_wardRound_submit"
        :disabled="isDisabled || emptyFields"
        class="btn btn-primary float-right"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    content: '',
    isDisabled: false,
  }),
  computed: {
    emptyFields() {
      return !this.content;
    },
    visit() {
      return this.$store.state.visit.visit;
    },
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
      this.initValues();
      this.$store.dispatch('admission/fetchWardRounds', {
        id: this.visit.admission_id,
      });
    },

    createWardRound() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            content: this.content,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_wardRound_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('admission/createWardRound', {
              id: this.visit.admission_id,
              data: obj,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.content = '';
      this.isDisabled = false;
    },
  },
};
</script>

<style scoped></style>
