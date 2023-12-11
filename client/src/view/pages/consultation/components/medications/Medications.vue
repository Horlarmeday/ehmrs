<template>
  <div class="col-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Medications</span>
        </h3>
      </div>

      <div class="card-body pt-2" style="padding: 2rem 1.25rem">
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
  </div>
</template>

<script>
import MedicationsTable from '@/view/components/table/MedicationsTable.vue';
import AdditionalItemsTable from '@/view/components/table/AdditionalItemsTable.vue';

export default {
  name: 'Medications',
  components: { AdditionalItemsTable, MedicationsTable },
  data: () => ({
    currentPage: 1,
    itemsPerPage: 10,
    count: 0,
    item: {},
    showPopover: false,
    popOverId: 'popover-reactive-1',
  }),
  computed: {
    drugs() {
      return this.$store.state.order.drug_orders;
    },
    items() {
      return this.$store.state.order.additional_items_orders;
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
  methods: {
    viewPopover(item) {
      this.item = item;
      this.showPopover = true;
    },
    hidePopover() {
      this.showPopover = false;
    },
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
