<template>
  <div class="d-none d-lg-flex align-items-center">
    <ul v-if="patient" class="menu-nav">
      <li class="menu-item">
        <div class="symbol symbol-40 symbol-lg-50 symbol-circle bg-dark mr-3">
          <img alt="Pic" src="/media/users/blank.png" />
        </div>
      </li>
      <li class="menu-item">
        <p class="menu-link">
          <span class="font-weight-bolder text-dark"
            >{{ patient.fullname }} ({{ patient.hospital_id }})</span
          >
        </p>
      </li>
      <li class="menu-item">
        <p class="menu-link">
          <span class="text-dark font-weight-bolder">{{ patient.gender }}</span>
        </p>
      </li>
      <li class="menu-item">
        <p class="menu-link">
          <span class="text-dark font-weight-bolder">{{
            patient.date_of_birth | moment('from', 'now', true)
          }}</span>
        </p>
      </li>
      <li v-if="patient.has_insurance" class="menu-item">
        <p class="menu-link">
          <span class="text-dark font-weight-bolder">{{ patient?.insurance.name }}</span>
        </p>
      </li>
      <li v-if="patient.hmo_id" class="menu-item">
        <p class="menu-link">
          <span class="menu-text text-dark font-weight-bolder">{{
            patient?.hmo.name
          }}</span>
        </p>
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
  computed: {
    patient() {
      return this.$store.state.patient.currentPatient;
    },
  },
};
</script>

<style scoped></style>
