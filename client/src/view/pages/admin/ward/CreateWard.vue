<template>
  <b-modal v-model="activePrompt" hide-footer title="Ward">
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
        <label class="col-lg-3 col-form-label">Associated Service</label>
        <div class="col-lg-8">
          <v-select
            v-validate="'required'"
            data-vv-validate-on="blur"
            v-model="service_id"
            name="service"
            label="name"
            @search="searchServices"
            :reduce="services => services.id"
            :options="services"
          >
            <template slot="no-options">
              type to search for services..
            </template>
          </v-select>
          <span class="text-danger text-sm">{{ errors.first('service') }}</span>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-lg-3 col-form-label">Occupant Type</label>
        <div class="col-lg-8">
          <select
            v-validate="'required'"
            data-vv-validate-on="blur"
            name="occupant_type"
            class="form-control form-control-sm"
            v-model="occupant_type"
          >
            <option v-for="(type, i) in occupantTypes" :key="i">{{ type }}</option>
          </select>
          <span class="text-danger text-sm">{{ errors.first('occupant_type') }}</span>
        </div>
      </div>
    </div>
    <button
      class="mt-3 btn btn-primary"
      @click="createWard"
      :disabled="isDisabled"
      ref="kt_ward_submit"
    >
      Submit
    </button>
  </b-modal>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';

export default {
  components: { vSelect },
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
      ward_id: '',
      isDisabled: false,
      service_id: '',
      occupant_type: '',
      occupantTypes: ['Male', 'Female', 'Children', 'All', 'Maternity', 'Emergency'],
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.name !== '';
    },
    activePrompt: {
      get() {
        return this.displayPrompt;
      },
      set(value) {
        this.$emit('closeModal', value);
      },
    },
    services() {
      return this.$store.state.model.services;
    },
  },
  watch: {
    displayPrompt(val) {
      if (!val) return;
      if (Object.entries(this.data).length === 0) {
        this.initValues();
        this.$validator.reset();
      } else {
        const { id, name, service_id, occupant_type } = JSON.parse(JSON.stringify(this.data));
        this.ward_id = id;
        this.name = name;
        this.service_id = service_id;
        this.occupant_type = occupant_type;
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

    searchServices(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debouncedSearch(search, this, loading);
      }
    },

    debouncedSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('model/fetchServices', {
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    createWard() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            ward_id: this.ward_id,
            name: this.name,
            service_id: this.service_id,
            occupant_type: this.occupant_type,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_ward_submit'];
          this.addSpinner(submitButton);

          if (this.ward_id && this.ward_id >= 0) {
            this.$store
              .dispatch('model/updateWard', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          } else {
            delete obj.ward_id;
            this.$store
              .dispatch('model/addWard', obj)
              .then(() => this.initializeRequest(submitButton))
              .catch(() => this.removeSpinner(submitButton));
          }
        }
      });
    },
    initValues() {
      this.name = '';
      this.ward_id = '';
      this.service_id = '';
      this.occupant_type = '';
    },
  },
};
</script>

<style></style>
