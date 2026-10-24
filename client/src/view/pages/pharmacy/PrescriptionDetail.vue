<template>
  <div>
    <div v-if="prescription" class="card card-custom gutter-b">
      <history-modal :visit-id="visitId" :display-prompt="displayPrompt" @closeModal="hideModal" />
      <page-title title="Dispense Drug" />
      <div class="card-body pt-0">
        <section-title text="Patient Information" />
        <patient-section :patient="prescription.patient" :insurance="prescription.insurance" />
        <div>
          <section-title text="Drugs Information" />
          <div class="mb-3">
            <a
              v-b-tooltip.hover
              title="View Past Prescriptions"
              @click="showModal"
              href="#"
              class="btn btn-icon btn-light-primary pulse pulse-primary"
            >
              <i class="flaticon2-document"></i>
              <span class="pulse-ring"></span>
            </a>
          </div>
          <div class="mb-4 border p-4" v-if="prescriptions?.length">
            <div class="form-inline flex-lg-row">
              <h6>Drugs</h6>
              <h5 class="ml-auto mr-4">
                <span class="mr-2">Total:</span>
                ₦‎{{ formatNaira(drugSummary.total) }}
              </h5>
              <h5 class="ml-auto mr-4">
                <span class="mr-2">Patient pays:</span>
                ₦‎{{ formatNaira(drugSummary.patient) }}
              </h5>
              <h5 class="ml-auto">
                <span class="mr-2">Payer covers:</span>
                ₦‎{{ formatNaira(drugSummary.payer) }}
              </h5>
              <span v-if="drugSummary.awaiting" class="ml-3 text-warning font-weight-bold">
                {{ drugSummary.awaiting }} awaiting split
              </span>
            </div>
            <drug-dispense-section
              :key="prescriptionKey"
              :status="prescription.status"
              :prescriptions="prescriptions"
            />
          </div>
          <div class="border p-4" v-if="items?.length">
            <div class="form-inline flex-lg-row">
              <h6>Additional Items</h6>
              <h5 class="ml-auto mr-4">
                <span class="mr-2">Total:</span>
                ₦‎{{ formatNaira(itemSummary.total) }}
              </h5>
              <h5 class="ml-auto mr-4">
                <span class="mr-2">Patient pays:</span>
                ₦‎{{ formatNaira(itemSummary.patient) }}
              </h5>
              <h5 class="ml-auto">
                <span class="mr-2">Payer covers:</span>
                ₦‎{{ formatNaira(itemSummary.payer) }}
              </h5>
              <span v-if="itemSummary.awaiting" class="ml-3 text-warning font-weight-bold">
                {{ itemSummary.awaiting }} awaiting split
              </span>
            </div>
            <additional-item-dispense-section
              :key="prescriptionKey"
              :status="prescription.status"
              :items="items"
            />
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
import HistoryModal from '@/view/pages/pharmacy/history/HistoryModal.vue';
import chargeSplit from '@/common/chargeSplit';

export default {
  mixins: [chargeSplit],
  components: {
    HistoryModal,
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
    showHistory: false,
    displayPrompt: false,
  }),
  computed: {
    prescription() {
      return this.$store.state.pharmacy.prescription;
    },

    prescriptionKey() {
      return this.$route.params.id + Date.now();
    },

    visitId() {
      return this.prescription.visit_id;
    },

    drugSummary() {
      return this.summarizeChargeLines(this.prescriptions);
    },

    itemSummary() {
      return this.summarizeChargeLines(this.items);
    },
  },
  methods: {
    hideModal() {
      this.displayPrompt = false;
    },

    showModal() {
      this.displayPrompt = true;
    },
  },
  watch: {
    prescription(val) {
      this.prescriptions = val.drugs.map((drug) => ({
        id: drug.id,
        drug_name: drug.drug.name,
        drug_type: drug.drug_type,
        quantity_to_dispense: drug.quantity_to_dispense,
        quantity_remaining_to_dispense: drug.quantity_to_dispense - drug.quantity_dispensed,
        quantity_remaining_to_return: drug.quantity_to_dispense - drug.quantity_returned,
        quantity_to_return:
          drug.quantity_to_dispense - drug.quantity_dispensed || drug.quantity_to_dispense,
        quantity_remaining: drug.quantity_to_dispense - drug.quantity_dispensed,
        dosage_form: drug?.dosage_form?.name,
        strength: drug?.strength?.name,
        quantity_prescribed: drug.quantity_to_dispense,
        route: drug?.route?.name,
        prescribed_strength: drug.prescribed_strength,
        duration: drug.duration,
        duration_unit: drug.duration_unit,
        total_price: drug.total_price,
        patient_insurance_id: drug.patient_insurance_id,
        coverage_outcome: drug.coverage_outcome,
        split_amount: drug.split_amount,
        patient_share: drug.patient_share,
        patient_net: drug.patient_net,
        insurer_amount: drug.insurer_amount,
        insurer_net: drug.insurer_net,
        corporate_amount: drug.corporate_amount,
        corporate_net: drug.corporate_net,
        quantity: drug.quantity_prescribed,
        start_date: drug.start_date,
        frequency: drug.frequency,
        date_prescribed: drug.date_prescribed,
        date_dispensed: drug.date_dispensed,
        notes: drug.notes,
        dispense_status: drug.dispense_status,
        disabledReturn: val.status === this.COMPLETE_DISPENSE,
        payment_status: drug.payment_status,
        reason_for_return: drug.reason_for_return,
        staff: val.examiner,
        dispenser: drug?.dispenser,
        shouldDisableDispense:
          drug.quantity_dispensed === drug.quantity_to_dispense ||
          drug.quantity_returned === drug.quantity_to_dispense,
      }));

      this.items = val.items.map((item) => ({
        id: item.id,
        item_name: item.drug.name,
        drug_type: item.drug_type,
        drug_form: item.drug_form,
        prescribed_drug_id: item.prescribed_drug_id,
        quantity_to_dispense: item.quantity_to_dispense,
        quantity_remaining_to_dispense: item.quantity_to_dispense - item.quantity_dispensed,
        quantity_remaining_to_return: item.quantity_to_dispense - item.quantity_returned,
        quantity_to_return:
          item.quantity_to_dispense - item.quantity_dispensed || item.quantity_to_dispense,
        quantity_remaining: item.quantity_to_dispense - item.quantity_dispensed,
        payment_status: item.payment_status,
        dispense_status: item.dispense_status,
        date_prescribed: item.date_prescribed,
        date_dispensed: item.date_dispensed,
        unit: item.unit.name,
        total_price: item.total_price,
        patient_insurance_id: item.patient_insurance_id,
        coverage_outcome: item.coverage_outcome,
        split_amount: item.split_amount,
        patient_share: item.patient_share,
        patient_net: item.patient_net,
        insurer_amount: item.insurer_amount,
        insurer_net: item.insurer_net,
        corporate_amount: item.corporate_amount,
        corporate_net: item.corporate_net,
        reason_for_return: item.reason_for_return,
        disabledReturn: val.status === this.COMPLETE_DISPENSE,
        staff: val.examiner,
        dispenser: item?.dispenser,
        shouldDisableDispense:
          item.quantity_dispensed === item.quantity_to_dispense ||
          item.quantity_returned === item.quantity_to_dispense,
      }));
    },
  },
  created() {
    this.$store.dispatch('pharmacy/fetchOnePrescription', this.$route.params.id);
  },
};
</script>
