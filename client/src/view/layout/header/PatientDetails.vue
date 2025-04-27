<template>
  <div class="d-none d-lg-flex align-items-center">
    <ul v-if="patient" class="menu-nav">
      <li class="menu-item">
        <div class="symbol symbol-lg-50 symbol-circle mr-3">
          <img
            v-if="!imageError"
            alt="Pic"
            :src="imageUrl(patient.photo)"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <router-link
            :to="`/patient/profile/${patient.id}`"
            v-else
            class="symbol-label font-size-h4"
          >
            {{ patient?.firstname?.charAt(0)?.toUpperCase() }}
            {{ patient?.lastname?.charAt(0)?.toUpperCase() }}
          </router-link>
        </div>
      </li>
      <li class="menu-item">
        <div class="menu-link">
          <router-link :to="`/patient/profile/${patient.id}`" class="font-weight-bolder text-dark"
            >{{ patient.fullname }} ({{ patient.hospital_id }})</router-link
          >
        </div>
      </li>
      <li class="menu-item">
        <div class="menu-link">
          <span class="text-dark font-weight-bolder">{{ patient.gender }}</span>
        </div>
      </li>
      <li class="menu-item">
        <div class="menu-link">
          <span class="text-dark font-weight-bolder">{{
            patient.date_of_birth | dayjs('from', 'now', true)
          }}</span>
        </div>
      </li>
      <li v-if="patient.has_insurance" class="menu-item">
        <div class="menu-link">
          <span class="text-dark font-weight-bolder">{{ patient?.insurance?.name }}</span>
        </div>
      </li>
      <li v-if="patient.has_insurance" class="menu-item">
        <div class="menu-link">
          <span class="menu-text text-dark font-weight-bolder">{{ patient?.hmo?.name }}</span>
        </div>
      </li>
      <li class="menu-item" v-if="patient.is_difficult_patient">
        <div class="menu-link">
          <span class="menu-text text-dark font-weight-bolder">
            <span class="label label-danger label-pill label-inline mr-2 font-weight-boldest pulse">
              <i class="flaticon2-bell-alarm-symbol mr-2 text-white icon-nm"></i>
              <span class="font-weight-bold">Difficult Patient</span>
            </span>
          </span>
        </div>
      </li>
    </ul>
    <!--    <div class="ml-auto">-->
    <!--      <div class="">-->
    <!--        <a href="#" class="btn btn-danger font-weight-bold btn-sm">Back</a>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script>
export default {
  data: () => ({
    imageError: false,
  }),
  methods: {
    imageUrl(url) {
      return `${window.location.origin}/static/images/${url}`;
    },
    handleImageLoad() {
      this.imageError = false;
    },
    handleImageError() {
      this.imageError = true;
    },
  },
  computed: {
    patient() {
      return this.$store.state.patient.currentPatient;
    },
  },
};
</script>

<style scoped></style>
