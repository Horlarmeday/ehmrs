<template>
  <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
    <div class="card">
      <div class="card-header">
        <div class="card-title" v-b-toggle.accordion-5>
          <div class="card-label">Surgery</div>
          <accordion-icon />
        </div>
      </div>
      <b-collapse id="accordion-5" visible>
        <div class="card-body py-2">
          <div v-if="!loading">
            <surgery-details v-if="surgery" :surgery="surgery" />
            <surgery-form v-else />
          </div>
          <div v-else>
            <DefaultSkeleton />
          </div>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import SurgeryDetails from './SurgeryDetails.vue';
import SurgeryForm from './SurgeryForm.vue';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton, SurgeryForm, SurgeryDetails, AccordionIcon },
  data: () => ({
    loading: false,
  }),

  computed: {
    surgery() {
      return this.$store.state.surgery.surgery;
    },
  },

  created() {
    this.loading = true;
    this.$store
      .dispatch('surgery/fetchSurgery', { visitId: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
