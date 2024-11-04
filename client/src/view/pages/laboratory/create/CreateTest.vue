<template>
  <b-modal v-model="activePrompt" hide-footer title="Test" size="lg">
    <div class="mb-15">
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Name:</label>
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
        <div class="col-lg-6">
          <label>Price:</label>
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
        <div class="col-lg-6">
          <label>NHIS Price:</label>
          <input
            type="number"
            class="form-control form-control-sm"
            placeholder="NHIS Price"
            v-model="nhis_price"
          />
        </div>
        <div class="col-lg-6">
          <label>PHIS Price:</label>
          <input
            type="number"
            class="form-control form-control-sm"
            placeholder="PHIS Price"
            v-model="phis_price"
          />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Retainership Price:</label>
          <input
            type="number"
            class="form-control form-control-sm"
            placeholder="PHIS Price"
            v-model="retainership_price"
          />
        </div>
        <div class="col-lg-6">
          <label>Sample Type:</label>
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
        <div class="col-lg-6">
          <label>Result Unit:</label>
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
        <div class="col-lg-6">
          <label>Result Valid Range:</label>
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
        <div class="col-lg-12">
          <label>Result Form:</label>
          <div class="radio-inline mt-3">
            <label class="radio radio-lg" v-for="(form, i) in forms" :key="i">
              <input type="radio" v-model="result_form" :value="form.code" />
              <span></span>
              {{ form.name }}
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
import { resultFormList } from '@/view/pages/laboratory/forms/resultFormList';

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
      nhis_price: '',
      phis_price: '',
      retainership_price: '',
      test_id: '',
      sample_id: '',
      valid_range: '',
      result_unit: '',
      result_form: 'DefaultResultForm',
      isDisabled: false,
      forms: resultFormList,
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
        const {
          id,
          name,
          price,
          sample_id,
          result_unit,
          valid_range,
          type,
          nhis_price,
          phis_price,
          retainership_price,
          result_form,
        } = JSON.parse(JSON.stringify(this.data));
        this.test_id = id;
        this.name = name;
        this.price = price;
        this.sample_id = sample_id;
        this.result_unit = result_unit;
        this.valid_range = valid_range;
        this.testType = type;
        this.nhis_price = nhis_price;
        this.phis_price = phis_price;
        this.retainership_price = retainership_price;
        this.result_form = result_form;
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
            phis_price: this.phis_price,
            nhis_price: this.nhis_price,
            retainership_price: this.retainership_price,
            test_id: this.test_id,
            result_unit: this.result_unit,
            valid_range: this.valid_range,
            result_form: this.result_form,
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
      this.nhis_price = '';
      this.phis_price = '';
      this.retainership_price = '';
      this.test_id = '';
      this.sample_id = '';
      this.valid_range = '';
      this.result_unit = '';
      this.result_form = '';
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
