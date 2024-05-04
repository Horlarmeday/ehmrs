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
        <span class="font-weight-bolder font-size-sm">Name</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ patient.fullname }}</span
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
    <!--begin::Item-->
    <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon2-hourglass-1 display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm">Age</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span
          >{{ patient.date_of_birth | dayjs('from', 'now', true) }}</span
        >
      </div>
    </div>
    <!--end::Item-->
    <!--begin::Item-->
    <div v-if="insurance?.insurance" class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon-folder-1 display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm">Insurance Type</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ insurance?.insurance?.name }}</span
        >
      </div>
    </div>
    <!--end::Item-->
    <!--begin::Item-->
    <div v-if="insurance?.hmo" class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
      <span class="mr-4">
        <i class="flaticon-file-2 display-4 text-muted font-weight-bold" />
      </span>
      <div class="d-flex flex-column text-dark-75">
        <span class="font-weight-bolder font-size-sm text-dark-55">HMO</span>
        <span class="font-weight-bolder font-size-h5"
          ><span class="text-dark-50 font-weight-bold"></span>{{ insurance?.hmo?.name }}</span
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
    insurance: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped></style>
