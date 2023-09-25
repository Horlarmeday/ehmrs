<template>
  <div>
    <div class="card card-custom gutter-b">
      <page-title title="Dispense Drug" />
      <div v-if="loading">
        <b-progress :value="count" variant="primary" show-progress animated :max="100" />
      </div>
      <div v-else class="card-body">
        <section-title text="Patient Information" />
        <patient-section :patient="prescription.patient" />

        <div>
          <section-title text="Drugs Information" />
          <drug-dispense-section :status="prescription.status" :prescriptions="prescriptions" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PatientSection from '@/utils/PatientSection.vue';
import PageTitle from '@/utils/PageTitle.vue';
import DrugDispenseSection from '@/view/pages/pharmacy/drugDispense/DrugDispenseSection.vue';

export default {
  components: { DrugDispenseSection, SectionTitle, PageTitle, PatientSection },
  name: 'PrescriptionDetail',
  data: () => ({
    count: 0,
    loading: false,
    prescriptions: [],
  }),
  computed: {
    prescription() {
      return this.$store.state.pharmacy.prescription;
    },
  },
  watch: {
    prescription(val) {
      this.prescriptions = val.drugs.map(drug => ({
        id: drug.id,
        drug_name: drug.drug.name,
        drug_type: drug.drug_type,
        quantity_to_dispense: drug.quantity_to_dispense,
        quantity_remaining_to_dispense: drug.quantity_to_dispense - drug.quantity_dispensed,
        quantity_to_return: drug.quantity_to_dispense,
        quantity_remaining: drug.quantity_to_dispense - drug.quantity_dispensed,
        dosage_form: drug?.dosage_form?.name,
        strength: drug?.strength?.name,
        quantity_prescribed: drug.quantity_to_dispense,
        route: drug?.route?.name,
        prescribed_strength: drug.prescribed_strength,
        duration: drug.duration,
        duration_unit: drug.duration_unit,
        total_price: drug.total_price,
        quantity: drug.quantity_prescribed,
        start_date: drug.start_date,
        frequency: drug.frequency,
        date_prescribed: drug.date_prescribed,
        notes: drug.notes,
        disabledReturn: val.status === 'Complete Dispense',
      }));
    },
  },
  methods: {
    countToHundred() {
      for (let i = 1; i <= 100; i++) {
        this.count = i;
        if (this.prescription) break;
      }
    },
  },
  created() {
    this.loading = true;
    this.countToHundred();
    this.$store
      .dispatch('pharmacy/fetchOnePrescription', this.$route.params.id)
      .then(() => (this.loading = false));
  },
};
</script>
