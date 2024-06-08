<template>
  <div>
    <div class="card-body card-header-tabs-line">
      <b-tabs content-class="mt-3">
        <b-tab title="Additional Items" active>
          <additional-items
            source="Consultation"
            :show-switch="showSwitch"
            :switch-position="switchPosition"
            :filter="filter"
            :insurance-name="insuranceName"
          />
        </b-tab>
        <b-tab title="Additional Services">
          <additional-services
            :filter="filter"
            source="Consultation"
            :show-switch="showSwitch"
            :switch-position="switchPosition"
            :is-visible="true"
            :insurance-name="insuranceName"
          />
        </b-tab>
      </b-tabs>
    </div>
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
    insuranceName() {
      return this.admission?.insurance?.insurance?.name;
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
