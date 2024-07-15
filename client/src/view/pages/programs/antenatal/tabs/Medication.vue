<template>
  <div class="card card-custom gutter-b">
    <div class="card-header pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Medications</span>
      </h3>
      <a
        title="ANC Routine Drugs"
        v-b-tooltip.hover
        href="#"
        class="btn btn-icon btn-light-primary ml-lg-5"
        @click="openModal"
      >
        <i class="fas fa-tablets"></i>
      </a>
    </div>
    <RoutineDrugs
      :display-prompt="displayPrompt"
      @closeModal="hideModal"
      :source="source"
      :switch-position="switchPosition"
      :insurance-name="insuranceName"
    />
    <div class="card-body">
      <b-tabs content-class="mt-5">
        <b-tab title="Drugs" active>
          <medications-table :drugs="drugs" />
        </b-tab>
        <b-tab title="Additional Items">
          <additional-items-table :items="items" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';
import RoutineDrugs from '@/view/pages/programs/antenatal/components/RoutineDrugs.vue';
import { EXCLUDED_INSURANCE } from '@/common/common';

export default {
  name: 'Medications',
  components: { RoutineDrugs, AdditionalItemsTable, MedicationsTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    source: 'Antenatal',
    switchPosition: false,
    displayPrompt: false,
  }),
  computed: {
    drugs() {
      return this.$store.state.order.drug_orders;
    },
    items() {
      return this.$store.state.order.additional_items_orders;
    },

    insurance() {
      return this.$store.state.insurance.patientInsurance;
    },

    insuranceName() {
      return this.insurance?.insurance?.name;
    },
  },
  methods: {
    openModal() {
      this.displayPrompt = true;
    },

    hideModal() {
      this.displayPrompt = false;
    },

    defaultSwitchPosition() {
      setTimeout(() => {
        if (
          this.insurance &&
          this.insurance?.insurance?.name &&
          !EXCLUDED_INSURANCE.includes(this.insurance?.insurance?.name)
        ) {
          this.switchPosition = true;
        }
      }, 350);
    },
  },
  created() {
    this.defaultSwitchPosition();
    this.$store.dispatch('order/fetchPrescribedDrugs', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      fetchWithItems: true,
      filter: { visit_id: this.$route.params.id },
    });
  },
};
</script>

<style scoped></style>
