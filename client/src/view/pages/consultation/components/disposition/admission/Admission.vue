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
          <div v-if="loading">
            <b-progress :value="count" variant="primary" show-progress animated :max="100" />
          </div>
          <div v-else>
            <admission-details
              v-if="admission && admission.discharge_status === admissionStatus"
              :admission="admission"
            />
            <admission-form v-else />
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

export default {
  components: { AdmissionDetails, AdmissionForm, AccordionIcon },
  data: () => ({
    loading: false,
    count: 0,
    admissionStatus: 'On Admission',
  }),

  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },
  },

  methods: {
    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.admission) break;
      }
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
