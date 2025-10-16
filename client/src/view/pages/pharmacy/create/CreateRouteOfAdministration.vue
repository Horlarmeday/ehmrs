<template>
  <b-modal v-model="activePrompt" hide-footer title="Route of Administration">
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
            label="name"
            :reduce="(dosage) => dosage.id"
            multiple
            placeholder="Select dosage forms"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="dosage_form"
          />
          <span class="text-danger text-sm">{{ errors.first('dosage_form') }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createRoute"
      :disabled="isDisabled"
      ref="kt_route_submit"
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
      route_id: '',
      isDisabled: false,
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
        this.route_id = id;
        this.name = name;
        // Extract IDs from dosage_forms array
        this.dosage_form_ids = dosage_forms ? dosage_forms.map((df) => df.id) : [];
      }
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
    createRoute() {
      this.$validator.validateAll().then((result) => {
        if (result) {
          const obj = {
            route_id: this.route_id,
            name: this.name,
            dosage_form_ids: this.dosage_form_ids,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_route_submit'];
          this.addSpinner(submitButton);

          if (this.route_id && this.route_id >= 0) {
            this.$store
              .dispatch('pharmacy/updateRoute', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.route_id;
            this.$store
              .dispatch('pharmacy/addRoute', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = '';
      this.dosage_form_ids = [];
      this.route_id = '';
    },
  },
};
</script>

<style></style>
