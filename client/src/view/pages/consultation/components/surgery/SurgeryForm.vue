<template>
  <div class="form">
    <div class="form-group row">
      <label class="col-2 col-form-label">Select Surgery</label>
      <div class="col-6">
        <v-select
          v-model="service_id"
          label="name"
          @search="searchServices"
          :reduce="surgeries => surgeries.id"
          :options="services"
        >
          <template slot="no-options">
            type to search for surgeries..
          </template>
        </v-select>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-2 col-form-label">Notes </label>
      <div class="col-6">
        <textarea v-model="notes" class="form-control" cols="30" rows="5" />
      </div>
    </div>
    <div class="form-group row">
      <div class="col-2 offset-3"></div>
      <button
        :disabled="isDisabled || !service_id"
        @click="submitForm"
        ref="kt-operation-submit"
        class="float-right btn btn-primary"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { debounce } from '@/common/common';

export default {
  components: { vSelect },
  data: () => ({
    service_id: '',
    notes: '',
    isDisabled: false,
  }),

  computed: {
    services() {
      return this.$store.state.model.services;
    },
  },

  methods: {
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

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('surgery/fetchSurgery', { visitId: this.$route.params.id });
    },

    initValues() {
      this.service_id = '';
      this.notes = '';
    },

    submitForm() {
      const submitButton = this.$refs['kt-operation-submit'];
      this.addSpinner(submitButton);
      this.$store
        .dispatch('surgery/requestSurgery', {
          service_id: this.service_id,
          visit_id: this.$route.params.id,
          notes: this.notes,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },
  },
};
</script>

<style scoped>
.selected {
  border: 2px solid #3699ff;
}
</style>
