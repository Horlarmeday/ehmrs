<template>
  <div>
    <div class="form-group row">
      <label class="col-lg-3 col-form-label">Type of Duty:</label>
      <div class="col-lg-6">
        <input
          name="type_of_duty"
          v-validate="'required'"
          data-vv-validate-on="blur"
          type="text"
          v-model="type_of_duty"
          class="form-control form-control-sm"
        />
        <span class="text-danger text-sm">{{ errors.first('type_of_duty') }}</span>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-lg-3 col-form-label">Notes:</label>
      <div class="col-lg-6">
        <textarea
          name="notes"
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="notes"
          class="form-control-sm form-control"
          cols="30"
          rows="10"
        />
        <span class="text-danger text-sm">{{ errors.first('notes') }}</span>
      </div>
    </div>
    <div class="col-lg-6 offset-3">
      <button
        @click="createNursingNote"
        ref="kt_nursingNote_submit"
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
    notes: '',
    type_of_duty: '',
    isDisabled: false,
  }),
  computed: {
    emptyFields() {
      return !this.notes && !this.type_of_duty;
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
      this.$store.dispatch('admission/fetchNursingNotes', {
        id: this.$route.params.id,
      });
    },

    createNursingNote() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            notes: this.notes,
            type_of_duty: this.type_of_duty,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_nursingNote_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('admission/createNursingNote', {
              id: this.$route.params.id,
              data: obj,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.notes = '';
      this.type_of_duty = '';
      this.isDisabled = false;
    },
  },
};
</script>

<style scoped></style>
