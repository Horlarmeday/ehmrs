<template>
  <b-modal v-model="activePrompt" hide-footer :title="service.name">
    <div class="p-3">
      <div class="form-group row">
        <label class="col-lg-2 col-form-label">Test Groups</label>
        <div class="col-lg-10">
          <select
            name="service_group"
            class="form-control"
            v-model="service_group"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option v-for="(group, i) in groups" :key="i">{{ group }}</option>
          </select>

          <span class="text-danger text-sm">{{ errors.first('service_group') }}</span>
        </div>
      </div>
      <div>
        <button
          ref="kt_updateServiceGroup_submit"
          class="btn btn-primary font-weight-bold float-right"
          @click="updateServiceGroup"
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
    service: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      service_group: '',
      isDisabled: false,
      groups: ['Primary', 'Secondary'],
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
      this.service_group = '';
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

    updateServiceGroup() {
      this.$validator.validateAll().then(result => {
        if (result) {
          // set spinner to submit button
          const submitButton = this.$refs['kt_updateTestGroup_submit'];
          this.addSpinner(submitButton);

          const data = {
            service_group: this.service_group,
            id: this.service.id,
          };
          this.$store
            .dispatch('order/updatePrescribedService', { data })
            .then(response => this.endRequest(submitButton, response))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
};
</script>

<style></style>
