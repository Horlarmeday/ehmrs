<template>
  <div>
    <div
      class="accordion accordion-solid accordion-panel accordion-svg-toggle"
      id="accordionExample8"
      role="tablist"
    >
      <!-- Personal Info -->
      <div class="card card-custom gutter-b">
        <div class="card-header" header-tag="header" role="tab">
          <div class="card-title" v-b-toggle.accordion-1>
            <div class="card-label">
              Edit
              <span class="text-primary">{{ $route.query.patient }}</span>
              Health Insurance
            </div>
            <accordion-icon />
          </div>
        </div>
        <div class="card-body">
          <div class="tab-content">
            <patient-insurances-table @editInsurance="editInsurance" :insurances="insurances" />
          </div>
        </div>
        <hr />
        <edit-insurance-form :insurance="insurance" />
      </div>
    </div>
  </div>
</template>
<script>
import AccordionIcon from '@/assets/icons/AccordionIcon.vue';
import PatientInsurancesTable from '@/view/components/table/PatientInsurancesTable.vue';
import EditInsuranceForm from '@/view/pages/patient/page/components/EditInsuranceForm.vue';

export default {
  data: () => ({
    insurance: {},
  }),
  components: { EditInsuranceForm, PatientInsurancesTable, AccordionIcon },
  created() {
    this.fetchInsurances();
  },
  computed: {
    insurances() {
      return this.$store.state.insurance.patientInsurances;
    },
  },
  methods: {
    fetchInsurances() {
      this.$store.dispatch('insurance/fetchPatientInsurances', this.$route.params.id);
    },

    editInsurance(insurance) {
      this.insurance = insurance;
    },
  },
};
</script>

<style scoped></style>
