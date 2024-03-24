<template>
  <div>
    <div class="form-group row mt-4">
      <label class="col-lg-3 col-form-label">Alert:</label>
      <div class="col-lg-8">
        <textarea
          v-validate="'required'"
          data-vv-validate-on="blur"
          name="content"
          class="form-control"
          cols="30"
          rows="10"
          v-model="content"
        />
        <span class="text-danger text-sm">{{ errors.first('content') }}</span>
      </div>
    </div>
    <div>
      <button
        :disabled="isDisabled"
        @click="createAlert"
        ref="kt_alert_submit"
        class="btn btn-primary mb-2 float-right"
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
    id: '',
    isDisabled: false,
  }),

  props: {
    alert: {
      type: Object,
      default: () => {},
    },
  },

  watch: {
    alert(data) {
      this.content = data.alert;
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
      this.$store.dispatch('alert/fetchAlerts', { id: this.$route.params.id });
    },

    initValues() {
      this.content = '';
      this.id = '';
    },

    createAlert() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            alert: this.content,
            visit_id: this.$route.params.id,
            id: this.alert?.id,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_alert_submit'];
          this.addSpinner(submitButton);

          if (obj.id && obj.id >= 0) {
            this.dispatchAlert('alert/updateAlert', submitButton, obj);
          } else {
            delete obj.id;
            this.dispatchAlert('alert/addAlert', submitButton, obj);
          }
        }
      });
    },

    dispatchAlert(type, button, data) {
      this.$store
        .dispatch(type, data)
        .then(() => this.endRequest(button))
        .catch(() => this.removeSpinner(button));
    },
  },
};
</script>

<style>
.accord {
  background: #f1f1f1 !important;
  padding: 0.5rem 1.25rem !important;
}
</style>
