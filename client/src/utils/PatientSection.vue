<template>
  <div class="d-flex align-items-center flex-wrap">
    <!--begin::Item-->
    <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon-medal display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm">Patient ID</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ patient.hospital_id }}</span
        >
      </div>
    </div>
    <!--end::Item-->

    <!--begin::Item-->
    <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon-confetti display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm">First Name</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ patient.firstname }}</span
        >
      </div>
    </div>
    <!--end::Item-->
    <!--begin::Item-->
    <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon-confetti display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm">Last Name</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ patient.lastname }}</span
        >
      </div>
    </div>
    <!--end::Item-->
    <!--begin::Item-->
    <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon-customer display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm">Gender</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ patient.gender }}</span
        >
      </div>
    </div>
    <!--end::Item-->
  </div>
</template>

<script>
export default {
  name: 'PatientSection',
  props: {
    patient: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped></style>
