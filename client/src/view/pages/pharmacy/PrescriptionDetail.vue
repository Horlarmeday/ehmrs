<template>
  <div>
    <div v-if="prescription" class="card card-custom gutter-b">
      <page-title title="Dispense Drug" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="prescription.patient" :insurance="prescription.insurance" />

        <div>
          <section-title text="Drugs Information" />
          <div class="mb-4 border p-2" v-if="prescriptions?.length">
            <h6>Drugs</h6>
            <drug-dispense-section :status="prescription.status" :prescriptions="prescriptions" />
          </div>
          <div class="border p-2" v-if="items?.length">
            <h6>Additional Items</h6>
            <additional-item-dispense-section :status="prescription.status" :items="items" />
          </div>
        </div>
      </div>
    </div>
    <prescription-skeleton v-else title="Dispense Drug" />
  </div>
</template>
<script>
import SectionTitle from '@/utils/SectionTitle.vue';
import PatientSection from '@/utils/PatientSection.vue';
import PageTitle from '@/utils/PageTitle.vue';
import DrugDispenseSection from '@/view/pages/pharmacy/drugDispense/DrugDispenseSection.vue';
import PrescriptionSkeleton from '@/view/pages/pharmacy/components/skeleton/PrescriptionSkeleton.vue';
import AdditionalItemDispenseSection from '@/view/pages/pharmacy/drugDispense/AdditionalItemDispenseSection.vue';

export default {
  components: {
    AdditionalItemDispenseSection,
    PrescriptionSkeleton,
    DrugDispenseSection,
    SectionTitle,
    PageTitle,
    PatientSection,
  },
  name: 'PrescriptionDetail',
  data: () => ({
    prescriptions: [],
    items: [],
    COMPLETE_DISPENSE: 'Complete Dispense',
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
        dispense_status: drug.dispense_status,
        disabledReturn: val.status === this.COMPLETE_DISPENSE,
        payment_status: drug.payment_status,
      }));

      this.items = val.items.map(item => ({
        id: item.id,
        item_name: item.drug.name,
        drug_type: item.drug_type,
        quantity_to_dispense: item.quantity_to_dispense,
        quantity_remaining_to_dispense: item.quantity_to_dispense - item.quantity_dispensed,
        quantity_to_return: item.quantity_to_dispense,
        quantity_remaining: item.quantity_to_dispense - item.quantity_dispensed,
        payment_status: item.payment_status,
        dispense_status: item.dispense_status,
        date_prescribed: item.date_prescribed,
        unit: item.unit.name,
        total_price: item.total_price,
      }));
    },
  },
  created() {
    this.$store.dispatch('pharmacy/fetchOnePrescription', this.$route.params.id);
  },
};
</script>
