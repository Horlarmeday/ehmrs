<template>
  <b-modal v-model="activePrompt" hide-footer title="Unit">
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
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createUnit"
      :disabled="isDisabled"
      ref="kt_unit_submit"
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
      unit_id: "",
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
        const { id, name } = JSON.parse(JSON.stringify(this.data));
        this.unit_id = id;
        this.name = name;
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
    createUnit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            unit_id: this.unit_id,
            name: this.name
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_unit_submit"];
          this.addSpinner(submitButton);

          if (this.unit_id && this.unit_id >= 0) {
            this.$store
              .dispatch("model/updateUnit", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.unit_id;
            this.$store
              .dispatch("model/addUnit", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = "";
      this.unit_id = "";
    }
  }
};
</script>

<style></style>
