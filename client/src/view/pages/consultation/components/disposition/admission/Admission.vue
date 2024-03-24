<template>
  <div class="accordion accordion-solid accordion-panel accordion-svg-toggle">
    <div class="card">
      <div class="card-header">
        <div class="card-title" v-b-toggle.accordion-4>
          <div class="card-label">Admission</div>
          <accordion-icon />
        </div>
      </div>
      <b-collapse id="accordion-4" visible>
        <div class="card-body py-2">
          <div v-if="!loading">
            <admission-details
              v-if="admission && admission.discharge_status === ON_ADMISSION"
              :admission="admission"
            />
            <admission-form v-else />
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
import AdmissionForm from './AdmissionForm.vue';
import AdmissionDetails from './AdmissionDetails.vue';
import DefaultSkeleton from '@/utils/DefaultSkeleton.vue';

export default {
  components: { DefaultSkeleton, AdmissionDetails, AdmissionForm, AccordionIcon },
  data: () => ({
    ON_ADMISSION: 'On Admission',
    loading: false,
  }),

  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },
  },

  created() {
    this.loading = true;
    this.$store
      .dispatch('admission/fetchAdmission', { visitId: this.$route.params.id })
      .then(() => (this.loading = false));
  },
};
</script>

<style scoped></style>
