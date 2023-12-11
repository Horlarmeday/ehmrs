<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Observation</span>
        </h3>
      </div>
      <div class="card-body">
        <observation-accordion />
        <create-observation />
      </div>
    </div>
  </div>
</template>
<script>
import ObservationAccordion from '../components/observations/ObservationAccordion.vue';
import CreateObservation from '../components/observations/CreateObservation.vue';

export default {
  components: { CreateObservation, ObservationAccordion },
};
</script>

<style scoped></style>
