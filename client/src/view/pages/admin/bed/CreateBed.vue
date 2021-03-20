<template>
  <b-modal v-model="activePrompt" hide-footer :title="`Bed in ${name}`">
    <div class="mb-15">
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Code</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            placeholder="Bed Number"
            v-model="code"
            name="code"
          />
          <span class="text-danger text-sm">{{ errors.first("code") }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Bed Type:</label>
        <div class="col-lg-8">
          <select
            v-model="bed_type"
            class="form-control form-control-sm"
            name="bed_type"
            v-validate="'required'"
            data-vv-validate-on="blur"
          >
            <option value="Deluxe">Deluxe</option>
            <option value="Normal">Normal</option>
            <option value="Luxury">Luxury</option>
          </select>
          <span class="text-danger text-sm">{{
            errors.first("bed_type")
          }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createBed"
      :disabled="isDisabled"
      ref="kt_bed_submit"
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
      code: "",
      bed_type: "",
      bed_id: "",
      ward_id: "",
      isDisabled: false
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.code !== "";
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
        this.ward_id = id;
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

    createBed() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            ward_id: this.ward_id,
            code: this.code,
            bed_type: this.bed_type
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_bed_submit"];
          this.addSpinner(submitButton);

          //   if (this.ward_id && this.ward_id >= 0) {
          //     this.$store
          //       .dispatch("model/updateBed", obj)
          //       .then(response => {
          //         this.initializeRequest(submitButton, response);
          //       })
          //       .catch(err => {
          //         this.cancelRequest(submitButton, err);
          //       });
          //   } else {
          //     delete obj.ward_id;
          this.$store
            .dispatch("model/addBed", obj)
            .then(() => this.initializeRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },
    initValues() {
      this.code = "";
      this.bed_type = "";
      this.ward_id = "";
    }
  }
};
</script>

<style>
.pointer {
  cursor: pointer;
}
</style>
