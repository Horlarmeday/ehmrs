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
              <h5 class="ml-auto" v-if="!isEmpty(prescription?.insurance)">
                <span class="mr-2">NHIS 10% Total: </span>
                ₦‎{{ nhis10PercentDrugsPrice }}
              </h5>
              <h5 class="ml-auto" v-if="!isEmpty(prescription?.insurance)">
                <span class="mr-2">NHIS 90% Total: </span>
                ₦‎{{ nhis90PercentDrugsPrice }}
              </h5>
              <h5 class="ml-auto" v-if="isEmpty(prescription?.insurance)">
                <span class="mr-2">Total: </span>
                ₦‎{{ totalDrugsPrice }}
              </h5>
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
              <h5 class="ml-auto">
                <span class="mr-2">Total: </span>
                ₦‎{{ totalItemsPrice }}
              </h5>
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
import { isEmpty } from '@/common/common';

export default {
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

    totalDrugsPrice() {
      const totalPrice = this.prescription.drugs?.map(pres => pres.total_price);
      return totalPrice.reduce((acc, cur) => acc + +cur, 0);
    },

    totalItemsPrice() {
      const totalPrice = this.prescription.items?.map(pres => pres.total_price);
      return totalPrice.reduce((acc, cur) => acc + +cur, 0);
    },

    nhisMappedTotalPrice() {
      return this.prescription.drugs
        ?.filter(drug => drug?.drug_type === 'NHIS')
        .map(pres => pres.total_price);
    },

    nhis90PercentDrugsPrice() {
      const mappedTotal10PercentPrice = this.nhisMappedTotalPrice.reduce(
        (acc, cur) => acc + +cur,
        0
      );
      const totalActualPrice = mappedTotal10PercentPrice / 0.1;
      return totalActualPrice * 0.9;
    },

    nhis10PercentDrugsPrice() {
      return this.nhisMappedTotalPrice.reduce((acc, cur) => acc + +cur, 0);
    },
  },
  methods: {
    isEmpty,
    hideModal() {
      this.displayPrompt = false;
    },

    showModal() {
      this.displayPrompt = true;
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

      this.items = val.items.map(item => ({
        id: item.id,
        item_name: item.drug.name,
        drug_type: item.drug_type,
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
