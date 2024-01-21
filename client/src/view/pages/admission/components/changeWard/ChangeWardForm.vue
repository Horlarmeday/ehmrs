<template>
  <div>
    <div class="form-group row">
      <label class="col-lg-3 col-form-label">Current Ward</label>
      <div class="col-lg-6">
        <input
          type="text"
          v-model="admission.ward.name"
          class="form-control form-control-sm"
          readonly
        />
      </div>
    </div>
    <div class="form-group row">
      <label class="col-lg-3 col-form-label">Ward:</label>
      <div class="col-lg-6">
        <select
          name="ward"
          v-validate="'required'"
          data-vv-validate-on="blur"
          v-model="ward"
          class="form-control-sm form-control"
          @change="getBeds"
        >
          <option :value="{ id: ward.id, beds: ward.beds }" v-for="(ward, i) in wards" :key="i">{{
            ward.name
          }}</option>
        </select>
        <span class="text-danger text-sm">{{ errors.first('ward') }}</span>
      </div>
    </div>
    <div v-if="ward" class="form-group row">
      <label class="col-lg-2 col-form-label">Bed Space</label>
      <div class="col-lg-6 offset-1">
        <div v-if="!beds.length">
          <div class="alert alert-custom alert-notice alert-light-danger fade show" role="alert">
            <div class="alert-text">There are no beds in this ward!</div>
          </div>
        </div>
        <div class="row">
          <div v-for="bed in beds" :key="bed.id" class="ml-3">
            <div
              class="bg-gray-100 rounded-lg text-dark text-center pr-4 pl-4 pt-4 pb-4 mr-2 inline-display mb-2"
              :class="bed.status === 'Untaken' && 'bg-hover-state-primary shadow bg-gray-400'"
              @click="setActiveTab($event, bed)"
              v-b-tooltip.hover
              :title="bed.status === 'Taken' ? 'Bed is already taken' : 'Click to select bed'"
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
    <div class="col-lg-6 offset-3">
      <button
        @click="changeWard"
        ref="kt_changeWard_submit"
        :disabled="isDisabled || emptyFields"
        class="btn btn-primary float-right"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    ward: '',
    beds: [],
    bed_id: '',
    isDisabled: false,
  }),
  props: {
    admission: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  computed: {
    emptyFields() {
      return !this.ward || !this.bed_id;
    },

    wards() {
      return this.$store.state.model.wardsAndBeds;
    },
  },
  created() {
    this.fetchWards();
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

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
    },

    changeWard() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const obj = {
            ward_id: this.ward.id,
            bed_id: this.bed_id,
          };
          // set spinner to submit button
          const submitButton = this.$refs['kt_changeWard_submit'];
          this.addSpinner(submitButton);

          this.$store
            .dispatch('admission/changeWard', {
              id: this.$route.params.id,
              data: obj,
            })
            .then(() => this.endRequest(submitButton))
            .catch(() => this.removeSpinner(submitButton));
        }
      });
    },

    selectBed(bed) {
      if (!bed) return false;
      this.bed_id = bed.id;
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

    getBeds() {
      this.beds = this.ward.beds;
    },

    fetchWards() {
      this.$store.dispatch('model/fetchWardsAndBeds');
    },

    initValues() {
      this.ward = '';
      this.bed_id = '';
      this.isDisabled = false;
    },
  },
};
</script>

<style scoped>
.selected {
  border: 2px solid #3699ff;
}
</style>
