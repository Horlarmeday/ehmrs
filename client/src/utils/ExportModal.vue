<template>
  <b-modal v-model="activePrompt" hide-footer title="Export Data">
    <div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Data Type</label>
        <div class="col-lg-8">
          <select
            class="form-control"
            name="dataType"
            v-model="dataType"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option v-for="(d, i) in dataTypes" :key="i">{{ d }}</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('dataType') }}</span>
        </div>
      </div>
      <div>
        <button ref="kt_export_submit" @click="exportData" class="btn btn-primary">Export</button>
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
    action: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
      default: () => {},
    },
    selectAll: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    dataTypes: ['CSV', 'Excel', 'PDF'],
    dataType: '',
  }),
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
    initValues() {
      this.dataType = '';
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.$emit('closeModal');
      this.initValues();
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    exportData() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            dataType: this.dataType,
            selectAll: this.selectAll,
            ...this.data,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_export_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch(this.action, obj)
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
  },
};
</script>
<style></style>
