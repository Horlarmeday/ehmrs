<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Admit Patients</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="form">
        <div class="form-group row">
          <label class="col-2 col-form-label">Select Ward</label>
          <div class="col-6">
            <v-select
              v-model="ward"
              label="name"
              @search="searchWards"
              :reduce="
                wards => ({
                  id: wards.id,
                  name: wards.name,
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
          <label v-if="isVIPWard" class="col-2 col-form-label">Bed Space</label>
          <label v-else class="col-2 col-form-label"></label>
          <div class="col-6">
            <div v-if="!beds.length">
              <div
                class="alert alert-custom alert-notice alert-light-danger fade show"
                role="alert"
              >
                <div class="alert-text">There are no beds in this ward!</div>
              </div>
            </div>
            <div v-if="isVIPWard" class="row">
              <div v-for="bed in beds" :key="bed.id" class="ml-3">
                <div
                  class="bg-gray-100 rounded-lg text-dark text-center pr-4 pl-4 pt-4 pb-4 mr-2 inline-display mb-2"
                  :class="bed.status === UNTAKEN && 'bg-hover-state-primary shadow bg-gray-400'"
                  @click="setActiveTab($event, bed)"
                  v-b-tooltip.hover
                  :title="bed.status === TAKEN ? 'Bed is already taken' : 'Click to select bed'"
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
          <div class="col-6">
            <textarea v-model="comment" class="form-control" cols="30" rows="5" />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-2 offset-3"></div>
          <button
            :disabled="isDisabled || !ward"
            @click="admitPatient"
            ref="kt-admit-submit"
            class="float-right btn btn-primary"
          >
            Submit
          </button>
        </div>
      </div>
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
    isDisabled: false,
    isVIPWard: false,
    TAKEN: 'Taken',
    UNTAKEN: 'Untaken',
  }),

  computed: {
    wards() {
      return this.$store.state.model.wardsAndBeds;
    },
  },

  created() {
    this.fetchVisit();
    this.$store.dispatch('model/fetchWardsAndBeds');
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
      this.isVIPWard = /VIP/.test(this.ward.name);
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
      window.location.href = '/';
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
          visit_id: this.$route.params.id,
          ward_id: this.ward.id,
          comment: this.comment,
          ...(this.$route.query?.antenatal && { ante_natal_id: this.$route.query.antenatal }),
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    fetchVisit() {
      this.$store.dispatch('visit/fetchVisit', this.$route.params.id).then(response => {
        const res = response.data.data;
        this.$store.dispatch('patient/setCurrentPatient', {
          ...res.insurance,
          ...res.patient,
        });
      });
    },
  },
};
</script>

<style scoped>
.selected {
  border: 2px solid #3699ff;
}
</style>
