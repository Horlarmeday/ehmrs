<template>
  <div class="container white mb-5">
    <div class="">
      <div class="d-flex justify-content-between pt-2 pb-2">
        <div class="d-flex flex-column flex-root ">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-danger font-size-h2"></i>
            </span>
            EDD
          </span>
          <span class="opacity-70 ml-lg-7">{{
            estimated_delivery_date | dayjs('MMM D, YYYY')
          }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-success font-size-h2"></i>
            </span>
            BLOOD PRESSURE
          </span>
          <span class="opacity-70 ml-lg-7">
            <span v-if="triage?.systolic">{{ triage?.blood_pressure }}</span>
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
          <span class="opacity-70 ml-lg-7">{{
            Number(triage?.body_mass_index)?.toFixed(3) || '-'
          }}</span>
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
            RVST
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.rvst || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-primary font-size-h2"></i>
            </span>
            URI. PROTEIN
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.urinalysis_protein || '-' }}</span>
        </div>
        <div class="d-flex flex-column flex-root">
          <span class="font-weight-bolder mb-1">
            <span class="navi-icon mr-2">
              <i class="fa fa-genderless text-primary font-size-h2"></i>
            </span>
            URI. GLUCOSE
          </span>
          <span class="opacity-70 ml-lg-7">{{ triage?.urinalysis_glucose || '-' }}</span>
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
  name: 'ANCTriageCard',
  props: {
    triage: {
      type: Object,
      required: true,
      default: () => {},
    },
    estimated_delivery_date: {
      type: String,
    },
  },
};
</script>

<style scoped></style>
