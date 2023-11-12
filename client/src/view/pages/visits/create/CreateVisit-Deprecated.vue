<template>
  <b-modal v-model="activePrompt" hide-footer :title="`Create Visit for ${patient.fullname}`">
    <div class="mb-15">
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Type:</label>
        <div class="col-lg-8">
          <select name="type" v-model="type" class="form-control form-control-sm">
            <option value="OPD">OPD</option>
            <option value="IPD">IPD</option>
            <option value="Antenatal">ANC</option>
            <option value="Emergency">Emergency</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('type') }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createVisit"
      :disabled="isDisabled"
      ref="kt_visit_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    patient: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      type: '',
      isDisabled: false,
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== '';
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
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

    initializeRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$emit('closeModal');
    },

    createVisit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            patient_id: this.patient.id,
            type: this.type,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_visit_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('visit/addVisit', obj)
            .then(() => this.initializeRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    initValues() {
      this.type = '';
    },
  },
};
</script>

<style></style>
