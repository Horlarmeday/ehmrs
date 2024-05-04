<template>
  <div class="col-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Medications</span>
        </h3>
        <div>
          <button
            :disabled="!tempDrugs?.length || isDisabled"
            ref="kt-drugOrders-submit"
            class="btn btn-primary"
            @click="submitDrugOrder"
          >
            Submit
          </button>
        </div>
      </div>

      <div class="card-body pt-2" style="padding: 2rem 1.25rem">
        <temp-medication-table v-if="tempDrugs?.length" :drugs="tempDrugs" />
        <b-tabs v-else content-class="mt-5">
          <b-tab title="Drugs" active>
            <medications-table :drugs="drugs" />
          </b-tab>
          <b-tab title="Additional Items">
            <additional-items-table :items="items" />
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import TempMedicationTable from '@/view/components/table/TempMedicationTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
import KTUtil from '@/assets/js/components/util';

export default {
  name: 'BulkMedications',
  components: { AdditionalItemsTable, TempMedicationTable, MedicationsTable },
  computed: {
    tempDrugs() {
      return this.$store.state.order.drug_prescriptions;
    },

    drugs() {
      return this.$store.state.order.drug_orders;
    },

    items() {
      return this.$store.state.order.additional_items_orders;
    },
  },
  data: () => ({
    isDisabled: false,
  }),
  methods: {
    submitDrugOrder() {
      const submitButton = this.$refs['kt-drugOrders-submit'];
      this.addSpinner(submitButton);

      this.$store
        .dispatch('order/bulkOrderDrug', {
          drugs: this.tempDrugs,
          id: this.$route.params.id,
        })
        .then(() => this.endRequest(submitButton))
        .catch(() => this.removeSpinner(submitButton));
    },

    addSpinner(submitButton) {
      this.isDisabled = true;
      submitButton.classList.add('spinner', 'spinner-light', 'spinner-right');
    },

    removeSpinner(submitButton) {
      this.isDisabled = false;
      submitButton.classList.remove('spinner', 'spinner-light', 'spinner-right');
    },

    initValues() {
      this.$store.dispatch('order/emptyTempDrug', []);
    },

    endRequest(button) {
      this.removeSpinner(button);
      this.initValues();
      this.$store.dispatch('order/fetchPrescribedDrugs', {
        fetchWithItems: true,
        filter: { visit_id: this.$route.params.id },
      });
      setTimeout(() => {
        KTUtil.scrollTop();
      }, 500);
    },
  },
  created() {
    this.$store.dispatch('order/fetchPrescribedDrugs', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      fetchWithItems: true,
      filter: { visit_id: this.$route.params.id },
    });
  },
};
</script>

<style scoped>
.flex-row-fluid {
  -webkit-box-flex: 1;
  flex: 3 auto;
  -ms-flex: 1 0 0px;
  min-width: 0;
}
</style>
