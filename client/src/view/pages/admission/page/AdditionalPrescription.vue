<template>
  <div>
    <additional-items
      source="Consultation"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
      :filter="filter"
    />
    <br />
    <additional-services
      :filter="filter"
      source="Consultation"
      :show-switch="showSwitch"
      :switch-position="switchPosition"
    />
  </div>
</template>
<script>
import { EXCLUDED_INSURANCE } from '@/common/common';
import AdditionalItems from '@/view/pages/admission/components/additionalPrescriptions/AdditionalItems.vue';
import AdditionalServices from '@/view/pages/admission/components/additionalPrescriptions/AdditionalServices.vue';

export default {
  components: { AdditionalServices, AdditionalItems },
  data: () => ({
    switchPosition: false,
  }),
  computed: {
    admission() {
      return this.$store.state.admission.admission;
    },
    filter() {
      return { visit_id: this.admission?.visit_id };
    },
    showSwitch() {
      return (
        (this.admission?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.admission?.insurance?.insurance?.name)) ||
        false
      );
    },
  },
  methods: {
    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.admission?.patient?.has_insurance &&
          !EXCLUDED_INSURANCE.includes(this.admission?.insurance?.insurance?.name)
        ) {
          this.switchPosition = true;
        }
      }, 350);
    },
  },
  created() {
    this.$store
      .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
      .then(response => {
        const res = response.data.data;
        this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
      });
    this.defaultSwitchPosition();
  },
};
</script>

<style scoped></style>
