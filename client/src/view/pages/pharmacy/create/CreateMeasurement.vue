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
          <span class="text-danger text-sm">{{ errors.first("name") }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Dosage Forms:</label>
        <div class="col-lg-8">
          <select
            v-model="dosage_form_id"
            class="form-control form-control-sm"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="dosage_form"
          >
            <option
              :value="dosage.id"
              v-for="dosage in dosageForms"
              :key="dosage.id"
              >{{ dosage.name }}</option
            >
          </select>
          <span class="text-danger text-sm">{{
            errors.first("dosage_form")
          }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createMeasurement"
      :disabled="isDisabled"
      ref="kt_measurement_submit"
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
      required: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      name: "",
      dosage_form_id: "",
      measurement_id: "",
      isDisabled: false
    };
  },
  created() {
    this.$store.dispatch("pharmacy/fetchDosageForms");
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== "";
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit("closeModal", value);
      }
    },
    dosageForms() {
      return this.$store.state.pharmacy.dosageForms;
    }
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, dosage_form_id } = JSON.parse(
          JSON.stringify(this.data)
        );
        this.measurement_id = id;
        this.name = name;
        this.dosage_form_id = dosage_form_id;
      }
    }
  },
  methods: {
    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add("spinner", "spinner-light", "spinner-right");
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove(
        "spinner",
        "spinner-light",
        "spinner-right"
      );
    },
    initializeRequest(button) {
      this.removeSpinner(button);
      this.$emit("closeModal");
      this.initValues();
    },
    createMeasurement() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            measurement_id: this.measurement_id,
            name: this.name,
            dosage_form_id: this.dosage_form_id
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_measurement_submit"];
          this.addSpinner(submitButton);

          if (this.measurement_id && this.measurement_id >= 0) {
            this.$store
              .dispatch("pharmacy/updateMeasurement", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.measurement_id;
            this.$store
              .dispatch("pharmacy/addMeasurement", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = "";
      this.dosage_form_id = "";
      this.measurement_id = "";
    }
  }
};
</script>

<style></style>
