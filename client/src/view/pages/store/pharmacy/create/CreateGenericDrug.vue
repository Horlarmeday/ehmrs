<template>
  <b-modal v-model="activePrompt" hide-footer title="Generic Drug">
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
        <label class="col-lg-3 col-form-label">Type:</label>
        <div class="col-lg-8">
          <select
            v-model="type"
            class="form-control form-control-sm"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="drug_type"
          >
            <option value="Drug">Drug</option>
            <option value="Consumable">Consumable</option>
          </select>
          <span class="text-danger text-sm">{{
            errors.first("drug_type")
          }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createGenericDrug"
      :disabled="isDisabled"
      ref="kt_drug_submit"
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
      type: "",
      drug_id: "",
      isDisabled: false
    };
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
    }
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, type } = JSON.parse(JSON.stringify(this.data));
        this.drug_id = id;
        this.name = name;
        this.type = type;
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
    createGenericDrug() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            drug_id: this.drug_id,
            name: this.name,
            type: this.type
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_drug_submit"];
          this.addSpinner(submitButton);

          if (this.drug_id && this.drug_id >= 0) {
            this.$store
              .dispatch("store/updateGenericDrug", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.drug_id;
            this.$store
              .dispatch("store/addGenericDrug", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = "";
      this.type = "";
      this.drug_id = "";
    }
  }
};
</script>

<style></style>
