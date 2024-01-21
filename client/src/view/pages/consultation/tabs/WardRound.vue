<template>
  <div>
    <div class="card card-custom gutter-b">
      <div class="card-header py-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Ward Round</span>
        </h3>
      </div>
      <div class="card-body">
        <ward-round-accordion />
        <ward-round-form />
      </div>
    </div>
  </div>
</template>
<script>
import WardRoundAccordion from '@/view/pages/consultation/components/wardRound/WardRoundAccordion.vue';
import WardRoundForm from '@/view/pages/consultation/components/wardRound/WardRoundForm.vue';

export default {
  components: { WardRoundForm, WardRoundAccordion },
};
</script>

<style scoped></style>
