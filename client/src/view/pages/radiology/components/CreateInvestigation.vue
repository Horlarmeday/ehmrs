<template>
  <b-modal v-model="activePrompt" hide-footer title="Investigation" size="lg">
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
            name="price"
            class="form-control form-control-sm"
            placeholder="Price"
            v-model="price"
          />
          <span class="text-danger text-sm">{{ errors.first('price') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-6">
          <label>NHIS Price:</label>
          <input
            type="number"
            name="price"
            class="form-control form-control-sm"
            placeholder="NHIS Price"
            v-model="nhis_price"
          />
        </div>
        <div class="col-lg-6">
          <label>PHIS Price:</label>
          <input
            type="number"
            name="price"
            class="form-control form-control-sm"
            placeholder="NHIS Price"
            v-model="phis_price"
          />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-lg-6">
          <label>Retainership Price:</label>
          <input
            type="number"
            name="price"
            class="form-control form-control-sm"
            placeholder="NHIS Price"
            v-model="retainership_price"
          />
        </div>
        <div class="col-lg-6">
          <label>Imaging Type</label>
          <v-select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="imaging_id"
            v-model="imaging_id"
            @search="searchImaging"
            :reduce="imagings => imagings.id"
            label="name"
            :options="imagings"
          >
            <template slot="no-options">
              <span>Type to search</span>
            </template>
          </v-select>
          <span class="text-danger text-sm">{{ errors.first('imaging_id') }}</span>
        </div>
      </div>

      <div class="form-group row">
        <div class="col-lg-6">
          <label>Type:</label>
          <div class="radio-inline mt-3">
            <label class="radio" v-for="(type, i) in investigationTypes" :key="i">
              <input type="radio" v-model="investigationType" :value="type" />
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
      @click="createInvestigation"
      :disabled="isDisabled"
      ref="kt_investigation_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
export default {
  name: 'CreateInvestigation',
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
  components: {
    vSelect,
  },
  data() {
    return {
      name: '',
      price: '',
      investigation_id: '',
      imaging_id: '',
      nhis_price: '',
      phis_price: '',
      retainership_price: '',
      investigationType: '',
      investigationTypes: ['Primary', 'Secondary'],
      isDisabled: false,
    };
  },
  computed: {
    imagings() {
      return this.$store.state.radiology.imagings;
    },
    validateForm() {
      return (
        !this.errors.any() &&
        this.name !== '' &&
        this.price !== '' &&
        this.investigation_id !== '' &&
        this.imaging_id !== ''
      );
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
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const {
          price,
          name,
          imaging_id,
          id,
          type,
          retainership_price,
          phis_price,
          nhis_price,
        } = JSON.parse(JSON.stringify(this.data));
        this.price = price;
        this.name = name;
        this.imaging_id = imaging_id;
        this.investigationType = type;
        this.investigation_id = id;
        this.phis_price = phis_price;
        this.nhis_price = nhis_price;
        this.retainership_price = retainership_price;
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
    searchImaging(search) {
      this.$store.dispatch('radiology/fetchImagings', {
        currentPage: 1,
        itemsPerPage: 20,
        search,
      });
    },
    initializeRequest(button) {
      this.removeSpinner(button);
      this.$emit('closeModal');
      this.initValues();
    },
    createInvestigation() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            imaging_id: this.imaging_id,
            name: this.name,
            price: this.price,
            phis_price: this.phis_price,
            nhis_price: this.nhis_price,
            retainership_price: this.retainership_price,
            type: this.investigationType,
            investigation_id: this.investigation_id,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_investigation_submit'];
          this.addSpinner(submitButton);

          if (this.investigation_id && this.investigation_id >= 0) {
            this.$store
              .dispatch('radiology/updateInvestigation', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.investigation_id;
            this.$store
              .dispatch('radiology/addInvestigation', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = '';
      this.price = '';
      this.phis_price = '';
      this.nhis_price = '';
      this.retainership_price = '';
      this.imaging_id = '';
      this.investigation_id = '';
      this.investigationType = '';
    },
  },
};
</script>

<style></style>
