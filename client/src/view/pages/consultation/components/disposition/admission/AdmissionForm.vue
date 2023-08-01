<template>
  <div class="form">
    <div class="form-group row">
      <label class="col-2 col-form-label">Select Ward</label>
      <div class="col-4">
        <v-select
          v-model="ward"
          label="name"
          @search="searchWards"
          :reduce="
            wards => ({
              id: wards.id,
              beds: wards.beds,
            })
          "
          @input="getBeds"
          :options="wards"
        >
          <template slot="no-options">
            type to search for ward..
          </template>
        </v-select>
      </div>
    </div>
    <div v-if="ward" class="form-group row">
      <label class="col-2 col-form-label">Bed Space</label>
      <div class="col-4">
        <div class="row">
          <div v-if="!beds.length" class="offset-1">
            <span class="text-danger mb-2">There are no beds in this ward</span>
          </div>
          <div v-for="bed in beds" :key="bed.id" class="col-lg-3" data-test-id="tabs">
            <div
              class="bg-gray-100 rounded-lg text-dark text-center pr-4 pl-4 pt-4 pb-4 mr-2 inline-display mb-2"
              :class="bed.status === 'Untaken' && 'bg-hover-state-primary shadow bg-gray-400'"
              @click="setActiveTab($event, bed)"
            >
              <span class="navi-icon"
                ><i class="fas fa-bed text-primary"></i>
                <span class="ml-2">{{ bed.code }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-2 col-form-label">Comment </label>
      <div class="col-4">
        <textarea v-model="comment" class="form-control" cols="30" rows="5" />
      </div>
    </div>
    <div class="form-group row">
      <div class="col-2 offset-3"></div>
      <button @click="admitPatient" ref="kt-admit-submit" class="float-right btn btn-primary">
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
    ward: '',
    beds: [],
    bed_id: '',
    comment: '',
  }),

  computed: {
    wards() {
      return this.$store.state.model.wardsAndBeds;
    },
  },

  methods: {
    searchWards(search, loading) {
      if (search.length > 2) {
        loading(true);
        this.debouncedSearch(search, this, loading);
      }
    },

    debouncedSearch: debounce((search, vm, loading) => {
      vm.$store
        .dispatch('model/fetchWardsAndBeds', {
          search,
        })
        .then(() => loading(false))
        .catch(() => loading(false));
    }, 500),

    getBeds() {
      this.beds = this.ward.beds;
    },

    setActiveTab(event, bed) {
      if (bed.status === 'Taken') return;
      let target = event.target;
      if (!event.target.classList.contains('shadow')) {
        target = event.target.closest('.shadow');
      }
      const links = document.querySelectorAll('.shadow');
      // remove active tab links
      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('selected');
      }
      // set current active tab
      target.classList.add('selected');

      this.selectBed(bed);
    },

    selectBed(bed) {
      if (!bed) return false;
      this.bed_id = bed.id;
    },

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
      this.$store.dispatch('admission/fetchAdmission', { visitId: this.$route.params.visitId });
    },

    initValues() {
      this.beds = [];
      this.bed_id = '';
      this.comment = '';
      this.ward = '';
    },

    admitPatient() {
      const submitButton = this.$refs['kt-admit-submit'];
      this.addSpinner(submitButton);
      this.$store
        .dispatch('admission/admitPatient', {
          bed_id: this.bed_id,
          visit_id: this.$route.params.visitId,
          ward_id: this.ward.id,
          comment: this.comment,
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
