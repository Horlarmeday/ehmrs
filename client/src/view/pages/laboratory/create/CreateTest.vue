<template>
  <b-modal v-model="activePrompt" hide-footer title="Test">
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
        <label class="col-lg-3 col-form-label">Price</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="number"
            class="form-control form-control-sm"
            placeholder="Price"
            v-model="price"
            name="price"
          />
          <span class="text-danger text-sm">{{ errors.first("price") }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Sample Type</label>
        <div class="col-lg-8">
          <select
            class="form-control form-control-sm"
            v-model="sample_id"
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="sample"
          >
            <option
              :value="sample.id"
              v-for="sample in samples"
              :key="sample.id"
              >{{ sample.name }}</option
            >
          </select>
          <span class="text-danger text-sm">{{ errors.first("sample") }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createTest"
      :disabled="isDisabled"
      ref="kt_test_submit"
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
      price: "",
      test_id: "",
      sample_id: "",
      isDisabled: false
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.type !== "";
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit("closeModal", value);
      }
    },
    samples() {
      return this.$store.state.laboratory.samples;
    }
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, price, sample_id } = JSON.parse(
          JSON.stringify(this.data)
        );
        this.test_id = id;
        this.name = name;
        this.price = price;
        this.sample_id = sample_id;
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
    createTest() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            sample_id: this.sample_id,
            name: this.name,
            price: this.price,
            test_id: this.test_id
          };
          // set spinner to submit button
          const submitButton = this.$refs["kt_test_submit"];
          this.addSpinner(submitButton);

          if (this.test_id && this.test_id >= 0) {
            this.$store
              .dispatch("laboratory/updateTest", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.test_id;
            this.$store
              .dispatch("laboratory/addTest", obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = "";
      this.price = "";
      this.test_id = "";
      this.sample_id = "";
    }
  },
  created() {
    this.$store.dispatch("laboratory/fetchTestSamples", {
      currentPage: 1,
      itemsPerPage: 20
    });
  }
};
</script>

<style></style>
