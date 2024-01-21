<template>
  <b-modal v-model="activePrompt" hide-footer :title="data.name">
    <div class="p-3">
      <div class="form-group row">
        <label class="col-lg-2 col-form-label">Code</label>
        <div class="col-lg-10">
          <textarea
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="code"
            name="code"
            class="form-control form-control-sm"
            cols="30"
            rows="10"
          />

          <span class="text-danger text-sm">{{ errors.first('code') }}</span>
        </div>
      </div>
      <div>
        <button
          ref="kt_updateAuthCode_submit"
          class="btn btn-primary font-weight-bold float-right"
          @click="addAuthCode"
          :disabled="isDisabled"
        >
          Save
        </button>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    dispatchType: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      code: '',
      isDisabled: false,
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.code !== '';
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
    initValues() {
      this.code = '';
    },

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
      this.$emit('closeModal');
      this.initValues();
    },

    addAuthCode() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt_updateAuthCode_submit'];
          this.addSpinner(submitButton);

          const data = {
            auth_code: this.code,
            id: this.data.id,
          };
          this.$store
            .dispatch(this.dispatchType, { data })
            .then(response => this.endRequest(submitButton, response))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
};
</script>

<style></style>
