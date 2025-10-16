<template>
  <b-modal v-model="activePrompt" hide-footer title="Measurement">
    <div class="mb-15">
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Name</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            placeholder="Name"
            v-model="name"
            name="name"
          />
          <span class="text-danger text-sm">{{ errors.first('name') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Dosage Forms:</label>
        <div class="col-lg-8">
          <v-select
            v-model="dosage_form_ids"
            :options="dosageForms"
            :reduce="(dosage) => dosage.id"
            label="name"
            multiple
            placeholder="Select dosage forms"
            class="form-control-sm"
          />
          <span class="text-danger text-sm" v-if="showDosageError">
            At least one dosage form is required
          </span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createMeasurement"
      :disabled="isDisabled || !validateForm"
      ref="kt_measurement_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';

export default {
  components: {
    vSelect,
  },
  props: {
    displayPrompt: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      name: '',
      dosage_form_ids: [],
      measurement_id: '',
      isDisabled: false,
      showDosageError: false,
    };
  },
  created() {
    this.$store.dispatch('pharmacy/fetchDosageForms');
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== '' && this.dosage_form_ids.length > 0;
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, dosage_forms } = JSON.parse(JSON.stringify(this.data));
        this.measurement_id = id;
        this.name = name;
        // Extract IDs from dosage_forms array
        this.dosage_form_ids = dosage_forms?.map((df) => df.id) || [];
      }
    },
    dosage_form_ids(val) {
      this.showDosageError = val.length === 0;
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
      this.$emit('closeModal');
      this.initValues();
    },
    createMeasurement() {
      this.$validator.validateAll().then((result) => {
        if (result && this.dosage_form_ids.length > 0) {
          const obj = {
            measurement_id: this.measurement_id,
            name: this.name,
            dosage_form_ids: this.dosage_form_ids,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_measurement_submit'];
          this.addSpinner(submitButton);

          if (this.measurement_id && this.measurement_id >= 0) {
            this.$store
              .dispatch('pharmacy/updateMeasurement', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.measurement_id;
            this.$store
              .dispatch('pharmacy/addMeasurement', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        } else {
          this.showDosageError = this.dosage_form_ids.length === 0;
        }
      });
    },
    initValues() {
      this.name = '';
      this.dosage_form_ids = [];
      this.measurement_id = '';
      this.showDosageError = false;
    },
  },
};
</script>

<style></style>
