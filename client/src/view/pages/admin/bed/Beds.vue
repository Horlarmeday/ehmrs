<template>
  <div class="row" data-sticky-container>
    <create-bed :displayPrompt="displayPrompt" @closeModal="hideModal" :data="ward" />
    <div class="col-lg-6 col-xl-3">
      <div
        class="card card-custom sticky"
        data-sticky="true"
        data-margin-top="140px"
        data-sticky-for="1023"
        data-sticky-class="kt-sticky"
      >
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">Wards <small>List of all available wards</small></h3>
          </div>
        </div>
        <div class="card-body p-0">
          <ul class="navi navi-bold navi-hover my-5" role="tablist">
            <li class="navi-item" v-for="ward in wards" :key="ward.id" @click="getBeds(ward)">
              <a class="navi-link" :class="active" data-toggle="tab" href="#">
                <span class="navi-icon"><i class="flaticon2-plus-1"></i></span>
                <span class="navi-text">{{ ward.name }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="col-lg-6 col-xl-9">
      <div class="card card-custom gutter-b example example-compact">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">
              Beds <small v-if="ward">> {{ ward.name }}</small>
            </h3>
          </div>
        </div>
        <div class="card-body">
          <div v-if="wards.length && !showBeds" class="col-lg-12">
            <div
              class="bg-gray-400 text-center p-6 mr-2 inline-display mb-2 shadow pointer"
              v-for="ward in wards"
              :key="ward.id"
              @click="getBeds(ward)"
            >
              <span class="navi-icon">
                <span class="ml-1">{{ ward.name }}</span>
              </span>
            </div>
          </div>
          <div v-if="showBeds" class="col-lg-12">
            <div
              class="bg-gray-500 text-dark text-center pr-6 pl-6 pt-4 pb-4 mr-2 inline-display mb-2 shadow pointer"
              v-for="bed in beds"
              :key="bed.id"
            >
              <span class="navi-icon"
                ><i class="fas fa-bed text-dark"></i>
                <span class="ml-2">{{ bed.code }}</span>
              </span>
              <br />
              <span>{{ bed.bed_type }}</span>
            </div>
            <div
              class="bg-secondary text-center pr-6 pl-6 pt-4 pb-4 mr-2 inline-display mb-2 shadow pointer"
              @click="addNewData"
            >
              <span class="navi-icon"
                ><i class="flaticon2-plus-1 text-dark"></i>
                <span class="ml-1">Add bed</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateBed from './CreateBed.vue';
export default {
  components: { CreateBed },
  data() {
    return {
      active: 'activ',
      isActive: false,
      displayPrompt: false,
      showBeds: false,
      ward: {},
    };
  },
  computed: {
    wards() {
      return this.$store.state.model.wards;
    },
    beds() {
      return this.$store.state.model.beds;
    },
  },
  created() {
    this.$store.dispatch('model/fetchWards', {
      currentPage: 1,
      itemsPerPage: 20,
    });
  },
  methods: {
    addNewData() {
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },
    getBeds(ward) {
      this.showBeds = true;
      this.ward = ward;
      this.$store.dispatch('model/fetchBeds', {
        ward_id: ward.id,
      });
    },
  },
};
</script>

<style scoped>
.inline-display {
  display: inline-block;
}

.shadow {
  box-shadow: 1px 1px 3px rgb(43, 42, 42);
}
</style>
