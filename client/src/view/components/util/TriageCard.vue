<template>
  <div class="container white mb-5">
    <div class="">
      <div class="d-flex justify-content-between pt-2 pb-2">
        <div class="d-flex flex-column flex-root ">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-danger font-size-h2"></i>
            </span>
            TEMPERATURE
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.temperature || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-success font-size-h2"></i>
            </span>
            BLOOD PRESSURE
          </span>
          <span class="opacity-70 ml-lg-7">
            <span v-if="triage?.systolic">{{ triage?.systolic }}/{{ triage?.diastolic }}</span>
            <span v-else>-</span>
          </span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-primary font-size-h2"></i>
            </span>
            BMI
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.bmi || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-info font-size-h2"></i>
            </span>
            WEIGHT
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.weight || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-dark font-size-h2"></i>
            </span>
            HEIGHT
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.height || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-warning font-size-h2"></i>
            </span>
            PULSE
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.pulse || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-primary font-size-h2"></i>
            </span>
            RESPIRATION
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.respiration || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-success font-size-h2"></i>
            </span>
            CREATED
          </span>
          <span class="opacity-70 ml-lg-7">{{
            triage?.createdAt | dayjs('MMM D, YYYY, h:mma')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'TriageCard',
  props: {
    triage: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>

<style scoped></style>
