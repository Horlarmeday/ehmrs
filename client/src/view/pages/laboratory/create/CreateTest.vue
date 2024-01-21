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
          <span class="text-danger text-sm">{{ errors.first('name') }}</span>
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
          <span class="text-danger text-sm">{{ errors.first('price') }}</span>
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
            <option :value="sample.id" v-for="sample in samples" :key="sample.id">{{
              sample.name
            }}</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('sample') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Result Unit</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            placeholder="e.g mg/dL"
            v-model="result_unit"
            name="result_unit"
          />
          <span class="text-danger text-sm">{{ errors.first('result_unit') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Result Valid Range</label>
        <div class="col-lg-8">
          <input
            v-validate="'required'"
            data-vv-validate-on="blur"
            type="text"
            class="form-control form-control-sm"
            placeholder="e.g 0.7 - 1.2"
            v-model="valid_range"
            name="valid_range"
          />
          <span class="text-danger text-sm">{{ errors.first('valid_range') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Type</label>
        <div class="col-lg-8">
          <div class="radio-inline mt-3">
            <label class="radio" v-for="(type, i) in testTypes" :key="i">
              <input type="radio" v-model="testType" :value="type" />
              <span></span>
              {{ type }}
            </label>
          </div>
          <span class="text-danger text-sm">{{ errors.first('type') }}</span>
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
      price: '',
      test_id: '',
      sample_id: '',
      valid_range: '',
      result_unit: '',
      testType: '',
      isDisabled: false,
      testTypes: ['Primary', 'Secondary'],
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.type !== '';
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    samples() {
      return this.$store.state.laboratory.samples;
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, price, sample_id, result_unit, valid_range, type } = JSON.parse(
          JSON.stringify(this.data)
        );
        this.test_id = id;
        this.name = name;
        this.price = price;
        this.sample_id = sample_id;
        this.result_unit = result_unit;
        this.valid_range = valid_range;
        this.testType = type;
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
    createTest() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            sample_id: this.sample_id,
            name: this.name,
            price: this.price,
            test_id: this.test_id,
            result_unit: this.result_unit,
            valid_range: this.valid_range,
            type: this.testType,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_test_submit'];
          this.addSpinner(submitButton);

          if (this.test_id && this.test_id >= 0) {
            this.$store
              .dispatch('laboratory/updateTest', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.test_id;
            this.$store
              .dispatch('laboratory/addTest', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = '';
      this.price = '';
      this.test_id = '';
      this.sample_id = '';
      this.valid_range = '';
      this.result_unit = '';
      this.testType = '';
    },
  },
  created() {
    this.$store.dispatch('laboratory/fetchTestSamples', {
      currentPage: 1,
      itemsPerPage: 20,
    });
  },
};
</script>

<style></style>
