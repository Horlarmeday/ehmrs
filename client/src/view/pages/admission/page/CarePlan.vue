<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Care Plan</span>
        </h3>
      </div>
      <div class="card-body">
        <care-plan-accordion />
        <create-care-plan />
      </div>
    </div>
  </div>
</template>
<script>
import CarePlanAccordion from '@/view/pages/admission/components/careplan/CarePlanAccordion.vue';
import CreateCarePlan from '@/view/pages/admission/components/careplan/CreateCarePlan.vue';

export default {
  components: { CreateCarePlan, CarePlanAccordion },
};
</script>

<style scoped></style>
